import api from './api';

export const sosService = {
  triggerSOS: (data) => api.post('/api/sos', data),
  getMySOS: () => api.get('/api/sos/my'),
};
