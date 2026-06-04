import type { ReactNode } from 'react';

export type Session = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
};

export type SidebarKey = 'overview' | 'organizations' | 'facilities' | 'maps' | 'parking' | 'cameras' | 'users' | 'security';
export type FacilityTab = 'sites' | 'buildings' | 'floors';
export type ParkingTab = 'facilities' | 'zones';
export type MapEditorTool = 'select' | 'node' | 'connection';

export type Option = {
  value: number;
  label: string;
};

export type SearchOption = {
  value: string;
  label: string;
  hint?: string;
};

export type OrganizationForm = {
  name: string;
  description: string;
};

export type SiteForm = {
  code: string;
  name: string;
  siteType: number;
  address: string;
};

export type BuildingForm = {
  siteId: string;
  code: string;
  name: string;
  buildingType: number;
};

export type FloorForm = {
  buildingId: string;
  code: string;
  name: string;
  level: number;
};

export type ParkingFacilityForm = {
  siteId: string;
  buildingId: string;
  code: string;
  name: string;
  facilityType: number;
};

export type ParkingZoneForm = {
  parkingFacilityId: string;
  floorId: string;
  code: string;
  name: string;
};

export type CameraForm = {
  siteId: string;
  buildingId: string;
  floorId: string;
  parkingFacilityId: string;
  name: string;
  ipAddress: string;
  streamUrl: string;
  notes: string;
};

export type CameraZoneForm = {
  cameraId: string;
  parkingZoneId: string;
  mapVersionId: string;
  name: string;
  detectionThreshold: number;
  polygonJson: string;
};

export type MapVersionForm = {
  floorId: string;
  name: string;
  width: number;
  height: number;
};

export type NodeForm = {
  label: string;
  nodeType: number;
  pixelX: number;
  pixelY: number;
  isAccessible: boolean;
};

export type ConnectionForm = {
  fromNodeId: string;
  toNodeId: string;
  distanceMeters: number;
  isBidirectional: boolean;
  isAccessible: boolean;
};

export type TransitionForm = {
  fromNodeId: string;
  toMapVersionId: string;
  toNodeId: string;
  connectionType: number;
  distanceMeters: number;
  isBidirectional: boolean;
  isAccessible: boolean;
};

export type UserActionState = {
  selectedUserId: string;
  selectedRoleId: string;
  userSearchTerm: string;
  organizationSearchTerm: string;
  selectedOrganizationAdminOrganizationId: string;
};

export type MapEditorSelectionState = {
  editingNodeId: string;
  editingConnectionId: string;
};

export type PolygonPoint = {
  x: number;
  y: number;
};

export type CanvasSize = {
  width: number;
  height: number;
};

export type FieldShellProps = {
  label: string;
  children: ReactNode;
};
