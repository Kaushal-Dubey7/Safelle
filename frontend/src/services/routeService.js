import api from './api';

export const routeService = {
  getSafeRoute: (params) => api.get('/api/routes/safe', { params }),
};

export const adminService = {
  getIncidents: (params) => api.get('/api/admin/incidents', { params }),
  verifyIncident: (id, data) => api.put(`/api/admin/incident/${id}`, data),
  deleteIncident: (id) => api.delete(`/api/admin/incident/${id}`),
  getStats: () => api.get('/api/admin/stats'),
  getUsers: () => api.get('/api/admin/users'),
};
