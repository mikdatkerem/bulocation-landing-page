import type { Dispatch, MouseEvent, SetStateAction } from 'react';
import {
  adminApi,
  type CameraHierarchy,
  type CameraZoneHierarchy,
  type MapVersionEditor,
  type ParkingFacilityHierarchy,
} from '../services/adminApi';
import type { CameraForm, CameraZoneForm, PolygonPoint, Session } from '../types/admin.types';
import {
  isImageMapAsset,
  parsePolygonJson,
  resolveContainedImageRect,
  snapToGrid,
  stringifyPolygon,
} from '../utils';

type RunAction = (
  action: () => Promise<void>,
  successMessage: string,
  errorMessage?: string,
) => Promise<void>;

type IdOption = {
  id: string;
};

type UseAdminCameraActionsArgs = {
  session: Session | null;
  editingCameraId: string;
  editingCameraZoneId: string;
  cameraForm: CameraForm;
  cameraZoneForm: CameraZoneForm;
  cameraZonePoints: PolygonPoint[];
  sites: IdOption[];
  buildings: IdOption[];
  floors: IdOption[];
  parkingFacilities: ParkingFacilityHierarchy[];
  cameras: Array<CameraHierarchy & { siteId: string }>;
  mapVersions: IdOption[];
  cameraZoneMapEditor: MapVersionEditor | null;
  setEditingCameraId: Dispatch<SetStateAction<string>>;
  setEditingCameraZoneId: Dispatch<SetStateAction<string>>;
  setCameraForm: Dispatch<SetStateAction<CameraForm>>;
  setCameraZoneForm: Dispatch<SetStateAction<CameraZoneForm>>;
  setCameraZonePoints: Dispatch<SetStateAction<PolygonPoint[]>>;
  refreshHierarchy: (activeSession: Session, organizationId?: string) => Promise<void>;
  runAction: RunAction;
};

export default function useAdminCameraActions({
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
}: UseAdminCameraActionsArgs) {
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
    if (
      !session ||
      !cameraForm.siteId ||
      !cameraForm.name.trim() ||
      !cameraForm.ipAddress.trim() ||
      !cameraForm.streamUrl.trim()
    ) {
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

  function syncCameraZonePoints(points: PolygonPoint[]) {
    setCameraZonePoints(points);
    setCameraZoneForm((current) => ({
      ...current,
      polygonJson: stringifyPolygon(points),
    }));
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

  function handleCameraZoneCanvasClick(event: MouseEvent<HTMLDivElement>) {
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

  return {
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
  };
}
