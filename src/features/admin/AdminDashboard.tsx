import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  MousePointer2,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  Waypoints,
  X,
} from 'lucide-react';
import AdminLogin from '../../admin/AdminLogin';
import {
  adminApi,
  type AdminUserSearchResult,
  type AdminUserListItem,
  getApiErrorMessage,
  getApiFieldErrors,
  isApiClientError,
  type BuildingHierarchy,
  type CameraHierarchy,
  type CameraZoneHierarchy,
  type FacilityMapConnection,
  type FacilityMapNode,
  type FacilityMapTransition,
  type MapAsset,
  type MapPublishReadiness,
  type MapVersionEditor,
  type OrganizationHierarchy,
  type OrganizationSummary,
  type ParkingFacilityHierarchy,
  type PagedResult,
  type RoleDto,
  type SiteHierarchy,
  type UserProfile,
} from './shared/services/adminApi';
import AdminShell from './layout/AdminShell';
import AdminSidebar from './layout/AdminSidebar';
import AdminTopbar from './layout/AdminTopbar';
import DashboardOverview from './dashboard/DashboardOverview';
import OrganizationManagement from './organizations/OrganizationManagement';
import FacilitiesManagement from './organizations/FacilitiesManagement';
import ParkingManagement from './organizations/ParkingManagement';
import CodeGuide from './shared/components/CodeGuide';
import FieldShell from './shared/components/FieldShell';
import SearchableSelect from './shared/components/SearchableSelect';
import {
  ADMIN_SESSION_STORAGE_KEY,
  allNodeTypeOptions,
  nodeTypeOptions,
  CAMERA_ZONE_GRID_SIZE,
  sidebarItems,
  transitionConnectorNodeTypes,
  transitionTypeOptions,
} from './shared/constants';
import type {
  BuildingForm,
  CameraForm,
  CameraZoneForm,
  CanvasSize,
  ConnectionForm,
  FacilityTab,
  FloorForm,
  MapEditorSelectionState,
  MapEditorTool,
  MapVersionForm,
  NodeForm,
  ParkingFacilityForm,
  ParkingTab,
  ParkingZoneForm,
  PolygonPoint,
  Session,
  SidebarKey,
  SiteForm,
  TransitionForm,
  UserActionState,
} from './shared/types/admin.types';
import {
  actionButtonClassName,
  buildMapsiteFloorUrl,
  buildMapsiteMapUrl,
  enumLabel,
  flattenBuildings,
  flattenCameras,
  flattenFloors,
  flattenMapVersions,
  flattenParkingFacilities,
  flattenSites,
  formatDate,
  getViewLabel,
  inputClassName,
  isDraftMapStatus,
  isImageMapAsset,
  isPublishedMapStatus,
  mapAssetUrl,
  nodeTypeGeneratesQr,
  parsePolygonJson,
  resolveContainedImageRect,
  rowCardClassName,
  sectionCardClassName,
  selectClassName,
  snapToGrid,
  statusLabel,
  stringifyPolygon,
  subtlePanelClassName,
  topNavTabs,
} from './shared/utils';

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
  const [userSearchResults, setUserSearchResults] = useState<AdminUserSearchResult[]>([]);
  const [mapEditor, setMapEditor] = useState<MapVersionEditor | null>(null);
  const [mapPublishReadiness, setMapPublishReadiness] = useState<MapPublishReadiness | null>(null);
  const [cameraZoneMapEditor, setCameraZoneMapEditor] = useState<MapVersionEditor | null>(null);
  const [transitionTargetEditor, setTransitionTargetEditor] = useState<MapVersionEditor | null>(null);
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
  const [transitionForm, setTransitionForm] = useState<TransitionForm>({
    fromNodeId: '',
    toMapVersionId: '',
    toNodeId: '',
    connectionType: 1,
    distanceMeters: 1,
    isBidirectional: true,
    isAccessible: true,
  });
  const [userActionState, setUserActionState] = useState<UserActionState>({
    selectedUserId: '',
    selectedRoleId: '',
    userSearchTerm: '',
    organizationSearchTerm: '',
    selectedOrganizationAdminOrganizationId: '',
  });
  const [mapGraphSearch, setMapGraphSearch] = useState({
    nodeListTerm: '',
    connectionListTerm: '',
    fromNodeTerm: '',
    toNodeTerm: '',
    transitionFromNodeTerm: '',
    transitionMapTerm: '',
    transitionToNodeTerm: '',
  });
  const [mapEditorSelection, setMapEditorSelection] = useState<MapEditorSelectionState>({
    editingNodeId: '',
    editingConnectionId: '',
  });
  const [mapEditorTool, setMapEditorTool] = useState<MapEditorTool>('select');
  const [connectionStartNodeId, setConnectionStartNodeId] = useState<string>('');
  const [editingCameraId, setEditingCameraId] = useState<string>('');
  const [editingCameraZoneId, setEditingCameraZoneId] = useState<string>('');
  const [cameraZonePoints, setCameraZonePoints] = useState<PolygonPoint[]>([]);
  const [selectedNodeQrDataUrl, setSelectedNodeQrDataUrl] = useState<string>('');
  const [copiedNodeLinkType, setCopiedNodeLinkType] = useState<string>('');
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
  const users = useMemo(() => usersPage?.items ?? [], [usersPage]);
  const isSuperAdmin = profile?.roles.some((role) => role.toLowerCase() === 'superadmin') ?? false;
  const assignableRoles = useMemo(
    () => roles.filter((role) => role.name.toLowerCase() !== 'admin'),
    [roles],
  );
  const selectedRoleUser = useMemo(
    () =>
      userSearchResults.find((user) => user.id === userActionState.selectedUserId) ??
      users.find((user) => user.id === userActionState.selectedUserId) ??
      null,
    [userActionState.selectedUserId, userSearchResults, users],
  );
  const organizationSearchResults = useMemo(() => {
    const search = userActionState.organizationSearchTerm.trim().toLocaleLowerCase('tr-TR');
    if (search.length < 2) {
      return [] as OrganizationSummary[];
    }

    return organizations
      .filter((organization) => {
        const name = organization.name.toLocaleLowerCase('tr-TR');
        const description = organization.description?.toLocaleLowerCase('tr-TR') ?? '';
        return name.includes(search) || description.includes(search);
      })
      .slice(0, 12);
  }, [organizations, userActionState.organizationSearchTerm]);
  const selectedOrganizationAdminOrganization = useMemo(
    () =>
      organizations.find(
        (organization) => organization.id === userActionState.selectedOrganizationAdminOrganizationId,
      ) ?? null,
    [organizations, userActionState.selectedOrganizationAdminOrganizationId],
  );
  const visibleSidebarItems = useMemo(
    () => sidebarItems.filter((item) => isSuperAdmin || (item.key !== 'users' && item.key !== 'security')),
    [isSuperAdmin],
  );
  const isParkingSpotNode = nodeForm.nodeType === 8;
  const selectedMapCanEdit = isDraftMapStatus(mapEditor?.status);
  const selectedMapIsPublished = isPublishedMapStatus(mapEditor?.status);
  const selectedMapNode = useMemo(
    () => mapEditor?.nodes.find((node) => node.id === mapEditorSelection.editingNodeId) ?? null,
    [mapEditor, mapEditorSelection.editingNodeId],
  );
  const selectedNodeReference = selectedMapNode?.externalReferenceId ?? '';
  const selectedNodeMapsiteUrl = useMemo(
    () => buildMapsiteMapUrl(selectedNodeReference),
    [selectedNodeReference],
  );
  const selectedMapsiteFloorUrl = useMemo(
    () => buildMapsiteFloorUrl(mapEditor?.floorId),
    [mapEditor?.floorId],
  );
  const selectedMapsiteEmbedUrl = useMemo(
    () => buildMapsiteFloorUrl(mapEditor?.floorId, true),
    [mapEditor?.floorId],
  );
  const connectionStartNode = useMemo(
    () => mapEditor?.nodes.find((node) => node.id === connectionStartNodeId) ?? null,
    [connectionStartNodeId, mapEditor],
  );
  const filteredFromNodes = useMemo(() => {
    const search = mapGraphSearch.fromNodeTerm.trim().toLocaleLowerCase('tr-TR');
    if (!mapEditor) {
      return [] as FacilityMapNode[];
    }

    if (!search) {
      return mapEditor.nodes;
    }

    return mapEditor.nodes.filter((node) => {
      const code = node.code.toLocaleLowerCase('tr-TR');
      const label = node.label.toLocaleLowerCase('tr-TR');
      return code.includes(search) || label.includes(search);
    });
  }, [mapEditor, mapGraphSearch.fromNodeTerm]);
  const filteredToNodes = useMemo(() => {
    const search = mapGraphSearch.toNodeTerm.trim().toLocaleLowerCase('tr-TR');
    if (!mapEditor) {
      return [] as FacilityMapNode[];
    }

    if (!search) {
      return mapEditor.nodes;
    }

    return mapEditor.nodes.filter((node) => {
      const code = node.code.toLocaleLowerCase('tr-TR');
      const label = node.label.toLocaleLowerCase('tr-TR');
      return code.includes(search) || label.includes(search);
    });
  }, [mapEditor, mapGraphSearch.toNodeTerm]);
  const filteredMapNodes = useMemo(() => {
    const search = mapGraphSearch.nodeListTerm.trim().toLocaleLowerCase('tr-TR');
    if (!mapEditor) {
      return [] as FacilityMapNode[];
    }

    if (!search) {
      return mapEditor.nodes;
    }

    return mapEditor.nodes.filter((node) => {
      const code = node.code.toLocaleLowerCase('tr-TR');
      const label = node.label.toLocaleLowerCase('tr-TR');
      const type = enumLabel(node.nodeType, allNodeTypeOptions).toLocaleLowerCase('tr-TR');
      return code.includes(search) || label.includes(search) || type.includes(search);
    });
  }, [mapEditor, mapGraphSearch.nodeListTerm]);
  const filteredMapConnections = useMemo(() => {
    const search = mapGraphSearch.connectionListTerm.trim().toLocaleLowerCase('tr-TR');
    if (!mapEditor) {
      return [] as FacilityMapConnection[];
    }

    if (!search) {
      return mapEditor.connections;
    }

    return mapEditor.connections.filter((connection) => {
      const fromNode = mapEditor.nodes.find((node) => node.id === connection.fromNodeId);
      const toNode = mapEditor.nodes.find((node) => node.id === connection.toNodeId);
      const fromText = `${fromNode?.code ?? ''} ${fromNode?.label ?? ''}`.toLocaleLowerCase('tr-TR');
      const toText = `${toNode?.code ?? ''} ${toNode?.label ?? ''}`.toLocaleLowerCase('tr-TR');
      const directionText = connection.isBidirectional ? 'cift yonlu' : 'tek yonlu';
      return fromText.includes(search) || toText.includes(search) || directionText.includes(search);
    });
  }, [mapEditor, mapGraphSearch.connectionListTerm]);
  const selectedMapVersionSummary = useMemo(
    () => mapVersions.find((version) => version.id === selectedMapVersionId) ?? null,
    [mapVersions, selectedMapVersionId],
  );
  const mapVersionById = useMemo(
    () => new globalThis.Map(mapVersions.map((version) => [version.id, version])),
    [mapVersions],
  );
  const transitionTargetMapVersions = useMemo(() => {
    if (!selectedMapVersionSummary) {
      return [];
    }

    const search = mapGraphSearch.transitionMapTerm.trim().toLocaleLowerCase('tr-TR');
    return mapVersions
      .filter(
        (version) =>
          version.id !== selectedMapVersionSummary.id &&
          version.buildingId === selectedMapVersionSummary.buildingId,
      )
      .filter((version) => {
        if (!search) {
          return true;
        }

        const text = `${version.name} ${version.floorName} ${version.floorCode} ${version.buildingName}`.toLocaleLowerCase(
          'tr-TR',
        );
        return text.includes(search);
      });
  }, [mapGraphSearch.transitionMapTerm, mapVersions, selectedMapVersionSummary]);
  const transitionSourceNodes = useMemo(() => {
    const search = mapGraphSearch.transitionFromNodeTerm.trim().toLocaleLowerCase('tr-TR');
    if (!mapEditor) {
      return [] as FacilityMapNode[];
    }

    return mapEditor.nodes
      .filter((node) => transitionConnectorNodeTypes.has(node.nodeType))
      .filter((node) => {
        if (!search) {
          return true;
        }

        return `${node.code} ${node.label} ${enumLabel(node.nodeType, allNodeTypeOptions)}`
          .toLocaleLowerCase('tr-TR')
          .includes(search);
      });
  }, [mapEditor, mapGraphSearch.transitionFromNodeTerm]);
  const transitionTargetNodes = useMemo(() => {
    const search = mapGraphSearch.transitionToNodeTerm.trim().toLocaleLowerCase('tr-TR');
    if (!transitionTargetEditor) {
      return [] as FacilityMapNode[];
    }

    return transitionTargetEditor.nodes
      .filter((node) => transitionConnectorNodeTypes.has(node.nodeType))
      .filter((node) => {
        if (!search) {
          return true;
        }

        return `${node.code} ${node.label} ${enumLabel(node.nodeType, allNodeTypeOptions)}`
          .toLocaleLowerCase('tr-TR')
          .includes(search);
      });
  }, [mapGraphSearch.transitionToNodeTerm, transitionTargetEditor]);
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

  const activeViewLabel = getViewLabel(activeView);
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
    setConnectionStartNodeId('');
    setMapEditorTool('select');
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
    if (assignableRoles.length === 0) {
      return;
    }

    setUserActionState((current) => ({
      ...current,
      selectedRoleId: assignableRoles.some((role) => role.id === current.selectedRoleId)
        ? current.selectedRoleId
        : assignableRoles[0].id,
    }));
  }, [assignableRoles]);

  useEffect(() => {
    if (!session || !isSuperAdmin) {
      setUserSearchResults([]);
      return;
    }

    const search = userActionState.userSearchTerm.trim();
    if (search.length < 2) {
      setUserSearchResults([]);
      return;
    }

    const activeSession = session;
    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      try {
        const results = await adminApi.searchAdminUsers(activeSession.accessToken, search, 20);
        if (!cancelled) {
          setUserSearchResults(results);
        }
      } catch (searchError) {
        if (!cancelled) {
          setError(getApiErrorMessage(searchError, 'Kullanici aramasi yapilamadi.'));
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [isSuperAdmin, session, userActionState.userSearchTerm]);

  useEffect(() => {
    const referenceValue = selectedNodeReference;
    if (
      !selectedMapNode ||
      !referenceValue ||
      !selectedNodeMapsiteUrl ||
      !selectedMapIsPublished ||
      !nodeTypeGeneratesQr(selectedMapNode.nodeType)
    ) {
      setSelectedNodeQrDataUrl('');
      return;
    }

    let disposed = false;
    const qrOptions = {
      margin: 1,
      width: 220,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    };

    void QRCode.toDataURL(selectedNodeMapsiteUrl, qrOptions)
      .then((qrUrl: string) => {
        if (!disposed) {
          setSelectedNodeQrDataUrl(qrUrl);
        }
      })
      .catch(() => {
        if (!disposed) {
          setSelectedNodeQrDataUrl('');
        }
      });

    return () => {
      disposed = true;
    };
  }, [selectedMapIsPublished, selectedMapNode, selectedNodeMapsiteUrl, selectedNodeReference]);

  useEffect(() => {
    if (!selectedMapIsPublished) {
      setNodeQrDataUrls({});
      return;
    }

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
        const url = await QRCode.toDataURL(buildMapsiteMapUrl(node.externalReferenceId), {
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
  }, [mapEditor, selectedMapIsPublished]);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      setOrganizations([]);
      setOrganizationHierarchy(null);
      setRoles([]);
      setUsersPage(null);
      setUserSearchResults([]);
      setMapEditor(null);
      return;
    }

    const activeSession = session;
    let cancelled = false;

    async function loadDashboard() {
      try {
        setBusy(true);
        setError(null);

        const [currentUser, organizationsResponse] = await Promise.all([
          adminApi.getCurrentUser(activeSession.accessToken),
          adminApi.getOrganizations(activeSession.accessToken),
        ]);
        const currentUserIsSuperAdmin = currentUser.roles.some((role) => role.toLowerCase() === 'superadmin');
        const [rolesResponse, usersResponse] = currentUserIsSuperAdmin
          ? await Promise.all([
              adminApi.getRoles(activeSession.accessToken),
              adminApi.getAdminUsers(activeSession.accessToken),
            ])
          : [[], null] satisfies [RoleDto[], PagedResult<AdminUserListItem> | null];

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
  }, [selectedOrganizationId, session]);

  useEffect(() => {
    if (!visibleSidebarItems.some((item) => item.key === activeView)) {
      setActiveView('organizations');
    }
  }, [activeView, visibleSidebarItems]);

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
      setMapPublishReadiness(null);
      setTransitionTargetEditor(null);
      return;
    }

    const activeSession = session;
    let cancelled = false;

    async function loadMapVersion() {
      try {
        const editor = await adminApi.getMapVersion(activeSession.accessToken, selectedMapVersionId);
        const readiness = await loadMapPublishReadinessOrNull(activeSession, selectedMapVersionId);
        if (!cancelled) {
          setMapEditor(editor);
          setMapPublishReadiness(readiness);
          setConnectionForm((current) => ({
            ...current,
            fromNodeId: current.fromNodeId || editor.nodes[0]?.id || '',
            toNodeId: current.toNodeId || editor.nodes[1]?.id || '',
          }));
          setTransitionForm((current) => ({
            ...current,
            fromNodeId:
              current.fromNodeId && editor.nodes.some((node) => node.id === current.fromNodeId)
                ? current.fromNodeId
                : editor.nodes.find((node) => transitionConnectorNodeTypes.has(node.nodeType))?.id || '',
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

  useEffect(() => {
    if (!session || !transitionForm.toMapVersionId) {
      setTransitionTargetEditor(null);
      return;
    }

    const activeSession = session;
    let cancelled = false;

    async function loadTransitionTargetMap() {
      try {
        const editor = await adminApi.getMapVersion(activeSession.accessToken, transitionForm.toMapVersionId);
        if (!cancelled) {
          setTransitionTargetEditor(editor);
          setTransitionForm((current) => ({
            ...current,
            toNodeId:
              current.toNodeId && editor.nodes.some((node) => node.id === current.toNodeId)
                ? current.toNodeId
                : editor.nodes.find((node) => transitionConnectorNodeTypes.has(node.nodeType))?.id || '',
          }));
        }
      } catch (loadError) {
        if (!cancelled) {
          setTransitionTargetEditor(null);
          setError(getApiErrorMessage(loadError, 'Hedef kat haritası yüklenemedi.'));
        }
      }
    }

    void loadTransitionTargetMap();

    return () => {
      cancelled = true;
    };
  }, [session, transitionForm.toMapVersionId]);

  useEffect(() => {
    if (
      transitionForm.toMapVersionId &&
      !transitionTargetMapVersions.some((version) => version.id === transitionForm.toMapVersionId)
    ) {
      setTransitionTargetEditor(null);
      setTransitionForm((current) => ({
        ...current,
        toMapVersionId: '',
        toNodeId: '',
      }));
    }
  }, [transitionForm.toMapVersionId, transitionTargetMapVersions]);

  async function refreshUsers(activeSession: Session) {
    if (!isSuperAdmin) {
      setUsersPage(null);
      return;
    }

    const nextUsersPage = await adminApi.getAdminUsers(activeSession.accessToken);
    setUsersPage(nextUsersPage);
  }

  async function refreshUserSearchResults(activeSession: Session) {
    const search = userActionState.userSearchTerm.trim();
    if (!isSuperAdmin || search.length < 2) {
      setUserSearchResults([]);
      return;
    }

    const results = await adminApi.searchAdminUsers(activeSession.accessToken, search, 20);
    setUserSearchResults(results);
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
      setMapPublishReadiness(null);
      return null;
    }

    const editor = await adminApi.getMapVersion(activeSession.accessToken, mapVersionId);
    const readiness = await loadMapPublishReadinessOrNull(activeSession, mapVersionId);
    setMapEditor(editor);
    setMapPublishReadiness(readiness);
    return editor;
  }

  async function loadMapPublishReadinessOrNull(activeSession: Session, mapVersionId: string) {
    try {
      return await adminApi.getMapPublishReadiness(activeSession.accessToken, mapVersionId);
    } catch {
      return null;
    }
  }

  async function runAction(action: () => Promise<void>, successMessage: string, errorMessage = 'Islem tamamlanamadi.') {
    try {
      setBusy(true);
      setError(null);
      setSuccess(null);
      await action();
      setSuccess(successMessage);
    } catch (actionError) {
      setError(getApiErrorMessage(actionError, errorMessage));
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

  void handleUpdateFloor;
  void handleDeleteFloor;

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
    }, 'Harita dosyasi yuklendi.', 'Harita dosyasi yuklenemedi. Dosya turunu, boyutunu ve sunucu depolama ayarlarini kontrol edin.');
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
      setConnectionStartNodeId('');
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

  async function handleAddTransition() {
    if (!session || !selectedMapVersionId) {
      return;
    }

    await runAction(async () => {
      await adminApi.addMapTransition(session.accessToken, {
        fromMapVersionId: selectedMapVersionId,
        fromNodeId: transitionForm.fromNodeId,
        toMapVersionId: transitionForm.toMapVersionId,
        toNodeId: transitionForm.toNodeId,
        connectionType: transitionForm.connectionType,
        distanceMeters: Number(transitionForm.distanceMeters),
        isBidirectional: transitionForm.isBidirectional,
        isAccessible: transitionForm.isAccessible,
      });
      await refreshMapVersion(session);
    }, 'Katlar arasi gecis eklendi.', 'Kat gecisi eklenemedi.');
  }

  async function handleDeleteTransition(transitionId: string) {
    if (!session) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteMapTransition(session.accessToken, transitionId);
      await refreshMapVersion(session);
    }, 'Katlar arasi gecis silindi.');
  }

  function startNodeEdit(node: FacilityMapNode) {
    setMapEditorSelection({
      editingNodeId: node.id,
      editingConnectionId: '',
    });
    setMapEditorTool('select');
    setConnectionStartNodeId('');
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
    setMapEditorTool('connection');
    setConnectionStartNodeId(connection.fromNodeId);
    setConnectionForm({
      fromNodeId: connection.fromNodeId,
      toNodeId: connection.toNodeId,
      distanceMeters: connection.distanceMeters,
      isBidirectional: connection.isBidirectional,
      isAccessible: connection.isAccessible,
    });
  }

  function handleMapCanvasClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!mapEditor || !isImageMapAsset(mapEditor)) {
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
      if (mapEditorTool === 'connection') {
        setConnectionStartNodeId('');
      }
      return;
    }

    if (mapEditorTool !== 'node') {
      setMapEditorSelection({
        editingNodeId: '',
        editingConnectionId: '',
      });
      if (mapEditorTool === 'connection') {
        setConnectionStartNodeId('');
      }
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

  async function handleMapNodeClick(node: FacilityMapNode) {
    if (mapEditorTool !== 'connection' || !selectedMapCanEdit) {
      startNodeEdit(node);
      return;
    }

    setMapEditorSelection({
      editingNodeId: '',
      editingConnectionId: '',
    });

    if (!connectionStartNodeId) {
      setConnectionStartNodeId(node.id);
      setConnectionForm((current) => ({
        ...current,
        fromNodeId: node.id,
        toNodeId: '',
      }));
      return;
    }

    if (connectionStartNodeId === node.id) {
      setConnectionStartNodeId('');
      setConnectionForm((current) => ({
        ...current,
        fromNodeId: '',
        toNodeId: '',
      }));
      return;
    }

    setConnectionForm((current) => ({
      ...current,
      fromNodeId: connectionStartNodeId,
      toNodeId: node.id,
    }));

    if (!session || !selectedMapVersionId || busy) {
      return;
    }

    const fromNodeId = connectionStartNodeId;
    const toNodeId = node.id;

    await runAction(async () => {
      await adminApi.addMapConnection(session.accessToken, selectedMapVersionId, {
        fromNodeId,
        toNodeId,
        distanceMeters: Number(connectionForm.distanceMeters),
        isBidirectional: connectionForm.isBidirectional,
        isAccessible: connectionForm.isAccessible,
      });
      setConnectionStartNodeId('');
      await refreshMapVersion(session);
    }, 'Baglanti eklendi.');
  }

  function renderMapCanvas() {
    if (!mapEditor) {
      return null;
    }

    if (!isImageMapAsset(mapEditor)) {
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
        <div className="admin-map-toolbar flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {([
              { key: 'select' as const, label: 'Sec', icon: MousePointer2 },
              { key: 'node' as const, label: 'Nokta', icon: Plus },
              { key: 'connection' as const, label: 'Baglanti', icon: Waypoints },
            ]).map((tool) => {
              const Icon = tool.icon;
              const active = mapEditorTool === tool.key;
              const disabled = tool.key !== 'select' && !selectedMapCanEdit;
              return (
                <button
                  key={tool.key}
                  className={`admin-map-tool inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold ${
                    active ? 'admin-map-tool-active' : ''
                  }`}
                  disabled={disabled}
                  onClick={() => {
                    setMapEditorTool(tool.key);
                    setMapEditorSelection({ editingNodeId: '', editingConnectionId: '' });
                    if (tool.key !== 'connection') {
                      setConnectionStartNodeId('');
                    }
                  }}
                  type="button"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tool.label}
                </button>
              );
            })}
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#8f96a3]">
            {mapEditorTool === 'connection'
              ? connectionStartNode
                ? `${connectionStartNode.code} secildi, hedef dugume tikla`
                : 'Baslangic dugumune tikla'
              : mapEditorTool === 'node'
                ? 'Bos alana tikla, koordinat sec'
                : 'Dugume tikla, duzenle'}
          </div>
        </div>
        <div
          ref={mapCanvasRef}
          className={`relative bg-[#090b0d] ${
            mapEditorTool === 'node'
              ? 'cursor-crosshair'
              : mapEditorTool === 'connection'
                ? 'cursor-copy'
                : 'cursor-default'
          }`}
          onClick={handleMapCanvasClick}
          style={{ aspectRatio: `${mapEditor.width} / ${mapEditor.height}` }}
        >
          <img
            alt={mapEditor.name}
            className="h-full w-full object-contain"
            src={mapAssetUrl(mapEditor.assetPath)}
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
              const connectionStart = connectionStartNodeId === node.id;
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
                          selected || connectionStart
                            ? 'border-[#1836B9] bg-[#1836B9] text-[#F5F3EF]'
                            : 'border-[rgba(245,243,239,0.12)] bg-[#0f1216] text-[#F5F3EF]'
                        } ${showQrPreview ? 'rounded-[8px]' : 'rounded-full'}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleMapNodeClick(node);
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
    if (!cameraZoneMapEditor || !isImageMapAsset(cameraZoneMapEditor)) {
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

    if (!isImageMapAsset(cameraZoneMapEditor)) {
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
            src={mapAssetUrl(cameraZoneMapEditor.assetPath)}
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

    if (mapPublishReadiness && !mapPublishReadiness.canPublish) {
      setError('Harita yayina hazir degil. Once hazirlik kontrolundeki hatalari tamamlayin.');
      setSuccess(null);
      return;
    }

    await runAction(async () => {
      await adminApi.publishMapVersion(session.accessToken, selectedMapVersionId);
      await refreshHierarchy(session);
      await refreshMapVersion(session);
    }, `Harita surumu yayina alindi. Mapsite: ${buildMapsiteFloorUrl(mapEditor?.floorId)}`);
  }

  async function copyMapsiteLink(value: string, type: string) {
    if (!value || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopiedNodeLinkType(type);
    window.setTimeout(() => {
      setCopiedNodeLinkType((current) => (current === type ? '' : current));
    }, 1800);
  }

  function renderMapPublishReadiness() {
    if (!mapEditor) {
      return null;
    }

    if (!mapPublishReadiness) {
      return (
        <div className="admin-panel-subtle mt-6 border-dashed p-5 text-sm text-[#8f96a3]">
          Yayin hazirlik kontrolu yukleniyor.
        </div>
      );
    }

    return (
      <div className="mt-6 admin-panel-subtle p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="admin-kicker">Yayin hazirligi</p>
            <p className="mt-2 text-sm text-[#d7d2ca]">
              {mapPublishReadiness.canPublish
                ? 'Bu surum mobil ve mapsite yayini icin temel kontrollerden gecti.'
                : 'Yayina almadan once asagidaki hatalari tamamlayin.'}
            </p>
          </div>
          <span
            className={`admin-pill px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${
              mapPublishReadiness.canPublish ? 'text-emerald-200' : 'text-rose-200'
            }`}
          >
            {mapPublishReadiness.canPublish ? 'Hazir' : 'Eksik'}
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          {mapPublishReadiness.checks.map((checkItem) => {
            const passed = checkItem.status === 'pass';
            return (
              <div
                key={checkItem.code}
                className={`border px-4 py-3 ${
                  passed
                    ? 'border-emerald-500/20 bg-emerald-950/10'
                    : 'border-rose-500/25 bg-rose-950/15'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      passed
                        ? 'border-emerald-400/40 text-emerald-200'
                        : 'border-rose-400/40 text-rose-200'
                    }`}
                  >
                    {passed ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#F5F3EF]">{checkItem.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[#8f96a3]">{checkItem.message}</p>
                    {checkItem.details.length > 0 ? (
                      <ul className="mt-3 space-y-1 text-xs leading-5 text-[#d7d2ca]">
                        {checkItem.details.slice(0, 6).map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                        {checkItem.details.length > 6 ? (
                          <li>{checkItem.details.length - 6} kayit daha var.</li>
                        ) : null}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
      await refreshUserSearchResults(session);
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
      await refreshUserSearchResults(session);
    }, 'Rol kaldirildi.');
  }

  async function handleAssignOrganizationAdmin() {
    if (
      !session ||
      !userActionState.selectedUserId ||
      !userActionState.selectedOrganizationAdminOrganizationId
    ) {
      return;
    }

    const organizationName = selectedOrganizationAdminOrganization?.name ?? 'secilen sirket';

    await runAction(async () => {
      await adminApi.assignOrganizationAdmin(
        session.accessToken,
        userActionState.selectedOrganizationAdminOrganizationId,
        userActionState.selectedUserId,
      );
      await Promise.all([
        refreshUsers(session),
        refreshUserSearchResults(session),
      ]);
    }, `${selectedRoleUser?.email ?? 'Kullanici'} ${organizationName} icin sirket admini yapildi.`);
  }

  function renderOrganizations() {
    return (
      <OrganizationManagement
        organizations={organizations}
        selectedOrganizationId={selectedOrganizationId}
        organizationHierarchy={organizationHierarchy}
        organizationForm={organizationForm}
        isSuperAdmin={isSuperAdmin}
        busy={busy}
        sitesCount={sites.length}
        buildingsCount={buildings.length}
        camerasCount={cameras.length}
        onSelectOrganization={setSelectedOrganizationId}
        onOrganizationFormChange={setOrganizationForm}
        onCreateOrganization={handleCreateOrganization}
        onUpdateOrganization={(organization) => {
          void handleUpdateOrganization(organization);
        }}
        onDeleteOrganization={(organizationId) => {
          void handleDeleteOrganization(organizationId);
        }}
      />
    );
  }

  function renderOverview() {
    return (
      <DashboardOverview
        organizationName={organizationHierarchy?.name}
        organizationDescription={organizationHierarchy?.description}
        profileName={profile?.fullName}
        profileEmail={profile?.email}
        onChangeView={setActiveView}
      />
    );
  }

  function renderFacilities() {
    return (
      <FacilitiesManagement
        facilityTab={facilityTab}
        organizations={organizations}
        selectedOrganizationId={selectedOrganizationId}
        siteForm={siteForm}
        buildingForm={buildingForm}
        floorForm={floorForm}
        sites={sites}
        buildings={buildings}
        busy={busy}
        onChangeFacilityTab={setFacilityTab}
        onSelectOrganization={setSelectedOrganizationId}
        onSiteFormChange={setSiteForm}
        onBuildingFormChange={setBuildingForm}
        onFloorFormChange={setFloorForm}
        onCreateSite={handleCreateSite}
        onCreateBuilding={handleCreateBuilding}
        onCreateFloor={handleCreateFloor}
        onUpdateSite={(site) => {
          void handleUpdateSite(site);
        }}
        onDeleteSite={(siteId) => {
          void handleDeleteSite(siteId);
        }}
        onUpdateBuilding={(building) => {
          void handleUpdateBuilding(building);
        }}
        onDeleteBuilding={(buildingId) => {
          void handleDeleteBuilding(buildingId);
        }}
      />
    );
  }

  function renderParking() {
    return (
      <ParkingManagement
        parkingTab={parkingTab}
        parkingFacilityForm={parkingFacilityForm}
        parkingZoneForm={parkingZoneForm}
        parkingFacilities={parkingFacilities}
        sites={sites}
        buildings={buildings}
        floors={floors}
        busy={busy}
        onChangeParkingTab={setParkingTab}
        onParkingFacilityFormChange={setParkingFacilityForm}
        onParkingZoneFormChange={setParkingZoneForm}
        onCreateParkingFacility={handleCreateParkingFacility}
        onCreateParkingZone={handleCreateParkingZone}
        onUpdateParkingFacility={(facility) => {
          void handleUpdateParkingFacility(facility);
        }}
        onDeleteParkingFacility={(facilityId) => {
          void handleDeleteParkingFacility(facilityId);
        }}
        onUpdateParkingZone={(zone) => {
          void handleUpdateParkingZone(zone);
        }}
        onDeleteParkingZone={(zoneId) => {
          void handleDeleteParkingZone(zoneId);
        }}
      />
    );
  }

  function renderMaps() {
    const mapTransitions = mapEditor?.transitions ?? [];

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
                <div className="flex flex-wrap justify-end gap-2">
                  <a
                    className="admin-action inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold"
                    href={selectedMapsiteFloorUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Mapsite
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <button
                    className="admin-action inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold"
                    onClick={() => void copyMapsiteLink(selectedMapsiteEmbedUrl, 'embed')}
                    type="button"
                  >
                    {copiedNodeLinkType === 'embed' ? 'Embed kopyalandi' : 'Embed link'}
                  </button>
                  <button
                    className="admin-action admin-action-accent inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
                    disabled={busy}
                    onClick={handlePublishMapVersion}
                    type="button"
                  >
                    Yayinla
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
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

            {renderMapPublishReadiness()}

            {mapEditor ? (
              <div className="admin-panel-subtle mt-6 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="admin-kicker">Mapsite linkleri</p>
                    <p className="mt-2 text-sm leading-6 text-[#8f96a3]">
                      Yayindaki kat haritasini web sitesi veya embed yuzeyinde acmak icin kullan.
                    </p>
                  </div>
                  <span className="admin-pill px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
                    {statusLabel(mapEditor.status)}
                  </span>
                </div>
                <div className="mt-4 grid gap-3">
                  <div className="border border-[rgba(245,243,239,0.08)] bg-[#0d1013] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f96a3]">Kat linki</p>
                    <p className="mt-2 break-all font-mono text-xs leading-5 text-[#d7d2ca]">{selectedMapsiteFloorUrl}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a className={actionButtonClassName('neutral')} href={selectedMapsiteFloorUrl} rel="noreferrer" target="_blank">Ac</a>
                      <button className={actionButtonClassName('neutral')} onClick={() => void copyMapsiteLink(selectedMapsiteFloorUrl, 'floor')} type="button">
                        {copiedNodeLinkType === 'floor' ? 'Kopyalandi' : 'Kopyala'}
                      </button>
                    </div>
                  </div>
                  <div className="border border-[rgba(245,243,239,0.08)] bg-[#0d1013] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f96a3]">Embed linki</p>
                    <p className="mt-2 break-all font-mono text-xs leading-5 text-[#d7d2ca]">{selectedMapsiteEmbedUrl}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a className={actionButtonClassName('neutral')} href={selectedMapsiteEmbedUrl} rel="noreferrer" target="_blank">Ac</a>
                      <button className={actionButtonClassName('neutral')} onClick={() => void copyMapsiteLink(selectedMapsiteEmbedUrl, 'embed-panel')} type="button">
                        {copiedNodeLinkType === 'embed-panel' ? 'Kopyalandi' : 'Kopyala'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {mapEditor ? renderMapCanvas() : null}

          <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
            <div className={sectionCardClassName()}>
              <p className="admin-kicker">Dugum ekle</p>
              {mapEditor && !selectedMapCanEdit ? (
                <div className="admin-panel-subtle mt-4 p-4 text-sm leading-6 text-[#d7d2ca]">
                  <p className="font-semibold text-[#F5F3EF]">
                    Bu surum {statusLabel(mapEditor.status).toLowerCase()} oldugu icin kilitli.
                  </p>
                  <p className="mt-1 text-[#8f96a3]">
                    Duzenlemek icin taslak kopya olustur; yeni kopya otomatik secilir.
                  </p>
                  <button
                    className="admin-action admin-action-accent mt-3 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold"
                    onClick={() => void handleDuplicateMapVersion(mapEditor.id, mapEditor.name)}
                    type="button"
                  >
                    Taslak kopya olustur
                  </button>
                </div>
              ) : null}
              <div className="mt-6 grid gap-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {nodeTypeOptions.map((option) => {
                    const active = nodeForm.nodeType === option.value;
                    return (
                      <button
                        key={option.value}
                        className={`admin-map-tool px-3 py-2 text-left text-xs font-semibold ${
                          active ? 'admin-map-tool-active' : ''
                        }`}
                        onClick={() => {
                          setNodeForm((current) => ({ ...current, nodeType: option.value }));
                          setMapEditorTool('node');
                        }}
                        type="button"
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
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
                    : 'Bu nokta kaydedildiginde QR kodu sistem tarafinda otomatik olusturulur.'}
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
                  disabled={busy || !selectedMapVersionId || !selectedMapCanEdit || !nodeForm.label.trim()}
                  onClick={mapEditorSelection.editingNodeId ? handleUpdateNode : handleAddNode}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  {mapEditorSelection.editingNodeId ? 'Dugumu guncelle' : 'Dugum ekle'}
                </button>
                {selectedMapNode && nodeTypeGeneratesQr(selectedMapNode.nodeType) ? (
                  <div className="admin-panel-subtle p-4">
                    <p className="admin-kicker">
                      QR ve linkler
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#F5F3EF]">
                      {selectedMapNode.code} - {selectedMapNode.label}
                    </p>

                      {!selectedMapIsPublished ? (
                        <div className="mt-4 border border-dashed border-[rgba(245,243,239,0.12)] bg-[#0d1013] p-4 text-sm leading-6 text-[#8f96a3]">
                          Bu QR canli mapsite linkidir. Taslak surumlerde kullanima acilmaz; haritayi yayina aldiktan sonra QR ve link burada gorunur.
                        </div>
                      ) : selectedNodeQrDataUrl ? (
                        <div className="mt-4 border border-[rgba(245,243,239,0.08)] bg-[#0d1013] p-4">
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                            <img
                              alt={`${selectedMapNode.code} QR`}
                              className="h-32 w-32 shrink-0 rounded-[8px] border border-[rgba(245,243,239,0.08)] bg-white p-3"
                              src={selectedNodeQrDataUrl}
                            />
                            <div className="min-w-0 flex-1 space-y-3 text-xs leading-5 text-[#8f96a3]">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f96a3]">
                                  Tek QR linki
                                </p>
                                <p className="mt-2 break-all font-mono text-xs leading-5 text-[#d7d2ca]">
                                  {selectedNodeMapsiteUrl}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <a
                                  className="admin-action inline-flex items-center justify-center px-3 py-2 font-semibold transition"
                                  href={selectedNodeMapsiteUrl}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  Mapsite'de ac
                                </a>
                                <a
                                  className="admin-action inline-flex items-center justify-center px-3 py-2 font-semibold transition"
                                  download={`${selectedMapNode.code.toLowerCase()}-qr.png`}
                                  href={selectedNodeQrDataUrl}
                                >
                                  QR indir
                                </a>
                                <button
                                  className="admin-action inline-flex items-center justify-center px-3 py-2 font-semibold transition"
                                  onClick={() => void copyMapsiteLink(selectedNodeMapsiteUrl, 'node-mapsite')}
                                  type="button"
                                >
                                  {copiedNodeLinkType === 'node-mapsite' ? 'Kopyalandi' : 'Link kopyala'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div className={sectionCardClassName()}>
              <p className="admin-kicker">Baglanti ekle</p>
              {connectionStartNode ? (
                <div className="admin-panel-subtle mt-4 p-3 text-xs leading-5 text-[#d7d2ca]">
                  Canvas secimi: {connectionStartNode.code} - {connectionStartNode.label}
                </div>
              ) : null}
              <div className="mt-6 grid gap-4">
                <FieldShell label="Baslangic dugumu">
                  <input
                    className={`${inputClassName()} mb-3`}
                    placeholder="Kod veya etiket ara"
                    value={mapGraphSearch.fromNodeTerm}
                    onChange={(event) =>
                      setMapGraphSearch((current) => ({ ...current, fromNodeTerm: event.target.value }))
                    }
                  />
                  <select
                    className={selectClassName()}
                    value={connectionForm.fromNodeId}
                    onChange={(event) =>
                      setConnectionForm((current) => ({ ...current, fromNodeId: event.target.value }))
                    }
                  >
                    <option value="">Dugum sec</option>
                    {filteredFromNodes.map((node: FacilityMapNode) => (
                      <option key={node.id} value={node.id}>
                        {node.code} - {node.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                <FieldShell label="Hedef dugumu">
                  <input
                    className={`${inputClassName()} mb-3`}
                    placeholder="Kod veya etiket ara"
                    value={mapGraphSearch.toNodeTerm}
                    onChange={(event) =>
                      setMapGraphSearch((current) => ({ ...current, toNodeTerm: event.target.value }))
                    }
                  />
                  <select
                    className={selectClassName()}
                    value={connectionForm.toNodeId}
                    onChange={(event) =>
                      setConnectionForm((current) => ({ ...current, toNodeId: event.target.value }))
                    }
                  >
                    <option value="">Dugum sec</option>
                    {filteredToNodes.map((node: FacilityMapNode) => (
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
                    !selectedMapCanEdit ||
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

            <div className={sectionCardClassName()}>
              <p className="admin-kicker">Kat geçişi ekle</p>
              <div className="admin-panel-subtle mt-4 p-3 text-xs leading-5 text-[#8f96a3]">
                Asansör, merdiven, giriş ve çıkış gibi geçiş düğümlerini aynı binadaki başka kat haritasına bağlar.
              </div>
              <div className="mt-6 grid gap-4">
                <FieldShell label="Bu kattaki geçiş düğümü">
                  <input
                    className={`${inputClassName()} mb-3`}
                    placeholder="Kod, etiket veya tip ara"
                    value={mapGraphSearch.transitionFromNodeTerm}
                    onChange={(event) =>
                      setMapGraphSearch((current) => ({
                        ...current,
                        transitionFromNodeTerm: event.target.value,
                      }))
                    }
                  />
                  <select
                    className={selectClassName()}
                    value={transitionForm.fromNodeId}
                    onChange={(event) =>
                      setTransitionForm((current) => ({ ...current, fromNodeId: event.target.value }))
                    }
                  >
                    <option value="">Düğüm seç</option>
                    {transitionSourceNodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.code} - {node.label} / {enumLabel(node.nodeType, allNodeTypeOptions)}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                <FieldShell label="Hedef kat haritası">
                  <input
                    className={`${inputClassName()} mb-3`}
                    placeholder="Kat veya harita adı ara"
                    value={mapGraphSearch.transitionMapTerm}
                    onChange={(event) =>
                      setMapGraphSearch((current) => ({
                        ...current,
                        transitionMapTerm: event.target.value,
                      }))
                    }
                  />
                  <select
                    className={selectClassName()}
                    value={transitionForm.toMapVersionId}
                    onChange={(event) =>
                      setTransitionForm((current) => ({
                        ...current,
                        toMapVersionId: event.target.value,
                        toNodeId: '',
                      }))
                    }
                  >
                    <option value="">Hedef harita seç</option>
                    {transitionTargetMapVersions.map((version) => (
                      <option key={version.id} value={version.id}>
                        {version.floorName} - {version.name} / {statusLabel(version.status)}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                <FieldShell label="Hedef kattaki düğüm">
                  <input
                    className={`${inputClassName()} mb-3`}
                    placeholder="Kod, etiket veya tip ara"
                    value={mapGraphSearch.transitionToNodeTerm}
                    onChange={(event) =>
                      setMapGraphSearch((current) => ({
                        ...current,
                        transitionToNodeTerm: event.target.value,
                      }))
                    }
                  />
                  <select
                    className={selectClassName()}
                    disabled={!transitionTargetEditor}
                    value={transitionForm.toNodeId}
                    onChange={(event) =>
                      setTransitionForm((current) => ({ ...current, toNodeId: event.target.value }))
                    }
                  >
                    <option value="">Hedef düğüm seç</option>
                    {transitionTargetNodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.code} - {node.label} / {enumLabel(node.nodeType, allNodeTypeOptions)}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                <FieldShell label="Geçiş tipi">
                  <select
                    className={selectClassName()}
                    value={transitionForm.connectionType}
                    onChange={(event) =>
                      setTransitionForm((current) => ({
                        ...current,
                        connectionType: Number(event.target.value),
                      }))
                    }
                  >
                    {transitionTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                <FieldShell label="Mesafe metre">
                  <input
                    className={inputClassName()}
                    min="0.1"
                    step="0.1"
                    type="number"
                    value={transitionForm.distanceMeters}
                    onChange={(event) =>
                      setTransitionForm((current) => ({
                        ...current,
                        distanceMeters: Number(event.target.value),
                      }))
                    }
                  />
                </FieldShell>
                <label className="admin-panel-subtle flex items-center gap-3 px-4 py-3 text-sm text-[#d7d2ca]">
                  <input
                    checked={transitionForm.isBidirectional}
                    onChange={(event) =>
                      setTransitionForm((current) => ({
                        ...current,
                        isBidirectional: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  Çift yönlü
                </label>
                <label className="admin-panel-subtle flex items-center gap-3 px-4 py-3 text-sm text-[#d7d2ca]">
                  <input
                    checked={transitionForm.isAccessible}
                    onChange={(event) =>
                      setTransitionForm((current) => ({
                        ...current,
                        isAccessible: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  Erişilebilir geçiş
                </label>
                <button
                  className="admin-action admin-action-accent inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
                  disabled={
                    busy ||
                    !selectedMapVersionId ||
                    !selectedMapCanEdit ||
                    !transitionForm.fromNodeId ||
                    !transitionForm.toMapVersionId ||
                    !transitionForm.toNodeId
                  }
                  onClick={handleAddTransition}
                  type="button"
                >
                  <Waypoints className="h-4 w-4" />
                  Kat geçişi ekle
                </button>
              </div>
            </div>
          </div>

          {mapEditor ? (
            <div className={sectionCardClassName()}>
              <p className="admin-kicker">Mevcut grafik</p>
              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#F5F3EF]">Dugumler</p>
                    <div className="w-full max-w-xs">
                      <input
                        className={inputClassName()}
                        placeholder="Kod, etiket veya tip ara"
                        value={mapGraphSearch.nodeListTerm}
                        onChange={(event) =>
                          setMapGraphSearch((current) => ({ ...current, nodeListTerm: event.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {filteredMapNodes.map((node: FacilityMapNode) => (
                      <div key={node.id} className="admin-panel-subtle p-4">
                        <p className="text-sm font-semibold text-[#F5F3EF]">
                          {node.code} - {node.label}
                        </p>
                        <p className="mt-1 text-xs text-[#8f96a3]">
                          {enumLabel(node.nodeType, allNodeTypeOptions)} - ({node.pixelX}, {node.pixelY})
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button className={actionButtonClassName('neutral')} onClick={() => startNodeEdit(node)} type="button">Duzenle</button>
                          <button className={actionButtonClassName('danger')} disabled={!selectedMapCanEdit} onClick={() => void handleDeleteNode(node.id)} type="button">Sil</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#F5F3EF]">Baglantilar</p>
                    <div className="w-full max-w-xs">
                      <input
                        className={inputClassName()}
                        placeholder="Baslangic veya hedef ara"
                        value={mapGraphSearch.connectionListTerm}
                        onChange={(event) =>
                          setMapGraphSearch((current) => ({ ...current, connectionListTerm: event.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {filteredMapConnections.map((connection: FacilityMapConnection) => {
                      const fromNode = mapEditor.nodes.find((node) => node.id === connection.fromNodeId);
                      const toNode = mapEditor.nodes.find((node) => node.id === connection.toNodeId);
                      return (
                      <div
                        key={connection.id}
                        className="admin-panel-subtle p-4"
                      >
                        <p className="text-sm font-semibold text-[#F5F3EF]">
                          {fromNode ? `${fromNode.code} - ${fromNode.label}` : connection.fromNodeId.slice(0, 8)}
                          {' -> '}
                          {toNode ? `${toNode.code} - ${toNode.label}` : connection.toNodeId.slice(0, 8)}
                        </p>
                        <p className="mt-1 text-xs text-[#8f96a3]">
                          {connection.distanceMeters}m -{' '}
                          {connection.isBidirectional ? 'Cift yonlu' : 'Tek yonlu'}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button className={actionButtonClassName('neutral')} onClick={() => startConnectionEdit(connection)} type="button">Duzenle</button>
                          <button className={actionButtonClassName('danger')} disabled={!selectedMapCanEdit} onClick={() => void handleDeleteConnection(connection.id)} type="button">Sil</button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-8 border-t border-[rgba(245,243,239,0.08)] pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#F5F3EF]">Kat geçişleri</p>
                    <p className="mt-1 text-xs leading-5 text-[#8f96a3]">
                      Bu haritadan veya bu haritaya tanımlanan asansör, merdiven ve giriş bağlantıları.
                    </p>
                  </div>
                  <span className="admin-pill px-3 py-1.5 text-xs font-semibold">
                    {mapTransitions.length} kayıt
                  </span>
                </div>
                <div className="mt-4 grid gap-3 xl:grid-cols-2">
                  {mapTransitions.length === 0 ? (
                    <div className="admin-panel-subtle border-dashed p-4 text-sm text-[#8f96a3]">
                      Henüz kat geçişi yok.
                    </div>
                  ) : null}
                  {mapTransitions.map((transition: FacilityMapTransition) => {
                    const fromMap = mapVersionById.get(transition.fromMapVersionId);
                    const toMap = mapVersionById.get(transition.toMapVersionId);
                    const fromNode =
                      transition.fromMapVersionId === mapEditor.id
                        ? mapEditor.nodes.find((node) => node.id === transition.fromNodeId)
                        : null;
                    const toNode =
                      transition.toMapVersionId === mapEditor.id
                        ? mapEditor.nodes.find((node) => node.id === transition.toNodeId)
                        : null;
                    return (
                      <div key={transition.id} className="admin-panel-subtle p-4">
                        <p className="text-sm font-semibold text-[#F5F3EF]">
                          {fromNode ? `${fromNode.code} - ${fromNode.label}` : fromMap?.floorName ?? 'Kaynak kat'}
                          {' -> '}
                          {toNode ? `${toNode.code} - ${toNode.label}` : toMap?.floorName ?? 'Hedef kat'}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#8f96a3]">
                          {fromMap ? `${fromMap.floorName} / ${fromMap.name}` : transition.fromMapVersionId.slice(0, 8)}
                          {' -> '}
                          {toMap ? `${toMap.floorName} / ${toMap.name}` : transition.toMapVersionId.slice(0, 8)}
                        </p>
                        <p className="mt-1 text-xs text-[#8f96a3]">
                          {enumLabel(transition.connectionType, transitionTypeOptions)} - {transition.distanceMeters}m -{' '}
                          {transition.isBidirectional ? 'Çift yönlü' : 'Tek yönlü'}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            className={actionButtonClassName('danger')}
                            disabled={!selectedMapCanEdit}
                            onClick={() => void handleDeleteTransition(transition.id)}
                            type="button"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                  {user.roles.filter((role) => role.toLowerCase() !== 'admin').map((role) => (
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
          <p className="admin-kicker">Yetki atama</p>
          <h3 className="admin-heading mt-2 text-2xl font-semibold">Kullanici ara ve sirket yetkisi ver</h3>
          <p className="mt-2 text-sm leading-6 text-[#8f96a3]">
            Bu ekran yalnizca SuperAdmin tarafindan kullanilir. Once kullaniciyi, sonra sirketi sec; atama sonrasi kullanici sadece o sirketin panel verilerini gorur.
          </p>

          <div className="mt-6 grid gap-4">
            <FieldShell label="Kullanici ara">
              <input
                className={inputClassName()}
                placeholder="E-posta, kullanici adi, ad veya soyad"
                value={userActionState.userSearchTerm}
                onChange={(event) =>
                  setUserActionState((current) => ({
                    ...current,
                    userSearchTerm: event.target.value,
                    selectedUserId: '',
                  }))
                }
              />
            </FieldShell>

            <div className="grid gap-2">
              {userActionState.userSearchTerm.trim().length < 2 ? (
                <div className="admin-panel-subtle border-dashed p-4 text-sm text-[#8f96a3]">
                  Arama icin en az 2 karakter yaz.
                </div>
              ) : userSearchResults.length === 0 ? (
                <div className="admin-panel-subtle border-dashed p-4 text-sm text-[#8f96a3]">
                  Eslesen kullanici bulunamadi.
                </div>
              ) : (
                userSearchResults.map((user) => {
                  const selected = user.id === userActionState.selectedUserId;
                  const visibleRoles = user.roles.filter((role) => role.toLowerCase() !== 'admin');
                  return (
                    <button
                      key={user.id}
                      className={`admin-action flex items-center justify-between gap-4 px-4 py-3 text-left transition ${
                        selected ? 'admin-action-accent' : ''
                      }`}
                      onClick={() =>
                        setUserActionState((current) => ({
                          ...current,
                          selectedUserId: user.id,
                        }))
                      }
                      type="button"
                    >
                      <span>
                        <span className="block text-sm font-semibold">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="mt-1 block text-xs text-[#8f96a3]">{user.email}</span>
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {visibleRoles.length === 0 ? (
                            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[#8f96a3]">
                              Rol yok
                            </span>
                          ) : (
                            visibleRoles.map((role) => (
                              <span
                                key={`${user.id}-${role}`}
                                className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[#d7d2ca]"
                              >
                                {role}
                              </span>
                            ))
                          )}
                        </span>
                      </span>
                      <span className="text-xs uppercase tracking-[0.16em] text-[#8f96a3]">
                        {selected ? 'Secildi' : 'Sec'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {selectedRoleUser ? (
              <div className="admin-panel-subtle p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f96a3]">Secili kullanici</p>
                <p className="mt-2 text-sm font-semibold text-[#f5f3ef]">
                  {selectedRoleUser.firstName} {selectedRoleUser.lastName}
                </p>
                <p className="mt-1 text-xs text-[#8f96a3]">{selectedRoleUser.email}</p>
              </div>
            ) : null}

            <div className="admin-panel-subtle border-dashed p-4">
              <p className="admin-kicker">Sirket admini atama</p>
              <div className="mt-4 grid gap-4">
                <FieldShell label="Sirket ara">
                  <input
                    className={inputClassName()}
                    placeholder="Organizasyon veya aciklama ara"
                    value={userActionState.organizationSearchTerm}
                    onChange={(event) =>
                      setUserActionState((current) => ({
                        ...current,
                        organizationSearchTerm: event.target.value,
                        selectedOrganizationAdminOrganizationId: '',
                      }))
                    }
                  />
                </FieldShell>

                <div className="grid gap-2">
                  {userActionState.organizationSearchTerm.trim().length < 2 ? (
                    <div className="admin-panel-subtle border-dashed p-4 text-sm text-[#8f96a3]">
                      Sirket aramak icin en az 2 karakter yaz.
                    </div>
                  ) : organizationSearchResults.length === 0 ? (
                    <div className="admin-panel-subtle border-dashed p-4 text-sm text-[#8f96a3]">
                      Eslesen sirket bulunamadi.
                    </div>
                  ) : (
                    organizationSearchResults.map((organization) => {
                      const selected = organization.id === userActionState.selectedOrganizationAdminOrganizationId;
                      return (
                        <button
                          key={organization.id}
                          className={`admin-action flex items-center justify-between gap-4 px-4 py-3 text-left transition ${
                            selected ? 'admin-action-accent' : ''
                          }`}
                          onClick={() =>
                            setUserActionState((current) => ({
                              ...current,
                              selectedOrganizationAdminOrganizationId: organization.id,
                            }))
                          }
                          type="button"
                        >
                          <span>
                            <span className="block text-sm font-semibold">{organization.name}</span>
                            <span className="mt-1 block text-xs text-[#8f96a3]">
                              {organization.description || 'Aciklama yok'}
                            </span>
                          </span>
                          <span className="text-xs uppercase tracking-[0.16em] text-[#8f96a3]">
                            {selected ? 'Secildi' : 'Sec'}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {selectedOrganizationAdminOrganization ? (
                  <div className="admin-panel-subtle p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f96a3]">Secili sirket</p>
                    <p className="mt-2 text-sm font-semibold text-[#f5f3ef]">
                      {selectedOrganizationAdminOrganization.name}
                    </p>
                    <p className="mt-1 text-xs text-[#8f96a3]">
                      {selectedOrganizationAdminOrganization.description || 'Aciklama yok'}
                    </p>
                  </div>
                ) : null}

                <button
                  className="admin-action admin-action-accent inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
                  disabled={
                    busy ||
                    !userActionState.selectedUserId ||
                    !userActionState.selectedOrganizationAdminOrganizationId
                  }
                  onClick={handleAssignOrganizationAdmin}
                  type="button"
                >
                  Secili kullaniciyi bu sirketin admini yap
                </button>
              </div>
            </div>

            <FieldShell label="Rol">
              <select
                className={selectClassName()}
                value={userActionState.selectedRoleId}
                onChange={(event) =>
                  setUserActionState((current) => ({ ...current, selectedRoleId: event.target.value }))
                }
              >
                <option value="">Rol sec</option>
                {assignableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </FieldShell>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className="admin-action admin-action-accent inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
                disabled={busy || !userActionState.selectedUserId || !userActionState.selectedRoleId}
                onClick={handleAssignRole}
                type="button"
              >
                Rol ata
              </button>
              <button
                className="admin-action inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
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

  return (
    <AdminShell
      sidebar={
        <AdminSidebar
          activeView={activeView}
          visibleSidebarItems={visibleSidebarItems}
          profileName={profile?.fullName}
          profileEmail={profile?.email}
          onChangeView={setActiveView}
          onLogout={handleLogout}
        />
      }
      topbar={
        <AdminTopbar
          tabs={topNavTabs(activeView, activeViewLabel)}
          onChangeView={setActiveView}
        />
      }
    >
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

      {activeView === 'overview' ? renderOverview() : null}
      {activeView === 'organizations' ? renderOrganizations() : null}
      {activeView === 'facilities' ? renderFacilities() : null}
      {activeView === 'parking' ? renderParking() : null}
      {activeView === 'maps' ? renderMaps() : null}
      {activeView === 'cameras' ? renderCameras() : null}
      {isSuperAdmin && activeView === 'users' ? renderUsers() : null}
      {isSuperAdmin && activeView === 'security' ? renderSecurity() : null}
    </AdminShell>
  );
}

