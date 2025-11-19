import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../utils/api';
import './NewProject.css';

const CATEGORIES = ['Aircraft Tech', 'Operations', 'Sustainable Fuel', 'Offsets'];

const DEMO_DATA = {
  title: 'Electric VTOL Aircraft for Urban Transport',
  description: 'Developing a zero-emission vertical take-off and landing aircraft for urban air mobility in Lagos. The aircraft features advanced battery technology, autonomous flight capabilities, and meets ICAO noise reduction standards. This innovation aims to reduce traffic congestion while maintaining environmental sustainability.',
  category: 'Aircraft Tech'
};

function NewProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // Check if demo mode is active
    const isDemoMode = localStorage.getItem('demoMode') === 'true';
    setDemoMode(isDemoMode);
    
    if (isDemoMode) {
      setFormData(DEMO_DATA);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.category) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      const response = await projectAPI.create(formData);
      navigate(`/projects/${response.data.project.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="new-project-container">
        <h1>Submit New Project</h1>
        <p className="subtitle">Share your aviation innovation with regulators and the community</p>

        {demoMode && (
          <div className="demo-banner">
            ✨ Demo Mode Active - Form pre-filled with sample data
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-group">
            <label htmlFor="title">Project Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Autonomous Drone Delivery System"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">ICAO Basket Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Project Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your innovation, its goals, and how it contributes to aviation sustainability..."
              rows="8"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewProject;
