import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../utils/api';
import './NewProject.css';

const CATEGORIES = ['Aircraft Tech', 'Operations', 'Sustainable Fuel', 'Offsets'];

function NewProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
