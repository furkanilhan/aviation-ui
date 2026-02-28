import axiosInstance from './axiosInstance';

export const getLocations = () => axiosInstance.get('/locations');
export const createLocation = (data) => axiosInstance.post('/locations', data);
export const updateLocation = (id, data) => axiosInstance.put(`/locations/${id}`, data);
export const deleteLocation = (id) => axiosInstance.delete(`/locations/${id}`);