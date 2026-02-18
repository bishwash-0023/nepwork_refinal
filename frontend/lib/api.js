import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5135';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Jobs API
export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  getMyJobs: () => api.get('/jobs/my'),
  create: (data) => api.post('/jobs', data),
  updateStatus: (id, status) => api.put(`/jobs/${id}/status`, { status }),
};

// Applications API
export const applicationsAPI = {
  create: (data) => api.post('/applications', data),
  getJobApplications: (jobId) => api.get(`/applications/job/${jobId}`),
  getById: (id) => api.get(`/applications/${id}`),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
};

// Questions API
export const questionsAPI = {
  create: (data) => api.post('/questions', data),
  getByJob: (jobId) => api.get(`/questions/job/${jobId}`),
  answer: (id, answer) => api.put(`/questions/${id}/answer`, { answer }),
  react: (id, type, target) => api.post(`/questions/${id}/react`, { type, target }),
  delete: (id) => api.delete(`/questions/${id}`),
  getMyJobQuestions: () => api.get('/questions/my'),
};

// Proposals API
export const proposalsAPI = {
  create: (data) => api.post('/proposals', data),
  getMyProposals: () => api.get('/proposals/my'),
  getJobProposals: (jobId) => api.get(`/jobs/${jobId}/proposals`),
  updateStatus: (id, status) => api.put(`/proposals/${id}/status`, { status }),
};

// Messages API
export const messagesAPI = {
  create: (data) => api.post('/messages', data),
  getJobMessages: (jobId) => api.get(`/jobs/${jobId}/messages`),
};

// Reviews API
export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  getUserReviews: (userId) => api.get(`/users/${userId}/reviews`),
};

// Admin API
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllJobs: (params) => api.get('/admin/jobs', { params }),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteImage: (path) => api.delete('/upload/image', { data: { path } }),
};

export default api;

