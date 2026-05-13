import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { adminApi, getApiErrorMessage, type MapPublishReadiness, type MapVersionEditor } from '../services/adminApi';
import { transitionConnectorNodeTypes } from '../constants';
import type { CameraZoneForm, ConnectionForm, Session, TransitionForm } from '../types/admin.types';

type UseMapEditorLoaderArgs = {
  session: Session | null;
  selectedMapVersionId: string;
  selectedOrganizationId: string;
  transitionToMapVersionId: string;
  cameraZoneForm: CameraZoneForm;
  onError: (message: string) => void;
  setSelectedMapVersionId: (value: string) => void;
  setSelectedMapSiteId: (value: string) => void;
  setSelectedMapBuildingId: (value: string) => void;
  setSelectedMapFloorId: (value: string) => void;
  setConnectionForm: Dispatch<SetStateAction<ConnectionForm>>;
  setTransitionForm: Dispatch<SetStateAction<TransitionForm>>;
};

export default function useMapEditorLoader({
  session,
  selectedMapVersionId,
  selectedOrganizationId,
  transitionToMapVersionId,
  cameraZoneForm,
  onError,
  setSelectedMapVersionId,
  setSelectedMapSiteId,
  setSelectedMapBuildingId,
  setSelectedMapFloorId,
  setConnectionForm,
  setTransitionForm,
}: UseMapEditorLoaderArgs) {
  const [mapEditor, setMapEditor] = useState<MapVersionEditor | null>(null);
  const [mapPublishReadiness, setMapPublishReadiness] = useState<MapPublishReadiness | null>(null);
  const [cameraZoneMapEditor, setCameraZoneMapEditor] = useState<MapVersionEditor | null>(null);
  const [transitionTargetEditor, setTransitionTargetEditor] = useState<MapVersionEditor | null>(null);

  useEffect(() => {
    setSelectedMapVersionId('');
    setSelectedMapSiteId('');
    setSelectedMapBuildingId('');
    setSelectedMapFloorId('');
  }, [selectedOrganizationId, setSelectedMapBuildingId, setSelectedMapFloorId, setSelectedMapSiteId, setSelectedMapVersionId]);

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

  const loadMapPublishReadinessOrNull = useCallback(async (activeSession: Session, mapVersionId: string) => {
    try {
      return await adminApi.getMapPublishReadiness(activeSession.accessToken, mapVersionId);
    } catch {
      return null;
    }
  }, []);

  const refreshMapVersion = useCallback(
    async (activeSession: Session, mapVersionId = selectedMapVersionId) => {
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
    },
    [loadMapPublishReadinessOrNull, selectedMapVersionId],
  );

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
          onError(getApiErrorMessage(loadError, 'Harita surumu yuklenemedi.'));
        }
      }
    }

    void loadMapVersion();

    return () => {
      cancelled = true;
    };
  }, [
    loadMapPublishReadinessOrNull,
    onError,
    selectedMapVersionId,
    session,
    setConnectionForm,
    setTransitionForm,
  ]);

  useEffect(() => {
    if (!session || !transitionToMapVersionId) {
      setTransitionTargetEditor(null);
      return;
    }

    const activeSession = session;
    let cancelled = false;

    async function loadTransitionTargetMap() {
      try {
        const editor = await adminApi.getMapVersion(activeSession.accessToken, transitionToMapVersionId);
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
          onError(getApiErrorMessage(loadError, 'Hedef kat haritasi yuklenemedi.'));
        }
      }
    }

    void loadTransitionTargetMap();

    return () => {
      cancelled = true;
    };
  }, [onError, session, setTransitionForm, transitionToMapVersionId]);

  return {
    mapEditor,
    setMapEditor,
    mapPublishReadiness,
    setMapPublishReadiness,
    cameraZoneMapEditor,
    transitionTargetEditor,
    setTransitionTargetEditor,
    refreshMapVersion,
  };
}
