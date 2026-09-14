import api from './client';

export const listUsers = (params = {}) => api.get('/users', { params });

export const getUser = (id) => api.get(`/users/${id}`);

export const createSalesman = (payload) => api.post('/users/create-salesman', payload);

export const updateUser = (id, payload) => api.patch(`/users/${id}`, payload);

export const activateUser = (id) => api.patch(`/users/${id}/activate`);

export const deactivateUser = (id) => api.patch(`/users/${id}/deactivate`);

export const deleteUser = (id) => api.delete(`/users/${id}`);
