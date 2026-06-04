import { request } from './client';
import type { OrganizationHierarchy, OrganizationSummary } from './types';

export const facilitiesApi = {
  getOrganizations: (token: string) =>
    request<OrganizationSummary[]>('/api/facilities/organizations', {}, token),

  createOrganization: (token: string, name: string, description: string) =>
    request<OrganizationSummary>(
      '/api/facilities/organizations',
      {
        method: 'POST',
        body: JSON.stringify({ name, description: description || null }),
      },
      token,
    ),

  updateOrganization: (token: string, organizationId: string, payload: { name: string; description: string | null }) =>
    request<void>(
      `/api/facilities/organizations/${organizationId}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  deleteOrganization: (token: string, organizationId: string) =>
    request<void>(`/api/facilities/organizations/${organizationId}`, { method: 'DELETE' }, token),

  getOrganizationHierarchy: (token: string, organizationId: string) =>
    request<OrganizationHierarchy>(`/api/facilities/organizations/${organizationId}`, {}, token),

  createSite: (
    token: string,
    organizationId: string,
    payload: { code: string; name: string; siteType: number | string; address: string },
  ) =>
    request<string>(
      `/api/facilities/organizations/${organizationId}/sites`,
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  updateSite: (
    token: string,
    siteId: string,
    payload: { code: string; name: string; siteType: number | string; address: string | null },
  ) =>
    request<void>(
      `/api/facilities/sites/${siteId}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  deleteSite: (token: string, siteId: string) =>
    request<void>(`/api/facilities/sites/${siteId}`, { method: 'DELETE' }, token),

  createBuilding: (
    token: string,
    siteId: string,
    payload: { code: string; name: string; buildingType: number | string },
  ) =>
    request<string>(
      `/api/facilities/sites/${siteId}/buildings`,
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  updateBuilding: (
    token: string,
    buildingId: string,
    payload: { code: string; name: string; buildingType: number | string },
  ) =>
    request<void>(
      `/api/facilities/buildings/${buildingId}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  deleteBuilding: (token: string, buildingId: string) =>
    request<void>(`/api/facilities/buildings/${buildingId}`, { method: 'DELETE' }, token),

  createFloor: (
    token: string,
    buildingId: string,
    payload: { code: string; name: string; level: number },
  ) =>
    request<string>(
      `/api/facilities/buildings/${buildingId}/floors`,
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  updateFloor: (
    token: string,
    floorId: string,
    payload: { code: string; name: string; level: number },
  ) =>
    request<void>(
      `/api/facilities/floors/${floorId}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  deleteFloor: (token: string, floorId: string) =>
    request<void>(`/api/facilities/floors/${floorId}`, { method: 'DELETE' }, token),

  createParkingFacility: (
    token: string,
    siteId: string,
    payload: { buildingId?: string | null; code: string; name: string; facilityType: number | string },
  ) =>
    request<string>(
      `/api/facilities/sites/${siteId}/parking-facilities`,
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  updateParkingFacility: (
    token: string,
    parkingFacilityId: string,
    payload: { buildingId?: string | null; code: string; name: string; facilityType: number | string },
  ) =>
    request<void>(
      `/api/facilities/parking-facilities/${parkingFacilityId}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  deleteParkingFacility: (token: string, parkingFacilityId: string) =>
    request<void>(`/api/facilities/parking-facilities/${parkingFacilityId}`, { method: 'DELETE' }, token),

  createParkingZone: (
    token: string,
    parkingFacilityId: string,
    payload: { floorId?: string | null; code: string; name: string },
  ) =>
    request<string>(
      `/api/facilities/parking-facilities/${parkingFacilityId}/zones`,
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  updateParkingZone: (
    token: string,
    parkingZoneId: string,
    payload: { floorId?: string | null; code: string; name: string },
  ) =>
    request<void>(
      `/api/facilities/parking-zones/${parkingZoneId}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  deleteParkingZone: (token: string, parkingZoneId: string) =>
    request<void>(`/api/facilities/parking-zones/${parkingZoneId}`, { method: 'DELETE' }, token),
};
