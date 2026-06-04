import { request } from './client';
import type {
  MapAsset,
  MapPublishReadiness,
  MapVersionEditor,
  MapVersionSummary,
} from './types';

function normalizeMapVersionEditor(editor: MapVersionEditor): MapVersionEditor {
  return {
    ...editor,
    assetContentType: editor.assetContentType ?? '',
    nodes: editor.nodes ?? [],
    connections: editor.connections ?? [],
    transitions: editor.transitions ?? [],
  };
}

export const facilityMapsApi = {
  uploadMapAsset: (token: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<MapAsset>('/api/facility-maps/assets', { method: 'POST', body: formData }, token);
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
};
