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
