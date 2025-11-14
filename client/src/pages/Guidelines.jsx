import { Link } from 'react-router-dom';
import { guidelines } from '../data/guidelines';
import './Guidelines.css';

function Guidelines() {
  return (
    <div className="page-container">
      <div className="guidelines-header">
        <h1>Knowledge Base & Guidelines</h1>
        <p className="guidelines-subtitle">
          Understanding ICAO's approach to sustainable aviation and how the Nigeria Aviation Innovation Hub supports each pillar
        </p>
      </div>

      <div className="guidelines-grid">
        {guidelines.map((guideline) => (
          <Link 
            to={`/guidelines/${guideline.slug}`} 
            key={guideline.id} 
            className="guideline-card"
          >
            <div className="guideline-icon">{guideline.icon}</div>
            <h2>{guideline.title}</h2>
            <p>{guideline.summary}</p>
            <span className="read-more">Read more →</span>
          </Link>
        ))}
      </div>

      <div className="guidelines-footer">
        <div className="info-box">
          <h3>About These Guidelines</h3>
          <p>
            These guidelines are based on ICAO's four-pillar strategy for reducing aviation emissions 
            and achieving sustainable growth. The Nigeria Aviation Innovation Hub supports innovators 
            working on projects across all four areas.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Guidelines;
