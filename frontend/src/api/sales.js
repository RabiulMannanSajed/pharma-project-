import api from './client';

export const listSales = (params = {}) => api.get('/sales', { params });

export const createSale = (payload) => api.post('/sales', payload);

export const updateSale = (id, payload) => api.patch(`/sales/${id}`, payload);

export const deleteSale = (id) => api.delete(`/sales/${id}`);

export const mySales = (params = {}) => api.get('/sales/my-sales', { params });

export const dailyReport = () => api.get('/sales/daily');

export const weeklyReport = () => api.get('/sales/weekly');

export const monthlyReport = () => api.get('/sales/monthly');

export const customReport = (params = {}) => api.get('/sales/reports/custom', { params });

export const dailySeries = (params = {}) => api.get('/sales/reports/daily-series', { params });
