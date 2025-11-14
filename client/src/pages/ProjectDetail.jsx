import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../utils/api';
import './ProjectDetail.css';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getById(id);
      setProject(response.data);
      setEditData({
        title: response.data.title,
        description: response.data.description,
        category: response.data.category
      });
    } catch (err) {
      setError(err.response?.status === 404 ? 'Project not found' : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      title: project.title,
      description: project.description,
      category: project.category
    });
  };

  const handleSaveEdit = async () => {
    try {
      await projectAPI.update(id, editData);
      setIsEditing(false);
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update project');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Aircraft Tech': 'bg-blue-100 text-blue-800',
      'Operations': 'bg-green-100 text-green-800',
      'Sustainable Fuel': 'bg-yellow-100 text-yellow-800',
      'Offsets': 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Submitted': 'bg-blue-50 text-blue-700',
      'Under Review': 'bg-yellow-50 text-yellow-700',
      'Feedback Provided': 'bg-orange-50 text-orange-700',
      'In Progress': 'bg-indigo-50 text-indigo-700',
      'Completed': 'bg-green-50 text-green-700'
    };
    return colors[status] || 'bg-gray-50 text-gray-700';
  };

  const isOwner = user && project && user.id === project.owner_id;
  const isRegulator = user && user.role === 'regulator';
  const canEdit = isOwner || isRegulator;

  if (loading) {
    return <div className="page-container"><div className="loading">Loading project...</div></div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h2>{error}</h2>
          <Link to="/projects" className="btn-primary">Back to Projects</Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="page-container">
      <div className="project-detail">
        <div className="detail-header">
          <Link to="/projects" className="back-link">← Back to Projects</Link>
          {canEdit && !isEditing && (
            <button onClick={handleEdit} className="btn-edit">
              Edit Project
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={editData.category}
                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              >
                <option value="Aircraft Tech">Aircraft Tech</option>
                <option value="Operations">Operations</option>
                <option value="Sustainable Fuel">Sustainable Fuel</option>
                <option value="Offsets">Offsets</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows="8"
              />
            </div>
            <div className="edit-actions">
              <button onClick={handleCancelEdit} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveEdit} className="btn-primary">Save Changes</button>
            </div>
          </div>
        ) : (
          <>
            <div className="detail-title-section">
              <h1>{project.title}</h1>
              <div className="detail-badges">
                <span className={`category-pill ${getCategoryColor(project.category)}`}>
                  {project.category}
                </span>
                <span className={`status-badge ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            </div>

            <div className="detail-meta">
              <div className="meta-item">
                <span className="meta-label">Submitted by:</span>
                <span className="meta-value">{project.owner_name}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Email:</span>
                <span className="meta-value">{project.owner_email}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Created:</span>
                <span className="meta-value">
                  {new Date(project.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              {project.updated_at !== project.created_at && (
                <div className="meta-item">
                  <span className="meta-label">Last updated:</span>
                  <span className="meta-value">
                    {new Date(project.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="detail-description">
              <h2>Project Description</h2>
              <p>{project.description}</p>
            </div>

            {isRegulator && (
              <div className="regulator-info">
                <p><strong>Regulator View:</strong> Status management will be available in the Admin dashboard (Milestone 5)</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProjectDetail;
