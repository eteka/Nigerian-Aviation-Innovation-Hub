const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

process.env.NODE_ENV = 'test'; // in-memory database

let server;
let base;
let csrf;
let cookie;

before(async () => {
  const app = require('../server/index.js');
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve); // random free port
  });
  base = `http://127.0.0.1:${server.address().port}`;
  const res = await fetch(`${base}/api/v1/csrf`);
  csrf = (await res.json()).csrfToken;
  cookie = `XSRF-TOKEN=${csrf}`;
});

after(() => {
  server.close();
});

const post = (url, body) =>
  fetch(`${base}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf, Cookie: cookie },
    body: JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, body: await r.json() }));

test('sign-up with a 7-character password returns a plain message string', async () => {
  const { status, body } = await post('/api/auth/register', {
    name: 'Ada Test', email: 'ada@example.com', password: '1234567',
  });
  assert.equal(status, 400);
  assert.equal(typeof body.error.message, 'string');
  assert.match(body.error.message, /at least 8 characters/);
});

test('sign-up with a malformed email returns a plain message string', async () => {
  const { status, body } = await post('/api/auth/register', {
    name: 'Ada Test', email: 'not-an-email', password: '12345678',
  });
  assert.equal(status, 400);
  assert.equal(typeof body.error.message, 'string');
  assert.match(body.error.message, /valid email/);
});

test('the page helper turns every error shape into text, never an object', async () => {
  const { errorMessage } = await import('../client/src/utils/errorMessage.js');
  const { body } = await post('/api/auth/register', { name: 'A', email: 'x', password: '1' });
  const shapes = [
    { response: { data: body } },
    { response: { data: { error: 'Invalid email or password' } } },
    { response: { data: { error: { code: 'X' } } } },
    {},
  ];
  for (const err of shapes) {
    assert.equal(typeof errorMessage(err, 'fallback'), 'string');
  }
  assert.equal(errorMessage({ response: { data: { error: 'Invalid email or password' } } }, 'f'), 'Invalid email or password');
  assert.equal(errorMessage({}, 'fallback'), 'fallback');
});

test('every page shows error text through the helper, never the raw error', () => {
  const pages = path.join(__dirname, '..', 'client', 'src', 'pages');
  for (const f of ['Signup', 'Login', 'RequestAdmin', 'NewProject', 'ProjectDetail']) {
    const src = fs.readFileSync(path.join(pages, `${f}.jsx`), 'utf8');
    assert.match(src, /errorMessage\(/, `${f} uses errorMessage`);
    assert.doesNotMatch(src, /response\?\.data\?\.error\s*\|\|/, `${f} prints a raw error object`);
  }
});

test('sign-up form says 8 characters and does not read process.env', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'client', 'src', 'pages', 'Signup.jsx'), 'utf8');
  assert.match(src, /password\.length < 8/);
  assert.match(src, /At least 8 characters/);
  assert.doesNotMatch(src, /At least 6|< 6/);
  assert.doesNotMatch(src, /process\.env/);
});

// --- T2: page-load checks must not lock people out of signing in ---
test('40 page-load checks of each kind do not stop a new account from registering', async () => {
  for (const url of ['/api/auth/me', '/api/auth/has-admin', '/api/v1/csrf']) {
    for (let i = 0; i < 40; i++) {
      const r = await fetch(`${base}${url}`, { headers: { Cookie: cookie } });
      assert.notEqual(r.status, 429, `${url} request ${i + 1} was rate limited`);
    }
  }
  const { status } = await post('/api/auth/register', {
    name: 'Page Browser', email: 'browser@example.com', password: 'a-long-password-1',
  });
  assert.equal(status, 201);
});

test('the 21st wrong-password login is still refused with the rate-limit message', async () => {
  let last;
  for (let i = 0; i < 21; i++) {
    last = await post('/api/auth/login', { email: 'nobody@example.com', password: 'wrong-password-1' });
  }
  assert.equal(last.status, 429);
  assert.match(last.body.error.message, /Too many authentication attempts/);
});
