import { request } from './client';

export const camerasApi = {
  createCamera: (
    token: string,
    siteId: string,
    payload: {
      buildingId?: string | null;
      floorId?: string | null;
      parkingFacilityId?: string | null;
      name: string;
      ipAddress: string;
      streamUrl: string;
      notes?: string | null;
    },
  ) =>
    request<string>(
      `/api/facilities/sites/${siteId}/cameras`,
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  updateCamera: (
    token: string,
    cameraId: string,
    payload: {
      siteId: string;
      buildingId?: string | null;
      floorId?: string | null;
      parkingFacilityId?: string | null;
      name: string;
      ipAddress: string;
      streamUrl: string;
      notes?: string | null;
      isActive: boolean;
    },
  ) =>
    request<void>(
      `/api/facilities/cameras/${cameraId}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  deleteCamera: (token: string, cameraId: string) =>
    request<void>(`/api/facilities/cameras/${cameraId}`, { method: 'DELETE' }, token),

  createCameraZone: (
    token: string,
    cameraId: string,
    payload: {
      parkingZoneId?: string | null;
      mapVersionId?: string | null;
      name: string;
      detectionThreshold: number;
      polygonJson: string;
    },
  ) =>
    request<string>(
      `/api/facilities/cameras/${cameraId}/zones`,
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  updateCameraZone: (
    token: string,
    cameraZoneId: string,
    payload: {
      parkingZoneId?: string | null;
      mapVersionId?: string | null;
      name: string;
      detectionThreshold: number;
      polygonJson: string;
    },
  ) =>
    request<void>(
      `/api/facilities/camera-zones/${cameraZoneId}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  deleteCameraZone: (token: string, cameraZoneId: string) =>
    request<void>(`/api/facilities/camera-zones/${cameraZoneId}`, { method: 'DELETE' }, token),
};
