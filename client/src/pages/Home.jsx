import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const { user } = useAuth();
  const [demoMode, setDemoMode] = useState(false);
  const isRegulator = user?.role === 'regulator';

  const handleDemoToggle = () => {
    setDemoMode(!demoMode);
    if (!demoMode) {
      // Store demo mode in localStorage so NewProject can access it
      localStorage.setItem('demoMode', 'true');
    } else {
      localStorage.removeItem('demoMode');
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero">
        <h1>🛫 Nigeria Aviation Innovation Hub</h1>
        <p className="mission">
          Empowering Nigeria's aviation sector through innovation and collaboration. 
          We connect aviation innovators with regulatory authorities to develop cutting-edge 
          technologies safely, sustainably, and in compliance with international standards.
        </p>
        
        {/* Demo Mode Toggle */}
        <div className="demo-toggle">
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={demoMode} 
              onChange={handleDemoToggle}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="toggle-label">
            {demoMode ? '✨ Demo Mode Active' : '🎯 Try Demo Mode'}
          </span>
        </div>
        {demoMode && (
          <p className="demo-hint">
            Demo mode will pre-fill forms with sample data for quick testing!
          </p>
        )}
      </div>

      {/* Main Action Cards */}
      <div className="action-cards">
        <Link to="/projects" className="action-card">
          <div className="card-icon">📊</div>
          <h3>Browse Projects</h3>
          <p>Explore innovative aviation projects from across Nigeria</p>
          <span className="card-arrow">→</span>
        </Link>

        <Link to="/guidelines" className="action-card">
          <div className="card-icon">📋</div>
          <h3>Compliance Guidelines</h3>
          <p>Access ICAO-aligned regulations and best practices</p>
          <span className="card-arrow">→</span>
        </Link>

        {user && (
          <Link to="/projects/new" className="action-card primary">
            <div className="card-icon">🚀</div>
            <h3>Submit Project</h3>
            <p>Share your aviation innovation idea with regulators</p>
            <span className="card-arrow">→</span>
          </Link>
        )}

        {isRegulator && !demoMode && (
          <Link to="/admin" className="action-card admin">
            <div className="card-icon">⚙️</div>
            <h3>Admin Dashboard</h3>
            <p>Manage projects, users, and regulatory oversight</p>
            <span className="card-arrow">→</span>
          </Link>
        )}

        {!user && (
          <Link to="/signup" className="action-card highlight">
            <div className="card-icon">✨</div>
            <h3>Get Started</h3>
            <p>Join the hub and start innovating today</p>
            <span className="card-arrow">→</span>
          </Link>
        )}
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Why Choose Our Hub?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🛡️</div>
            <h4>Regulatory Compliance</h4>
            <p>Ensure your innovations meet ICAO and local aviation standards</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🤝</div>
            <h4>Direct Collaboration</h4>
            <p>Connect directly with aviation regulators for guidance and approval</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🌱</div>
            <h4>Sustainable Focus</h4>
            <p>Prioritize eco-friendly and sustainable aviation solutions</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📈</div>
            <h4>Track Progress</h4>
            <p>Monitor your project status from submission to approval</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Resources</h4>
            <a href="https://github.com/eteka/Nigerian-Aviation-Innovation-Hub" target="_blank" rel="noopener noreferrer">
              📦 GitHub Repository
            </a>
            <a href="http://localhost:5000/api/docs" target="_blank" rel="noopener noreferrer">
              📚 API Documentation
            </a>
            <Link to="/guidelines">📋 Guidelines</Link>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link to="/projects">Browse Projects</Link>
            {user ? (
              <Link to="/projects/new">Submit Project</Link>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Sign Up</Link>
              </>
            )}
          </div>
          <div className="footer-section">
            <h4>About</h4>
            <p className="footer-text">
              Nigeria Aviation Innovation Hub connects innovators with regulators 
              to advance aviation technology safely and sustainably.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Nigeria Aviation Innovation Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
