import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const { user } = useAuth();
  const [demoMode, setDemoMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isRegulator = user?.role === 'regulator';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDemoToggle = () => {
    setDemoMode(!demoMode);
    if (!demoMode) {
      localStorage.setItem('demoMode', 'true');
    } else {
      localStorage.removeItem('demoMode');
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <div className={`hero ${scrolled ? 'scrolled' : ''}`}>
        <div className="hero-background">
          <div className="hero-pattern"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">✈️</span>
            <span>Nigeria's Premier Aviation Innovation Platform</span>
          </div>
          <h1 className="hero-title">
            Transforming Aviation Through
            <span className="gradient-text"> Innovation & Collaboration</span>
          </h1>
          <p className="hero-description">
            Empowering Nigeria's aviation sector by connecting innovators with regulatory
            authorities. Develop cutting-edge technologies safely, sustainably, and in
            compliance with ICAO international standards.
          </p>

          {/* CTA Buttons */}
          <div className="hero-actions">
            {!user ? (
              <>
                <Link to="/signup" className="btn btn-primary">
                  <span>Get Started Free</span>
                  <span className="btn-icon">→</span>
                </Link>
                <Link to="/projects" className="btn btn-secondary">
                  <span>Explore Projects</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/projects/new" className="btn btn-primary">
                  <span>Submit Project</span>
                  <span className="btn-icon">🚀</span>
                </Link>
                <Link to="/projects" className="btn btn-secondary">
                  <span>Browse Projects</span>
                </Link>
              </>
            )}
          </div>

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
              Demo mode pre-fills forms with sample data for quick testing
            </p>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-item">
          <div className="stat-number">100%</div>
          <div className="stat-label">ICAO Compliant</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">24/7</div>
          <div className="stat-label">Support Available</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">Secure</div>
          <div className="stat-label">End-to-End Encryption</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">Fast</div>
          <div className="stat-label">Quick Approval Process</div>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="section-header">
        <h2>Get Started in Minutes</h2>
        <p>Choose your path and start innovating today</p>
      </div>

      <div className="action-cards">
        <Link to="/projects" className="action-card">
          <div className="card-header">
            <div className="card-icon">📊</div>
            <div className="card-badge">Explore</div>
          </div>
          <h3>Browse Projects</h3>
          <p>Discover innovative aviation solutions from talented innovators across Nigeria</p>
          <div className="card-footer">
            <span className="card-link">View All Projects</span>
            <span className="card-arrow">→</span>
          </div>
        </Link>

        <Link to="/guidelines" className="action-card">
          <div className="card-header">
            <div className="card-icon">📋</div>
            <div className="card-badge">Learn</div>
          </div>
          <h3>Compliance Guidelines</h3>
          <p>Access comprehensive ICAO-aligned regulations, standards, and best practices</p>
          <div className="card-footer">
            <span className="card-link">Read Guidelines</span>
            <span className="card-arrow">→</span>
          </div>
        </Link>

        {user && (
          <Link to="/projects/new" className="action-card card-primary">
            <div className="card-header">
              <div className="card-icon">🚀</div>
              <div className="card-badge">Submit</div>
            </div>
            <h3>Launch Your Project</h3>
            <p>Share your aviation innovation with regulators and get expert feedback</p>
            <div className="card-footer">
              <span className="card-link">Submit Now</span>
              <span className="card-arrow">→</span>
            </div>
          </Link>
        )}

        {isRegulator && (
          <Link to="/admin" className="action-card card-admin">
            <div className="card-header">
              <div className="card-icon">⚙️</div>
              <div className="card-badge">Admin</div>
            </div>
            <h3>Admin Dashboard</h3>
            <p>Manage projects, users, and provide regulatory oversight efficiently</p>
            <div className="card-footer">
              <span className="card-link">Open Dashboard</span>
              <span className="card-arrow">→</span>
            </div>
          </Link>
        )}

        {!user && (
          <Link to="/signup" className="action-card card-highlight">
            <div className="card-header">
              <div className="card-icon">✨</div>
              <div className="card-badge">Free</div>
            </div>
            <h3>Join the Hub</h3>
            <p>Create your account and become part of Nigeria's aviation innovation community</p>
            <div className="card-footer">
              <span className="card-link">Sign Up Free</span>
              <span className="card-arrow">→</span>
            </div>
          </Link>
        )}
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="section-header">
          <h2>Why Innovators Choose Our Platform</h2>
          <p>Everything you need to bring your aviation ideas to life</p>
        </div>

        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">🛡️</div>
            </div>
            <h4>Regulatory Compliance</h4>
            <p>Ensure your innovations meet ICAO and local Nigerian aviation standards from day one</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">🤝</div>
            </div>
            <h4>Direct Collaboration</h4>
            <p>Connect directly with aviation regulators for real-time guidance and approval processes</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">🌱</div>
            </div>
            <h4>Sustainable Innovation</h4>
            <p>Prioritize eco-friendly and sustainable aviation solutions for a greener future</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">📈</div>
            </div>
            <h4>Progress Tracking</h4>
            <p>Monitor your project status in real-time from initial submission to final approval</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">🔒</div>
            </div>
            <h4>Secure Platform</h4>
            <p>Enterprise-grade security protecting your intellectual property and sensitive data</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">⚡</div>
            </div>
            <h4>Fast Processing</h4>
            <p>Streamlined approval workflows designed to accelerate your innovation timeline</p>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      {!user && (
        <div className="cta-banner">
          <div className="cta-content">
            <h3>Ready to Transform Nigerian Aviation?</h3>
            <p>Join hundreds of innovators already shaping the future of flight</p>
            <Link to="/signup" className="btn btn-light">
              <span>Create Free Account</span>
              <span className="btn-icon">→</span>
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section footer-about">
            <h4>Nigeria Aviation Innovation Hub</h4>
            <p className="footer-text">
              Connecting aviation innovators with regulatory authorities to develop
              cutting-edge technologies safely, sustainably, and in compliance with
              international standards.
            </p>
            <div className="footer-social">
              <a href="https://github.com/eteka/Nigerian-Aviation-Innovation-Hub" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Platform</h4>
            <Link to="/projects">Browse Projects</Link>
            <Link to="/guidelines">Guidelines</Link>
            {user ? (
              <Link to="/projects/new">Submit Project</Link>
            ) : (
              <>
                <Link to="/signup">Sign Up</Link>
                <Link to="/login">Login</Link>
              </>
            )}
          </div>

          <div className="footer-section">
            <h4>Resources</h4>
            <a href={`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/docs`} target="_blank" rel="noopener noreferrer">
              API Documentation
            </a>
            <a href="https://github.com/eteka/Nigerian-Aviation-Innovation-Hub" target="_blank" rel="noopener noreferrer">
              GitHub Repository
            </a>
            <Link to="/guidelines">Compliance Guide</Link>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <a href="https://github.com/eteka/Nigerian-Aviation-Innovation-Hub/issues" target="_blank" rel="noopener noreferrer">
              Report Issues
            </a>
            <a href="https://github.com/eteka/Nigerian-Aviation-Innovation-Hub#readme" target="_blank" rel="noopener noreferrer">
              Documentation
            </a>
            <Link to="/guidelines">Help Center</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Nigeria Aviation Innovation Hub. Building the future of Nigerian aviation.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
