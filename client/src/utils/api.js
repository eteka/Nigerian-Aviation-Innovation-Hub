import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// CSRF token management
let csrfToken = null;

// Function to get CSRF token from cookie
const getCSRFTokenFromCookie = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN') {
      return value;
    }
  }
  return null;
};

// Function to fetch CSRF token from server
export const fetchCSRFToken = async () => {
  try {
    const response = await axios.get('/api/v1/csrf', { withCredentials: true });
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

// Request interceptor to add CSRF token to mutation requests
api.interceptors.request.use(
  (config) => {
    // Add CSRF token to POST, PUT, DELETE requests
    if (['post', 'put', 'delete'].includes(config.method?.toLowerCase())) {
      const token = csrfToken || getCSRFTokenFromCookie();
      if (token) {
        config.headers['X-CSRF-Token'] = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle CSRF errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If CSRF token is invalid or missing, try to refresh it
    if (error.response?.data?.error?.code === 'CSRF_TOKEN_INVALID' || 
        error.response?.data?.error?.code === 'CSRF_TOKEN_MISSING') {
      
      console.log('CSRF token invalid, refreshing...');
      const newToken = await fetchCSRFToken();
      
      if (newToken && error.config) {
        // Retry the original request with new token
        error.config.headers['X-CSRF-Token'] = newToken;
        return api.request(error.config);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  hasAdmin: () => api.get('/auth/has-admin'),
  requestAdmin: (data) => api.post('/auth/request-admin', data)
};

export const projectAPI = {
  getAll: (category) => api.get('/projects', { params: category ? { category } : {} }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data)
};

export const adminAPI = {
  getProjects: (filters) => api.get('/admin/projects', { params: filters }),
  updateProjectStatus: (id, status) => api.put(`/admin/projects/${id}/status`, { status }),
  getUsers: (search) => api.get('/admin/users', { params: search ? { q: search } : {} }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getAuditLogs: (limit = 50) => api.get('/admin/audit-logs', { params: { limit } }),
  getRequests: () => api.get('/admin/requests'),
  approveRequest: (id) => api.put(`/admin/requests/${id}/approve`),
  rejectRequest: (id) => api.put(`/admin/requests/${id}/reject`)
};

export default api;
