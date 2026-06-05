import { useMemo } from 'react';
import type {
  FacilityMapConnection,
  FacilityMapNode,
  OrganizationHierarchy,
  PagedResult,
  RoleDto,
  UserProfile,
  AdminUserListItem,
  MapVersionEditor,
} from '../services/adminApi';
import { allNodeTypeOptions, sidebarItems, transitionConnectorNodeTypes } from '../constants';
import type {
  CameraZoneForm,
  CanvasSize,
  MapEditorSelectionState,
  NodeForm,
  SidebarKey,
} from '../types/admin.types';
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
  isPublishedMapStatus,
  resolveContainedImageRect,
} from '../utils';

type MapGraphSearchState = {
  fromNodeTerm: string;
  toNodeTerm: string;
  transitionFromNodeTerm: string;
  transitionMapTerm: string;
  transitionToNodeTerm: string;
  nodeListTerm: string;
  connectionListTerm: string;
};

type UseAdminDashboardDerivedDataArgs = {
  activeView: SidebarKey;
  profile: UserProfile | null;
  roles: RoleDto[];
  usersPage: PagedResult<AdminUserListItem> | null;
  organizationHierarchy: OrganizationHierarchy | null;
  selectedMapSiteId: string;
  selectedMapBuildingId: string;
  selectedMapFloorId: string;
  selectedMapVersionId: string;
  nodeForm: NodeForm;
  mapEditor: MapVersionEditor | null;
  mapEditorSelection: MapEditorSelectionState;
  connectionStartNodeId: string;
  mapGraphSearch: MapGraphSearchState;
  transitionTargetEditor: MapVersionEditor | null;
  cameraZoneForm: CameraZoneForm;
  mapCanvasSize: CanvasSize;
  cameraZoneCanvasSize: CanvasSize;
  cameraZoneMapEditor: MapVersionEditor | null;
};

export default function useAdminDashboardDerivedData({
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
}: UseAdminDashboardDerivedDataArgs) {
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

    return filterMapNodes(mapEditor.nodes, search);
  }, [mapEditor, mapGraphSearch.fromNodeTerm]);
  const filteredToNodes = useMemo(() => {
    const search = mapGraphSearch.toNodeTerm.trim().toLocaleLowerCase('tr-TR');
    if (!mapEditor) {
      return [] as FacilityMapNode[];
    }

    return filterMapNodes(mapEditor.nodes, search);
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

    return filterTransitionNodes(mapEditor.nodes, search);
  }, [mapEditor, mapGraphSearch.transitionFromNodeTerm]);
  const transitionTargetNodes = useMemo(() => {
    const search = mapGraphSearch.transitionToNodeTerm.trim().toLocaleLowerCase('tr-TR');
    if (!transitionTargetEditor) {
      return [] as FacilityMapNode[];
    }

    return filterTransitionNodes(transitionTargetEditor.nodes, search);
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

  return {
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
    selectedCamera,
    cameraScopedParkingZones,
    cameraScopedMapVersions,
    activeViewLabel,
    mapCanvasImageRect,
    cameraZoneCanvasImageRect,
  };
}

function filterMapNodes(nodes: FacilityMapNode[], search: string) {
  if (!search) {
    return nodes;
  }

  return nodes.filter((node) => {
    const code = node.code.toLocaleLowerCase('tr-TR');
    const label = node.label.toLocaleLowerCase('tr-TR');
    return code.includes(search) || label.includes(search);
  });
}

function filterTransitionNodes(nodes: FacilityMapNode[], search: string) {
  return nodes
    .filter((node) => transitionConnectorNodeTypes.has(node.nodeType))
    .filter((node) => {
      if (!search) {
        return true;
      }

      return `${node.code} ${node.label} ${enumLabel(node.nodeType, allNodeTypeOptions)}`
        .toLocaleLowerCase('tr-TR')
        .includes(search);
    });
}
