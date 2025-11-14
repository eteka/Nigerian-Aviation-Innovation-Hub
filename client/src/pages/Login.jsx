import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminLogin, setAdminLogin] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in as regulator
    if (user?.role === 'regulator') {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      
      if (adminLogin && response.user?.role !== 'regulator') {
        setShowRequestDialog(true);
        setLoading(false);
        return;
      }
      
      // Redirect based on role and intent
      if (response.user?.role === 'regulator') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAdmin = () => {
    setShowRequestDialog(false);
    navigate('/request-admin');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Login</h1>
        <p className="auth-subtitle">Welcome back to the Aviation Innovation Hub</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="Enter your password"
            />
          </div>

          <div className="form-group admin-toggle">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={adminLogin}
                onChange={(e) => setAdminLogin(e.target.checked)}
              />
              <span className="checkmark"></span>
              Admin login
            </label>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : (adminLogin ? 'Admin Login' : 'Login')}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>

        {showRequestDialog && (
          <div className="request-admin-dialog">
            <div className="dialog-content">
              <h3>You're not an admin yet</h3>
              <p>Would you like to request admin access?</p>
              <div className="dialog-actions">
                <button 
                  onClick={() => setShowRequestDialog(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRequestAdmin}
                  className="btn-primary"
                >
                  Request Admin Access
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
