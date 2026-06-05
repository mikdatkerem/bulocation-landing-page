import type { Dispatch, MouseEvent, SetStateAction } from 'react';
import {
  adminApi,
  type FacilityMapConnection,
  type FacilityMapNode,
  type MapVersionEditor,
} from '../services/adminApi';
import type {
  ConnectionForm,
  MapEditorSelectionState,
  MapEditorTool,
  NodeForm,
  Session,
  TransitionForm,
} from '../types/admin.types';
import { isImageMapAsset, resolveContainedImageRect } from '../utils';

type RunAction = (
  action: () => Promise<void>,
  successMessage: string,
  errorMessage?: string,
) => Promise<void>;

type UseAdminMapActionsArgs = {
  session: Session | null;
  busy: boolean;
  selectedMapVersionId: string;
  mapEditor: MapVersionEditor | null;
  mapEditorSelection: MapEditorSelectionState;
  mapEditorTool: MapEditorTool;
  selectedMapCanEdit: boolean;
  connectionStartNodeId: string;
  nodeForm: NodeForm;
  connectionForm: ConnectionForm;
  transitionForm: TransitionForm;
  setMapEditorSelection: Dispatch<SetStateAction<MapEditorSelectionState>>;
  setMapEditorTool: Dispatch<SetStateAction<MapEditorTool>>;
  setConnectionStartNodeId: Dispatch<SetStateAction<string>>;
  setNodeForm: Dispatch<SetStateAction<NodeForm>>;
  setConnectionForm: Dispatch<SetStateAction<ConnectionForm>>;
  setHiddenNodeIds: Dispatch<SetStateAction<Record<string, boolean>>>;
  refreshLoadedMapVersion: (activeSession: Session, mapVersionId?: string) => Promise<MapVersionEditor | null>;
  runAction: RunAction;
};

export default function useAdminMapActions({
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
}: UseAdminMapActionsArgs) {
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
      const editor = await refreshLoadedMapVersion(session);
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
      await refreshLoadedMapVersion(session);
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
      await refreshLoadedMapVersion(session);
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
      await refreshLoadedMapVersion(session);
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
      await refreshLoadedMapVersion(session);
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
      await refreshLoadedMapVersion(session);
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
      await refreshLoadedMapVersion(session);
    }, 'Katlar arasi gecis eklendi.', 'Kat gecisi eklenemedi.');
  }

  async function handleDeleteTransition(transitionId: string) {
    if (!session) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteMapTransition(session.accessToken, transitionId);
      await refreshLoadedMapVersion(session);
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

  function handleMapCanvasClick(event: MouseEvent<HTMLDivElement>) {
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

    if (!insideImage || mapEditorTool !== 'node') {
      setMapEditorSelection({ editingNodeId: '', editingConnectionId: '' });
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
    setMapEditorSelection({ editingNodeId: '', editingConnectionId: '' });
  }

  async function handleMapNodeClick(node: FacilityMapNode) {
    if (mapEditorTool !== 'connection' || !selectedMapCanEdit) {
      startNodeEdit(node);
      return;
    }

    setMapEditorSelection({ editingNodeId: '', editingConnectionId: '' });

    if (!connectionStartNodeId) {
      setConnectionStartNodeId(node.id);
      setConnectionForm((current) => ({ ...current, fromNodeId: node.id, toNodeId: '' }));
      return;
    }

    if (connectionStartNodeId === node.id) {
      setConnectionStartNodeId('');
      setConnectionForm((current) => ({ ...current, fromNodeId: '', toNodeId: '' }));
      return;
    }

    setConnectionForm((current) => ({ ...current, fromNodeId: connectionStartNodeId, toNodeId: node.id }));

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
      await refreshLoadedMapVersion(session);
    }, 'Baglanti eklendi.');
  }

  function toggleNodeVisibility(nodeId: string) {
    setHiddenNodeIds((current) => ({
      ...current,
      [nodeId]: !current[nodeId],
    }));
  }

  function handleSelectMapEditorTool(tool: MapEditorTool) {
    setMapEditorTool(tool);
    setMapEditorSelection({ editingNodeId: '', editingConnectionId: '' });
    if (tool !== 'connection') {
      setConnectionStartNodeId('');
    }
  }

  return {
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
  };
}
