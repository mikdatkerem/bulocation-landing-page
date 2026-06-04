import { request } from './client';

export const parkingSpotsApi = {
  createParkingSpot: (
    token: string,
    payload: { id: string; label: string; x: number; y: number },
  ) =>
    request<void>(
      '/api/parkingspots',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  updateParkingSpot: (
    token: string,
    parkingSpotId: string,
    payload: { label: string; x: number; y: number },
  ) =>
    request<void>(
      `/api/parkingspots/${parkingSpotId}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  deleteParkingSpot: (token: string, parkingSpotId: string) =>
    request<void>(`/api/parkingspots/${parkingSpotId}`, { method: 'DELETE' }, token),
};
