import type {
  MapVersionEditor,
  OrganizationHierarchy,
} from './services/adminApi';
import { sidebarItems, CAMERA_ZONE_GRID_SIZE } from './constants';
import type { Option, PolygonPoint, SidebarKey } from './types/admin.types';

export function enumLabel(value: number | string, options: Option[]) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (numeric === 2) {
    return 'Yol Noktasi';
  }
  return options.find((option) => option.value === numeric)?.label ?? String(value);
}

export function nodeTypeGeneratesQr(nodeType: number) {
  return nodeType !== 11;
}

export function statusLabel(value: number | string) {
  const key = mapVersionStatusKey(value);
  return { draft: 'Taslak', published: 'Yayinda', archived: 'Arsiv' }[key] ?? String(value);
}

export function mapVersionStatusKey(value: number | string) {
  if (typeof value === 'number') {
    return { 1: 'draft', 2: 'published', 3: 'archived' }[value] ?? 'unknown';
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'draft', 'taslak'].includes(normalized)) {
    return 'draft';
  }

  if (['2', 'published', 'yayinda', 'yayÄ±nda'].includes(normalized)) {
    return 'published';
  }

  if (['3', 'archived', 'archive', 'arsiv', 'arÅŸiv'].includes(normalized)) {
    return 'archived';
  }

  return 'unknown';
}

export function isDraftMapStatus(value: number | string | null | undefined) {
  return value !== null && value !== undefined && mapVersionStatusKey(value) === 'draft';
}

export function isPublishedMapStatus(value: number | string | null | undefined) {
  return value !== null && value !== undefined && mapVersionStatusKey(value) === 'published';
}

export function flattenSites(organizationHierarchy: OrganizationHierarchy | null) {
  return organizationHierarchy?.sites ?? [];
}

export function flattenBuildings(organizationHierarchy: OrganizationHierarchy | null) {
  return flattenSites(organizationHierarchy).flatMap((site) =>
    site.buildings.map((building) => ({
      ...building,
      siteId: site.id,
      siteName: site.name,
    })),
  );
}

export function flattenFloors(organizationHierarchy: OrganizationHierarchy | null) {
  return flattenBuildings(organizationHierarchy).flatMap((building) =>
    building.floors.map((floor) => ({
      ...floor,
      buildingId: building.id,
      buildingName: building.name,
      siteId: building.siteId,
      siteName: building.siteName,
    })),
  );
}

export function flattenParkingFacilities(organizationHierarchy: OrganizationHierarchy | null) {
  return flattenSites(organizationHierarchy).flatMap((site) => site.parkingFacilities);
}

export function flattenCameras(organizationHierarchy: OrganizationHierarchy | null) {
  return flattenSites(organizationHierarchy).flatMap((site) =>
    site.cameras.map((camera) => ({
      ...camera,
      siteId: site.id,
      siteName: site.name,
    })),
  );
}

export function flattenMapVersions(organizationHierarchy: OrganizationHierarchy | null) {
  return flattenFloors(organizationHierarchy).flatMap((floor) =>
    floor.mapVersions.map((version) => ({
      ...version,
      floorId: floor.id,
      floorName: floor.name,
      floorCode: floor.code,
      buildingId: floor.buildingId,
      buildingName: floor.buildingName,
      siteId: floor.siteId,
      siteName: floor.siteName,
    })),
  );
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return 'Mevcut degil';
  }

  return new Date(value).toLocaleString();
}

export function inputClassName() {
  return 'admin-input px-4 py-3 text-sm';
}

export function selectClassName() {
  return `${inputClassName()} appearance-none pr-10`;
}

export function sectionCardClassName() {
  return 'admin-panel-card p-6 lg:p-8';
}

export function rowCardClassName(active = false) {
  return `w-full rounded-[8px] border px-4 py-4 text-left transition ${
    active
      ? 'border-[#1836B9] bg-[#101520] text-[#F5F3EF] shadow-[0_20px_40px_rgba(0,0,0,0.28)]'
      : 'border-[rgba(245,243,239,0.08)] bg-[#0d1013] text-[#d7d2ca] hover:border-[rgba(245,243,239,0.16)] hover:bg-[#14181d]'
  }`;
}

export function subtlePanelClassName() {
  return 'admin-panel-subtle';
}

export function actionButtonClassName(tone: 'neutral' | 'danger' | 'accent' = 'neutral') {
  if (tone === 'danger') {
    return 'admin-action admin-action-danger inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition';
  }

  if (tone === 'accent') {
    return 'admin-action admin-action-accent inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition';
  }

  return 'admin-action inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition';
}

export function mapAssetUrl(assetPath: string) {
  const normalizedPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return normalizedPath.replace(/^\/storage\/maps/, '/admin-map-assets');
}

export function isImageMapAsset(editor: Pick<MapVersionEditor, 'assetContentType'> | null | undefined) {
  return editor?.assetContentType?.startsWith('image/') === true;
}

export function getViewLabel(view: SidebarKey) {
  return sidebarItems.find((item) => item.key === view)?.label ?? view;
}

export function topNavTabs(activeView: SidebarKey, activeViewLabel: string) {
  const tabs = [
    { key: 'overview' as SidebarKey, label: 'Panel', active: activeView === 'overview' },
  ];

  if (activeView !== 'overview') {
    tabs.push({ key: activeView, label: activeViewLabel, active: true });
  }

  return tabs;
}

export function parsePolygonJson(value: string | null | undefined) {
  if (!value?.trim()) {
    return [] as PolygonPoint[];
  }

  try {
    const parsed = JSON.parse(value) as Array<{ x: number; y: number }>;
    return parsed
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
      .map((point) => ({
        x: Math.round(point.x),
        y: Math.round(point.y),
      }));
  } catch {
    return [] as PolygonPoint[];
  }
}

export function stringifyPolygon(points: PolygonPoint[]) {
  return JSON.stringify(points);
}

export function getMapsiteBaseUrl() {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  const configured = env?.VITE_MAPSITE_BASE_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

    if (isLocalHost) {
      return 'http://localhost:3000';
    }

    return window.location.origin.replace(/\/$/, '');
  }

  return 'http://localhost:3000';
}

export function buildMapsiteMapUrl(referenceId: string | null | undefined) {
  const normalized = referenceId?.trim();
  if (!normalized) {
    return '';
  }

  return `${getMapsiteBaseUrl()}/map?ref=${encodeURIComponent(normalized)}`;
}

export function buildMapsiteFloorUrl(floorId: string | null | undefined, embed = false) {
  const normalized = floorId?.trim();
  if (!normalized) {
    return '';
  }

  const params = new URLSearchParams({ floorId: normalized });
  if (embed) {
    params.set('embed', '1');
  }

  return `${getMapsiteBaseUrl()}/map?${params.toString()}`;
}

export function snapToGrid(value: number, max: number, gridSize = CAMERA_ZONE_GRID_SIZE) {
  if (gridSize <= 1) {
    return Math.max(0, Math.min(value, max));
  }

  const snapped = Math.round(value / gridSize) * gridSize;
  return Math.max(0, Math.min(snapped, max));
}

export function resolveContainedImageRect(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
) {
  if (!containerWidth || !containerHeight || !imageWidth || !imageHeight) {
    return {
      left: 0,
      top: 0,
      width: containerWidth,
      height: containerHeight,
    };
  }

  const scale = Math.min(containerWidth / imageWidth, containerHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return {
    left: (containerWidth - width) / 2,
    top: (containerHeight - height) / 2,
    width,
    height,
  };
}
