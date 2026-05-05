export type AuthResponse = {
  userId: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  isActive: boolean;
  roles: string[];
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

export type UserProfile = {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  roles: string[];
};

export type OrganizationSummary = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
};

export type RoleDto = {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  createdAt: string;
};

export type AdminUserListItem = {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  roles: string[];
};

export type AdminUserSearchResult = {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
};

export type OrganizationAdmin = {
  userId: string;
  organizationId: string;
  roleName: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  assignedAt: string;
};

export type PagedResult<T> = {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type OrganizationHierarchy = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sites: SiteHierarchy[];
};

export type SiteHierarchy = {
  id: string;
  code: string;
  name: string;
  siteType: string | number;
  address: string | null;
  isActive: boolean;
  buildings: BuildingHierarchy[];
  parkingFacilities: ParkingFacilityHierarchy[];
  cameras: CameraHierarchy[];
};

export type BuildingHierarchy = {
  id: string;
  code: string;
  name: string;
  buildingType: string | number;
  isActive: boolean;
  floors: FloorHierarchy[];
};

export type FloorHierarchy = {
  id: string;
  code: string;
  name: string;
  level: number;
  isActive: boolean;
  mapVersions: MapVersionSummary[];
};

export type ParkingFacilityHierarchy = {
  id: string;
  code: string;
  name: string;
  facilityType: string | number;
  isActive: boolean;
  zones: ParkingZone[];
};

export type ParkingZone = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  floorId: string | null;
};

export type CameraZoneHierarchy = {
  id: string;
  name: string;
  detectionThreshold: number;
  polygonJson: string;
  isActive: boolean;
  parkingZoneId: string | null;
  mapVersionId: string | null;
};

export type CameraHierarchy = {
  id: string;
  name: string;
  ipAddress: string;
  streamUrl: string;
  notes: string | null;
  isActive: boolean;
  buildingId: string | null;
  floorId: string | null;
  parkingFacilityId: string | null;
  zones: CameraZoneHierarchy[];
};

export type MapVersionSummary = {
  id: string;
  versionNumber: number;
  name: string;
  status: string;
  publishedAt: string | null;
};

export type MapAsset = {
  originalFileName: string;
  storedFileName: string;
  relativePath: string;
  contentType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
};

export type FacilityMapNode = {
  id: string;
  code: string;
  label: string;
  nodeType: number;
  pixelX: number;
  pixelY: number;
  normalizedX: number;
  normalizedY: number;
  externalReferenceId: string | null;
  isAccessible: boolean;
};

export type FacilityMapConnection = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  distanceMeters: number;
  isBidirectional: boolean;
  isAccessible: boolean;
};

export type FacilityMapTransition = {
  id: string;
  fromMapVersionId: string;
  fromNodeId: string;
  toMapVersionId: string;
  toNodeId: string;
  connectionType: number;
  distanceMeters: number;
  isAccessible: boolean;
  isBidirectional: boolean;
};

export type MapVersionEditor = {
  id: string;
  floorId: string;
  versionNumber: number;
  name: string;
  assetPath: string;
  assetContentType: string;
  width: number;
  height: number;
  status: number | string;
  publishedAt: string | null;
  nodes: FacilityMapNode[];
  connections: FacilityMapConnection[];
  transitions: FacilityMapTransition[];
};

function normalizeMapVersionEditor(editor: MapVersionEditor): MapVersionEditor {
  return {
    ...editor,
    assetContentType: editor.assetContentType ?? '',
    nodes: editor.nodes ?? [],
    connections: editor.connections ?? [],
    transitions: editor.transitions ?? [],
  };
}

export type MapPublishReadinessCheck = {
  code: string;
  label: string;
  status: 'pass' | 'warning' | 'error' | string;
  message: string;
  details: string[];
};

export type MapPublishReadiness = {
  mapVersionId: string;
  canPublish: boolean;
  checks: MapPublishReadinessCheck[];
};

export type ApiProblem = {
  status?: number;
  title?: string;
  detail?: string;
  code?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
};

export class ApiClientError extends Error {
  status?: number;
  title?: string;
  detail?: string;
  code?: string;
  traceId?: string;
  errors?: Record<string, string[]>;

  constructor(problem: ApiProblem, fallbackMessage: string) {
    super(problem.detail || problem.title || fallbackMessage);
    this.name = 'ApiClientError';
    this.status = problem.status;
    this.title = problem.title;
    this.detail = problem.detail;
    this.code = problem.code;
    this.traceId = problem.traceId;
    this.errors = problem.errors;
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}

export function getApiFieldErrors(error: unknown): Record<string, string[]> | null {
  return isApiClientError(error) ? error.errors ?? null : null;
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!isApiClientError(error)) {
    return error instanceof Error ? error.message : fallbackMessage;
  }

  switch (error.code) {
    case 'auth.invalid_credentials':
      return 'E-posta veya kullanici adi ya da sifre hatali.';
    case 'auth.account_locked':
      return 'Hesap gecici olarak kilitlendi. Bir sure sonra tekrar deneyin.';
    case 'auth.account_inactive':
      return 'Hesap aktif degil. Sistem yoneticinizle iletisime gecin.';
    case 'auth.invalid_current_password':
      return 'Mevcut sifre hatali.';
    case 'conflict.email_in_use':
      return 'Bu e-posta adresi zaten kullaniliyor.';
    case 'conflict.username_in_use':
      return 'Bu kullanici adi zaten kullaniliyor.';
    case 'auth.google_not_configured':
      return 'Google ile giris henuz yapilandirilmamis.';
    case 'auth.default_role_missing':
      return 'Varsayilan kullanici rolu tanimli degil.';
    case 'auth.session_not_owned':
      return 'Bu oturum size ait degil.';
    case 'auth.authenticated_user_required':
      return 'Bu islem icin aktif oturum gerekli.';
    case 'validation_failed': {
      const firstError = Object.values(error.errors ?? {}).flat()[0];
      return firstError || 'Form alanlarini kontrol edin.';
    }
    case 'request_invalid':
      return error.detail || 'Istek tamamlanamadi. Girdileri kontrol edin.';
    case 'server_error':
      return fallbackMessage;
    case 'invalid_token':
      return 'Baglanti veya dogrulama kodu gecerli degil ya da suresi doldu.';
    default:
      return error.detail || error.title || fallbackMessage;
  }
}

const API_BASE = '/admin-api';

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let error: ApiProblem | undefined;
    try {
      error = (await response.json()) as ApiProblem;
    } catch {
      error = undefined;
    }

    throw new ApiClientError(
      {
        status: response.status,
        title: error?.title,
        detail: error?.detail,
        code: error?.code,
        traceId: error?.traceId,
        errors: error?.errors,
      },
      `Request failed with ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const adminApi = {
  login: (emailOrUserName: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUserName, password }),
    }),

  refreshToken: (refreshToken: string) =>
    request<AuthResponse>('/api/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  forgotPassword: (email: string) =>
    request<void>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    request<void>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  resendEmailVerification: (email: string) =>
    request<void>('/api/auth/resend-email-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyEmail: (token: string) =>
    request<void>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  getCurrentUser: (token: string) =>
    request<UserProfile>('/api/auth/me', {}, token),

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

  uploadMapAsset: (token: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{
      originalFileName: string;
      storedFileName: string;
      relativePath: string;
      contentType: string;
      sizeBytes: number;
      width?: number | null;
      height?: number | null;
    }>('/api/facility-maps/assets', { method: 'POST', body: formData }, token);
  },

  createMapVersion: (
    token: string,
    floorId: string,
    payload: {
      name: string;
      assetPath: string;
      assetContentType: string;
      width: number;
      height: number;
    },
  ) =>
    request<MapVersionSummary>(
      `/api/facility-maps/floors/${floorId}/versions`,
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  renameMapVersion: (token: string, mapVersionId: string, name: string) =>
    request<void>(
      `/api/facility-maps/versions/${mapVersionId}`,
      { method: 'PUT', body: JSON.stringify({ name }) },
      token,
    ),

  archiveMapVersion: (token: string, mapVersionId: string) =>
    request<void>(`/api/facility-maps/versions/${mapVersionId}/archive`, { method: 'POST' }, token),

  duplicateMapVersion: (token: string, mapVersionId: string, name?: string | null) =>
    request<MapVersionSummary>(
      `/api/facility-maps/versions/${mapVersionId}/duplicate`,
      { method: 'POST', body: JSON.stringify({ name: name || null }) },
      token,
    ),

  deleteMapVersion: (token: string, mapVersionId: string) =>
    request<void>(`/api/facility-maps/versions/${mapVersionId}`, { method: 'DELETE' }, token),

  getMapVersion: async (token: string, mapVersionId: string) =>
    normalizeMapVersionEditor(
      await request<MapVersionEditor>(`/api/facility-maps/versions/${mapVersionId}`, {}, token),
    ),

  getMapPublishReadiness: (token: string, mapVersionId: string) =>
    request<MapPublishReadiness>(
      `/api/facility-maps/versions/${mapVersionId}/publish-readiness`,
      {},
      token,
    ),

  addMapNode: (
    token: string,
    mapVersionId: string,
    payload: {
      label: string;
      nodeType: number;
      pixelX: number;
      pixelY: number;
      isAccessible: boolean;
    },
  ) =>
    request<string>(
      `/api/facility-maps/versions/${mapVersionId}/nodes`,
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  updateMapNode: (
    token: string,
    nodeId: string,
    payload: {
      label: string;
      nodeType: number;
      pixelX: number;
      pixelY: number;
      isAccessible: boolean;
    },
  ) =>
    request<void>(
      `/api/facility-maps/nodes/${nodeId}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  deleteMapNode: (token: string, nodeId: string) =>
    request<void>(`/api/facility-maps/nodes/${nodeId}`, { method: 'DELETE' }, token),

  addMapConnection: (
    token: string,
    mapVersionId: string,
    payload: {
      fromNodeId: string;
      toNodeId: string;
      distanceMeters: number;
      isBidirectional: boolean;
      isAccessible: boolean;
    },
  ) =>
    request<string>(
      `/api/facility-maps/versions/${mapVersionId}/connections`,
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  updateMapConnection: (
    token: string,
    connectionId: string,
    payload: {
      fromNodeId: string;
      toNodeId: string;
      distanceMeters: number;
      isBidirectional: boolean;
      isAccessible: boolean;
    },
  ) =>
    request<void>(
      `/api/facility-maps/connections/${connectionId}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  deleteMapConnection: (token: string, connectionId: string) =>
    request<void>(`/api/facility-maps/connections/${connectionId}`, { method: 'DELETE' }, token),

  addMapTransition: (
    token: string,
    payload: {
      fromMapVersionId: string;
      fromNodeId: string;
      toMapVersionId: string;
      toNodeId: string;
      connectionType: number;
      distanceMeters: number;
      isAccessible: boolean;
      isBidirectional: boolean;
    },
  ) =>
    request<string>(
      '/api/facility-maps/transitions',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  updateMapTransition: (
    token: string,
    transitionId: string,
    payload: {
      fromMapVersionId: string;
      fromNodeId: string;
      toMapVersionId: string;
      toNodeId: string;
      connectionType: number;
      distanceMeters: number;
      isAccessible: boolean;
      isBidirectional: boolean;
    },
  ) =>
    request<void>(
      `/api/facility-maps/transitions/${transitionId}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  deleteMapTransition: (token: string, transitionId: string) =>
    request<void>(`/api/facility-maps/transitions/${transitionId}`, { method: 'DELETE' }, token),

  publishMapVersion: (token: string, mapVersionId: string) =>
    request<void>(
      `/api/facility-maps/versions/${mapVersionId}/publish`,
      { method: 'POST' },
      token,
    ),

  getRoles: (token: string) => request<RoleDto[]>('/api/roles', {}, token),

  getAdminUsers: (token: string) =>
    request<PagedResult<AdminUserListItem>>('/api/admin/users?pageNumber=1&pageSize=10', {}, token),

  searchAdminUsers: (token: string, search: string, limit = 20) =>
    request<AdminUserSearchResult[]>(
      `/api/admin/users/search?search=${encodeURIComponent(search)}&limit=${limit}`,
      {},
      token,
    ),

  getAdminUser: (token: string, userId: string) =>
    request<AdminUserListItem & { updatedAt?: string | null; deletedAt?: string | null }>(
      `/api/admin/users/${userId}`,
      {},
      token,
    ),

  setAdminUserStatus: (token: string, userId: string, isActive: boolean) =>
    request<void>(
      `/api/admin/users/${userId}/status`,
      { method: 'PATCH', body: JSON.stringify({ isActive }) },
      token,
    ),

  softDeleteAdminUser: (token: string, userId: string) =>
    request<void>(`/api/admin/users/${userId}`, { method: 'DELETE' }, token),

  restoreAdminUser: (token: string, userId: string) =>
    request<void>(`/api/admin/users/${userId}/restore`, { method: 'POST' }, token),

  assignRole: (token: string, userId: string, roleId: string) =>
    request<void>(
      `/api/admin/users/${userId}/roles`,
      { method: 'POST', body: JSON.stringify({ roleId }) },
      token,
    ),

  removeRole: (token: string, userId: string, roleId: string) =>
    request<void>(`/api/admin/users/${userId}/roles/${roleId}`, { method: 'DELETE' }, token),

  getOrganizationAdmins: (token: string, organizationId: string) =>
    request<OrganizationAdmin[]>(`/api/admin/organizations/${organizationId}/admins`, {}, token),

  assignOrganizationAdmin: (token: string, organizationId: string, userId: string) =>
    request<void>(
      `/api/admin/organizations/${organizationId}/admins`,
      { method: 'POST', body: JSON.stringify({ userId }) },
      token,
    ),

  removeOrganizationAdmin: (token: string, organizationId: string, userId: string) =>
    request<void>(`/api/admin/organizations/${organizationId}/admins/${userId}`, { method: 'DELETE' }, token),
};
