import api from './client';

export const listAttendance = (params = {}) => api.get('/attendance', { params });

export const markAttendance = (payload) => api.post('/attendance', payload);

export const updateAttendance = (id, payload) => api.patch(`/attendance/${id}`, payload);

export const deleteAttendance = (id) => api.delete(`/attendance/${id}`);

export const myAttendance = (params = {}) => api.get('/attendance/my-attendance', { params });

export const dailyAttendance = () => api.get('/attendance/daily');

export const monthlyAttendance = (params = {}) => api.get('/attendance/monthly', { params });

export const myMonthlyStats = (params = {}) => api.get('/attendance/my-monthly-stats', { params });
