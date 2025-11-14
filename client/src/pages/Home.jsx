import './Home.css'

function Home() {
  return (
    <div className="home">
      <div className="hero-section">
        <h1 className="hero-title">Welcome to the Nigeria Aviation Innovation Hub</h1>
        <p className="hero-subtitle">
          Connecting aviation innovators with regulators and resources to bring bold ideas to life safely
        </p>
        <div className="hero-description">
          <p>
            The Nigeria Aviation Innovation Hub supports the development of cutting-edge aviation technologies 
            including drones, electric and hydrogen aircraft, and AI-powered aviation solutions. Our platform 
            facilitates early regulatory engagement and provides the resources needed to achieve sustainability 
            goals in line with ICAO's CO2 reduction measures.
          </p>
          <p>
            We provide a structured pathway for innovators to develop their ideas safely and compliantly, 
            with sandbox testing opportunities and comprehensive regulatory support throughout the innovation journey.
          </p>
        </div>
      </div>

      <div className="features-section">
        <h2>What We Offer</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Project Submission</h3>
            <p>Submit your aviation innovation proposals and receive expert regulatory feedback</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Knowledge Base</h3>
            <p>Access comprehensive guidelines on drone regulations, CORSIA compliance, and sustainable fuels</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Project Tracking</h3>
            <p>Monitor your projects across ICAO basket categories: Aircraft Tech, Operations, Sustainable Fuel, and Offsets</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Regulatory Support</h3>
            <p>Connect directly with hub managers for guidance on bringing your innovations to market</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
