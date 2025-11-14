import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🛩️ Nigeria Aviation Innovation Hub
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          <li className="navbar-item">
            <Link to="/projects" className="navbar-link">Projects</Link>
          </li>
          <li className="navbar-item">
            <Link to="/guidelines" className="navbar-link">Guidelines</Link>
          </li>
          
          {user ? (
            <>
              {user.role === 'regulator' && (
                <li className="navbar-item">
                  <Link to="/admin" className="navbar-link">Admin</Link>
                </li>
              )}
              <li className="navbar-item navbar-user">
                <span className="navbar-username">👤 {user.name}</span>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-link navbar-link-logout">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link navbar-link-login">Login</Link>
              </li>
              <li className="navbar-item">
                <Link to="/signup" className="navbar-link navbar-link-signup">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
