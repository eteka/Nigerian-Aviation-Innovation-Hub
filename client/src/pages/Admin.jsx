import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../utils/api';
import Toast from '../components/Toast';
import './Admin.css';

const CATEGORIES = ['All', 'Aircraft Tech', 'Operations', 'Sustainable Fuel', 'Offsets'];
const STATUSES = ['All', 'Submitted', 'Under Review', 'Feedback Provided', 'In Progress', 'Completed'];

function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('projects');
  const [toast, setToast] = useState(null);

  // Projects state
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectFilters, setProjectFilters] = useState({
    category: 'All',
    status: 'All',
    search: ''
  });

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Admin requests state
  const [adminRequests, setAdminRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'projects') {
      fetchProjects();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'audit') {
      fetchAuditLogs();
    } else if (activeTab === 'requests') {
      fetchAdminRequests();
    }
  }, [activeTab, projectFilters, userSearch]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const filters = {};
      if (projectFilters.category !== 'All') filters.category = projectFilters.category;
      if (projectFilters.status !== 'All') filters.status = projectFilters.status;
      if (projectFilters.search) filters.q = projectFilters.search;

      const response = await adminAPI.getProjects(filters);
      setProjects(response.data);
    } catch (error) {
      showToast('Failed to load projects', 'error');
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await adminAPI.getUsers(userSearch);
      setUsers(response.data);
    } catch (error) {
      showToast('Failed to load users', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const response = await adminAPI.getAuditLogs();
      setAuditLogs(response.data);
    } catch (error) {
      showToast('Failed to load audit logs', 'error');
    } finally {
      setAuditLoading(false);
    }
  };

  const fetchAdminRequests = async () => {
    try {
      setRequestsLoading(true);
      const response = await adminAPI.getRequests();
      setAdminRequests(response.data);
    } catch (error) {
      showToast('Failed to load admin requests', 'error');
    } finally {
      setRequestsLoading(false);
    }
  };

  const updateProjectStatus = async (projectId, newStatus) => {
    const originalProjects = [...projects];
    
    // Optimistic update
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, status: newStatus } : p
    ));

    try {
      await adminAPI.updateProjectStatus(projectId, newStatus);
      showToast('Project status updated successfully');
    } catch (error) {
      // Revert on error
      setProjects(originalProjects);
      showToast('Failed to update project status', 'error');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    const originalUsers = [...users];
    
    // Optimistic update
    setUsers(users.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));

    try {
      await adminAPI.updateUserRole(userId, newRole);
      showToast('User role updated successfully');
    } catch (error) {
      // Revert on error
      setUsers(originalUsers);
      showToast(error.response?.data?.error || 'Failed to update user role', 'error');
    }
  };

  const handleApproveRequest = async (requestId) => {
    const originalRequests = [...adminRequests];
    
    // Optimistic update
    setAdminRequests(adminRequests.map(req => 
      req.id === requestId ? { ...req, status: 'approved' } : req
    ));

    try {
      await adminAPI.approveRequest(requestId);
      showToast('Admin request approved successfully');
      // Refresh users list to show new regulator
      if (activeTab === 'users') {
        fetchUsers();
      }
    } catch (error) {
      // Revert on error
      setAdminRequests(originalRequests);
      showToast('Failed to approve request', 'error');
    }
  };

  const handleRejectRequest = async (requestId) => {
    const originalRequests = [...adminRequests];
    
    // Optimistic update
    setAdminRequests(adminRequests.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));

    try {
      await adminAPI.rejectRequest(requestId);
      showToast('Admin request rejected');
    } catch (error) {
      // Revert on error
      setAdminRequests(originalRequests);
      showToast('Failed to reject request', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="page-container">
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.name}! Manage projects, users, and view audit logs.</p>
        </div>

        <div className="admin-tabs">
          <button 
            className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`tab-button ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            Audit Logs
          </button>
          <button 
            className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests
          </button>
        </div>

        {activeTab === 'projects' && (
          <div className="tab-content">
            <div className="filters">
              <select
                value={projectFilters.category}
                onChange={(e) => setProjectFilters({...projectFilters, category: e.target.value})}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={projectFilters.status}
                onChange={(e) => setProjectFilters({...projectFilters, status: e.target.value})}
              >
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search projects..."
                value={projectFilters.search}
                onChange={(e) => setProjectFilters({...projectFilters, search: e.target.value})}
              />
            </div>

            {projectsLoading ? (
              <div className="loading">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="empty-state">No projects found</div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Owner</th>
                      <th>Status</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(project => (
                      <tr key={project.id}>
                        <td>
                          <a 
                            href={`/projects/${project.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="project-link"
                          >
                            {project.title}
                          </a>
                        </td>
                        <td>{project.category}</td>
                        <td>{project.owner.name}</td>
                        <td>
                          <select
                            value={project.status}
                            onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                            className="status-select"
                          >
                            {STATUSES.slice(1).map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                        <td>{formatDate(project.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="tab-content">
            <div className="filters">
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            {usersLoading ? (
              <div className="loading">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="empty-state">No users found</div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(userItem => (
                      <tr key={userItem.id}>
                        <td>{userItem.name}</td>
                        <td>{userItem.email}</td>
                        <td>{userItem.role}</td>
                        <td>
                          <select
                            value={userItem.role}
                            onChange={(e) => updateUserRole(userItem.id, e.target.value)}
                            className="role-select"
                            disabled={userItem.id === user?.id}
                          >
                            <option value="innovator">Innovator</option>
                            <option value="regulator">Regulator</option>
                          </select>
                          {userItem.id === user?.id && (
                            <span className="self-indicator">(You)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="tab-content">
            {auditLoading ? (
              <div className="loading">Loading audit logs...</div>
            ) : auditLogs.length === 0 ? (
              <div className="empty-state">No audit logs found</div>
            ) : (
              <div className="audit-logs">
                {auditLogs.map(log => (
                  <div key={log.id} className="audit-log-item">
                    <div className="audit-header">
                      <span className="audit-action">{log.action}</span>
                      <span className="audit-time">{formatDate(log.createdAt)}</span>
                    </div>
                    <div className="audit-details">
                      <span>Actor: {log.actor.email}</span>
                      <span>Target: {log.targetType}:{log.targetId}</span>
                      {log.before && log.after && (
                        <span>
                          {Object.keys(log.before)[0]}: {Object.values(log.before)[0]} → {Object.values(log.after)[0]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="tab-content">
            {requestsLoading ? (
              <div className="loading">Loading admin requests...</div>
            ) : adminRequests.length === 0 ? (
              <div className="empty-state">No admin requests found</div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminRequests.map(request => (
                      <tr key={request.id}>
                        <td>{request.user.name}</td>
                        <td>{request.user.email}</td>
                        <td>
                          <div className="reason-cell">
                            {request.reason || 'No reason provided'}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge status-${request.status}`}>
                            {request.status}
                          </span>
                        </td>
                        <td>{formatDate(request.createdAt)}</td>
                        <td>
                          {request.status === 'pending' ? (
                            <div className="request-actions">
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                className="btn-approve"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="btn-reject"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="action-completed">
                              {request.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Admin;
