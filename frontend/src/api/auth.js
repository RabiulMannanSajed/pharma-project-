import api from './client';

export const login = ({ email, password }) => api.post('/auth/login', { email, password });

export const me = () => api.get('/auth/me');

export const changePassword = (payload) => api.post('/auth/change-password', payload);

export const updateMe = (payload) => api.patch('/auth/me', payload);
