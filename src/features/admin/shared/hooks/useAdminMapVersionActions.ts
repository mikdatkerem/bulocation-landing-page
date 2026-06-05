import type { Dispatch, SetStateAction } from 'react';
import {
  adminApi,
  type MapAsset,
  type MapPublishReadiness,
  type MapVersionEditor,
} from '../services/adminApi';
import type { MapVersionForm, Session } from '../types/admin.types';

type RunAction = (
  action: () => Promise<void>,
  successMessage: string,
  errorMessage?: string,
) => Promise<void>;

type VersionSelection = {
  id: string;
  siteId: string;
  buildingId: string;
  floorId: string;
};

type UseAdminMapVersionActionsArgs = {
  session: Session | null;
  selectedMapVersionId: string;
  selectedMapsiteFloorUrl: string;
  uploadedAsset: MapAsset | null;
  mapVersionForm: MapVersionForm;
  mapPublishReadiness: MapPublishReadiness | null;
  setUploadedAsset: Dispatch<SetStateAction<MapAsset | null>>;
  setMapVersionForm: Dispatch<SetStateAction<MapVersionForm>>;
  setSelectedMapVersionId: Dispatch<SetStateAction<string>>;
  setSelectedMapSiteId: Dispatch<SetStateAction<string>>;
  setSelectedMapBuildingId: Dispatch<SetStateAction<string>>;
  setSelectedMapFloorId: Dispatch<SetStateAction<string>>;
  setCopiedNodeLinkType: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setSuccess: Dispatch<SetStateAction<string | null>>;
  refreshHierarchy: (activeSession: Session, organizationId?: string) => Promise<void>;
  refreshLoadedMapVersion: (activeSession: Session, mapVersionId?: string) => Promise<MapVersionEditor | null>;
  runAction: RunAction;
};

export default function useAdminMapVersionActions({
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
}: UseAdminMapVersionActionsArgs) {
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
      await refreshLoadedMapVersion(session, created.id);
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
      await refreshLoadedMapVersion(session, versionId);
    }, 'Harita surumu yeniden adlandirildi.');
  }

  async function handleArchiveMapVersion(versionId: string) {
    if (!session) {
      return;
    }

    await runAction(async () => {
      await adminApi.archiveMapVersion(session.accessToken, versionId);
      await refreshHierarchy(session);
      await refreshLoadedMapVersion(session, versionId);
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
      await refreshLoadedMapVersion(session, duplicated.id);
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
      await refreshLoadedMapVersion(session, nextId);
    }, 'Harita surumu silindi.');
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
      await refreshLoadedMapVersion(session);
    }, `Harita surumu yayina alindi. Mapsite: ${selectedMapsiteFloorUrl}`);
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

  function handleSelectMapFloor(value: string) {
    setSelectedMapFloorId(value);
    setMapVersionForm((current) => ({ ...current, floorId: value }));
  }

  function handleSelectMapVersion(version: VersionSelection) {
    setSelectedMapSiteId(version.siteId);
    setSelectedMapBuildingId(version.buildingId);
    setSelectedMapFloorId(version.floorId);
    setMapVersionForm((current) => ({ ...current, floorId: version.floorId }));
    setSelectedMapVersionId(version.id);
  }

  return {
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
  };
}
