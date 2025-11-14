import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import Toast from '../components/Toast';
import './Auth.css';

function RequestAdmin() {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [toast, setToast] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'regulator') {
      navigate('/admin');
      return;
    }

    // Check if user already has a pending request
    // This would require an additional API endpoint, but for now we'll handle it in the submit
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.requestAdmin({ reason });
      setToast({ message: 'Admin access request submitted successfully!', type: 'success' });
      setHasPendingRequest(true);
      setReason('');
    } catch (err) {
      if (err.response?.status === 409) {
        setToast({ message: 'You already have a pending admin request', type: 'error' });
        setHasPendingRequest(true);
      } else {
        setToast({ message: err.response?.data?.error || 'Failed to submit request', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="page-container">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Request Admin Access</h1>
          <p className="auth-subtitle">
            Submit a request to become an administrator of the Aviation Innovation Hub
          </p>

          {hasPendingRequest ? (
            <div className="pending-request-notice">
              <div className="pending-icon">⏳</div>
              <div>
                <h3>Request Pending</h3>
                <p>Your admin access request is being reviewed by existing administrators.</p>
                <p>You'll be notified once a decision is made.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="reason">Reason for Admin Access</label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please explain why you need admin access to the Aviation Innovation Hub..."
                  rows="6"
                  required
                />
                <small>Provide details about your role, organization, and why you need administrative privileges.</small>
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Submitting Request...' : 'Submit Admin Request'}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <button 
              onClick={() => navigate('/')}
              className="btn-secondary"
              style={{ textDecoration: 'none', display: 'inline-block' }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default RequestAdmin;