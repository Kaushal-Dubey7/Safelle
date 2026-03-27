import api from './api';

export const incidentService = {
  getIncidents: (params) => api.get('/api/incidents', { params }),
  createIncident: (data) => api.post('/api/incidents', data),
  getIncidentById: (id) => api.get(`/api/incidents/${id}`),
};
