import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../utils/api';
import './Projects.css';

const CATEGORIES = ['All', 'Aircraft Tech', 'Operations', 'Sustainable Fuel', 'Offsets'];

function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const category = selectedCategory === 'All' ? null : selectedCategory;
      const response = await projectAPI.getAll(category);
      setProjects(response.data);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
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

  return (
    <div className="page-container">
      <div className="projects-header">
        <h1>Projects</h1>
        {user && (
          <Link to="/projects/new" className="btn-primary">
            Submit New Project
          </Link>
        )}
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
          >
            {category}
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="no-projects">
          <p>No projects found{selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}.</p>
          {user && <p>Be the first to <Link to="/projects/new">submit a project</Link>!</p>}
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <Link to={`/projects/${project.id}`} key={project.id} className="project-card">
              <div className="project-card-header">
                <h3>{project.title}</h3>
                <span className={`category-pill ${getCategoryColor(project.category)}`}>
                  {project.category}
                </span>
              </div>
              <p className="project-description">
                {project.description.length > 150
                  ? `${project.description.substring(0, 150)}...`
                  : project.description}
              </p>
              <div className="project-card-footer">
                <span className={`status-badge ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className="project-owner">By {project.owner_name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;
