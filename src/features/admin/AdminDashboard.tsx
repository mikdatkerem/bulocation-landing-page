import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
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
import CameraManagement from './cameras/CameraManagement';
import UserManagement from './users/UserManagement';
import SecurityOverview from './security/SecurityOverview';
import MapUploadPanel from './maps/MapUploadPanel';
import MapVersionPanel from './maps/MapVersionPanel';
import MapPublishPanel from './maps/MapPublishPanel';
import MapPublishReadinessPanel from './maps/MapPublishReadinessPanel';
import MapCanvas from './maps/editor/MapCanvas';
import MapEditorSidebar from './maps/editor/MapEditorSidebar';
import {
  ADMIN_SESSION_STORAGE_KEY,
  allNodeTypeOptions,
  CAMERA_ZONE_GRID_SIZE,
  sidebarItems,
  transitionConnectorNodeTypes,
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
  buildMapsiteFloorUrl,
  buildMapsiteMapUrl,
  enumLabel,
  flattenBuildings,
  flattenCameras,
  flattenFloors,
  flattenMapVersions,
  flattenParkingFacilities,
  flattenSites,
  getViewLabel,
  isDraftMapStatus,
  isImageMapAsset,
  isPublishedMapStatus,
  mapAssetUrl,
  nodeTypeGeneratesQr,
  parsePolygonJson,
  resolveContainedImageRect,
  snapToGrid,
  stringifyPolygon,
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
    return (
      <MapCanvas
        mapEditor={mapEditor}
        selectedMapCanEdit={selectedMapCanEdit}
        mapEditorTool={mapEditorTool}
        mapEditorSelection={mapEditorSelection}
        connectionStartNodeId={connectionStartNodeId}
        connectionStartNode={connectionStartNode}
        nodeQrDataUrls={nodeQrDataUrls}
        hiddenNodeIds={hiddenNodeIds}
        mapCanvasImageRect={mapCanvasImageRect}
        mapCanvasRef={mapCanvasRef}
        onCanvasClick={handleMapCanvasClick}
        onToolSelect={(tool) => {
          setMapEditorTool(tool);
          setMapEditorSelection({ editingNodeId: '', editingConnectionId: '' });
          if (tool !== 'connection') {
            setConnectionStartNodeId('');
          }
        }}
        onNodeClick={(node) => {
          void handleMapNodeClick(node);
        }}
        onToggleNodeVisibility={toggleNodeVisibility}
      />
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
    return <MapPublishReadinessPanel mapPublishReadiness={mapPublishReadiness} />;
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
          <MapUploadPanel
            busy={busy}
            uploadedAsset={uploadedAsset}
            organizations={organizations}
            selectedOrganizationId={selectedOrganizationId}
            selectedMapSiteId={selectedMapSiteId}
            selectedMapBuildingId={selectedMapBuildingId}
            mapSites={mapSites}
            mapBuildings={mapBuildings}
            mapFloors={mapFloors}
            mapVersionForm={mapVersionForm}
            onUploadAsset={(file) => {
              void handleUploadAsset(file);
            }}
            onSelectOrganization={setSelectedOrganizationId}
            onSelectSite={setSelectedMapSiteId}
            onSelectBuilding={setSelectedMapBuildingId}
            onSelectFloor={(value) => {
              setSelectedMapFloorId(value);
              setMapVersionForm((current) => ({ ...current, floorId: value }));
            }}
            onMapVersionFormChange={setMapVersionForm}
            onCreateMapVersion={handleCreateMapVersion}
          />

          <MapVersionPanel
            selectedMapVersionId={selectedMapVersionId}
            filteredMapVersions={filteredMapVersions}
            onSelectVersion={(version) => {
              setSelectedMapSiteId(version.siteId);
              setSelectedMapBuildingId(version.buildingId);
              setSelectedMapFloorId(version.floorId);
              setMapVersionForm((current) => ({ ...current, floorId: version.floorId }));
              setSelectedMapVersionId(version.id);
            }}
            onRename={(versionId, versionName) => {
              void handleRenameMapVersion(versionId, versionName);
            }}
            onDuplicate={(versionId, versionName) => {
              void handleDuplicateMapVersion(versionId, versionName);
            }}
            onArchive={(versionId) => {
              void handleArchiveMapVersion(versionId);
            }}
            onDelete={(versionId) => {
              void handleDeleteMapVersion(versionId);
            }}
          />
        </div>

        <div className="space-y-6">
          <MapPublishPanel
            busy={busy}
            mapEditor={mapEditor}
            copiedNodeLinkType={copiedNodeLinkType}
            selectedMapsiteFloorUrl={selectedMapsiteFloorUrl}
            selectedMapsiteEmbedUrl={selectedMapsiteEmbedUrl}
            readinessContent={renderMapPublishReadiness()}
            onPublish={handlePublishMapVersion}
            onCopyEmbedHeader={() => {
              void copyMapsiteLink(selectedMapsiteEmbedUrl, 'embed');
            }}
            onCopyFloorLink={() => {
              void copyMapsiteLink(selectedMapsiteFloorUrl, 'floor');
            }}
            onCopyEmbedLink={() => {
              void copyMapsiteLink(selectedMapsiteEmbedUrl, 'embed-panel');
            }}
          />

          {mapEditor ? renderMapCanvas() : null}

          <MapEditorSidebar
            busy={busy}
            mapEditor={mapEditor}
            selectedMapVersionId={selectedMapVersionId}
            selectedMapCanEdit={selectedMapCanEdit}
            selectedMapIsPublished={selectedMapIsPublished}
            isParkingSpotNode={isParkingSpotNode}
            selectedMapNode={selectedMapNode}
            selectedNodeQrDataUrl={selectedNodeQrDataUrl}
            selectedNodeMapsiteUrl={selectedNodeMapsiteUrl}
            copiedNodeLinkType={copiedNodeLinkType}
            connectionStartNode={connectionStartNode}
            mapEditorSelection={mapEditorSelection}
            nodeForm={nodeForm}
            connectionForm={connectionForm}
            transitionForm={transitionForm}
            mapEditorTool={mapEditorTool}
            mapGraphSearch={mapGraphSearch}
            filteredFromNodes={filteredFromNodes}
            filteredToNodes={filteredToNodes}
            filteredMapNodes={filteredMapNodes}
            filteredMapConnections={filteredMapConnections}
            transitionSourceNodes={transitionSourceNodes}
            transitionTargetNodes={transitionTargetNodes}
            transitionTargetEditor={transitionTargetEditor}
            transitionTargetMapVersions={transitionTargetMapVersions}
            mapTransitions={mapTransitions}
            mapVersionById={mapVersionById}
            onNodeFormChange={setNodeForm}
            onConnectionFormChange={setConnectionForm}
            onTransitionFormChange={setTransitionForm}
            onMapEditorToolChange={setMapEditorTool}
            onMapGraphSearchChange={setMapGraphSearch}
            onDuplicateMapVersion={() => {
              if (mapEditor) {
                void handleDuplicateMapVersion(mapEditor.id, mapEditor.name);
              }
            }}
            onSaveNode={mapEditorSelection.editingNodeId ? handleUpdateNode : handleAddNode}
            onSaveConnection={mapEditorSelection.editingConnectionId ? handleUpdateConnection : handleAddConnection}
            onSaveTransition={handleAddTransition}
            onCopyNodeMapsiteLink={() => {
              void copyMapsiteLink(selectedNodeMapsiteUrl, 'node-mapsite');
            }}
            onStartNodeEdit={startNodeEdit}
            onDeleteNode={(nodeId) => {
              void handleDeleteNode(nodeId);
            }}
            onStartConnectionEdit={startConnectionEdit}
            onDeleteConnection={(connectionId) => {
              void handleDeleteConnection(connectionId);
            }}
            onDeleteTransition={(transitionId) => {
              void handleDeleteTransition(transitionId);
            }}
          />
        </div>
      </section>
    );
  }

  function renderCameras() {
    return (
      <CameraManagement
        busy={busy}
        editingCameraId={editingCameraId}
        editingCameraZoneId={editingCameraZoneId}
        cameraForm={cameraForm}
        cameraZoneForm={cameraZoneForm}
        cameraZonePoints={cameraZonePoints}
        sites={sites}
        buildings={buildings}
        floors={floors}
        parkingFacilities={parkingFacilities}
        cameras={cameras}
        cameraScopedParkingZones={cameraScopedParkingZones}
        cameraScopedMapVersions={cameraScopedMapVersions}
        cameraZoneCanvas={renderCameraZoneCanvas()}
        onCameraFormChange={setCameraForm}
        onCameraZoneFormChange={setCameraZoneForm}
        onSyncCameraZonePoints={syncCameraZonePoints}
        onSaveCamera={handleSaveCamera}
        onResetCameraForm={resetCameraForm}
        onCreateCameraZone={handleCreateCameraZone}
        onResetCameraZoneForm={resetCameraZoneForm}
        onStartCameraEdit={startCameraEdit}
        onDeleteCamera={(cameraId) => {
          void handleDeleteCamera(cameraId);
        }}
        onStartCameraZoneEdit={startCameraZoneEdit}
        onDeleteCameraZone={(zoneId) => {
          void handleDeleteCameraZone(zoneId);
        }}
      />
    );
  }

  function renderUsers() {
    return (
      <UserManagement
        busy={busy}
        usersPage={usersPage}
        users={users}
        userSearchResults={userSearchResults}
        selectedRoleUser={selectedRoleUser}
        organizationSearchResults={organizationSearchResults}
        selectedOrganizationAdminOrganization={selectedOrganizationAdminOrganization}
        userActionState={userActionState}
        assignableRoles={assignableRoles}
        onUserActionStateChange={(updater) => {
          setUserActionState((current) => updater(current));
        }}
        onToggleUserStatus={(user) => {
          void handleToggleUserStatus(user);
        }}
        onDeleteOrRestoreUser={(user) => {
          void handleDeleteOrRestoreUser(user);
        }}
        onAssignOrganizationAdmin={handleAssignOrganizationAdmin}
        onAssignRole={handleAssignRole}
        onRemoveRole={handleRemoveRole}
      />
    );
  }

  function renderSecurity() {
    return (
      <SecurityOverview profile={profile} roles={roles} />
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

