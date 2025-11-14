import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requireRegulator = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRegulator && user.role !== 'regulator') {
    return (
      <div className="page-container">
        <h1>Access Denied</h1>
        <p>You need regulator privileges to access this page.</p>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
