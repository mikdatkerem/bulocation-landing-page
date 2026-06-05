import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import AdminLogin from '../../admin/AdminLogin';
import {
  getApiErrorMessage,
  type MapAsset,
} from './shared/services/adminApi';
import AdminDashboardContent from './AdminDashboardContent';
import AdminShell from './layout/AdminShell';
import AdminSidebar from './layout/AdminSidebar';
import AdminTopbar from './layout/AdminTopbar';
import useAdminSession from './shared/hooks/useAdminSession';
import useAdminAuthActions from './shared/hooks/useAdminAuthActions';
import useAdminCameraActions from './shared/hooks/useAdminCameraActions';
import useAdminDashboardDerivedData from './shared/hooks/useAdminDashboardDerivedData';
import useAdminFacilityActions from './shared/hooks/useAdminFacilityActions';
import useAdminMapActions from './shared/hooks/useAdminMapActions';
import useAdminMapVersionActions from './shared/hooks/useAdminMapVersionActions';
import useAdminUserActions from './shared/hooks/useAdminUserActions';
import useAdminUserManagement from './shared/hooks/useAdminUserManagement';
import useAdminBootstrap from './shared/hooks/useAdminBootstrap';
import useMapEditorLoader from './shared/hooks/useMapEditorLoader';
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
  OrganizationForm,
  ParkingFacilityForm,
  ParkingTab,
  ParkingZoneForm,
  PolygonPoint,
  SidebarKey,
  SiteForm,
  TransitionForm,
} from './shared/types/admin.types';
import {
  buildMapsiteMapUrl,
  nodeTypeGeneratesQr,
  topNavTabs,
} from './shared/utils';

export default function AdminDashboard() {
  const { session, setSession, clearSession } = useAdminSession();
  const [activeView, setActiveView] = useState<SidebarKey>('organizations');
  const [facilityTab, setFacilityTab] = useState<FacilityTab>('sites');
  const [parkingTab, setParkingTab] = useState<ParkingTab>('facilities');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginFieldErrors, setLoginFieldErrors] = useState<Record<string, string[]> | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('');
  const [selectedMapVersionId, setSelectedMapVersionId] = useState<string>('');
  const [selectedMapSiteId, setSelectedMapSiteId] = useState<string>('');
  const [selectedMapBuildingId, setSelectedMapBuildingId] = useState<string>('');
  const [selectedMapFloorId, setSelectedMapFloorId] = useState<string>('');
  const [uploadedAsset, setUploadedAsset] = useState<MapAsset | null>(null);
  const [organizationForm, setOrganizationForm] = useState<OrganizationForm>({ name: '', description: '' });
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

  const {
    handleLogin,
    handleForgotPassword,
    handleResetPassword,
    handleLogout,
    clearLoginFeedback,
  } = useAdminAuthActions({
    error,
    loginFieldErrors,
    success,
    clearSession,
    setSession,
    setActiveView,
    setBusy,
    setError,
    setLoginFieldErrors,
    setSuccess,
  });

  const {
    profile,
    organizations,
    setOrganizations,
    organizationHierarchy,
    roles,
    usersPage,
    refreshUsers,
    refreshHierarchy,
  } = useAdminBootstrap({
    session,
    selectedOrganizationId,
    setSelectedOrganizationId,
    onBusyChange: setBusy,
    onError: setError,
    onInvalidSession: handleLogout,
  });

  const {
    mapEditor,
    mapPublishReadiness,
    cameraZoneMapEditor,
    transitionTargetEditor,
    setTransitionTargetEditor,
    refreshMapVersion: refreshLoadedMapVersion,
  } = useMapEditorLoader({
    session,
    selectedMapVersionId,
    selectedOrganizationId,
    transitionToMapVersionId: transitionForm.toMapVersionId,
    cameraZoneForm,
    onError: setError,
    setSelectedMapVersionId,
    setSelectedMapSiteId,
    setSelectedMapBuildingId,
    setSelectedMapFloorId,
    setConnectionForm,
    setTransitionForm,
  });
  const {
    sites,
    buildings,
    floors,
    parkingFacilities,
    cameras,
    mapVersions,
    mapSites,
    mapBuildings,
    mapFloors,
    filteredMapVersions,
    users,
    isSuperAdmin,
    assignableRoles,
    visibleSidebarItems,
    isParkingSpotNode,
    selectedMapCanEdit,
    selectedMapIsPublished,
    selectedMapNode,
    selectedNodeReference,
    selectedNodeMapsiteUrl,
    selectedMapsiteFloorUrl,
    selectedMapsiteEmbedUrl,
    connectionStartNode,
    filteredFromNodes,
    filteredToNodes,
    filteredMapNodes,
    filteredMapConnections,
    mapVersionById,
    transitionTargetMapVersions,
    transitionSourceNodes,
    transitionTargetNodes,
    cameraScopedParkingZones,
    cameraScopedMapVersions,
    activeViewLabel,
    mapCanvasImageRect,
    cameraZoneCanvasImageRect,
  } = useAdminDashboardDerivedData({
    activeView,
    profile,
    roles,
    usersPage,
    organizationHierarchy,
    selectedMapSiteId,
    selectedMapBuildingId,
    selectedMapFloorId,
    selectedMapVersionId,
    nodeForm,
    mapEditor,
    mapEditorSelection,
    connectionStartNodeId,
    mapGraphSearch,
    transitionTargetEditor,
    cameraZoneForm,
    mapCanvasSize,
    cameraZoneCanvasSize,
    cameraZoneMapEditor,
  });
  const {
    userActionState,
    setUserActionState,
    userSearchResults,
    setUserSearchResults,
    selectedRoleUser,
    organizationSearchResults,
    selectedOrganizationAdminOrganization,
  } = useAdminUserManagement({
    session,
    isSuperAdmin,
    organizations,
    users,
    assignableRoles,
    onError: setError,
  });

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
    if (!visibleSidebarItems.some((item) => item.key === activeView)) {
      setActiveView('organizations');
    }
  }, [activeView, visibleSidebarItems]);

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

  const {
    handleToggleUserStatus,
    handleDeleteOrRestoreUser,
    handleAssignRole,
    handleRemoveRole,
    handleAssignOrganizationAdmin,
  } = useAdminUserActions({
    session,
    isSuperAdmin,
    userActionState,
    selectedRoleUser,
    selectedOrganizationAdminOrganization,
    setUserSearchResults,
    refreshUsers,
    runAction,
  });

  const {
    handleCreateOrganization,
    handleUpdateOrganization,
    handleDeleteOrganization,
    handleCreateSite,
    handleUpdateSite,
    handleDeleteSite,
    handleCreateBuilding,
    handleUpdateBuilding,
    handleDeleteBuilding,
    handleCreateFloor,
    handleCreateParkingFacility,
    handleUpdateParkingFacility,
    handleDeleteParkingFacility,
    handleCreateParkingZone,
    handleUpdateParkingZone,
    handleDeleteParkingZone,
  } = useAdminFacilityActions({
    session,
    organizations,
    selectedOrganizationId,
    organizationForm,
    siteForm,
    buildingForm,
    floorForm,
    parkingFacilityForm,
    parkingZoneForm,
    setOrganizations,
    setSelectedOrganizationId,
    setOrganizationForm,
    setSiteForm,
    setBuildingForm,
    setFloorForm,
    setParkingFacilityForm,
    setParkingZoneForm,
    refreshHierarchy,
    runAction,
  });

  const {
    startCameraEdit,
    resetCameraForm,
    handleSaveCamera,
    handleDeleteCamera,
    syncCameraZonePoints,
    handleCreateCameraZone,
    startCameraZoneEdit,
    resetCameraZoneForm,
    handleDeleteCameraZone,
    handleCameraZoneCanvasClick,
  } = useAdminCameraActions({
    session,
    editingCameraId,
    editingCameraZoneId,
    cameraForm,
    cameraZoneForm,
    cameraZonePoints,
    sites,
    buildings,
    floors,
    parkingFacilities,
    cameras,
    mapVersions,
    cameraZoneMapEditor,
    setEditingCameraId,
    setEditingCameraZoneId,
    setCameraForm,
    setCameraZoneForm,
    setCameraZonePoints,
    refreshHierarchy,
    runAction,
  });

  const {
    handleUploadAsset,
    handleCreateMapVersion,
    handleRenameMapVersion,
    handleArchiveMapVersion,
    handleDuplicateMapVersion,
    handleDeleteMapVersion,
    handlePublishMapVersion,
    copyMapsiteLink,
    handleSelectMapFloor,
    handleSelectMapVersion,
  } = useAdminMapVersionActions({
    session,
    selectedMapVersionId,
    selectedMapsiteFloorUrl,
    uploadedAsset,
    mapVersionForm,
    mapPublishReadiness,
    setUploadedAsset,
    setMapVersionForm,
    setSelectedMapVersionId,
    setSelectedMapSiteId,
    setSelectedMapBuildingId,
    setSelectedMapFloorId,
    setCopiedNodeLinkType,
    setError,
    setSuccess,
    refreshHierarchy,
    refreshLoadedMapVersion,
    runAction,
  });

  const {
    handleAddNode,
    handleUpdateNode,
    handleDeleteNode,
    handleAddConnection,
    handleUpdateConnection,
    handleDeleteConnection,
    handleAddTransition,
    handleDeleteTransition,
    startNodeEdit,
    startConnectionEdit,
    handleMapCanvasClick,
    handleMapNodeClick,
    toggleNodeVisibility,
    handleSelectMapEditorTool,
  } = useAdminMapActions({
    session,
    busy,
    selectedMapVersionId,
    mapEditor,
    mapEditorSelection,
    mapEditorTool,
    selectedMapCanEdit,
    connectionStartNodeId,
    nodeForm,
    connectionForm,
    transitionForm,
    setMapEditorSelection,
    setMapEditorTool,
    setConnectionStartNodeId,
    setNodeForm,
    setConnectionForm,
    setHiddenNodeIds,
    refreshLoadedMapVersion,
    runAction,
  });

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

      <AdminDashboardContent
        activeView={activeView}
        isSuperAdmin={isSuperAdmin}
        overview={{
          organizationName: organizationHierarchy?.name,
          organizationDescription: organizationHierarchy?.description,
          profileName: profile?.fullName,
          profileEmail: profile?.email,
          onChangeView: setActiveView,
        }}
        organizations={{
          organizations,
          selectedOrganizationId,
          organizationHierarchy,
          organizationForm,
          isSuperAdmin,
          busy,
          sitesCount: sites.length,
          buildingsCount: buildings.length,
          camerasCount: cameras.length,
          onSelectOrganization: setSelectedOrganizationId,
          onOrganizationFormChange: setOrganizationForm,
          onCreateOrganization: handleCreateOrganization,
          onUpdateOrganization: (organization) => {
            void handleUpdateOrganization(organization);
          },
          onDeleteOrganization: (organizationId) => {
            void handleDeleteOrganization(organizationId);
          },
        }}
        facilities={{
          facilityTab,
          organizations,
          selectedOrganizationId,
          siteForm,
          buildingForm,
          floorForm,
          sites,
          buildings,
          busy,
          onChangeFacilityTab: setFacilityTab,
          onSelectOrganization: setSelectedOrganizationId,
          onSiteFormChange: setSiteForm,
          onBuildingFormChange: setBuildingForm,
          onFloorFormChange: setFloorForm,
          onCreateSite: handleCreateSite,
          onCreateBuilding: handleCreateBuilding,
          onCreateFloor: handleCreateFloor,
          onUpdateSite: (site) => {
            void handleUpdateSite(site);
          },
          onDeleteSite: (siteId) => {
            void handleDeleteSite(siteId);
          },
          onUpdateBuilding: (building) => {
            void handleUpdateBuilding(building);
          },
          onDeleteBuilding: (buildingId) => {
            void handleDeleteBuilding(buildingId);
          },
        }}
        parking={{
          parkingTab,
          parkingFacilityForm,
          parkingZoneForm,
          parkingFacilities,
          sites,
          buildings,
          floors,
          busy,
          onChangeParkingTab: setParkingTab,
          onParkingFacilityFormChange: setParkingFacilityForm,
          onParkingZoneFormChange: setParkingZoneForm,
          onCreateParkingFacility: handleCreateParkingFacility,
          onCreateParkingZone: handleCreateParkingZone,
          onUpdateParkingFacility: (facility) => {
            void handleUpdateParkingFacility(facility);
          },
          onDeleteParkingFacility: (facilityId) => {
            void handleDeleteParkingFacility(facilityId);
          },
          onUpdateParkingZone: (zone) => {
            void handleUpdateParkingZone(zone);
          },
          onDeleteParkingZone: (zoneId) => {
            void handleDeleteParkingZone(zoneId);
          },
        }}
        maps={{
          management: {
            busy,
            uploadedAsset,
            organizations,
            selectedOrganizationId,
            selectedMapSiteId,
            selectedMapBuildingId,
            mapSites,
            mapBuildings,
            mapFloors,
            mapVersionForm,
            selectedMapVersionId,
            filteredMapVersions,
            mapEditor,
            copiedNodeLinkType,
            selectedMapsiteFloorUrl,
            selectedMapsiteEmbedUrl,
            onUploadAsset: (file) => {
              void handleUploadAsset(file);
            },
            onSelectOrganization: setSelectedOrganizationId,
            onSelectSite: setSelectedMapSiteId,
            onSelectBuilding: setSelectedMapBuildingId,
            onSelectFloor: handleSelectMapFloor,
            onMapVersionFormChange: setMapVersionForm,
            onCreateMapVersion: handleCreateMapVersion,
            onSelectVersion: handleSelectMapVersion,
            onRenameVersion: (versionId, versionName) => {
              void handleRenameMapVersion(versionId, versionName);
            },
            onDuplicateVersion: (versionId, versionName) => {
              void handleDuplicateMapVersion(versionId, versionName);
            },
            onArchiveVersion: (versionId) => {
              void handleArchiveMapVersion(versionId);
            },
            onDeleteVersion: (versionId) => {
              void handleDeleteMapVersion(versionId);
            },
            onPublish: handlePublishMapVersion,
            onCopyEmbedHeader: () => {
              void copyMapsiteLink(selectedMapsiteEmbedUrl, 'embed');
            },
            onCopyFloorLink: () => {
              void copyMapsiteLink(selectedMapsiteFloorUrl, 'floor');
            },
            onCopyEmbedLink: () => {
              void copyMapsiteLink(selectedMapsiteEmbedUrl, 'embed-panel');
            },
          },
          publishReadiness: mapPublishReadiness,
          canvas: mapEditor
            ? {
                mapEditor,
                selectedMapCanEdit,
                mapEditorTool,
                mapEditorSelection,
                connectionStartNodeId,
                connectionStartNode,
                nodeQrDataUrls,
                hiddenNodeIds,
                mapCanvasImageRect,
                mapCanvasRef,
                onCanvasClick: handleMapCanvasClick,
                onToolSelect: handleSelectMapEditorTool,
                onNodeClick: (node) => {
                  void handleMapNodeClick(node);
                },
                onToggleNodeVisibility: toggleNodeVisibility,
              }
            : null,
          sidebar: {
            busy,
            mapEditor,
            selectedMapVersionId,
            selectedMapCanEdit,
            selectedMapIsPublished,
            isParkingSpotNode,
            selectedMapNode,
            selectedNodeQrDataUrl,
            selectedNodeMapsiteUrl,
            copiedNodeLinkType,
            connectionStartNode,
            mapEditorSelection,
            nodeForm,
            connectionForm,
            transitionForm,
            mapEditorTool,
            mapGraphSearch,
            filteredFromNodes,
            filteredToNodes,
            filteredMapNodes,
            filteredMapConnections,
            transitionSourceNodes,
            transitionTargetNodes,
            transitionTargetEditor,
            transitionTargetMapVersions,
            mapTransitions: mapEditor?.transitions ?? [],
            mapVersionById,
            onNodeFormChange: setNodeForm,
            onConnectionFormChange: setConnectionForm,
            onTransitionFormChange: setTransitionForm,
            onMapEditorToolChange: setMapEditorTool,
            onMapGraphSearchChange: setMapGraphSearch,
            onDuplicateMapVersion: () => {
              if (mapEditor) {
                void handleDuplicateMapVersion(mapEditor.id, mapEditor.name);
              }
            },
            onSaveNode: mapEditorSelection.editingNodeId ? handleUpdateNode : handleAddNode,
            onSaveConnection: mapEditorSelection.editingConnectionId ? handleUpdateConnection : handleAddConnection,
            onSaveTransition: handleAddTransition,
            onCopyNodeMapsiteLink: () => {
              void copyMapsiteLink(selectedNodeMapsiteUrl, 'node-mapsite');
            },
            onStartNodeEdit: startNodeEdit,
            onDeleteNode: (nodeId) => {
              void handleDeleteNode(nodeId);
            },
            onStartConnectionEdit: startConnectionEdit,
            onDeleteConnection: (connectionId) => {
              void handleDeleteConnection(connectionId);
            },
            onDeleteTransition: (transitionId) => {
              void handleDeleteTransition(transitionId);
            },
          },
        }}
        cameras={{
          management: {
            busy,
            editingCameraId,
            editingCameraZoneId,
            cameraForm,
            cameraZoneForm,
            cameraZonePoints,
            sites,
            buildings,
            floors,
            parkingFacilities,
            cameras,
            cameraScopedParkingZones,
            cameraScopedMapVersions,
            onCameraFormChange: setCameraForm,
            onCameraZoneFormChange: setCameraZoneForm,
            onSyncCameraZonePoints: syncCameraZonePoints,
            onSaveCamera: handleSaveCamera,
            onResetCameraForm: resetCameraForm,
            onCreateCameraZone: handleCreateCameraZone,
            onResetCameraZoneForm: resetCameraZoneForm,
            onStartCameraEdit: startCameraEdit,
            onDeleteCamera: (cameraId) => {
              void handleDeleteCamera(cameraId);
            },
            onStartCameraZoneEdit: startCameraZoneEdit,
            onDeleteCameraZone: (zoneId) => {
              void handleDeleteCameraZone(zoneId);
            },
          },
          canvas: {
            mapVersionId: cameraZoneForm.mapVersionId,
            cameraZoneMapEditor,
            cameraZonePoints,
            cameraZoneCanvasImageRect,
            cameraZoneCanvasRef,
            onCanvasClick: handleCameraZoneCanvasClick,
            onRemovePoint: (pointIndex) => {
              syncCameraZonePoints(cameraZonePoints.filter((_, currentIndex) => currentIndex !== pointIndex));
            },
          },
        }}
        users={{
          busy,
          usersPage,
          users,
          userSearchResults,
          selectedRoleUser,
          organizationSearchResults,
          selectedOrganizationAdminOrganization,
          userActionState,
          assignableRoles,
          onUserActionStateChange: (updater) => {
            setUserActionState((current) => updater(current));
          },
          onToggleUserStatus: (user) => {
            void handleToggleUserStatus(user);
          },
          onDeleteOrRestoreUser: (user) => {
            void handleDeleteOrRestoreUser(user);
          },
          onAssignOrganizationAdmin: handleAssignOrganizationAdmin,
          onAssignRole: handleAssignRole,
          onRemoveRole: handleRemoveRole,
        }}
        security={{
          profile,
          roles,
        }}
      />
    </AdminShell>
  );
}

