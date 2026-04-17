import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import QRCode from 'qrcode';
import {
  Activity,
  ArrowRight,
  Bell,
  Building2,
  Check,
  ChevronRight,
  Compass,
  Eye,
  EyeOff,
  HelpCircle,
  LogOut,
  Map,
  ParkingCircle,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  Waypoints,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminLogin from './AdminLogin';
import {
  adminApi,
  type AdminUserListItem,
  getApiErrorMessage,
  getApiFieldErrors,
  isApiClientError,
  type BuildingHierarchy,
  type CameraHierarchy,
  type CameraZoneHierarchy,
  type FacilityMapConnection,
  type FacilityMapNode,
  type MapAsset,
  type MapVersionEditor,
  type OrganizationHierarchy,
  type OrganizationSummary,
  type ParkingFacilityHierarchy,
  type PagedResult,
  type RoleDto,
  type SiteHierarchy,
  type UserProfile,
} from './api';

type Session = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
};

type SidebarKey = 'overview' | 'organizations' | 'facilities' | 'maps' | 'parking' | 'cameras' | 'users' | 'security';
type FacilityTab = 'sites' | 'buildings' | 'floors';
type ParkingTab = 'facilities' | 'zones';

type Option = {
  value: number;
  label: string;
};

type SearchOption = {
  value: string;
  label: string;
  hint?: string;
};

const ADMIN_SESSION_STORAGE_KEY = 'bulocation.admin.session';

type SiteForm = {
  code: string;
  name: string;
  siteType: number;
  address: string;
};

type BuildingForm = {
  siteId: string;
  code: string;
  name: string;
  buildingType: number;
};

type FloorForm = {
  buildingId: string;
  code: string;
  name: string;
  level: number;
};

type ParkingFacilityForm = {
  siteId: string;
  buildingId: string;
  code: string;
  name: string;
  facilityType: number;
};

type ParkingZoneForm = {
  parkingFacilityId: string;
  floorId: string;
  code: string;
  name: string;
};

type CameraForm = {
  siteId: string;
  buildingId: string;
  floorId: string;
  parkingFacilityId: string;
  name: string;
  ipAddress: string;
  streamUrl: string;
  notes: string;
};

type CameraZoneForm = {
  cameraId: string;
  parkingZoneId: string;
  mapVersionId: string;
  name: string;
  detectionThreshold: number;
  polygonJson: string;
};

type MapVersionForm = {
  floorId: string;
  name: string;
  width: number;
  height: number;
};

type NodeForm = {
  label: string;
  nodeType: number;
  pixelX: number;
  pixelY: number;
  isAccessible: boolean;
};

type ConnectionForm = {
  fromNodeId: string;
  toNodeId: string;
  distanceMeters: number;
  isBidirectional: boolean;
  isAccessible: boolean;
};

type UserActionState = {
  selectedUserId: string;
  selectedRoleId: string;
};

type MapEditorSelectionState = {
  editingNodeId: string;
  editingConnectionId: string;
};

type PolygonPoint = {
  x: number;
  y: number;
};

type CanvasSize = {
  width: number;
  height: number;
};

const sidebarItems: { key: SidebarKey; label: string; icon: typeof Activity }[] = [
  { key: 'overview', label: 'Panel', icon: Activity },
  { key: 'organizations', label: 'Organizasyonlar', icon: Building2 },
  { key: 'facilities', label: 'Tesisler', icon: Building2 },
  { key: 'maps', label: 'Haritalar', icon: Map },
  { key: 'parking', label: 'Otopark', icon: ParkingCircle },
  { key: 'cameras', label: 'Kameralar', icon: Compass },
  { key: 'users', label: 'Kullanicilar', icon: Users },
  { key: 'security', label: 'Guvenlik', icon: ShieldCheck },
];

const siteTypeOptions: Option[] = [
  { value: 1, label: 'Hastane' },
  { value: 2, label: 'Otopark Kampusu' },
  { value: 3, label: 'AVM' },
  { value: 4, label: 'Universite' },
  { value: 5, label: 'Kamu Tesisi' },
  { value: 6, label: 'Karma Kullanim' },
];

const buildingTypeOptions: Option[] = [
  { value: 1, label: 'Ana Bina' },
  { value: 2, label: 'Klinik' },
  { value: 3, label: 'Acil' },
  { value: 4, label: 'Otopark' },
  { value: 5, label: 'Ofis' },
  { value: 6, label: 'Ek Bina' },
  { value: 99, label: 'Diger' },
];

const parkingFacilityTypeOptions: Option[] = [
  { value: 1, label: 'Acik Otopark' },
  { value: 2, label: 'Kapali Otopark' },
  { value: 3, label: 'Vale' },
  { value: 4, label: 'Karma' },
];

const nodeTypeOptions: Option[] = [
  { value: 1, label: 'Gecis Noktasi' },
  { value: 3, label: 'Giris' },
  { value: 4, label: 'Cikis' },
  { value: 5, label: 'Asansor' },
  { value: 6, label: 'Merdiven' },
  { value: 7, label: 'Rampa' },
  { value: 8, label: 'Park Noktasi' },
  { value: 9, label: 'Otopark Girisi' },
  { value: 10, label: 'Otopark Cikisi' },
  { value: 11, label: 'Kisitli Alan Cizgisi' },
];

const CAMERA_ZONE_GRID_SIZE = 24;

function enumLabel(value: number | string, options: Option[]) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (numeric === 2) {
    return 'Gecis Noktasi';
  }
  return options.find((option) => option.value === numeric)?.label ?? String(value);
}

function nodeTypeGeneratesQr(nodeType: number) {
  return nodeType !== 11;
}

function statusLabel(value: number | string) {
  const numeric = typeof value === 'number' ? value : Number(value);
  return { 1: 'Taslak', 2: 'Yayinda', 3: 'Arsiv' }[numeric] ?? String(value);
}

function flattenSites(organizationHierarchy: OrganizationHierarchy | null) {
  return organizationHierarchy?.sites ?? [];
}

function flattenBuildings(organizationHierarchy: OrganizationHierarchy | null) {
  return flattenSites(organizationHierarchy).flatMap((site) =>
    site.buildings.map((building) => ({
      ...building,
      siteId: site.id,
      siteName: site.name,
    })),
  );
}

function flattenFloors(organizationHierarchy: OrganizationHierarchy | null) {
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

function flattenParkingFacilities(organizationHierarchy: OrganizationHierarchy | null) {
  return flattenSites(organizationHierarchy).flatMap((site) => site.parkingFacilities);
}

function flattenCameras(organizationHierarchy: OrganizationHierarchy | null) {
  return flattenSites(organizationHierarchy).flatMap((site) =>
    site.cameras.map((camera) => ({
      ...camera,
      siteId: site.id,
      siteName: site.name,
    })),
  );
}

function flattenMapVersions(organizationHierarchy: OrganizationHierarchy | null) {
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

function formatDate(value: string | null | undefined) {
  if (!value) {
    return 'Mevcut degil';
  }

  return new Date(value).toLocaleString();
}

function FieldShell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="admin-kicker mb-2 block">
        {label}
      </span>
      {children}
    </label>
  );
}

function SearchableSelect({
  label,
  value,
  options,
  placeholder,
  emptyText,
  onChange,
}: {
  label: string;
  value: string;
  options: SearchOption[];
  placeholder: string;
  emptyText: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState('');
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return options;
    }

    return options.filter((option) =>
      `${option.label} ${option.hint ?? ''}`.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  return (
    <FieldShell label={label}>
      <div className="space-y-3">
        <input
          className={inputClassName()}
          placeholder={placeholder}
          value={query || selectedOption?.label || ''}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            const exact = options.find((option) => option.label === nextQuery);
            if (!nextQuery.trim()) {
              onChange('');
            } else if (exact) {
              onChange(exact.value);
            }
          }}
        />
        <select
          className={selectClassName()}
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange(nextValue);
            setQuery('');
          }}
        >
          <option value="">{emptyText}</option>
          {filteredOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.hint ? `${option.label} - ${option.hint}` : option.label}
            </option>
          ))}
        </select>
        <div className="rounded-none border border-[#23314d] bg-[#0f1727] px-3 py-2 text-xs text-slate-400">
          {value
            ? `Secili kayit: ${selectedOption?.label ?? value}`
            : emptyText}
        </div>
      </div>
    </FieldShell>
  );
}

function inputClassName() {
  return 'admin-input px-4 py-3 text-sm';
}

function selectClassName() {
  return `${inputClassName()} appearance-none pr-10`;
}

function sectionCardClassName() {
  return 'admin-panel-card p-6 lg:p-8';
}

function CodeGuide({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-5 text-slate-400">{children}</p>;
}

function rowCardClassName(active = false) {
  return `w-full rounded-[8px] border px-4 py-4 text-left transition ${
    active
      ? 'border-[#1836B9] bg-[#101520] text-[#F5F3EF] shadow-[0_20px_40px_rgba(0,0,0,0.28)]'
      : 'border-[rgba(245,243,239,0.08)] bg-[#0d1013] text-[#d7d2ca] hover:border-[rgba(245,243,239,0.16)] hover:bg-[#14181d]'
  }`;
}

function subtlePanelClassName() {
  return 'admin-panel-subtle';
}

function actionButtonClassName(tone: 'neutral' | 'danger' | 'accent' = 'neutral') {
  if (tone === 'danger') {
    return 'admin-action admin-action-danger inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition';
  }

  if (tone === 'accent') {
    return 'admin-action admin-action-accent inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition';
  }

  return 'admin-action inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition';
}

function topNavTabs(activeViewLabel: string) {
  return ['Dashboard', 'Analytics', activeViewLabel];
}

function parsePolygonJson(value: string | null | undefined) {
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

function stringifyPolygon(points: PolygonPoint[]) {
  return JSON.stringify(points);
}

function snapToGrid(value: number, max: number, gridSize = CAMERA_ZONE_GRID_SIZE) {
  if (gridSize <= 1) {
    return Math.max(0, Math.min(value, max));
  }

  const snapped = Math.round(value / gridSize) * gridSize;
  return Math.max(0, Math.min(snapped, max));
}

function resolveContainedImageRect(
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

export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeView, setActiveView] = useState<SidebarKey>('organizations');
  const [facilityTab, setFacilityTab] = useState<FacilityTab>('sites');
  const [parkingTab, setParkingTab] = useState<ParkingTab>('facilities');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginFieldErrors, setLoginFieldErrors] = useState<Record<string, string[]> | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('');
  const [organizationHierarchy, setOrganizationHierarchy] = useState<OrganizationHierarchy | null>(null);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [usersPage, setUsersPage] = useState<PagedResult<AdminUserListItem> | null>(null);
  const [mapEditor, setMapEditor] = useState<MapVersionEditor | null>(null);
  const [cameraZoneMapEditor, setCameraZoneMapEditor] = useState<MapVersionEditor | null>(null);
  const [selectedMapVersionId, setSelectedMapVersionId] = useState<string>('');
  const [selectedMapSiteId, setSelectedMapSiteId] = useState<string>('');
  const [selectedMapBuildingId, setSelectedMapBuildingId] = useState<string>('');
  const [selectedMapFloorId, setSelectedMapFloorId] = useState<string>('');
  const [uploadedAsset, setUploadedAsset] = useState<MapAsset | null>(null);
  const [organizationForm, setOrganizationForm] = useState({ name: '', description: '' });
  const [siteForm, setSiteForm] = useState<SiteForm>({ code: '', name: '', siteType: 1, address: '' });
  const [buildingForm, setBuildingForm] = useState<BuildingForm>({
    siteId: '',
    code: '',
    name: '',
    buildingType: 1,
  });
  const [floorForm, setFloorForm] = useState<FloorForm>({
    buildingId: '',
    code: '',
    name: '',
    level: 0,
  });
  const [parkingFacilityForm, setParkingFacilityForm] = useState<ParkingFacilityForm>({
    siteId: '',
    buildingId: '',
    code: '',
    name: '',
    facilityType: 1,
  });
  const [parkingZoneForm, setParkingZoneForm] = useState<ParkingZoneForm>({
    parkingFacilityId: '',
    floorId: '',
    code: '',
    name: '',
  });
  const [cameraForm, setCameraForm] = useState<CameraForm>({
    siteId: '',
    buildingId: '',
    floorId: '',
    parkingFacilityId: '',
    name: '',
    ipAddress: '',
    streamUrl: '',
    notes: '',
  });
  const [cameraZoneForm, setCameraZoneForm] = useState<CameraZoneForm>({
    cameraId: '',
    parkingZoneId: '',
    mapVersionId: '',
    name: '',
    detectionThreshold: 0.8,
    polygonJson: '[]',
  });
  const [mapVersionForm, setMapVersionForm] = useState<MapVersionForm>({
    floorId: '',
    name: '',
    width: 1920,
    height: 1080,
  });
  const [nodeForm, setNodeForm] = useState<NodeForm>({
    label: '',
    nodeType: 1,
    pixelX: 0,
    pixelY: 0,
    isAccessible: true,
  });
  const [connectionForm, setConnectionForm] = useState<ConnectionForm>({
    fromNodeId: '',
    toNodeId: '',
    distanceMeters: 1,
    isBidirectional: true,
    isAccessible: true,
  });
  const [userActionState, setUserActionState] = useState<UserActionState>({
    selectedUserId: '',
    selectedRoleId: '',
  });
  const [mapEditorSelection, setMapEditorSelection] = useState<MapEditorSelectionState>({
    editingNodeId: '',
    editingConnectionId: '',
  });
  const [editingCameraId, setEditingCameraId] = useState<string>('');
  const [editingCameraZoneId, setEditingCameraZoneId] = useState<string>('');
  const [cameraZonePoints, setCameraZonePoints] = useState<PolygonPoint[]>([]);
  const [selectedNodeQrDataUrl, setSelectedNodeQrDataUrl] = useState<string>('');
  const [nodeQrDataUrls, setNodeQrDataUrls] = useState<Record<string, string>>({});
  const [hiddenNodeIds, setHiddenNodeIds] = useState<Record<string, boolean>>({});
  const [mapCanvasSize, setMapCanvasSize] = useState<CanvasSize>({ width: 0, height: 0 });
  const [cameraZoneCanvasSize, setCameraZoneCanvasSize] = useState<CanvasSize>({ width: 0, height: 0 });
  const mapCanvasRef = useRef<HTMLDivElement | null>(null);
  const cameraZoneCanvasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function restoreStoredSession() {
      if (typeof window === 'undefined') {
        return;
      }

      const rawSession = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
      if (!rawSession) {
        return;
      }

      try {
        const parsed = JSON.parse(rawSession) as Session;
        const refreshExpiry = new Date(parsed.refreshTokenExpiresAt).getTime();
        if (Number.isNaN(refreshExpiry) || refreshExpiry <= Date.now()) {
          window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
          return;
        }

        const accessExpiry = new Date(parsed.accessTokenExpiresAt).getTime();
        const shouldRefreshNow =
          Number.isNaN(accessExpiry) || accessExpiry <= Date.now() + 60_000;

        if (shouldRefreshNow) {
          const refreshed = await adminApi.refreshToken(parsed.refreshToken);
          if (cancelled) {
            return;
          }

          setSession({
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken,
            accessTokenExpiresAt: refreshed.accessTokenExpiresAt,
            refreshTokenExpiresAt: refreshed.refreshTokenExpiresAt,
          });
          return;
        }

        if (!cancelled) {
          setSession(parsed);
        }
      } catch {
        window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      }
    }

    void restoreStoredSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!session) {
      window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const sites = useMemo(() => flattenSites(organizationHierarchy), [organizationHierarchy]);
  const buildings = useMemo(() => flattenBuildings(organizationHierarchy), [organizationHierarchy]);
  const floors = useMemo(() => flattenFloors(organizationHierarchy), [organizationHierarchy]);
  const parkingFacilities = useMemo(
    () => flattenParkingFacilities(organizationHierarchy),
    [organizationHierarchy],
  );
  const cameras = useMemo(() => flattenCameras(organizationHierarchy), [organizationHierarchy]);
  const mapVersions = useMemo(() => flattenMapVersions(organizationHierarchy), [organizationHierarchy]);
  const mapSites = useMemo(() => sites, [sites]);
  const mapBuildings = useMemo(
    () => buildings.filter((building) => !selectedMapSiteId || building.siteId === selectedMapSiteId),
    [buildings, selectedMapSiteId],
  );
  const mapFloors = useMemo(
    () =>
      floors.filter(
        (floor) =>
          (!selectedMapSiteId || floor.siteId === selectedMapSiteId) &&
          (!selectedMapBuildingId || floor.buildingId === selectedMapBuildingId),
      ),
    [floors, selectedMapSiteId, selectedMapBuildingId],
  );
  const filteredMapVersions = useMemo(
    () =>
      mapVersions.filter(
        (version) =>
          (!selectedMapSiteId || version.siteId === selectedMapSiteId) &&
          (!selectedMapBuildingId || version.buildingId === selectedMapBuildingId) &&
          (!selectedMapFloorId || version.floorId === selectedMapFloorId),
      ),
    [mapVersions, selectedMapSiteId, selectedMapBuildingId, selectedMapFloorId],
  );
  const users = usersPage?.items ?? [];
  const isParkingSpotNode = nodeForm.nodeType === 8;
  const generatesQrForNodeForm = nodeTypeGeneratesQr(nodeForm.nodeType);
  const selectedMapNode = useMemo(
    () => mapEditor?.nodes.find((node) => node.id === mapEditorSelection.editingNodeId) ?? null,
    [mapEditor, mapEditorSelection.editingNodeId],
  );
  const selectedCamera = useMemo(
    () => cameras.find((camera) => camera.id === cameraZoneForm.cameraId) ?? null,
    [cameraZoneForm.cameraId, cameras],
  );
  const cameraScopedParkingZones = useMemo(() => {
    if (!selectedCamera?.parkingFacilityId) {
      return parkingFacilities.flatMap((facility) => facility.zones);
    }

    return (
      parkingFacilities.find((facility) => facility.id === selectedCamera.parkingFacilityId)?.zones ?? []
    );
  }, [parkingFacilities, selectedCamera]);
  const cameraScopedMapVersions = useMemo(() => {
    if (!selectedCamera?.floorId) {
      return mapVersions;
    }

    return mapVersions.filter((version) => version.floorId === selectedCamera.floorId);
  }, [mapVersions, selectedCamera]);

  const metrics = useMemo(
    () => [
      { label: 'Organizasyon', value: organizations.length.toString().padStart(2, '0'), icon: Building2 },
      { label: 'Yerleske', value: sites.length.toString().padStart(2, '0'), icon: Compass },
      { label: 'Harita Surumu', value: mapVersions.length.toString().padStart(2, '0'), icon: Map },
      { label: 'Kamera', value: cameras.length.toString().padStart(2, '0'), icon: Compass },
      { label: 'Yonetici Kullanici', value: users.length.toString().padStart(2, '0'), icon: Users },
    ],
    [organizations.length, sites.length, mapVersions.length, cameras.length, users.length],
  );
  const activeViewLabel = sidebarItems.find((item) => item.key === activeView)?.label ?? activeView;
  const mapCanvasImageRect = useMemo(
    () =>
      resolveContainedImageRect(
        mapCanvasSize.width,
        mapCanvasSize.height,
        mapEditor?.width ?? 0,
        mapEditor?.height ?? 0,
      ),
    [mapCanvasSize, mapEditor?.width, mapEditor?.height],
  );
  const cameraZoneCanvasImageRect = useMemo(
    () =>
      resolveContainedImageRect(
        cameraZoneCanvasSize.width,
        cameraZoneCanvasSize.height,
        cameraZoneMapEditor?.width ?? 0,
        cameraZoneMapEditor?.height ?? 0,
      ),
    [cameraZoneCanvasSize, cameraZoneMapEditor?.width, cameraZoneMapEditor?.height],
  );

  useEffect(() => {
    setHiddenNodeIds({});
  }, [mapEditor?.id]);

  useEffect(() => {
    const element = mapCanvasRef.current;
    if (!element) {
      return;
    }

    const update = () =>
      setMapCanvasSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [mapEditor?.id]);

  useEffect(() => {
    const element = cameraZoneCanvasRef.current;
    if (!element) {
      return;
    }

    const update = () =>
      setCameraZoneCanvasSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [cameraZoneMapEditor?.id, cameraZoneForm.mapVersionId]);

  useEffect(() => {
    if (!organizationHierarchy) {
      return;
    }

    setBuildingForm((current) => ({
      ...current,
      siteId: current.siteId || sites[0]?.id || '',
    }));

    setParkingFacilityForm((current) => ({
      ...current,
      siteId: current.siteId || sites[0]?.id || '',
    }));

    setFloorForm((current) => ({
      ...current,
      buildingId: current.buildingId || buildings[0]?.id || '',
    }));

    setParkingZoneForm((current) => ({
      ...current,
      parkingFacilityId: current.parkingFacilityId || parkingFacilities[0]?.id || '',
      floorId: current.floorId || floors[0]?.id || '',
    }));

    setMapVersionForm((current) => ({
      ...current,
      floorId: current.floorId || floors[0]?.id || '',
    }));

    setCameraForm((current) => ({
      ...current,
      siteId: current.siteId || sites[0]?.id || '',
      buildingId: current.buildingId || buildings[0]?.id || '',
      floorId: current.floorId || floors[0]?.id || '',
      parkingFacilityId: current.parkingFacilityId || parkingFacilities[0]?.id || '',
    }));

    setCameraZoneForm((current) => ({
      ...current,
      cameraId: current.cameraId || cameras[0]?.id || '',
      parkingZoneId: current.parkingZoneId || parkingFacilities[0]?.zones[0]?.id || '',
      mapVersionId: current.mapVersionId || mapVersions[0]?.id || '',
    }));
  }, [organizationHierarchy, sites, buildings, floors, parkingFacilities, cameras, mapVersions]);

  useEffect(() => {
    setSelectedMapSiteId((current) =>
      current && mapSites.some((site) => site.id === current) ? current : mapSites[0]?.id || '',
    );
  }, [mapSites]);

  useEffect(() => {
    setSelectedMapBuildingId((current) =>
      current && mapBuildings.some((building) => building.id === current) ? current : mapBuildings[0]?.id || '',
    );
  }, [mapBuildings]);

  useEffect(() => {
    setSelectedMapFloorId((current) =>
      current && mapFloors.some((floor) => floor.id === current) ? current : mapFloors[0]?.id || '',
    );
  }, [mapFloors]);

  useEffect(() => {
    setMapVersionForm((current) => ({
      ...current,
      floorId:
        current.floorId && mapFloors.some((floor) => floor.id === current.floorId)
          ? current.floorId
          : selectedMapFloorId || mapFloors[0]?.id || '',
    }));
  }, [mapFloors, selectedMapFloorId]);

  useEffect(() => {
    if (selectedMapVersionId && !filteredMapVersions.some((version) => version.id === selectedMapVersionId)) {
      setSelectedMapVersionId('');
    }
  }, [filteredMapVersions, selectedMapVersionId]);

  useEffect(() => {
    setCameraZoneForm((current) => ({
      ...current,
      parkingZoneId:
        current.parkingZoneId &&
        cameraScopedParkingZones.some((zone) => zone.id === current.parkingZoneId)
          ? current.parkingZoneId
          : cameraScopedParkingZones[0]?.id || '',
      mapVersionId:
        current.mapVersionId &&
        cameraScopedMapVersions.some((version) => version.id === current.mapVersionId)
          ? current.mapVersionId
          : cameraScopedMapVersions[0]?.id || '',
    }));
  }, [cameraScopedMapVersions, cameraScopedParkingZones]);

  useEffect(() => {
    if (!session || !cameraZoneForm.mapVersionId) {
      setCameraZoneMapEditor(null);
      return;
    }

    const activeSession = session;
    let cancelled = false;

    async function loadCameraZoneMap() {
      try {
        const editor = await adminApi.getMapVersion(activeSession.accessToken, cameraZoneForm.mapVersionId);
        if (!cancelled) {
          setCameraZoneMapEditor(editor);
        }
      } catch {
        if (!cancelled) {
          setCameraZoneMapEditor(null);
        }
      }
    }

    void loadCameraZoneMap();

    return () => {
      cancelled = true;
    };
  }, [cameraZoneForm.mapVersionId, session]);

  useEffect(() => {
    if (users.length === 0 && roles.length === 0) {
      return;
    }

    setUserActionState((current) => ({
      selectedUserId: current.selectedUserId || users[0]?.id || '',
      selectedRoleId: current.selectedRoleId || roles[0]?.id || '',
    }));
  }, [users, roles]);

  useEffect(() => {
    const referenceValue = selectedMapNode?.externalReferenceId;
    if (!referenceValue || !nodeTypeGeneratesQr(selectedMapNode.nodeType)) {
      setSelectedNodeQrDataUrl('');
      return;
    }

    let disposed = false;
    void QRCode.toDataURL(referenceValue, {
      margin: 1,
      width: 220,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    }).then((url: string) => {
      if (!disposed) {
        setSelectedNodeQrDataUrl(url);
      }
    }).catch(() => {
      if (!disposed) {
        setSelectedNodeQrDataUrl('');
      }
    });

    return () => {
      disposed = true;
    };
  }, [selectedMapNode]);

  useEffect(() => {
    const qrNodes = (mapEditor?.nodes ?? []).filter(
      (node) => nodeTypeGeneratesQr(node.nodeType) && node.externalReferenceId,
    );

    if (qrNodes.length === 0) {
      setNodeQrDataUrls({});
      return;
    }

    let disposed = false;

    void Promise.all(
      qrNodes.map(async (node) => {
        const url = await QRCode.toDataURL(node.externalReferenceId!, {
          margin: 1,
          width: 72,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        });

        return [node.id, url] as const;
      }),
    )
      .then((entries) => {
        if (!disposed) {
          setNodeQrDataUrls(Object.fromEntries(entries));
        }
      })
      .catch(() => {
        if (!disposed) {
          setNodeQrDataUrls({});
        }
      });

    return () => {
      disposed = true;
    };
  }, [mapEditor]);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      setOrganizations([]);
      setOrganizationHierarchy(null);
      setRoles([]);
      setUsersPage(null);
      setMapEditor(null);
      return;
    }

    const activeSession = session;
    let cancelled = false;

    async function loadDashboard() {
      try {
        setBusy(true);
        setError(null);

        const [currentUser, organizationsResponse, rolesResponse, usersResponse] = await Promise.all([
          adminApi.getCurrentUser(activeSession.accessToken),
          adminApi.getOrganizations(activeSession.accessToken),
          adminApi.getRoles(activeSession.accessToken),
          adminApi.getAdminUsers(activeSession.accessToken),
        ]);

        if (cancelled) {
          return;
        }

        setProfile(currentUser);
        setOrganizations(organizationsResponse);
        setRoles(rolesResponse);
        setUsersPage(usersResponse);

        const nextOrganizationId = selectedOrganizationId || organizationsResponse[0]?.id || '';
        setSelectedOrganizationId(nextOrganizationId);

        if (nextOrganizationId) {
          const hierarchy = await adminApi.getOrganizationHierarchy(activeSession.accessToken, nextOrganizationId);
          if (!cancelled) {
            setOrganizationHierarchy(hierarchy);
          }
        } else {
          setOrganizationHierarchy(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          const message = getApiErrorMessage(loadError, 'Yonetim paneli yuklenemedi.');
          setError(message);

          if (
            isApiClientError(loadError) &&
            (loadError.status === 401 || loadError.status === 403 || loadError.code === 'invalid_token')
          ) {
            handleLogout();
          }
        }
      } finally {
        if (!cancelled) {
          setBusy(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const accessExpiry = new Date(session.accessTokenExpiresAt).getTime();
    if (Number.isNaN(accessExpiry)) {
      return;
    }

    const refreshLeadMs = 60_000;
    const delay = Math.max(accessExpiry - Date.now() - refreshLeadMs, 5_000);
    let cancelled = false;

    const timeout = window.setTimeout(async () => {
      try {
        const refreshed = await adminApi.refreshToken(session.refreshToken);
        if (cancelled) {
          return;
        }

        setSession({
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          accessTokenExpiresAt: refreshed.accessTokenExpiresAt,
          refreshTokenExpiresAt: refreshed.refreshTokenExpiresAt,
        });
      } catch {
        if (!cancelled) {
          handleLogout();
        }
      }
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [session]);

  useEffect(() => {
    if (!session || !selectedOrganizationId) {
      return;
    }

    const activeSession = session;
    let cancelled = false;

    async function loadHierarchy() {
      try {
        const hierarchy = await adminApi.getOrganizationHierarchy(activeSession.accessToken, selectedOrganizationId);
        if (!cancelled) {
          setOrganizationHierarchy(hierarchy);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, 'Organizasyon hiyerarsisi yuklenemedi.'));
        }
      }
    }

    void loadHierarchy();

    return () => {
      cancelled = true;
    };
  }, [selectedOrganizationId, session]);

  useEffect(() => {
    setSelectedMapVersionId('');
    setSelectedMapSiteId('');
    setSelectedMapBuildingId('');
    setSelectedMapFloorId('');
  }, [selectedOrganizationId]);

  useEffect(() => {
    if (!session || !selectedMapVersionId) {
      setMapEditor(null);
      return;
    }

    const activeSession = session;
    let cancelled = false;

    async function loadMapVersion() {
      try {
        const editor = await adminApi.getMapVersion(activeSession.accessToken, selectedMapVersionId);
        if (!cancelled) {
          setMapEditor(editor);
          setConnectionForm((current) => ({
            ...current,
            fromNodeId: current.fromNodeId || editor.nodes[0]?.id || '',
            toNodeId: current.toNodeId || editor.nodes[1]?.id || '',
          }));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, 'Harita surumu yuklenemedi.'));
        }
      }
    }

    void loadMapVersion();

    return () => {
      cancelled = true;
    };
  }, [selectedMapVersionId, session]);

  async function refreshUsers(activeSession: Session) {
    const nextUsersPage = await adminApi.getAdminUsers(activeSession.accessToken);
    setUsersPage(nextUsersPage);
  }

  async function refreshHierarchy(activeSession: Session, organizationId = selectedOrganizationId) {
    if (!organizationId) {
      setOrganizationHierarchy(null);
      return;
    }

    const hierarchy = await adminApi.getOrganizationHierarchy(activeSession.accessToken, organizationId);
    setOrganizationHierarchy(hierarchy);
  }

  async function refreshMapVersion(activeSession: Session, mapVersionId = selectedMapVersionId) {
    if (!mapVersionId) {
      setMapEditor(null);
      return null;
    }

    const editor = await adminApi.getMapVersion(activeSession.accessToken, mapVersionId);
    setMapEditor(editor);
    return editor;
  }

  async function runAction(action: () => Promise<void>, successMessage: string) {
    try {
      setBusy(true);
      setError(null);
      setSuccess(null);
      await action();
      setSuccess(successMessage);
    } catch (actionError) {
      setError(getApiErrorMessage(actionError, 'Islem tamamlanamadi.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin(emailOrUserName: string, password: string) {
    try {
      setBusy(true);
      setError(null);
      setSuccess(null);
      setLoginFieldErrors(null);
      const auth = await adminApi.login(emailOrUserName, password);
      const nextSession = {
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        accessTokenExpiresAt: auth.accessTokenExpiresAt,
        refreshTokenExpiresAt: auth.refreshTokenExpiresAt,
      };

      setSession(nextSession);
      setActiveView('organizations');
    } catch (loginError) {
      setLoginFieldErrors(getApiFieldErrors(loginError));
      setError(getApiErrorMessage(loginError, 'Giris yapilamadi.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotPassword(email: string) {
    try {
      setBusy(true);
      setError(null);
      setSuccess(null);
      setLoginFieldErrors(null);
      await adminApi.forgotPassword(email.trim());
      setSuccess('E-posta sistemde kayitliysa sifre yenileme baglantisi gonderildi.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Sifirlama baglantisi gonderilemedi.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword(token: string, newPassword: string) {
    try {
      setBusy(true);
      setError(null);
      setSuccess(null);
      setLoginFieldErrors(null);
      await adminApi.resetPassword(token.trim(), newPassword);
      setSuccess('Sifreniz guncellendi. Yeni sifrenizle giris yapabilirsiniz.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Sifre yenilenemedi.'));
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    setSession(null);
    setError(null);
    setLoginFieldErrors(null);
    setSuccess(null);
  }

  function clearLoginFeedback() {
    if (!error && !loginFieldErrors && !success) {
      return;
    }

    setError(null);
    setLoginFieldErrors(null);
    setSuccess(null);
  }

  async function handleCreateOrganization() {
    if (!session) {
      return;
    }

    await runAction(async () => {
      const created = await adminApi.createOrganization(
        session.accessToken,
        organizationForm.name.trim(),
        organizationForm.description.trim(),
      );
      setOrganizations([created, ...organizations]);
      setSelectedOrganizationId(created.id);
      setOrganizationForm({ name: '', description: '' });
      await refreshHierarchy(session, created.id);
    }, 'Organizasyon olusturuldu.');
  }

  async function handleUpdateOrganization(organization: OrganizationSummary) {
    if (!session) {
      return;
    }

    const name = window.prompt('Organizasyon adi', organization.name);
    if (!name?.trim()) {
      return;
    }

    const description = window.prompt('Aciklama', organization.description ?? '') ?? '';

    await runAction(async () => {
      await adminApi.updateOrganization(session.accessToken, organization.id, {
        name: name.trim(),
        description: description.trim() || null,
      });
      const refreshed = await adminApi.getOrganizations(session.accessToken);
      setOrganizations(refreshed);
      await refreshHierarchy(session, organization.id);
    }, 'Organizasyon guncellendi.');
  }

  async function handleDeleteOrganization(organizationId: string) {
    if (!session || !window.confirm('Bu organizasyonu silmek istediginize emin misiniz?')) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteOrganization(session.accessToken, organizationId);
      const refreshed = await adminApi.getOrganizations(session.accessToken);
      setOrganizations(refreshed);
      const nextOrganizationId = selectedOrganizationId === organizationId ? refreshed[0]?.id || '' : selectedOrganizationId;
      setSelectedOrganizationId(nextOrganizationId);
      await refreshHierarchy(session, nextOrganizationId);
    }, 'Organizasyon silindi.');
  }

  async function handleCreateSite() {
    if (!session || !selectedOrganizationId) {
      return;
    }

    await runAction(async () => {
      await adminApi.createSite(session.accessToken, selectedOrganizationId, {
        code: siteForm.code.trim(),
        name: siteForm.name.trim(),
        siteType: siteForm.siteType,
        address: siteForm.address.trim(),
      });
      setSiteForm({ code: '', name: '', siteType: 1, address: '' });
      await refreshHierarchy(session);
    }, 'Yerleske olusturuldu.');
  }

  async function handleUpdateSite(site: SiteHierarchy) {
    if (!session) {
      return;
    }

    const code = window.prompt('Yerleske kodu', site.code);
    const name = window.prompt('Yerleske adi', site.name);
    if (!code?.trim() || !name?.trim()) {
      return;
    }

    const address = window.prompt('Adres', site.address ?? '') ?? '';

    await runAction(async () => {
      await adminApi.updateSite(session.accessToken, site.id, {
        code: code.trim(),
        name: name.trim(),
        siteType: site.siteType,
        address: address.trim() || null,
      });
      await refreshHierarchy(session);
    }, 'Yerleske guncellendi.');
  }

  async function handleDeleteSite(siteId: string) {
    if (!session || !window.confirm('Bu yerleskeyi silmek istediginize emin misiniz?')) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteSite(session.accessToken, siteId);
      await refreshHierarchy(session);
    }, 'Yerleske silindi.');
  }

  async function handleCreateBuilding() {
    if (!session || !buildingForm.siteId) {
      return;
    }

    await runAction(async () => {
      await adminApi.createBuilding(session.accessToken, buildingForm.siteId, {
        code: buildingForm.code.trim(),
        name: buildingForm.name.trim(),
        buildingType: buildingForm.buildingType,
      });
      setBuildingForm((current) => ({ ...current, code: '', name: '' }));
      await refreshHierarchy(session);
    }, 'Bina olusturuldu.');
  }

  async function handleUpdateBuilding(building: BuildingHierarchy) {
    if (!session) {
      return;
    }

    const code = window.prompt('Bina kodu', building.code);
    const name = window.prompt('Bina adi', building.name);
    if (!code?.trim() || !name?.trim()) {
      return;
    }

    await runAction(async () => {
      await adminApi.updateBuilding(session.accessToken, building.id, {
        code: code.trim(),
        name: name.trim(),
        buildingType: building.buildingType,
      });
      await refreshHierarchy(session);
    }, 'Bina guncellendi.');
  }

  async function handleDeleteBuilding(buildingId: string) {
    if (!session || !window.confirm('Bu binayi silmek istediginize emin misiniz?')) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteBuilding(session.accessToken, buildingId);
      await refreshHierarchy(session);
    }, 'Bina silindi.');
  }

  async function handleCreateFloor() {
    if (!session || !floorForm.buildingId) {
      return;
    }

    await runAction(async () => {
      await adminApi.createFloor(session.accessToken, floorForm.buildingId, {
        code: floorForm.code.trim(),
        name: floorForm.name.trim(),
        level: Number(floorForm.level),
      });
      setFloorForm((current) => ({ ...current, code: '', name: '', level: 0 }));
      await refreshHierarchy(session);
    }, 'Kat olusturuldu.');
  }

  async function handleUpdateFloor(floor: { id: string; code: string; name: string; level: number }) {
    if (!session) {
      return;
    }

    const code = window.prompt('Kat kodu', floor.code);
    const name = window.prompt('Kat adi', floor.name);
    const levelValue = window.prompt('Kat seviyesi', String(floor.level));
    if (!code?.trim() || !name?.trim() || levelValue === null) {
      return;
    }

    await runAction(async () => {
      await adminApi.updateFloor(session.accessToken, floor.id, {
        code: code.trim(),
        name: name.trim(),
        level: Number(levelValue),
      });
      await refreshHierarchy(session);
    }, 'Kat guncellendi.');
  }

  async function handleDeleteFloor(floorId: string) {
    if (!session || !window.confirm('Bu kati silmek istediginize emin misiniz?')) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteFloor(session.accessToken, floorId);
      await refreshHierarchy(session);
    }, 'Kat silindi.');
  }

  async function handleCreateParkingFacility() {
    if (!session || !parkingFacilityForm.siteId) {
      return;
    }

    await runAction(async () => {
      await adminApi.createParkingFacility(session.accessToken, parkingFacilityForm.siteId, {
        buildingId: parkingFacilityForm.buildingId || null,
        code: parkingFacilityForm.code.trim(),
        name: parkingFacilityForm.name.trim(),
        facilityType: parkingFacilityForm.facilityType,
      });
      setParkingFacilityForm((current) => ({ ...current, code: '', name: '' }));
      await refreshHierarchy(session);
    }, 'Otopark tesisi olusturuldu.');
  }

  async function handleUpdateParkingFacility(facility: ParkingFacilityHierarchy) {
    if (!session) {
      return;
    }

    const code = window.prompt('Otopark tesis kodu', facility.code);
    const name = window.prompt('Otopark tesis adi', facility.name);
    if (!code?.trim() || !name?.trim()) {
      return;
    }

    await runAction(async () => {
      await adminApi.updateParkingFacility(session.accessToken, facility.id, {
        code: code.trim(),
        name: name.trim(),
        buildingId: null,
        facilityType: facility.facilityType,
      });
      await refreshHierarchy(session);
    }, 'Otopark tesisi guncellendi.');
  }

  async function handleDeleteParkingFacility(parkingFacilityId: string) {
    if (!session || !window.confirm('Bu otopark tesisini silmek istediginize emin misiniz?')) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteParkingFacility(session.accessToken, parkingFacilityId);
      await refreshHierarchy(session);
    }, 'Otopark tesisi silindi.');
  }

  async function handleCreateParkingZone() {
    if (!session || !parkingZoneForm.parkingFacilityId) {
      return;
    }

    await runAction(async () => {
      await adminApi.createParkingZone(session.accessToken, parkingZoneForm.parkingFacilityId, {
        floorId: parkingZoneForm.floorId || null,
        code: parkingZoneForm.code.trim(),
        name: parkingZoneForm.name.trim(),
      });
      setParkingZoneForm((current) => ({ ...current, code: '', name: '' }));
      await refreshHierarchy(session);
    }, 'Otopark bolgesi olusturuldu.');
  }

  async function handleUpdateParkingZone(zone: { id: string; code: string; name: string; floorId: string | null }) {
    if (!session) {
      return;
    }

    const code = window.prompt('Bolge kodu', zone.code);
    const name = window.prompt('Bolge adi', zone.name);
    if (!code?.trim() || !name?.trim()) {
      return;
    }

    await runAction(async () => {
      await adminApi.updateParkingZone(session.accessToken, zone.id, {
        code: code.trim(),
        name: name.trim(),
        floorId: zone.floorId,
      });
      await refreshHierarchy(session);
    }, 'Otopark bolgesi guncellendi.');
  }

  async function handleDeleteParkingZone(parkingZoneId: string) {
    if (!session || !window.confirm('Bu otopark bolgesini silmek istediginize emin misiniz?')) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteParkingZone(session.accessToken, parkingZoneId);
      await refreshHierarchy(session);
    }, 'Otopark bolgesi silindi.');
  }

  function startCameraEdit(camera: CameraHierarchy & { siteId: string }) {
    setEditingCameraId(camera.id);
    setCameraForm({
      siteId: camera.siteId,
      buildingId: camera.buildingId ?? '',
      floorId: camera.floorId ?? '',
      parkingFacilityId: camera.parkingFacilityId ?? '',
      name: camera.name,
      ipAddress: camera.ipAddress,
      streamUrl: camera.streamUrl,
      notes: camera.notes ?? '',
    });
  }

  function resetCameraForm() {
    setEditingCameraId('');
    setCameraForm({
      siteId: sites[0]?.id || '',
      buildingId: buildings[0]?.id || '',
      floorId: floors[0]?.id || '',
      parkingFacilityId: parkingFacilities[0]?.id || '',
      name: '',
      ipAddress: '',
      streamUrl: '',
      notes: '',
    });
  }

  async function handleSaveCamera() {
    if (!session || !cameraForm.siteId || !cameraForm.name.trim() || !cameraForm.ipAddress.trim() || !cameraForm.streamUrl.trim()) {
      return;
    }

    await runAction(async () => {
      if (editingCameraId) {
        const camera = cameras.find((item) => item.id === editingCameraId);
        await adminApi.updateCamera(session.accessToken, editingCameraId, {
          siteId: cameraForm.siteId,
          buildingId: cameraForm.buildingId || null,
          floorId: cameraForm.floorId || null,
          parkingFacilityId: cameraForm.parkingFacilityId || null,
          name: cameraForm.name.trim(),
          ipAddress: cameraForm.ipAddress.trim(),
          streamUrl: cameraForm.streamUrl.trim(),
          notes: cameraForm.notes.trim() || null,
          isActive: camera?.isActive ?? true,
        });
      } else {
        await adminApi.createCamera(session.accessToken, cameraForm.siteId, {
          buildingId: cameraForm.buildingId || null,
          floorId: cameraForm.floorId || null,
          parkingFacilityId: cameraForm.parkingFacilityId || null,
          name: cameraForm.name.trim(),
          ipAddress: cameraForm.ipAddress.trim(),
          streamUrl: cameraForm.streamUrl.trim(),
          notes: cameraForm.notes.trim() || null,
        });
      }

      resetCameraForm();
      await refreshHierarchy(session);
    }, editingCameraId ? 'Kamera guncellendi.' : 'Kamera olusturuldu.');
  }

  async function handleDeleteCamera(cameraId: string) {
    if (!session || !window.confirm('Bu kamerayi silmek istediginize emin misiniz?')) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteCamera(session.accessToken, cameraId);
      await refreshHierarchy(session);
    }, 'Kamera silindi.');
  }

  async function handleCreateCameraZone() {
    if (!session || !cameraZoneForm.cameraId || cameraZonePoints.length < 3) {
      return;
    }

    await runAction(async () => {
      const payload = {
        parkingZoneId: cameraZoneForm.parkingZoneId || null,
        mapVersionId: cameraZoneForm.mapVersionId || null,
        name: cameraZoneForm.name.trim(),
        detectionThreshold: cameraZoneForm.detectionThreshold,
        polygonJson: stringifyPolygon(cameraZonePoints),
      };

      if (editingCameraZoneId) {
        await adminApi.updateCameraZone(session.accessToken, editingCameraZoneId, payload);
      } else {
        await adminApi.createCameraZone(session.accessToken, cameraZoneForm.cameraId, payload);
      }

      resetCameraZoneForm();
      await refreshHierarchy(session);
    }, editingCameraZoneId ? 'Kamera bolgesi guncellendi.' : 'Kamera bolgesi olusturuldu.');
  }

  function startCameraZoneEdit(zone: CameraZoneHierarchy, cameraId: string) {
    const points = parsePolygonJson(zone.polygonJson);
    setEditingCameraZoneId(zone.id);
    setCameraZonePoints(points);
    setCameraZoneForm({
      cameraId,
      parkingZoneId: zone.parkingZoneId ?? '',
      mapVersionId: zone.mapVersionId ?? '',
      name: zone.name,
      detectionThreshold: zone.detectionThreshold,
      polygonJson: stringifyPolygon(points),
    });
  }

  function resetCameraZoneForm() {
    const nextPoints: PolygonPoint[] = [];
    setEditingCameraZoneId('');
    setCameraZonePoints(nextPoints);
    setCameraZoneForm({
      cameraId: cameras[0]?.id || '',
      parkingZoneId: parkingFacilities[0]?.zones[0]?.id || '',
      mapVersionId: mapVersions[0]?.id || '',
      name: '',
      detectionThreshold: 0.8,
      polygonJson: stringifyPolygon(nextPoints),
    });
  }

  async function handleDeleteCameraZone(cameraZoneId: string) {
    if (!session || !window.confirm('Bu kamera bolgesini silmek istediginize emin misiniz?')) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteCameraZone(session.accessToken, cameraZoneId);
      await refreshHierarchy(session);
    }, 'Kamera bolgesi silindi.');
  }

  async function handleUploadAsset(file: File | null) {
    if (!session || !file) {
      return;
    }

    await runAction(async () => {
      const asset = await adminApi.uploadMapAsset(session.accessToken, file);
      setUploadedAsset(asset);
      setMapVersionForm((current) => ({
        ...current,
        name: current.name || asset.originalFileName.replace(/\.[^.]+$/, ''),
        width: asset.width ?? current.width,
        height: asset.height ?? current.height,
      }));
    }, 'Harita dosyasi yuklendi.');
  }

  async function handleCreateMapVersion() {
    if (!session || !mapVersionForm.floorId || !uploadedAsset) {
      return;
    }

    await runAction(async () => {
      const created = await adminApi.createMapVersion(session.accessToken, mapVersionForm.floorId, {
        name: mapVersionForm.name.trim(),
        assetPath: uploadedAsset.relativePath,
        assetContentType: uploadedAsset.contentType,
        width: Number(mapVersionForm.width),
        height: Number(mapVersionForm.height),
      });
      await refreshHierarchy(session);
      setSelectedMapVersionId(created.id);
      await refreshMapVersion(session, created.id);
    }, 'Harita surumu olusturuldu.');
  }

  async function handleRenameMapVersion(versionId: string, currentName: string) {
    if (!session) {
      return;
    }

    const name = window.prompt('Surum adi', currentName);
    if (!name?.trim()) {
      return;
    }

    await runAction(async () => {
      await adminApi.renameMapVersion(session.accessToken, versionId, name.trim());
      await refreshHierarchy(session);
      await refreshMapVersion(session, versionId);
    }, 'Harita surumu yeniden adlandirildi.');
  }

  async function handleArchiveMapVersion(versionId: string) {
    if (!session) {
      return;
    }

    await runAction(async () => {
      await adminApi.archiveMapVersion(session.accessToken, versionId);
      await refreshHierarchy(session);
      await refreshMapVersion(session, versionId);
    }, 'Harita surumu arsivlendi.');
  }

  async function handleDuplicateMapVersion(versionId: string, currentName: string) {
    if (!session) {
      return;
    }

    const name = window.prompt('Kopya surum adi', `${currentName} Kopya`);
    if (name === null) {
      return;
    }

    await runAction(async () => {
      const duplicated = await adminApi.duplicateMapVersion(session.accessToken, versionId, name.trim() || null);
      await refreshHierarchy(session);
      setSelectedMapVersionId(duplicated.id);
      await refreshMapVersion(session, duplicated.id);
    }, 'Harita surumu kopyalandi.');
  }

  async function handleDeleteMapVersion(versionId: string) {
    if (!session || !window.confirm('Bu harita surumunu silmek istediginize emin misiniz?')) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteMapVersion(session.accessToken, versionId);
      const nextId = selectedMapVersionId === versionId ? '' : selectedMapVersionId;
      setSelectedMapVersionId(nextId);
      await refreshHierarchy(session);
      await refreshMapVersion(session, nextId);
    }, 'Harita surumu silindi.');
  }

  async function handleAddNode() {
    if (!session || !selectedMapVersionId) {
      return;
    }

    await runAction(async () => {
      const nodeId = await adminApi.addMapNode(session.accessToken, selectedMapVersionId, {
        label: nodeForm.label.trim(),
        nodeType: nodeForm.nodeType,
        pixelX: Number(nodeForm.pixelX),
        pixelY: Number(nodeForm.pixelY),
        isAccessible: nodeForm.isAccessible,
      });
      const editor = await refreshMapVersion(session);
      const createdNode = editor?.nodes.find((node) => node.id === nodeId);
      if (createdNode) {
        startNodeEdit(createdNode);
      } else {
        setNodeForm((current) => ({
          ...current,
          label: '',
          pixelX: 0,
          pixelY: 0,
        }));
      }
    }, 'Harita dugumu eklendi.');
  }

  async function handleUpdateNode() {
    if (!session || !mapEditorSelection.editingNodeId) {
      return;
    }

    await runAction(async () => {
      await adminApi.updateMapNode(session.accessToken, mapEditorSelection.editingNodeId, {
        label: nodeForm.label.trim(),
        nodeType: nodeForm.nodeType,
        pixelX: Number(nodeForm.pixelX),
        pixelY: Number(nodeForm.pixelY),
        isAccessible: nodeForm.isAccessible,
      });
      setMapEditorSelection((current) => ({ ...current, editingNodeId: '' }));
      setNodeForm({
        label: '',
        nodeType: 1,
        pixelX: 0,
        pixelY: 0,
        isAccessible: true,
      });
      await refreshMapVersion(session);
    }, 'Harita dugumu guncellendi.');
  }

  async function handleDeleteNode(nodeId: string) {
    if (!session) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteMapNode(session.accessToken, nodeId);
      if (mapEditorSelection.editingNodeId === nodeId) {
        setMapEditorSelection((current) => ({ ...current, editingNodeId: '' }));
      }
      await refreshMapVersion(session);
    }, 'Harita dugumu silindi.');
  }

  async function handleAddConnection() {
    if (!session || !selectedMapVersionId) {
      return;
    }

    await runAction(async () => {
      await adminApi.addMapConnection(session.accessToken, selectedMapVersionId, {
        fromNodeId: connectionForm.fromNodeId,
        toNodeId: connectionForm.toNodeId,
        distanceMeters: Number(connectionForm.distanceMeters),
        isBidirectional: connectionForm.isBidirectional,
        isAccessible: connectionForm.isAccessible,
      });
      await refreshMapVersion(session);
    }, 'Baglanti eklendi.');
  }

  async function handleUpdateConnection() {
    if (!session || !mapEditorSelection.editingConnectionId) {
      return;
    }

    await runAction(async () => {
      await adminApi.updateMapConnection(session.accessToken, mapEditorSelection.editingConnectionId, {
        fromNodeId: connectionForm.fromNodeId,
        toNodeId: connectionForm.toNodeId,
        distanceMeters: Number(connectionForm.distanceMeters),
        isBidirectional: connectionForm.isBidirectional,
        isAccessible: connectionForm.isAccessible,
      });
      setMapEditorSelection((current) => ({ ...current, editingConnectionId: '' }));
      setConnectionForm({
        fromNodeId: '',
        toNodeId: '',
        distanceMeters: 1,
        isBidirectional: true,
        isAccessible: true,
      });
      await refreshMapVersion(session);
    }, 'Baglanti guncellendi.');
  }

  async function handleDeleteConnection(connectionId: string) {
    if (!session) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteMapConnection(session.accessToken, connectionId);
      if (mapEditorSelection.editingConnectionId === connectionId) {
        setMapEditorSelection((current) => ({ ...current, editingConnectionId: '' }));
      }
      await refreshMapVersion(session);
    }, 'Baglanti silindi.');
  }

  function startNodeEdit(node: FacilityMapNode) {
    setMapEditorSelection({
      editingNodeId: node.id,
      editingConnectionId: '',
    });
    setNodeForm({
      label: node.label,
      nodeType: node.nodeType === 2 ? 1 : node.nodeType,
      pixelX: node.pixelX,
      pixelY: node.pixelY,
      isAccessible: node.isAccessible,
    });
  }

  function startConnectionEdit(connection: FacilityMapConnection) {
    setMapEditorSelection({
      editingNodeId: '',
      editingConnectionId: connection.id,
    });
    setConnectionForm({
      fromNodeId: connection.fromNodeId,
      toNodeId: connection.toNodeId,
      distanceMeters: connection.distanceMeters,
      isBidirectional: connection.isBidirectional,
      isAccessible: connection.isAccessible,
    });
  }

  function handleMapCanvasClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!mapEditor || !mapEditor.assetContentType.startsWith('image/')) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const imageRect = resolveContainedImageRect(
      bounds.width,
      bounds.height,
      mapEditor.width,
      mapEditor.height,
    );
    const relativeX = event.clientX - bounds.left;
    const relativeY = event.clientY - bounds.top;

    const insideImage =
      relativeX >= imageRect.left &&
      relativeX <= imageRect.left + imageRect.width &&
      relativeY >= imageRect.top &&
      relativeY <= imageRect.top + imageRect.height;

    if (!insideImage) {
      setMapEditorSelection({
        editingNodeId: '',
        editingConnectionId: '',
      });
      return;
    }

    const pixelX = Math.round(((relativeX - imageRect.left) / imageRect.width) * mapEditor.width);
    const pixelY = Math.round(((relativeY - imageRect.top) / imageRect.height) * mapEditor.height);

    setNodeForm((current) => ({
      ...current,
      label: mapEditorSelection.editingNodeId ? '' : current.label,
      pixelX,
      pixelY,
    }));
    setMapEditorSelection({
      editingNodeId: '',
      editingConnectionId: '',
    });
  }

  function renderMapCanvas() {
    if (!mapEditor) {
      return null;
    }

    if (!mapEditor.assetContentType.startsWith('image/')) {
      return (
        <div className="admin-panel-subtle rounded-[8px] border-dashed p-6 text-sm leading-6 text-[#8f96a3]">
          Bu surum gorsel olmayan bir dosya turu kullaniyor. PDF veya baska formatlar icin su anda sadece
          liste tabanli editor aktif.
        </div>
      );
    }

    const nodeMap = new globalThis.Map(mapEditor.nodes.map((node) => [node.id, node]));

    return (
      <div className="admin-map-shell">
        <div className="admin-map-toolbar flex items-center justify-between px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#8f96a3]">
          <span>Gorsel editor</span>
          <span>Dugume tikla duzenle, bos alana tikla yeni koordinat sec</span>
        </div>
        <div
          ref={mapCanvasRef}
          className="relative cursor-crosshair bg-[#090b0d]"
          onClick={handleMapCanvasClick}
          style={{ aspectRatio: `${mapEditor.width} / ${mapEditor.height}` }}
        >
          <img
            alt={mapEditor.name}
            className="h-full w-full object-contain"
            src={`/admin-api${mapEditor.assetPath}`}
          />
          <svg
            className="pointer-events-none absolute"
            style={{
              left: mapCanvasImageRect.left,
              top: mapCanvasImageRect.top,
              width: mapCanvasImageRect.width,
              height: mapCanvasImageRect.height,
            }}
            viewBox={`0 0 ${mapEditor.width} ${mapEditor.height}`}
            preserveAspectRatio="none"
          >
            {mapEditor.connections.map((connection) => {
              const fromNode = nodeMap.get(connection.fromNodeId);
              const toNode = nodeMap.get(connection.toNodeId);

              if (!fromNode || !toNode) {
                return null;
              }

              return (
                <line
                  key={connection.id}
                  x1={fromNode.pixelX}
                  y1={fromNode.pixelY}
                  x2={toNode.pixelX}
                  y2={toNode.pixelY}
                  stroke={connection.isAccessible ? '#38bdf8' : '#94a3b8'}
                  strokeWidth="3"
                  strokeDasharray={connection.isBidirectional ? '0' : '8 6'}
                  strokeOpacity="0.9"
                />
              );
            })}
          </svg>
            {mapEditor.nodes.map((node) => {
              const selected = mapEditorSelection.editingNodeId === node.id;
              const qrPreview = nodeQrDataUrls[node.id];
              const showQrPreview = nodeTypeGeneratesQr(node.nodeType) && !!qrPreview;
              const hidden = !!hiddenNodeIds[node.id];

              return (
                <div
                  key={node.id}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 ${selected ? 'z-20' : 'z-10'}`}
                  style={{
                    left: mapCanvasImageRect.left + (node.pixelX / mapEditor.width) * mapCanvasImageRect.width,
                    top: mapCanvasImageRect.top + (node.pixelY / mapEditor.height) * mapCanvasImageRect.height,
                  }}
                >
                  <div className="flex items-center gap-1">
                    {!hidden ? (
                      <button
                        className={`border px-2 py-1 text-[10px] font-semibold shadow-lg transition ${
                          selected
                            ? 'border-[#1836B9] bg-[#1836B9] text-[#F5F3EF]'
                            : 'border-[rgba(245,243,239,0.12)] bg-[#0f1216] text-[#F5F3EF]'
                        } ${showQrPreview ? 'rounded-[8px]' : 'rounded-full'}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          startNodeEdit(node);
                        }}
                        type="button"
                      >
                        <span className="flex items-center gap-1.5">
                          {showQrPreview ? (
                            <img
                              alt={`${node.code} mini qr`}
                              className={`h-4 w-4 rounded-[4px] border ${
                                selected ? 'border-white/30 bg-white p-0.5' : 'border-white/10 bg-white p-0.5'
                              }`}
                              src={qrPreview}
                            />
                          ) : null}
                          <span>{node.code}</span>
                        </span>
                      </button>
                    ) : null}
                    <button
                      aria-label={hidden ? `${node.code} goster` : `${node.code} gizle`}
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border shadow-sm transition ${
                        hidden
                          ? 'border-[#9B18B9]/30 bg-[#9B18B9]/15 text-[#e9d6ff]'
                          : 'border-[rgba(245,243,239,0.12)] bg-[#0f1216] text-[#d7d2ca]'
                      }`}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleNodeVisibility(node.id);
                      }}
                      type="button"
                    >
                      {hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  function syncCameraZonePoints(points: PolygonPoint[]) {
    setCameraZonePoints(points);
    setCameraZoneForm((current) => ({
      ...current,
      polygonJson: stringifyPolygon(points),
    }));
  }

  function toggleNodeVisibility(nodeId: string) {
    setHiddenNodeIds((current) => ({
      ...current,
      [nodeId]: !current[nodeId],
    }));
  }

  function handleCameraZoneCanvasClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!cameraZoneMapEditor || !cameraZoneMapEditor.assetContentType.startsWith('image/')) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const imageRect = resolveContainedImageRect(
      bounds.width,
      bounds.height,
      cameraZoneMapEditor.width,
      cameraZoneMapEditor.height,
    );
    const relativeX = event.clientX - bounds.left;
    const relativeY = event.clientY - bounds.top;

    const insideImage =
      relativeX >= imageRect.left &&
      relativeX <= imageRect.left + imageRect.width &&
      relativeY >= imageRect.top &&
      relativeY <= imageRect.top + imageRect.height;

    if (!insideImage) {
      return;
    }

    const rawX = Math.round(((relativeX - imageRect.left) / imageRect.width) * cameraZoneMapEditor.width);
    const rawY = Math.round(((relativeY - imageRect.top) / imageRect.height) * cameraZoneMapEditor.height);
    const x = snapToGrid(rawX, cameraZoneMapEditor.width);
    const y = snapToGrid(rawY, cameraZoneMapEditor.height);

    syncCameraZonePoints([...cameraZonePoints, { x, y }]);
  }

  function renderCameraZoneCanvas() {
    if (!cameraZoneForm.mapVersionId) {
      return (
        <div className="admin-panel-subtle rounded-[8px] border-dashed p-5 text-sm text-[#8f96a3]">
          Polygon cizmek icin once bir harita surumu sec.
        </div>
      );
    }

    if (!cameraZoneMapEditor) {
      return (
        <div className="admin-panel-subtle rounded-[8px] border-dashed p-5 text-sm text-[#8f96a3]">
          Harita surumu yukleniyor.
        </div>
      );
    }

    if (!cameraZoneMapEditor.assetContentType.startsWith('image/')) {
      return (
        <div className="admin-panel-subtle rounded-[8px] border-dashed p-5 text-sm text-[#8f96a3]">
          Kamera bolgesi cizimi su anda yalnizca gorsel haritalarda destekleniyor.
        </div>
      );
    }

    const polygonPoints = cameraZonePoints
      .map((point) => `${(point.x / cameraZoneMapEditor.width) * 100},${(point.y / cameraZoneMapEditor.height) * 100}`)
      .join(' ');
    const verticalGridLines = Array.from(
      { length: Math.floor(cameraZoneMapEditor.width / CAMERA_ZONE_GRID_SIZE) + 1 },
      (_, index) => index * CAMERA_ZONE_GRID_SIZE,
    ).filter((value) => value > 0 && value < cameraZoneMapEditor.width);
    const horizontalGridLines = Array.from(
      { length: Math.floor(cameraZoneMapEditor.height / CAMERA_ZONE_GRID_SIZE) + 1 },
      (_, index) => index * CAMERA_ZONE_GRID_SIZE,
    ).filter((value) => value > 0 && value < cameraZoneMapEditor.height);

    return (
      <div className="admin-map-shell">
        <div className="admin-map-toolbar flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#8f96a3]">
          <span>Polygon editor</span>
          <span>{CAMERA_ZONE_GRID_SIZE}px grid ile snap aktif</span>
        </div>
        <div
          ref={cameraZoneCanvasRef}
          className="relative cursor-crosshair bg-[#090b0d]"
          onClick={handleCameraZoneCanvasClick}
          style={{ aspectRatio: `${cameraZoneMapEditor.width} / ${cameraZoneMapEditor.height}` }}
        >
          <img
            alt={cameraZoneMapEditor.name}
            className="h-full w-full object-contain"
            src={`/admin-api${cameraZoneMapEditor.assetPath}`}
          />
          <svg
            className="pointer-events-none absolute"
            style={{
              left: cameraZoneCanvasImageRect.left,
              top: cameraZoneCanvasImageRect.top,
              width: cameraZoneCanvasImageRect.width,
              height: cameraZoneCanvasImageRect.height,
            }}
            viewBox={`0 0 ${cameraZoneMapEditor.width} ${cameraZoneMapEditor.height}`}
            preserveAspectRatio="none"
          >
            {verticalGridLines.map((x) => (
              <line
                key={`grid-x-${x}`}
                x1={x}
                y1={0}
                x2={x}
                y2={cameraZoneMapEditor.height}
                stroke="rgba(148,163,184,0.18)"
                strokeWidth="1"
              />
            ))}
            {horizontalGridLines.map((y) => (
              <line
                key={`grid-y-${y}`}
                x1={0}
                y1={y}
                x2={cameraZoneMapEditor.width}
                y2={y}
                stroke="rgba(148,163,184,0.18)"
                strokeWidth="1"
              />
            ))}
            {cameraZonePoints.length >= 3 ? (
              <polygon
                fill="rgba(37,99,235,0.2)"
                points={polygonPoints}
                stroke="#60a5fa"
                strokeWidth="2"
              />
            ) : null}
            {cameraZonePoints.length >= 2 ? (
              <polyline
                fill="none"
                points={polygonPoints}
                stroke="#93c5fd"
                strokeDasharray="6 4"
                strokeWidth="2"
              />
            ) : null}
          </svg>
          {cameraZonePoints.map((point, index) => (
            <button
              key={`${point.x}-${point.y}-${index}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-blue-500 px-2 py-1 text-[10px] font-semibold text-white shadow-lg"
              onClick={(event) => {
                event.stopPropagation();
                syncCameraZonePoints(cameraZonePoints.filter((_, pointIndex) => pointIndex !== index));
              }}
              style={{
                left:
                  cameraZoneCanvasImageRect.left +
                  (point.x / cameraZoneMapEditor.width) * cameraZoneCanvasImageRect.width,
                top:
                  cameraZoneCanvasImageRect.top +
                  (point.y / cameraZoneMapEditor.height) * cameraZoneCanvasImageRect.height,
              }}
              type="button"
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  async function handlePublishMapVersion() {
    if (!session || !selectedMapVersionId) {
      return;
    }

    await runAction(async () => {
      await adminApi.publishMapVersion(session.accessToken, selectedMapVersionId);
      await refreshHierarchy(session);
      await refreshMapVersion(session);
    }, 'Harita surumu yayina alindi.');
  }

  async function handleToggleUserStatus(user: AdminUserListItem) {
    if (!session) {
      return;
    }

    await runAction(async () => {
      await adminApi.setAdminUserStatus(session.accessToken, user.id, !user.isActive);
      await refreshUsers(session);
    }, 'Kullanici durumu guncellendi.');
  }

  async function handleDeleteOrRestoreUser(user: AdminUserListItem) {
    if (!session) {
      return;
    }

    await runAction(async () => {
      if (user.isDeleted) {
        await adminApi.restoreAdminUser(session.accessToken, user.id);
      } else {
        await adminApi.softDeleteAdminUser(session.accessToken, user.id);
      }
      await refreshUsers(session);
    }, user.isDeleted ? 'Kullanici geri yuklendi.' : 'Kullanici pasife alindi.');
  }

  async function handleAssignRole() {
    if (!session || !userActionState.selectedUserId || !userActionState.selectedRoleId) {
      return;
    }

    await runAction(async () => {
      await adminApi.assignRole(
        session.accessToken,
        userActionState.selectedUserId,
        userActionState.selectedRoleId,
      );
      await refreshUsers(session);
    }, 'Rol atandi.');
  }

  async function handleRemoveRole() {
    if (!session || !userActionState.selectedUserId || !userActionState.selectedRoleId) {
      return;
    }

    await runAction(async () => {
      await adminApi.removeRole(
        session.accessToken,
        userActionState.selectedUserId,
        userActionState.selectedRoleId,
      );
      await refreshUsers(session);
    }, 'Rol kaldirildi.');
  }

  function renderOrganizations() {
    return (
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className={sectionCardClassName()}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Organizasyon kayitlari</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">Kurumsal sahiplik yapisi</h3>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
              {organizations.length} kayit
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {organizations.length === 0 ? (
              <div className="border border-dashed border-[#2b3d5f] bg-[#0d1422] p-5 text-sm text-slate-400">
                Henuz organizasyon yok.
              </div>
            ) : (
              organizations.map((organization) => {
                const active = organization.id === selectedOrganizationId;
                return (
                  <button
                    key={organization.id}
                    className={rowCardClassName(active)}
                    onClick={() => setSelectedOrganizationId(organization.id)}
                    type="button"
                  >
                    <p className="text-sm font-semibold">{organization.name}</p>
                    <p className={`mt-2 text-xs leading-6 ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                      {organization.description || 'Aciklama yok'}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <span className={actionButtonClassName('neutral')} onClick={(event) => { event.stopPropagation(); void handleUpdateOrganization(organization); }}>
                        Duzenle
                      </span>
                      <span className={actionButtonClassName('danger')} onClick={(event) => { event.stopPropagation(); void handleDeleteOrganization(organization.id); }}>
                        Sil
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className={sectionCardClassName()}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Organizasyon olustur</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Yeni kurum ekle</h3>
            <div className="mt-6 grid gap-4">
              <FieldShell label="Ad">
                <input className={inputClassName()} placeholder="Ornek: Acibadem Saglik Grubu" value={organizationForm.name} onChange={(event) => setOrganizationForm((current) => ({ ...current, name: event.target.value }))} />
              </FieldShell>
              <FieldShell label="Aciklama">
                <textarea className={`${inputClassName()} min-h-28 resize-y`} placeholder="Bu organizasyonun kapsami ve yonetim notu" value={organizationForm.description} onChange={(event) => setOrganizationForm((current) => ({ ...current, description: event.target.value }))} />
              </FieldShell>
              <CodeGuide>Organizasyon seviyesinde kod yok. Kod yapisi yerleske, bina, kat ve otopark seviyesinde kullanilir.</CodeGuide>
              <button className="inline-flex items-center justify-center gap-2 border border-[#38558a] bg-[#16233a] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy || !organizationForm.name.trim()} onClick={handleCreateOrganization} type="button">
                <Plus className="h-4 w-4" />
                Organizasyon olustur
              </button>
            </div>
          </div>

          <div className={sectionCardClassName()}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Secili organizasyon</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{organizationHierarchy?.name || 'Bir organizasyon secin'}</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className={`${subtlePanelClassName()} p-4`}>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Yerleske</p>
                <p className="mt-2 text-2xl font-semibold text-white">{sites.length}</p>
              </div>
              <div className={`${subtlePanelClassName()} p-4`}>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Bina</p>
                <p className="mt-2 text-2xl font-semibold text-white">{buildings.length}</p>
              </div>
              <div className={`${subtlePanelClassName()} p-4`}>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Kamera</p>
                <p className="mt-2 text-2xl font-semibold text-white">{cameras.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderOverview() {
    const organizationSites = organizationHierarchy?.sites ?? [];

    return (
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className={sectionCardClassName()}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Durum ozeti</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Secili operasyon resmi</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className={`${subtlePanelClassName()} p-4`}>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Secili organizasyon</p>
              <p className="mt-2 text-lg font-semibold text-white">{organizationHierarchy?.name || 'Secim yok'}</p>
              <p className="mt-2 text-sm text-slate-400">{organizationHierarchy?.description || 'Detay icin organizasyonlar sekmesini kullanin.'}</p>
            </div>
            <div className={`${subtlePanelClassName()} p-4`}>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Yonetici hesabi</p>
              <p className="mt-2 text-lg font-semibold text-white">{profile?.fullName || 'Bilinmiyor'}</p>
              <p className="mt-2 text-sm text-slate-400">{profile?.email || 'Oturum yok'}</p>
            </div>
          </div>
        </div>

        <div className={sectionCardClassName()}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Hizli gecis</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Siradaki islem</h3>
          <div className="mt-6 space-y-3">
            {[
              ['organizations', 'Organizasyonlar', 'Kurumsal sahiplik ve secim'],
              ['facilities', 'Tesisler', 'Yerleske, bina ve kat yapisi'],
              ['maps', 'Haritalar', 'Kroki surumleri ve editor'],
              ['cameras', 'Kameralar', 'Canli izleme cihazi ve bolge baglari'],
            ].map(([key, title, text]) => (
              <button key={key} className={`flex w-full items-center justify-between px-4 py-4 text-left ${subtlePanelClassName()}`} onClick={() => setActiveView(key as SidebarKey)} type="button">
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-1 text-xs text-slate-400">{text}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </section>
    );

    return (
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className={sectionCardClassName()}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Organizasyonlar</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Tesis konteynerleri</h3>
              </div>
              <div className="border border-[#2b3d5f] bg-[#0d1422] px-3 py-1 text-xs font-medium text-slate-300">
                {organizations.length} kayit
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-3">
                {organizations.length === 0 ? (
                  <div className="border border-dashed border-[#2b3d5f] bg-[#0d1422] p-5 text-sm text-slate-400">
                    Henuz organizasyon yok. Tesis kurulumuna baslamak icin ilk organizasyonu olusturun.
                  </div>
                ) : (
                  organizations.map((organization) => {
                    const active = organization.id === selectedOrganizationId;
                    return (
                      <button
                        key={organization.id}
                        className={rowCardClassName(active)}
                        onClick={() => setSelectedOrganizationId(organization.id)}
                        type="button"
                      >
                        <p className="text-sm font-semibold">{organization.name}</p>
                        <p className={`mt-2 text-xs leading-6 ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                          {organization.description || 'Aciklama yok'}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <span
                            className={actionButtonClassName('neutral')}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleUpdateOrganization(organization);
                            }}
                          >
                            Duzenle
                          </span>
                          <span
                            className={actionButtonClassName('danger')}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDeleteOrganization(organization.id);
                            }}
                          >
                            Sil
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className={`${subtlePanelClassName()} p-5`}>
                <p className="text-sm font-semibold text-white">Organizasyon olustur</p>
                <div className="mt-4 space-y-3">
                  <input
                    className={inputClassName()}
                    placeholder="Organizasyon adi"
                    value={organizationForm.name}
                    onChange={(event) =>
                      setOrganizationForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                  <textarea
                    className={`${inputClassName()} min-h-28 resize-y`}
                    placeholder="Aciklama"
                    value={organizationForm.description}
                    onChange={(event) =>
                      setOrganizationForm((current) => ({ ...current, description: event.target.value }))
                    }
                  />
                  <button
                    className="inline-flex items-center gap-2 border border-[#38558a] bg-[#16233a] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    disabled={busy || !organizationForm.name.trim()}
                    onClick={handleCreateOrganization}
                    type="button"
                  >
                    Olustur
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={sectionCardClassName()}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Kullanicilar</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Yonetici erisimli hesaplar</h3>
            <div className="mt-6 space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {user.roles.map((role) => (
                      <span
                        key={`${user.id}-${role}`}
                        className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={sectionCardClassName()}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Hiyerarsi</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              {organizationHierarchy?.name || 'Bir organizasyon secin'}
            </h3>
            <div className="mt-6 space-y-4">
              {organizationHierarchy ? (
                organizationSites.length > 0 ? (
                  organizationSites.map((site) => (
                    <div key={site.id} className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{site.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                            {site.code} - {enumLabel(site.siteType, siteTypeOptions)}
                          </p>
                        </div>
                        <div className="text-right text-xs text-slate-500">
                          <p>{site.buildings.length} bina</p>
                          <p>{site.parkingFacilities.length} otopark tesisi</p>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700" onClick={() => void handleUpdateSite(site)} type="button">Duzenle</button>
                        <button className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700" onClick={() => void handleDeleteSite(site.id)} type="button">Sil</button>
                      </div>

                      <div className="mt-4 space-y-3">
                        {site.buildings.map((building) => (
                          <div key={building.id} className="rounded-2xl border border-white bg-white/90 px-4 py-3">
                            <p className="text-sm font-medium text-slate-900">{building.name}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {building.floors.length} kat - {enumLabel(building.buildingType, buildingTypeOptions)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-500">
                    Bu organizasyon var ancak henuz yerleske olusturulmamis.
                  </div>
                )
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-500">
                  Yerleske, bina ve kat yapisini incelemek icin bir organizasyon secin.
                </div>
              )}
            </div>
            {buildings.length > 0 || floors.length > 0 ? (
              <div className="mt-6 space-y-3 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Hizli duzenleme</p>
                <div className="flex flex-wrap gap-2">
                  {buildings.map((building) => (
                    <button key={building.id} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700" onClick={() => void handleUpdateBuilding(building)} type="button">
                      Bina duzenle: {building.code}
                    </button>
                  ))}
                  {buildings.map((building) => (
                    <button key={`${building.id}-delete`} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700" onClick={() => void handleDeleteBuilding(building.id)} type="button">
                      Bina sil: {building.code}
                    </button>
                  ))}
                  {floors.map((floor) => (
                    <button key={floor.id} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700" onClick={() => void handleUpdateFloor(floor)} type="button">
                      Kat duzenle: {floor.code}
                    </button>
                  ))}
                  {floors.map((floor) => (
                    <button key={`${floor.id}-delete`} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700" onClick={() => void handleDeleteFloor(floor.id)} type="button">
                      Kat sil: {floor.code}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[34px] border border-slate-200/80 bg-slate-950 p-6 text-white shadow-[0_26px_70px_rgba(15,23,42,0.34)] lg:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200/80">Guvenlik</p>
            <h3 className="mt-2 text-2xl font-semibold">Proxy korumali yonetici trafigi</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Yonetici istekleri proxy yolu uzerinden iletilir. JWT oturum katmaninda kalir,
              uygulama gizli anahtari ise tarayici bundle yerine proxy tarafinda tutulur.
            </p>

            <div className="mt-6 grid gap-3">
              {roles.map((role) => (
                <div key={role.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-sm font-semibold text-white">{role.name}</p>
                  <p className="mt-1 text-xs text-slate-300">{role.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderFacilities() {
    return (
      <section className="space-y-6">
        <div className={sectionCardClassName()}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Tesis yonetimi</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">Yerleske, bina ve kat akisi</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['sites', 'Yerleskeler'],
                ['buildings', 'Binalar'],
                ['floors', 'Katlar'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${facilityTab === key ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-600'}`}
                  onClick={() => setFacilityTab(key as FacilityTab)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          {facilityTab === 'sites' ? (
            <div className={sectionCardClassName()}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Yerleske olustur</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">Organizasyon altina yerleske ekle</h3>
              <div className="mt-6 grid gap-4">
                <SearchableSelect
                  label="Organizasyon"
                  value={selectedOrganizationId}
                  options={organizations.map((organization) => ({
                    value: organization.id,
                    label: organization.name,
                    hint: organization.description ?? 'Organizasyon',
                  }))}
                  placeholder="Organizasyon ara"
                  emptyText="Organizasyon sec"
                  onChange={(value) => setSelectedOrganizationId(value)}
                />
                <FieldShell label="Kod">
                  <input className={inputClassName()} placeholder="Ornek: MASLAK" value={siteForm.code} onChange={(event) => setSiteForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} />
                </FieldShell>
                <CodeGuide>Yerleske kodu kisa ve tekil olmali. Ornek: MASLAK, ATASEHIR, GZTPE.</CodeGuide>
                <FieldShell label="Ad">
                  <input className={inputClassName()} value={siteForm.name} onChange={(event) => setSiteForm((current) => ({ ...current, name: event.target.value }))} />
                </FieldShell>
                <FieldShell label="Tur">
                  <select className={selectClassName()} value={siteForm.siteType} onChange={(event) => setSiteForm((current) => ({ ...current, siteType: Number(event.target.value) }))}>
                    {siteTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                <FieldShell label="Adres">
                  <textarea className={`${inputClassName()} min-h-24 resize-y`} value={siteForm.address} onChange={(event) => setSiteForm((current) => ({ ...current, address: event.target.value }))} />
                </FieldShell>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy || !selectedOrganizationId || !siteForm.code.trim() || !siteForm.name.trim()} onClick={handleCreateSite} type="button">
                  <Plus className="h-4 w-4" />
                  Yerleske olustur
                </button>
              </div>
            </div>
          ) : null}

          {facilityTab === 'buildings' ? (
            <div className={sectionCardClassName()}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Bina olustur</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">Yerleske icindeki ana yapilari kur</h3>
              <div className="mt-6 grid gap-4">
                <SearchableSelect
                  label="Yerleske"
                  value={buildingForm.siteId}
                  options={sites.map((site) => ({
                    value: site.id,
                    label: site.name,
                    hint: site.code,
                  }))}
                  placeholder="Yerleske ara"
                  emptyText="Yerleske sec"
                  onChange={(value) => setBuildingForm((current) => ({ ...current, siteId: value }))}
                />
                <FieldShell label="Kod">
                  <input className={inputClassName()} placeholder="Ornek: ANA, ACIL, POLIKLINIK" value={buildingForm.code} onChange={(event) => setBuildingForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} />
                </FieldShell>
                <CodeGuide>Bina kodu yerleske icinde tekil olmali. Kisa, sabit ve yon bulmada kullanilabilir bir ad secin.</CodeGuide>
                <FieldShell label="Ad">
                  <input className={inputClassName()} value={buildingForm.name} onChange={(event) => setBuildingForm((current) => ({ ...current, name: event.target.value }))} />
                </FieldShell>
                <FieldShell label="Bina tipi">
                  <select className={selectClassName()} value={buildingForm.buildingType} onChange={(event) => setBuildingForm((current) => ({ ...current, buildingType: Number(event.target.value) }))}>
                    {buildingTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy || !buildingForm.siteId || !buildingForm.code.trim() || !buildingForm.name.trim()} onClick={handleCreateBuilding} type="button">
                  <Plus className="h-4 w-4" />
                  Bina olustur
                </button>
              </div>
            </div>
          ) : null}

          {facilityTab === 'floors' ? (
            <div className={sectionCardClassName()}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Kat olustur</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">Haritaya hazir katlar olustur</h3>
              <div className="mt-6 grid gap-4">
                <SearchableSelect
                  label="Bina"
                  value={floorForm.buildingId}
                  options={buildings.map((building) => ({
                    value: building.id,
                    label: building.name,
                    hint: `${building.code} · ${building.siteName}`,
                  }))}
                  placeholder="Bina ara"
                  emptyText="Bina sec"
                  onChange={(value) => setFloorForm((current) => ({ ...current, buildingId: value }))}
                />
                <FieldShell label="Kod">
                  <input className={inputClassName()} placeholder="Ornek: B2, B1, Z, K1" value={floorForm.code} onChange={(event) => setFloorForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} />
                </FieldShell>
                <CodeGuide>Kat kodu bina icinde tekil olmali. Kullanicinin sahada gorecegi kisaltmayi kullanin.</CodeGuide>
                <FieldShell label="Ad">
                  <input className={inputClassName()} value={floorForm.name} onChange={(event) => setFloorForm((current) => ({ ...current, name: event.target.value }))} />
                </FieldShell>
                <FieldShell label="Seviye">
                  <input className={inputClassName()} type="number" value={floorForm.level} onChange={(event) => setFloorForm((current) => ({ ...current, level: Number(event.target.value) }))} />
                </FieldShell>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy || !floorForm.buildingId || !floorForm.code.trim() || !floorForm.name.trim()} onClick={handleCreateFloor} type="button">
                  <Plus className="h-4 w-4" />
                  Kat olustur
                </button>
              </div>
            </div>
          ) : null}

          <div className={sectionCardClassName()}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Mevcut yapilar</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Secili organizasyon agaci</h3>
            <div className="mt-6 space-y-4">
              {sites.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-500">
                  Bu organizasyon icin henuz yerleske yok.
                </div>
              ) : (
                sites.map((site: SiteHierarchy) => (
                  <div key={site.id} className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{site.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{site.code} - {enumLabel(site.siteType, siteTypeOptions)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700" onClick={() => void handleUpdateSite(site)} type="button">Duzenle</button>
                        <button className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700" onClick={() => void handleDeleteSite(site.id)} type="button">Sil</button>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {site.buildings.map((building) => (
                        <div key={building.id} className="rounded-2xl border border-white bg-white px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{building.name}</p>
                              <p className="mt-1 text-xs text-slate-500">{building.code} - {building.floors.length} kat</p>
                            </div>
                            <div className="flex gap-2">
                              <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700" onClick={() => void handleUpdateBuilding(building)} type="button">Duzenle</button>
                              <button className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700" onClick={() => void handleDeleteBuilding(building.id)} type="button">Sil</button>
                            </div>
                          </div>
                          {building.floors.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {building.floors.map((floor) => (
                                <span key={floor.id} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                  {floor.code} - {floor.name}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </section>
    );

    return (
      <section className="grid gap-6 xl:grid-cols-2">
        <div className={sectionCardClassName()}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Yerleske olustur</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Yerleskeyi organizasyona bagla</h3>
          <div className="mt-6 grid gap-4">
            <FieldShell label="Organizasyon">
              <select
                className={selectClassName()}
                value={selectedOrganizationId}
                onChange={(event) => setSelectedOrganizationId(event.target.value)}
              >
                <option value="">Organizasyon sec</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell label="Kod">
              <input
                className={inputClassName()}
                value={siteForm.code}
                onChange={(event) => setSiteForm((current) => ({ ...current, code: event.target.value }))}
              />
            </FieldShell>
            <FieldShell label="Ad">
              <input
                className={inputClassName()}
                value={siteForm.name}
                onChange={(event) => setSiteForm((current) => ({ ...current, name: event.target.value }))}
              />
            </FieldShell>
            <FieldShell label="Tur">
              <select
                className={selectClassName()}
                value={siteForm.siteType}
                onChange={(event) =>
                  setSiteForm((current) => ({ ...current, siteType: Number(event.target.value) }))
                }
              >
                {siteTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell label="Adres">
              <textarea
                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400"
                value={siteForm.address}
                onChange={(event) => setSiteForm((current) => ({ ...current, address: event.target.value }))}
              />
            </FieldShell>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              disabled={busy || !selectedOrganizationId || !siteForm.code.trim() || !siteForm.name.trim()}
              onClick={handleCreateSite}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Yerleske olustur
            </button>
          </div>
        </div>

        <div className={sectionCardClassName()}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Bina olustur</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Her yerleskenin yapisini kur</h3>
          <div className="mt-6 grid gap-4">
            <FieldShell label="Yerleske">
              <select
                className={selectClassName()}
                value={buildingForm.siteId}
                onChange={(event) => setBuildingForm((current) => ({ ...current, siteId: event.target.value }))}
              >
                <option value="">Yerleske sec</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell label="Kod">
              <input
                className={inputClassName()}
                value={buildingForm.code}
                onChange={(event) => setBuildingForm((current) => ({ ...current, code: event.target.value }))}
              />
            </FieldShell>
            <FieldShell label="Ad">
              <input
                className={inputClassName()}
                value={buildingForm.name}
                onChange={(event) => setBuildingForm((current) => ({ ...current, name: event.target.value }))}
              />
            </FieldShell>
            <FieldShell label="Bina tipi">
              <select
                className={selectClassName()}
                value={buildingForm.buildingType}
                onChange={(event) =>
                  setBuildingForm((current) => ({ ...current, buildingType: Number(event.target.value) }))
                }
              >
                {buildingTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FieldShell>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              disabled={busy || !buildingForm.siteId || !buildingForm.code.trim() || !buildingForm.name.trim()}
              onClick={handleCreateBuilding}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Bina olustur
            </button>
          </div>
        </div>

        <div className={sectionCardClassName()}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Kat olustur</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Haritaya hazir katlar olustur</h3>
          <div className="mt-6 grid gap-4">
            <FieldShell label="Bina">
              <select
                className={selectClassName()}
                value={floorForm.buildingId}
                onChange={(event) => setFloorForm((current) => ({ ...current, buildingId: event.target.value }))}
              >
                <option value="">Bina sec</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell label="Kod">
              <input
                className={inputClassName()}
                value={floorForm.code}
                onChange={(event) => setFloorForm((current) => ({ ...current, code: event.target.value }))}
              />
            </FieldShell>
            <FieldShell label="Ad">
              <input
                className={inputClassName()}
                value={floorForm.name}
                onChange={(event) => setFloorForm((current) => ({ ...current, name: event.target.value }))}
              />
            </FieldShell>
            <FieldShell label="Seviye">
              <input
                className={inputClassName()}
                type="number"
                value={floorForm.level}
                onChange={(event) =>
                  setFloorForm((current) => ({ ...current, level: Number(event.target.value) }))
                }
              />
            </FieldShell>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              disabled={busy || !floorForm.buildingId || !floorForm.code.trim() || !floorForm.name.trim()}
              onClick={handleCreateFloor}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Kat olustur
            </button>
          </div>
        </div>

        <div className={sectionCardClassName()}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Canli hiyerarsi</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Secili organizasyon agaci</h3>
          <div className="mt-6 space-y-4">
            {sites.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-500">
                Bu organizasyon icin henuz yerleske yok.
              </div>
            ) : (
              sites.map((site: SiteHierarchy) => (
                <div key={site.id} className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{site.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {site.code} - {enumLabel(site.siteType, siteTypeOptions)}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500">{site.address || 'Adres yok'}</div>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {site.buildings.map((building: BuildingHierarchy) => (
                      <div key={building.id} className="rounded-2xl border border-white bg-white px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900">{building.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {building.floors.length} kat - {enumLabel(building.buildingType, buildingTypeOptions)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    );
  }

  function renderParking() {
    return (
      <section className="space-y-6">
        <div className={sectionCardClassName()}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Otopark yonetimi</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">Tesis ve bolge planlamasi</h3>
            </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ['facilities', 'Tesisler'],
                  ['zones', 'Bolgeler'],
                ].map(([key, label]) => (
                  <button
                  key={key}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${parkingTab === key ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-600'}`}
                  onClick={() => setParkingTab(key as ParkingTab)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          {parkingTab === 'facilities' ? (
            <div className={sectionCardClassName()}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Otopark tesisi</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">Otopark yapisini yerleskeye bagla</h3>
              <div className="mt-6 grid gap-4">
                <FieldShell label="Yerleske">
                  <select className={selectClassName()} value={parkingFacilityForm.siteId} onChange={(event) => setParkingFacilityForm((current) => ({ ...current, siteId: event.target.value }))}>
                    <option value="">Yerleske sec</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                <FieldShell label="Bagli bina">
                  <select className={selectClassName()} value={parkingFacilityForm.buildingId} onChange={(event) => setParkingFacilityForm((current) => ({ ...current, buildingId: event.target.value }))}>
                    <option value="">Yok</option>
                    {buildings.map((building) => (
                      <option key={building.id} value={building.id}>
                        {building.name}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                <FieldShell label="Kod">
                  <input className={inputClassName()} placeholder="Ornek: KAPALI-A, VALE-1" value={parkingFacilityForm.code} onChange={(event) => setParkingFacilityForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} />
                </FieldShell>
                <CodeGuide>Otopark tesisi kodu yerleske icinde tekil olmali. Tesis turunu ve fiziki bolgeyi ayirt etsin.</CodeGuide>
                <FieldShell label="Ad">
                  <input className={inputClassName()} value={parkingFacilityForm.name} onChange={(event) => setParkingFacilityForm((current) => ({ ...current, name: event.target.value }))} />
                </FieldShell>
                <FieldShell label="Tesis tipi">
                  <select className={selectClassName()} value={parkingFacilityForm.facilityType} onChange={(event) => setParkingFacilityForm((current) => ({ ...current, facilityType: Number(event.target.value) }))}>
                    {parkingFacilityTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy || !parkingFacilityForm.siteId || !parkingFacilityForm.code.trim() || !parkingFacilityForm.name.trim()} onClick={handleCreateParkingFacility} type="button">
                  <Plus className="h-4 w-4" />
                  Otopark tesisi olustur
                </button>
              </div>
            </div>
          ) : parkingTab === 'zones' ? (
            <div className={sectionCardClassName()}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Otopark bolgesi</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">Tesis icindeki bolgeleri ayir</h3>
              <div className="mt-6 grid gap-4">
                <FieldShell label="Otopark tesisi">
                  <select className={selectClassName()} value={parkingZoneForm.parkingFacilityId} onChange={(event) => setParkingZoneForm((current) => ({ ...current, parkingFacilityId: event.target.value }))}>
                    <option value="">Otopark tesisi sec</option>
                    {parkingFacilities.map((facility: ParkingFacilityHierarchy) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                <FieldShell label="Bagli kat">
                  <select className={selectClassName()} value={parkingZoneForm.floorId} onChange={(event) => setParkingZoneForm((current) => ({ ...current, floorId: event.target.value }))}>
                    <option value="">Yok</option>
                    {floors.map((floor) => (
                      <option key={floor.id} value={floor.id}>
                        {floor.name}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                <FieldShell label="Kod">
                  <input className={inputClassName()} placeholder="Ornek: A1, B2, ENGELLI" value={parkingZoneForm.code} onChange={(event) => setParkingZoneForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} />
                </FieldShell>
                <CodeGuide>Bolge kodu otopark tesisi icinde tekil olmali. Saha ekiplerinin gunluk kullandigi isimlendirmeyi tercih edin.</CodeGuide>
                <FieldShell label="Ad">
                  <input className={inputClassName()} value={parkingZoneForm.name} onChange={(event) => setParkingZoneForm((current) => ({ ...current, name: event.target.value }))} />
                </FieldShell>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy || !parkingZoneForm.parkingFacilityId || !parkingZoneForm.code.trim() || !parkingZoneForm.name.trim()} onClick={handleCreateParkingZone} type="button">
                  <Plus className="h-4 w-4" />
                  Otopark bolgesi olustur
                </button>
              </div>
            </div>
          ) : null}

          <div className={sectionCardClassName()}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Mevcut envanter</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              Tesisler ve bolgeler
            </h3>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {parkingFacilities.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-500">
                  Henuz otopark tesisi yok.
                </div>
              ) : (
                parkingFacilities.map((facility) => (
                  <div key={facility.id} className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{facility.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{facility.code} - {enumLabel(facility.facilityType, parkingFacilityTypeOptions)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700" onClick={() => void handleUpdateParkingFacility(facility)} type="button">Duzenle</button>
                        <button className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700" onClick={() => void handleDeleteParkingFacility(facility.id)} type="button">Sil</button>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {facility.zones.length === 0 ? (
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">Henuz bolge yok</span>
                      ) : (
                        facility.zones.map((zone) => (
                          <button key={zone.id} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700" onClick={() => void handleUpdateParkingZone(zone)} type="button">
                            {zone.code} - {zone.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </section>
    );

    return (
      <section className="grid gap-6 xl:grid-cols-2">
        <div className={sectionCardClassName()}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Otopark tesisi</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Otopark yapisini yerleskeye bagla</h3>
          <div className="mt-6 grid gap-4">
            <FieldShell label="Yerleske">
              <select
                className={selectClassName()}
                value={parkingFacilityForm.siteId}
                onChange={(event) =>
                  setParkingFacilityForm((current) => ({ ...current, siteId: event.target.value }))
                }
              >
                <option value="">Yerleske sec</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell label="Bagli bina">
              <select
                className={selectClassName()}
                value={parkingFacilityForm.buildingId}
                onChange={(event) =>
                  setParkingFacilityForm((current) => ({ ...current, buildingId: event.target.value }))
                }
              >
                <option value="">Yok</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell label="Kod">
              <input
                className={inputClassName()}
                value={parkingFacilityForm.code}
                onChange={(event) =>
                  setParkingFacilityForm((current) => ({ ...current, code: event.target.value }))
                }
              />
            </FieldShell>
            <FieldShell label="Ad">
              <input
                className={inputClassName()}
                value={parkingFacilityForm.name}
                onChange={(event) =>
                  setParkingFacilityForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </FieldShell>
            <FieldShell label="Tesis tipi">
              <select
                className={selectClassName()}
                value={parkingFacilityForm.facilityType}
                onChange={(event) =>
                  setParkingFacilityForm((current) => ({
                    ...current,
                    facilityType: Number(event.target.value),
                  }))
                }
              >
                {parkingFacilityTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FieldShell>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              disabled={busy || !parkingFacilityForm.siteId || !parkingFacilityForm.code.trim() || !parkingFacilityForm.name.trim()}
              onClick={handleCreateParkingFacility}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Otopark tesisi olustur
            </button>
          </div>
        </div>

        <div className={sectionCardClassName()}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Otopark bolgesi</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Otopark envanterini bolgelere ayir</h3>
          <div className="mt-6 grid gap-4">
            <FieldShell label="Otopark tesisi">
              <select
                className={selectClassName()}
                value={parkingZoneForm.parkingFacilityId}
                onChange={(event) =>
                  setParkingZoneForm((current) => ({ ...current, parkingFacilityId: event.target.value }))
                }
              >
                <option value="">Otopark tesisi sec</option>
                {parkingFacilities.map((facility: ParkingFacilityHierarchy) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell label="Bagli kat">
              <select
                className={selectClassName()}
                value={parkingZoneForm.floorId}
                onChange={(event) =>
                  setParkingZoneForm((current) => ({ ...current, floorId: event.target.value }))
                }
              >
                <option value="">Yok</option>
                {floors.map((floor) => (
                  <option key={floor.id} value={floor.id}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell label="Kod">
              <input
                className={inputClassName()}
                value={parkingZoneForm.code}
                onChange={(event) =>
                  setParkingZoneForm((current) => ({ ...current, code: event.target.value }))
                }
              />
            </FieldShell>
            <FieldShell label="Ad">
              <input
                className={inputClassName()}
                value={parkingZoneForm.name}
                onChange={(event) =>
                  setParkingZoneForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </FieldShell>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              disabled={busy || !parkingZoneForm.parkingFacilityId || !parkingZoneForm.code.trim() || !parkingZoneForm.name.trim()}
              onClick={handleCreateParkingZone}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Otopark bolgesi olustur
            </button>
          </div>
        </div>

        <div className={`${sectionCardClassName()} xl:col-span-2`}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Otopark envanteri</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Mevcut tesis ve bolgeler</h3>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {parkingFacilities.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-500">
                Henuz otopark tesisi yok.
              </div>
            ) : (
              parkingFacilities.map((facility) => (
                <div key={facility.id} className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-5">
                  <p className="text-sm font-semibold text-slate-900">{facility.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {facility.code} - {enumLabel(facility.facilityType, parkingFacilityTypeOptions)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {facility.zones.length === 0 ? (
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                        Henuz bolge yok
                      </span>
                    ) : (
                      facility.zones.map((zone) => (
                        <span
                          key={zone.id}
                          className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                        >
                          {zone.code} - {zone.name}
                        </span>
                      ))
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700" onClick={() => void handleUpdateParkingFacility(facility)} type="button">Duzenle</button>
                    <button className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700" onClick={() => void handleDeleteParkingFacility(facility.id)} type="button">Sil</button>
                    {facility.zones.map((zone) => (
                      <button key={zone.id} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700" onClick={() => void handleUpdateParkingZone(zone)} type="button">
                        Bolgeyi duzenle: {zone.code}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          {parkingFacilities.some((facility) => facility.zones.length > 0) ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {parkingFacilities.flatMap((facility) =>
                facility.zones.map((zone) => (
                  <button key={`${zone.id}-edit`} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700" onClick={() => void handleUpdateParkingZone(zone)} type="button">
                    Bolge duzenle: {zone.code}
                  </button>
                )),
              )}
              {parkingFacilities.flatMap((facility) =>
                facility.zones.map((zone) => (
                  <button key={`${zone.id}-delete`} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700" onClick={() => void handleDeleteParkingZone(zone.id)} type="button">
                    Bolge sil: {zone.code}
                  </button>
                )),
              )}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  function renderMaps() {
    return (
      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <div className={sectionCardClassName()}>
            <p className="admin-kicker">Harita dosyasi yukleme</p>
            <h3 className="admin-heading mt-2 text-2xl font-semibold">Kat krokisini depolamaya gonder</h3>
            <div className="mt-6 space-y-4">
              <FieldShell label="Dosya">
                <input
                  className={inputClassName()}
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg,.pdf"
                  onChange={(event) => void handleUploadAsset(event.target.files?.[0] ?? null)}
                />
              </FieldShell>
              {uploadedAsset ? (
                <div className={`${subtlePanelClassName()} p-4 text-sm text-[#b5bcc7]`}>
                  <p className="font-semibold text-white">{uploadedAsset.originalFileName}</p>
                  <p className="mt-1">{uploadedAsset.relativePath}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className={sectionCardClassName()}>
            <p className="admin-kicker">Surum olustur</p>
            <h3 className="admin-heading mt-2 text-2xl font-semibold">Yayina hazir harita taslaklari</h3>
            <div className="mt-6 grid gap-4">
              <SearchableSelect
                label="Organizasyon"
                value={selectedOrganizationId}
                options={organizations.map((organization) => ({
                  value: organization.id,
                  label: organization.name,
                  hint: organization.description ?? 'Organizasyon',
                }))}
                placeholder="Organizasyon ara"
                emptyText="Organizasyon sec"
                onChange={(value) => setSelectedOrganizationId(value)}
              />
              <SearchableSelect
                label="Yerleske"
                value={selectedMapSiteId}
                options={mapSites.map((site) => ({
                  value: site.id,
                  label: site.name,
                  hint: site.code,
                }))}
                placeholder="Yerleske ara"
                emptyText="Yerleske sec"
                onChange={(value) => setSelectedMapSiteId(value)}
              />
              <SearchableSelect
                label="Bina"
                value={selectedMapBuildingId}
                options={mapBuildings.map((building) => ({
                  value: building.id,
                  label: building.name,
                  hint: `${building.code} · ${building.siteName}`,
                }))}
                placeholder="Bina ara"
                emptyText="Bina sec"
                onChange={(value) => setSelectedMapBuildingId(value)}
              />
              <SearchableSelect
                label="Kat"
                value={mapVersionForm.floorId}
                options={mapFloors.map((floor) => ({
                  value: floor.id,
                  label: floor.name,
                  hint: `${floor.code} · ${floor.buildingName}`,
                }))}
                placeholder="Kat ara"
                emptyText="Kat sec"
                onChange={(value) => {
                  setSelectedMapFloorId(value);
                  setMapVersionForm((current) => ({ ...current, floorId: value }));
                }}
              />
              <FieldShell label="Surum adi">
                <input
                  className={inputClassName()}
                  value={mapVersionForm.name}
                  onChange={(event) =>
                    setMapVersionForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </FieldShell>
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldShell label="Genislik">
                  <input
                    className={inputClassName()}
                    type="number"
                    value={mapVersionForm.width}
                    onChange={(event) =>
                      setMapVersionForm((current) => ({ ...current, width: Number(event.target.value) }))
                    }
                  />
                </FieldShell>
                <FieldShell label="Yukseklik">
                  <input
                    className={inputClassName()}
                    type="number"
                    value={mapVersionForm.height}
                    onChange={(event) =>
                      setMapVersionForm((current) => ({ ...current, height: Number(event.target.value) }))
                    }
                  />
                </FieldShell>
              </div>
                <button
                  className="admin-action admin-action-accent inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
                  disabled={busy || !uploadedAsset || !mapVersionForm.floorId || !mapVersionForm.name.trim()}
                  onClick={handleCreateMapVersion}
                  type="button"
                >
                  <Upload className="h-4 w-4" />
                  Harita surumu olustur
                </button>
            </div>
          </div>

          <div className={sectionCardClassName()}>
            <p className="admin-kicker">Harita surumleri</p>
            <h3 className="admin-heading mt-2 text-2xl font-semibold">Taslak veya yayindaki editoru sec</h3>
            <div className="mt-6 space-y-3">
              {filteredMapVersions.length === 0 ? (
                <div className="admin-panel-subtle border-dashed p-5 text-sm text-[#8f96a3]">
                  Secili filtreler icin henuz harita surumu yok.
                </div>
              ) : (
                filteredMapVersions.map((version) => {
                  const active = version.id === selectedMapVersionId;
                  return (
                    <button
                      key={version.id}
                      className={rowCardClassName(active)}
                      onClick={() => {
                        setSelectedMapSiteId(version.siteId);
                        setSelectedMapBuildingId(version.buildingId);
                        setSelectedMapFloorId(version.floorId);
                        setMapVersionForm((current) => ({ ...current, floorId: version.floorId }));
                        setSelectedMapVersionId(version.id);
                      }}
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{version.name}</p>
                          <p className={`mt-1 text-xs ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                            {version.floorCode} - {version.floorName}
                          </p>
                        </div>
                        <span className="admin-pill px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                          {statusLabel(version.status)}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={actionButtonClassName('neutral')} onClick={(event) => { event.stopPropagation(); void handleRenameMapVersion(version.id, version.name); }}>
                          Yeniden adlandir
                        </span>
                        <span className={actionButtonClassName('accent')} onClick={(event) => { event.stopPropagation(); void handleDuplicateMapVersion(version.id, version.name); }}>
                          Kopyala
                        </span>
                        <span className={actionButtonClassName('neutral')} onClick={(event) => { event.stopPropagation(); void handleArchiveMapVersion(version.id); }}>
                          Arsivle
                        </span>
                        <span className={actionButtonClassName('danger')} onClick={(event) => { event.stopPropagation(); void handleDeleteMapVersion(version.id); }}>
                          Sil
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={sectionCardClassName()}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="admin-kicker">Harita editoru</p>
                <h3 className="admin-heading mt-2 text-2xl font-semibold">
                  {mapEditor ? mapEditor.name : 'Bir harita surumu sec'}
                </h3>
              </div>
              {mapEditor ? (
                <button
                  className="admin-action admin-action-accent inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
                  disabled={busy}
                  onClick={handlePublishMapVersion}
                  type="button"
                >
                  Yayinla
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            {mapEditor ? (
              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div className="admin-panel-subtle p-4">
                  <p className="admin-kicker">Durum</p>
                  <p className="mt-2 text-lg font-semibold text-[#F5F3EF]">{statusLabel(mapEditor.status)}</p>
                </div>
                <div className="admin-panel-subtle p-4">
                  <p className="admin-kicker">Boyut</p>
                  <p className="mt-2 text-lg font-semibold text-[#F5F3EF]">
                    {mapEditor.width} x {mapEditor.height}
                  </p>
                </div>
                <div className="admin-panel-subtle p-4">
                  <p className="admin-kicker">Dugum</p>
                  <p className="mt-2 text-lg font-semibold text-[#F5F3EF]">{mapEditor.nodes.length}</p>
                </div>
                <div className="admin-panel-subtle p-4">
                  <p className="admin-kicker">Baglanti</p>
                  <p className="mt-2 text-lg font-semibold text-[#F5F3EF]">{mapEditor.connections.length}</p>
                </div>
              </div>
            ) : (
              <div className="admin-panel-subtle mt-6 border-dashed p-5 text-sm text-[#8f96a3]">
                Once bir harita surumu sec veya olustur.
              </div>
            )}
          </div>

          {mapEditor ? renderMapCanvas() : null}

          <div className="grid gap-6 xl:grid-cols-2">
            <div className={sectionCardClassName()}>
              <p className="admin-kicker">Dugum ekle</p>
              <div className="mt-6 grid gap-4">
                <FieldShell label="Etiket">
                  <input
                    className={inputClassName()}
                    value={nodeForm.label}
                    onChange={(event) => setNodeForm((current) => ({ ...current, label: event.target.value }))}
                  />
                </FieldShell>
                <FieldShell label="Dugum tipi">
                  <select
                    className={selectClassName()}
                    value={nodeForm.nodeType}
                    onChange={(event) =>
                      setNodeForm((current) => ({ ...current, nodeType: Number(event.target.value) }))
                    }
                  >
                    {nodeTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                    ))}
                  </select>
                </FieldShell>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldShell label="Piksel X">
                    <input
                      className={inputClassName()}
                      type="number"
                      value={nodeForm.pixelX}
                      onChange={(event) =>
                        setNodeForm((current) => ({ ...current, pixelX: Number(event.target.value) }))
                      }
                    />
                  </FieldShell>
                  <FieldShell label="Piksel Y">
                    <input
                      className={inputClassName()}
                      type="number"
                      value={nodeForm.pixelY}
                      onChange={(event) =>
                        setNodeForm((current) => ({ ...current, pixelY: Number(event.target.value) }))
                      }
                    />
                  </FieldShell>
                </div>
                <CodeGuide>
                  {isParkingSpotNode
                    ? 'Bu nokta kaydedildiginde park kaydi ve QR kodu sistem tarafinda otomatik olusturulur.'
                    : generatesQrForNodeForm
                      ? 'Bu nokta kaydedildiginde QR kodu sistem tarafinda otomatik olusturulur.'
                      : 'Kisitli alan cizgisinde sadece tur, etiket ve koordinat bilgisi tutulur.'}
                </CodeGuide>
                <label className="admin-panel-subtle flex items-center gap-3 px-4 py-3 text-sm text-[#d7d2ca]">
                  <input
                    checked={nodeForm.isAccessible}
                    onChange={(event) =>
                      setNodeForm((current) => ({ ...current, isAccessible: event.target.checked }))
                    }
                    type="checkbox"
                  />
                  Erisilebilir dugum
                </label>
                <button
                  className="admin-action admin-action-accent inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
                  disabled={busy || !selectedMapVersionId || !nodeForm.label.trim()}
                  onClick={mapEditorSelection.editingNodeId ? handleUpdateNode : handleAddNode}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  {mapEditorSelection.editingNodeId ? 'Dugumu guncelle' : 'Dugum ekle'}
                </button>
                {selectedMapNode && nodeTypeGeneratesQr(selectedMapNode.nodeType) ? (
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                    <p className="admin-kicker">
                      Otomatik QR
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#F5F3EF]">
                      {selectedMapNode.code} - {selectedMapNode.label}
                    </p>
                    {selectedNodeQrDataUrl ? (
                      <div className="mt-4 flex items-center gap-4">
                        <img
                          alt={`${selectedMapNode.code} QR`}
                          className="h-32 w-32 rounded-[8px] border border-[rgba(245,243,239,0.08)] bg-white p-3"
                          src={selectedNodeQrDataUrl}
                        />
                        <div className="space-y-3 text-xs leading-6 text-[#8f96a3]">
                          <div>
                            Bu QR kod mobil uygulamada dogrudan ilgili noktayi acar.
                            <br />
                            Park noktalarinda canli takip ayni nokta kaydi uzerinden ilerler.
                          </div>
                          <a
                            className="admin-action inline-flex items-center justify-center px-3 py-2 font-semibold transition"
                            download={`${selectedMapNode.code.toLowerCase()}-qr.png`}
                            href={selectedNodeQrDataUrl}
                          >
                            QR indir
                          </a>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div className={sectionCardClassName()}>
              <p className="admin-kicker">Baglanti ekle</p>
              <div className="mt-6 grid gap-4">
                <FieldShell label="Baslangic dugumu">
                  <select
                    className={selectClassName()}
                    value={connectionForm.fromNodeId}
                    onChange={(event) =>
                      setConnectionForm((current) => ({ ...current, fromNodeId: event.target.value }))
                    }
                  >
                    <option value="">Dugum sec</option>
                    {mapEditor?.nodes.map((node: FacilityMapNode) => (
                      <option key={node.id} value={node.id}>
                        {node.code} - {node.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                <FieldShell label="Hedef dugumu">
                  <select
                    className={selectClassName()}
                    value={connectionForm.toNodeId}
                    onChange={(event) =>
                      setConnectionForm((current) => ({ ...current, toNodeId: event.target.value }))
                    }
                  >
                    <option value="">Dugum sec</option>
                    {mapEditor?.nodes.map((node: FacilityMapNode) => (
                      <option key={node.id} value={node.id}>
                        {node.code} - {node.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                <FieldShell label="Mesafe metre">
                  <input
                    className={inputClassName()}
                    type="number"
                    min="0"
                    step="0.1"
                    value={connectionForm.distanceMeters}
                    onChange={(event) =>
                      setConnectionForm((current) => ({
                        ...current,
                        distanceMeters: Number(event.target.value),
                      }))
                    }
                  />
                </FieldShell>
                <label className="admin-panel-subtle flex items-center gap-3 px-4 py-3 text-sm text-[#d7d2ca]">
                  <input
                    checked={connectionForm.isBidirectional}
                    onChange={(event) =>
                      setConnectionForm((current) => ({
                        ...current,
                        isBidirectional: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  Cift yonlu
                </label>
                <label className="admin-panel-subtle flex items-center gap-3 px-4 py-3 text-sm text-[#d7d2ca]">
                  <input
                    checked={connectionForm.isAccessible}
                    onChange={(event) =>
                      setConnectionForm((current) => ({
                        ...current,
                        isAccessible: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  Erisilebilir baglanti
                </label>
                <button
                  className="admin-action admin-action-accent inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
                  disabled={
                    busy ||
                    !selectedMapVersionId ||
                    !connectionForm.fromNodeId ||
                    !connectionForm.toNodeId ||
                    connectionForm.fromNodeId === connectionForm.toNodeId
                  }
                  onClick={mapEditorSelection.editingConnectionId ? handleUpdateConnection : handleAddConnection}
                  type="button"
                >
                  <Waypoints className="h-4 w-4" />
                  {mapEditorSelection.editingConnectionId ? 'Baglantiyi guncelle' : 'Baglanti ekle'}
                </button>
              </div>
            </div>
          </div>

          {mapEditor ? (
            <div className={sectionCardClassName()}>
              <p className="admin-kicker">Mevcut grafik</p>
              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-[#F5F3EF]">Dugumler</p>
                  <div className="mt-4 space-y-3">
                    {mapEditor.nodes.map((node: FacilityMapNode) => (
                      <div key={node.id} className="admin-panel-subtle p-4">
                        <p className="text-sm font-semibold text-[#F5F3EF]">
                          {node.code} - {node.label}
                        </p>
                        <p className="mt-1 text-xs text-[#8f96a3]">
                          {enumLabel(node.nodeType, nodeTypeOptions)} - ({node.pixelX}, {node.pixelY})
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button className={actionButtonClassName('neutral')} onClick={() => startNodeEdit(node)} type="button">Duzenle</button>
                          <button className={actionButtonClassName('danger')} onClick={() => void handleDeleteNode(node.id)} type="button">Sil</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#F5F3EF]">Baglantilar</p>
                  <div className="mt-4 space-y-3">
                    {mapEditor.connections.map((connection: FacilityMapConnection) => (
                      <div
                        key={connection.id}
                        className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4"
                      >
                        <p className="text-sm font-semibold text-slate-900">
                          {connection.fromNodeId.slice(0, 8)} → {connection.toNodeId.slice(0, 8)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {connection.distanceMeters}m -{' '}
                          {connection.isBidirectional ? 'Cift yonlu' : 'Tek yonlu'}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700" onClick={() => startConnectionEdit(connection)} type="button">Duzenle</button>
                          <button className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700" onClick={() => void handleDeleteConnection(connection.id)} type="button">Sil</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  function renderCameras() {
    return (
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className={sectionCardClassName()}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Kamera olustur</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              {editingCameraId ? 'Kamera kaydini guncelle' : 'Algilama altyapisini yerlestir'}
            </h3>
            <div className="mt-6 grid gap-4">
              <FieldShell label="Yerleske">
                <select
                  className={selectClassName()}
                  value={cameraForm.siteId}
                  onChange={(event) => setCameraForm((current) => ({ ...current, siteId: event.target.value }))}
                >
                  <option value="">Yerleske sec</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell label="Bina">
                <select
                  className={selectClassName()}
                  value={cameraForm.buildingId}
                  onChange={(event) => setCameraForm((current) => ({ ...current, buildingId: event.target.value }))}
                >
                  <option value="">Bagli degil</option>
                  {buildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell label="Kat">
                <select
                  className={selectClassName()}
                  value={cameraForm.floorId}
                  onChange={(event) => setCameraForm((current) => ({ ...current, floorId: event.target.value }))}
                >
                  <option value="">Bagli degil</option>
                  {floors.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell label="Otopark tesisi">
                <select
                  className={selectClassName()}
                  value={cameraForm.parkingFacilityId}
                  onChange={(event) =>
                    setCameraForm((current) => ({ ...current, parkingFacilityId: event.target.value }))
                  }
                >
                  <option value="">Bagli degil</option>
                  {parkingFacilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell label="Kamera adi">
                <input className={inputClassName()} value={cameraForm.name} onChange={(event) => setCameraForm((current) => ({ ...current, name: event.target.value }))} />
              </FieldShell>
              <FieldShell label="IP adresi">
                <input className={inputClassName()} value={cameraForm.ipAddress} onChange={(event) => setCameraForm((current) => ({ ...current, ipAddress: event.target.value }))} />
              </FieldShell>
              <FieldShell label="Yayin adresi">
                <input className={inputClassName()} value={cameraForm.streamUrl} onChange={(event) => setCameraForm((current) => ({ ...current, streamUrl: event.target.value }))} />
              </FieldShell>
              <FieldShell label="Notlar">
                <textarea className={`${inputClassName()} min-h-28 resize-y`} value={cameraForm.notes} onChange={(event) => setCameraForm((current) => ({ ...current, notes: event.target.value }))} />
              </FieldShell>
              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  disabled={busy || !cameraForm.siteId || !cameraForm.name.trim() || !cameraForm.ipAddress.trim() || !cameraForm.streamUrl.trim()}
                  onClick={handleSaveCamera}
                  type="button"
                >
                  {editingCameraId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingCameraId ? 'Kamerayi kaydet' : 'Kamera olustur'}
                </button>
                {editingCameraId ? (
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                    onClick={resetCameraForm}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                    Iptal
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className={sectionCardClassName()}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Kamera bolgesi olustur</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              {editingCameraZoneId ? 'Kamera bolgesini guncelle' : 'Algilama alanlarini bagla'}
            </h3>
            <div className="mt-6 grid gap-4">
              <FieldShell label="Kamera">
                <select
                  className={selectClassName()}
                  value={cameraZoneForm.cameraId}
                  onChange={(event) => setCameraZoneForm((current) => ({ ...current, cameraId: event.target.value }))}
                >
                  <option value="">Kamera sec</option>
                  {cameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.name}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell label="Otopark bolgesi">
                <select
                  className={selectClassName()}
                  value={cameraZoneForm.parkingZoneId}
                  onChange={(event) => setCameraZoneForm((current) => ({ ...current, parkingZoneId: event.target.value }))}
                >
                  <option value="">Bagli degil</option>
                  {cameraScopedParkingZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.code} - {zone.name}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell label="Harita surumu">
                <select
                  className={selectClassName()}
                  value={cameraZoneForm.mapVersionId}
                  onChange={(event) => setCameraZoneForm((current) => ({ ...current, mapVersionId: event.target.value }))}
                >
                  <option value="">Bagli degil</option>
                  {cameraScopedMapVersions.map((version) => (
                    <option key={version.id} value={version.id}>
                      {version.floorCode} - {version.name}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell label="Bolge adi">
                <input className={inputClassName()} value={cameraZoneForm.name} onChange={(event) => setCameraZoneForm((current) => ({ ...current, name: event.target.value }))} />
              </FieldShell>
              <FieldShell label="Esik degeri">
                <input className={inputClassName()} type="number" min="0" max="1" step="0.05" value={cameraZoneForm.detectionThreshold} onChange={(event) => setCameraZoneForm((current) => ({ ...current, detectionThreshold: Number(event.target.value) }))} />
              </FieldShell>
              <FieldShell label="Polygon onizleme">
                <textarea className={`${inputClassName()} min-h-28 resize-y font-mono text-xs`} readOnly value={cameraZoneForm.polygonJson} />
              </FieldShell>
              <CodeGuide>
                Harita uzerine tiklayarak polygon olustur. Mavi noktalara tiklayarak tekil noktayi silebilirsin.
              </CodeGuide>
              {renderCameraZoneCanvas()}
              <div className="grid gap-3 sm:grid-cols-2">
                {cameraZonePoints.map((point, index) => (
                  <div key={`${point.x}-${point.y}-${index}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-700">
                    <span>
                      Nokta {index + 1}: {point.x}, {point.y}
                    </span>
                    <button
                      className="rounded-full border border-rose-200 bg-rose-50 p-1 text-rose-700"
                      onClick={() => syncCameraZonePoints(cameraZonePoints.filter((_, pointIndex) => pointIndex !== index))}
                      type="button"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  disabled={busy || !cameraZoneForm.cameraId || !cameraZoneForm.name.trim() || cameraZonePoints.length < 3}
                  onClick={handleCreateCameraZone}
                  type="button"
                >
                  {editingCameraZoneId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingCameraZoneId ? 'Bolgeyi kaydet' : 'Kamera bolgesi olustur'}
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  onClick={() => syncCameraZonePoints(cameraZonePoints.slice(0, -1))}
                  type="button"
                >
                  <RotateCcw className="h-4 w-4" />
                  Son noktayi geri al
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  onClick={() => syncCameraZonePoints([])}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                  Polygonu temizle
                </button>
                {editingCameraZoneId ? (
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                    onClick={resetCameraZoneForm}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                    Iptal
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className={sectionCardClassName()}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Kamera envanteri</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Canli cihazlar ve algilama alanlari</h3>
          <div className="mt-6 space-y-4">
            {cameras.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-500">
                Henuz kamera tanimlanmadi.
              </div>
            ) : (
              cameras.map((camera) => (
                <div key={camera.id} className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{camera.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{camera.ipAddress} - {camera.streamUrl}</p>
                      <p className="mt-1 text-xs text-slate-400">{camera.notes || 'Not yok'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700" onClick={() => startCameraEdit(camera)} type="button">Duzenle</button>
                      <button className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700" onClick={() => void handleDeleteCamera(camera.id)} type="button">Sil</button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {camera.zones.length === 0 ? (
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                        Henuz bolge yok
                      </span>
                    ) : (
                      camera.zones.map((zone) => (
                        <span key={zone.id} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {zone.name} - esik {zone.detectionThreshold}
                        </span>
                      ))
                    )}
                  </div>
                  {camera.zones.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {camera.zones.map((zone) => (
                        <button key={`${zone.id}-edit`} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700" onClick={() => startCameraZoneEdit(zone, camera.id)} type="button">
                          Bolgeyi duzenle: {zone.name}
                        </button>
                      ))}
                      {camera.zones.map((zone) => (
                        <button key={`${zone.id}-delete`} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700" onClick={() => void handleDeleteCameraZone(zone.id)} type="button">
                          Bolgeyi sil: {zone.name}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    );
  }

  function renderUsers() {
    return (
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className={sectionCardClassName()}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Kullanici islemleri</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">Durum ve yasam dongusu</h3>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
              {usersPage?.totalCount ?? 0} toplam
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {users.map((user) => (
              <div key={user.id} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.isDeleted
                          ? 'bg-rose-100 text-rose-700'
                          : user.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {user.isDeleted ? 'Silinmis' : user.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                    <button
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                      onClick={() => void handleToggleUserStatus(user)}
                      type="button"
                    >
                      {user.isActive ? 'Pasif yap' : 'Aktif yap'}
                    </button>
                    <button
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                      onClick={() => void handleDeleteOrRestoreUser(user)}
                      type="button"
                    >
                      {user.isDeleted ? 'Geri yukle' : 'Sil'}
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <span
                      key={`${user.id}-${role}`}
                      className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={sectionCardClassName()}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Rol atama</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Erisim ver veya kaldir</h3>
          <div className="mt-6 grid gap-4">
            <FieldShell label="Kullanici">
              <select
                className={selectClassName()}
                value={userActionState.selectedUserId}
                onChange={(event) =>
                  setUserActionState((current) => ({ ...current, selectedUserId: event.target.value }))
                }
              >
                <option value="">Kullanici sec</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} - {user.email}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell label="Rol">
              <select
                className={selectClassName()}
                value={userActionState.selectedRoleId}
                onChange={(event) =>
                  setUserActionState((current) => ({ ...current, selectedRoleId: event.target.value }))
                }
              >
                <option value="">Rol sec</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </FieldShell>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                disabled={busy || !userActionState.selectedUserId || !userActionState.selectedRoleId}
                onClick={handleAssignRole}
                type="button"
              >
                Rol ata
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                disabled={busy || !userActionState.selectedUserId || !userActionState.selectedRoleId}
                onClick={handleRemoveRole}
                type="button"
              >
                Rolu kaldir
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderSecurity() {
    return (
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[34px] border border-slate-200/80 bg-slate-950 p-6 text-white shadow-[0_26px_70px_rgba(15,23,42,0.34)] lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200/80">Proxy ve oturum</p>
          <h3 className="mt-2 text-2xl font-semibold">Operasyonel guvenlik gorunumu</h3>
          <div className="mt-6 grid gap-4">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Proxy tarafindan eklenen uygulama gizli anahtari</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Yonetim paneli `/admin-api` yolunu cagirir ve proxy katmani `x-app-secret` ekler.
                Tarayici bundle'i uygulama gizli anahtarini hicbir zaman icermez.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">JWT rol kapisi</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Yonetici islemleri dogrulanmis JWT oturumu ve backend admin politikasi gerektirir.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Guncel operator</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {profile?.fullName || 'Bilinmiyor'} / {profile?.email || 'Oturum yok'}
              </p>
            </div>
          </div>
        </div>

        <div className={sectionCardClassName()}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Rol katalogu</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Yetkilendirme yuzeyleri</h3>
          <div className="mt-6 grid gap-3">
            {roles.map((role) => (
              <div key={role.id} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{role.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{role.description}</p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                    {role.isSystemRole ? 'Sistem' : 'Ozel'}
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-400">Olusturulma: {formatDate(role.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!session) {
    return (
      <AdminLogin
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
        onResetPassword={handleResetPassword}
        onInputChange={clearLoginFeedback}
        error={error}
        notice={success}
        fieldErrors={loginFieldErrors}
        busy={busy}
      />
    );
  }

  const topSearchPlaceholder =
    activeView === 'cameras'
      ? 'Kamera veya bolge ara...'
      : activeView === 'maps'
        ? 'POI veya koordinat ara...'
        : activeView === 'users'
          ? 'Kullanici ara...'
          : 'Search...';

  return (
    <div className="admin-shell min-h-screen text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-[284px] shrink-0 border-r border-[rgba(245,243,239,0.08)] bg-[#090b0d] px-6 py-8 xl:block">
          <div className="mb-10 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[8px] border border-[rgba(245,243,239,0.08)] bg-[#0d1013] text-[#F5F3EF]">
                <Map className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-[2rem] font-semibold tracking-[-0.04em] text-[#F5F3EF]">
                  Bulocation
                </h1>
                <p className="mt-1 font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[#8f96a3]">
                  Enterprise Admin
                </p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map(({ key, label, icon: Icon }) => {
              const active = key === activeView;
              return (
                <button
                  key={key}
                  className={`flex w-full items-center gap-3 rounded-none border px-4 py-3 text-left text-sm transition ${
                    active
                      ? 'border-[#1836B9] bg-[#0f141c] text-[#F5F3EF]'
                      : 'border-transparent text-[#8f96a3] hover:border-[rgba(245,243,239,0.08)] hover:bg-[#0d1013] hover:text-[#F5F3EF]'
                  }`}
                  onClick={() => setActiveView(key)}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{label}</span>
                  {active ? <ChevronRight className="ml-auto h-4 w-4" /> : null}
                </button>
              );
            })}
          </nav>

          <div className="admin-panel-card mt-auto p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[8px] border border-[rgba(245,243,239,0.08)] bg-[#0d1013] text-sm font-semibold text-[#F5F3EF]">
                {(profile?.fullName ?? 'A').slice(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#F5F3EF]">{profile?.fullName}</p>
                <p className="truncate text-xs text-[#8f96a3]">{profile?.email}</p>
              </div>
            </div>
            <button
              className="admin-action mt-4 flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold"
              onClick={handleLogout}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Oturumu kapat
            </button>
          </div>
        </aside>

        <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <div className="mx-auto max-w-[1480px] space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(245,243,239,0.08)] pb-5">
              <div className="flex flex-wrap items-center gap-6">
                <div className="relative min-w-[320px] max-w-[360px] flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f96a3]" />
                  <input
                    className="admin-input h-12 px-12 text-sm"
                    placeholder={topSearchPlaceholder}
                  />
                </div>
                <nav className="flex items-center gap-8">
                  {topNavTabs(activeViewLabel).map((tab, index) => {
                    const active = index === 2;
                    return (
                      <span
                        key={tab}
                        className={`border-b-2 pb-1 text-sm font-semibold ${
                          active
                            ? 'border-[#1836B9] text-[#F5F3EF]'
                            : 'border-transparent text-[#8f96a3]'
                        }`}
                      >
                        {tab}
                      </span>
                    );
                  })}
                </nav>
              </div>
              <div className="flex items-center gap-3">
                <button className="admin-action flex h-11 w-11 items-center justify-center" type="button">
                  <Bell className="h-4 w-4" />
                </button>
                <button className="admin-action flex h-11 w-11 items-center justify-center" type="button">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </div>
            </header>

            {error ? (
              <div className="border border-rose-500/30 bg-rose-950/30 px-5 py-4 text-sm text-rose-200">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="border border-emerald-500/30 bg-emerald-950/30 px-5 py-4 text-sm text-emerald-200">
                {success}
              </div>
            ) : null}

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="border border-[#1f2c45] bg-[#101927] p-5 shadow-[0_24px_60px_rgba(2,6,23,0.3)] lg:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8ea3c8]">
                    {activeViewLabel}
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#eef3ff] sm:text-4xl">
                    {activeViewLabel} Yonetimi
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[#b4c4e2]">
                    Kurumsal yapinizi, navigasyon varliklarinizi ve operasyonel birimlerinizi bu panel uzerinden merkezi olarak yonetebilirsiniz.
                  </p>
                </div>
                {activeView === 'organizations' ? (
                  <button
                    className="inline-flex items-center gap-3 border border-[#a9c3ff] bg-[#a9c3ff] px-5 py-3 text-sm font-semibold text-[#0b234f]"
                    onClick={handleCreateOrganization}
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                    Yeni Organizasyon Ekle
                  </button>
                ) : null}
                {activeView === 'maps' && selectedMapVersionId ? (
                  <button
                    className="inline-flex items-center gap-3 border border-[#a9c3ff] bg-[#a9c3ff] px-5 py-3 text-sm font-semibold text-[#0b234f]"
                    onClick={handlePublishMapVersion}
                    type="button"
                  >
                    <Upload className="h-4 w-4" />
                    Yayinla
                  </button>
                ) : null}
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-5">
                {metrics.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="border border-[#1f2c45] bg-[#0d1422] p-4">
                    <div className="flex h-10 w-10 items-center justify-center border border-[#2d3d5a] bg-[#15233a] text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {activeView === 'overview' ? renderOverview() : null}
            {activeView === 'organizations' ? renderOrganizations() : null}
            {activeView === 'facilities' ? renderFacilities() : null}
            {activeView === 'parking' ? renderParking() : null}
            {activeView === 'maps' ? renderMaps() : null}
            {activeView === 'cameras' ? renderCameras() : null}
            {activeView === 'users' ? renderUsers() : null}
            {activeView === 'security' ? renderSecurity() : null}
          </div>
        </main>
      </div>
    </div>
  );
}
