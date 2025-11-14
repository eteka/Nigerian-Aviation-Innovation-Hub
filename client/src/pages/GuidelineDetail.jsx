import { useParams, Link, Navigate } from 'react-router-dom';
import { getGuidelineBySlug } from '../data/guidelines';
import './GuidelineDetail.css';

function GuidelineDetail() {
  const { slug } = useParams();
  const guideline = getGuidelineBySlug(slug);

  if (!guideline) {
    return <Navigate to="/guidelines" replace />;
  }

  return (
    <div className="page-container">
      <div className="guideline-detail">
        <Link to="/guidelines" className="back-link">
          ← Back to Guidelines
        </Link>

        <div className="detail-header">
          <div className="detail-icon">{guideline.icon}</div>
          <h1>{guideline.title}</h1>
        </div>

        <div className="detail-content">
          {guideline.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="support-section">
          <h2>What This Hub Supports in Nigeria</h2>
          <ul className="support-list">
            {guideline.supportedInNigeria.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="cta-section">
          <h3>Have a project in this area?</h3>
          <p>Submit your innovation proposal and get expert regulatory guidance.</p>
          <Link to="/projects/new" className="btn-primary">
            Submit Your Project
          </Link>
        </div>
      </div>
    </div>
  );
}

export default GuidelineDetail;
