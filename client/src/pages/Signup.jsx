import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import './Auth.css';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminRequested, setAdminRequested] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [hasAdmin, setHasAdmin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in as regulator
    if (user?.role === 'regulator') {
      navigate('/admin');
      return;
    }

    // Check if any admin exists
    checkAdminStatus();
  }, [user, navigate]);

  const checkAdminStatus = async () => {
    try {
      const response = await authAPI.hasAdmin();
      setHasAdmin(response.data.hasAdmin);
    } catch (error) {
      console.error('Failed to check admin status:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const registrationData = { name, email, password };
      
      if (adminRequested) {
        registrationData.adminRequested = true;
        if (hasAdmin || !process.env.ALLOW_FIRST_ADMIN) {
          registrationData.adminKey = adminKey;
        }
      }

      const response = await register(registrationData.name, registrationData.email, registrationData.password, registrationData);
      
      // Redirect based on role
      if (response.user?.role === 'regulator') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.response?.data?.error?.code === 'ADMIN_KEY_INVALID') {
        setError('Invalid Admin Access Key');
      } else {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Sign Up</h1>
        <p className="auth-subtitle">Join the Aviation Innovation Hub</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="At least 6 characters"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter your password"
            />
          </div>

          <div className="form-group admin-toggle">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={adminRequested}
                onChange={(e) => setAdminRequested(e.target.checked)}
              />
              <span className="checkmark"></span>
              Sign up as Admin
            </label>
          </div>

          {adminRequested && (
            <div className="form-group admin-key-section">
              {!hasAdmin ? (
                <div className="first-admin-notice">
                  <span className="first-admin-icon">👑</span>
                  <div>
                    <strong>First Admin Setup</strong>
                    <p>You'll be granted admin privileges as the first administrator.</p>
                  </div>
                </div>
              ) : (
                <>
                  <label htmlFor="adminKey">Admin Access Key</label>
                  <input
                    type="password"
                    id="adminKey"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    required={adminRequested && hasAdmin}
                    placeholder="Enter admin access key"
                  />
                </>
              )}
            </div>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating account...' : (adminRequested ? 'Sign Up as Admin' : 'Sign Up')}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
