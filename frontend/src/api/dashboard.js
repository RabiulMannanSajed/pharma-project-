import api from './client';

export const adminDashboard = () => api.get('/dashboard/admin');

export const salesmanDashboard = () => api.get('/dashboard/salesman');
