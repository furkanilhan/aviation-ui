import axiosInstance from './axiosInstance';

export const searchRoutes = (originId, destinationId, date) =>
  axiosInstance.get('/routes', {
    params: { originId, destinationId, date }
  });