import axiosInstance from './axiosInstance';

export const getTransportations = () => axiosInstance.get('/transportations');
export const createTransportation = (data) => axiosInstance.post('/transportations', data);
export const updateTransportation = (id, data) => axiosInstance.put(`/transportations/${id}`, data);
export const deleteTransportation = (id) => axiosInstance.delete(`/transportations/${id}`);