import api from './axiosInstance';

export const taskApi = {
  createTask: (payload) => api.post('/tasks', payload),
  listTasks: (params) => api.get('/tasks', { params }),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  updateTask: (id, payload) => api.put(`/tasks/${id}`, payload),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  getAdminStats: () => api.get('/tasks/admin/stats'),
  listTasksByOwner: (ownerId, params) =>
    api.get(`/tasks/admin/by-owner/${ownerId}`, { params }),
};

