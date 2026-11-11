import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials) => {
    // FastAPI OAuth2 expects form-urlencoded data
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    return api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  register: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
};

// Documents API
export const documentsAPI = {
  getAll: (params) => api.get('/api/documents', { params }),
  getById: (id) => api.get(`/api/documents/${id}`),
  create: (data) => api.post('/api/documents', data),
  update: (id, data) => api.put(`/api/documents/${id}`, data),
  delete: (id) => api.delete(`/api/documents/${id}`),
  incrementViews: (id) => api.post(`/api/documents/${id}/view`),
};

// Comments API
export const commentsAPI = {
  getByDocument: (documentId) => api.get(`/api/documents/${documentId}/comments`),
  create: (data) => api.post('/api/comments', data),
  update: (id, data) => api.put(`/api/comments/${id}`, data),
  delete: (id) => api.delete(`/api/comments/${id}`),
};

// Votes API
export const votesAPI = {
  vote: (data) => api.post('/api/votes', data),
  getMyVote: (targetType, targetId) => 
    api.get(`/api/votes/${targetType}/${targetId}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/api/categories'),
  create: (data) => api.post('/api/categories', data),
};

// Tags API
export const tagsAPI = {
  getAll: () => api.get('/api/tags'),
  create: (data) => api.post('/api/tags', data),
};

// Search API (IR System)
export const searchAPI = {
  search: (query, topK = 20) => 
    api.get('/api/search', { params: { query, top_k: topK } }),
  logClick: (data) => api.post('/api/search/click', data),
  getMetrics: () => api.get('/api/search/metrics'),
  getPopularQueries: (limit = 10) => 
    api.get('/api/search/popular', { params: { limit } }),
};

export default api;
