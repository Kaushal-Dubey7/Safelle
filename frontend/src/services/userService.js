import api from './api';

export const userService = {
  getProfile: () => api.get('/api/user/me'),
  updateProfile: (data) => api.put('/api/user/me', data),
  changePassword: (data) => api.put('/api/user/password', data),
  uploadAvatar: (formData) => api.post('/api/user/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
