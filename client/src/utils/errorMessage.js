// Turn any API error into plain text a page can safely display.
// The server answers with either a string or { code, message, details }.
export function errorMessage(err, fallback) {
  const data = err?.response?.data;
  const e = data?.error;
  if (typeof e === 'string' && e) return e;
  if (e && typeof e.message === 'string' && e.message) return e.message;
  if (typeof data?.message === 'string' && data.message) return data.message;
  return fallback;
}
