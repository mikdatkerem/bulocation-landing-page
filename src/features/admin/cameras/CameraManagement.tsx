import type { ReactNode } from 'react';
import { Check, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import type { CameraHierarchy, ParkingFacilityHierarchy } from '../shared/services/adminApi';
import CodeGuide from '../shared/components/CodeGuide';
import FieldShell from '../shared/components/FieldShell';
import type { CameraForm, CameraZoneForm, PolygonPoint } from '../shared/types/admin.types';
import { inputClassName, sectionCardClassName, selectClassName } from '../shared/utils';

type SiteOption = {
  id: string;
  name: string;
};

type BuildingOption = {
  id: string;
  name: string;
};

type FloorOption = {
  id: string;
  name: string;
};

type ParkingZoneOption = {
  id: string;
  code: string;
  name: string;
};

type MapVersionOption = {
  id: string;
  floorCode: string;
  name: string;
};

type CameraItem = CameraHierarchy & {
  siteId: string;
};

type CameraManagementProps = {
  busy: boolean;
  editingCameraId: string;
  editingCameraZoneId: string;
  cameraForm: CameraForm;
  cameraZoneForm: CameraZoneForm;
  cameraZonePoints: PolygonPoint[];
  sites: SiteOption[];
  buildings: BuildingOption[];
  floors: FloorOption[];
  parkingFacilities: ParkingFacilityHierarchy[];
  cameras: CameraItem[];
  cameraScopedParkingZones: ParkingZoneOption[];
  cameraScopedMapVersions: MapVersionOption[];
  cameraZoneCanvas: ReactNode;
  onCameraFormChange: (next: CameraForm) => void;
  onCameraZoneFormChange: (next: CameraZoneForm) => void;
  onSyncCameraZonePoints: (points: PolygonPoint[]) => void;
  onSaveCamera: () => void;
  onResetCameraForm: () => void;
  onCreateCameraZone: () => void;
  onResetCameraZoneForm: () => void;
  onStartCameraEdit: (camera: CameraItem) => void;
  onDeleteCamera: (cameraId: string) => void;
  onStartCameraZoneEdit: (zone: CameraHierarchy['zones'][number], cameraId: string) => void;
  onDeleteCameraZone: (zoneId: string) => void;
};

export default function CameraManagement({
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
  cameraZoneCanvas,
  onCameraFormChange,
  onCameraZoneFormChange,
  onSyncCameraZonePoints,
  onSaveCamera,
  onResetCameraForm,
  onCreateCameraZone,
  onResetCameraZoneForm,
  onStartCameraEdit,
  onDeleteCamera,
  onStartCameraZoneEdit,
  onDeleteCameraZone,
}: CameraManagementProps) {
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
                onChange={(event) => onCameraFormChange({ ...cameraForm, siteId: event.target.value })}
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
                onChange={(event) => onCameraFormChange({ ...cameraForm, buildingId: event.target.value })}
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
                onChange={(event) => onCameraFormChange({ ...cameraForm, floorId: event.target.value })}
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
                  onCameraFormChange({ ...cameraForm, parkingFacilityId: event.target.value })
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
              <input className={inputClassName()} value={cameraForm.name} onChange={(event) => onCameraFormChange({ ...cameraForm, name: event.target.value })} />
            </FieldShell>
            <FieldShell label="IP adresi">
              <input className={inputClassName()} value={cameraForm.ipAddress} onChange={(event) => onCameraFormChange({ ...cameraForm, ipAddress: event.target.value })} />
            </FieldShell>
            <FieldShell label="Yayin adresi">
              <input className={inputClassName()} value={cameraForm.streamUrl} onChange={(event) => onCameraFormChange({ ...cameraForm, streamUrl: event.target.value })} />
            </FieldShell>
            <FieldShell label="Notlar">
              <textarea className={`${inputClassName()} min-h-28 resize-y`} value={cameraForm.notes} onChange={(event) => onCameraFormChange({ ...cameraForm, notes: event.target.value })} />
            </FieldShell>
            <div className="flex flex-wrap gap-3">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                disabled={busy || !cameraForm.siteId || !cameraForm.name.trim() || !cameraForm.ipAddress.trim() || !cameraForm.streamUrl.trim()}
                onClick={onSaveCamera}
                type="button"
              >
                {editingCameraId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingCameraId ? 'Kamerayi kaydet' : 'Kamera olustur'}
              </button>
              {editingCameraId ? (
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  onClick={onResetCameraForm}
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
                onChange={(event) => onCameraZoneFormChange({ ...cameraZoneForm, cameraId: event.target.value })}
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
                onChange={(event) => onCameraZoneFormChange({ ...cameraZoneForm, parkingZoneId: event.target.value })}
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
                onChange={(event) => onCameraZoneFormChange({ ...cameraZoneForm, mapVersionId: event.target.value })}
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
              <input className={inputClassName()} value={cameraZoneForm.name} onChange={(event) => onCameraZoneFormChange({ ...cameraZoneForm, name: event.target.value })} />
            </FieldShell>
            <FieldShell label="Esik degeri">
              <input className={inputClassName()} type="number" min="0" max="1" step="0.05" value={cameraZoneForm.detectionThreshold} onChange={(event) => onCameraZoneFormChange({ ...cameraZoneForm, detectionThreshold: Number(event.target.value) })} />
            </FieldShell>
            <FieldShell label="Polygon onizleme">
              <textarea className={`${inputClassName()} min-h-28 resize-y font-mono text-xs`} readOnly value={cameraZoneForm.polygonJson} />
            </FieldShell>
            <CodeGuide>
              Harita uzerine tiklayarak polygon olustur. Mavi noktalara tiklayarak tekil noktayi silebilirsin.
            </CodeGuide>
            {cameraZoneCanvas}
            <div className="grid gap-3 sm:grid-cols-2">
              {cameraZonePoints.map((point, index) => (
                <div key={`${point.x}-${point.y}-${index}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-700">
                  <span>
                    Nokta {index + 1}: {point.x}, {point.y}
                  </span>
                  <button
                    className="rounded-full border border-rose-200 bg-rose-50 p-1 text-rose-700"
                    onClick={() => onSyncCameraZonePoints(cameraZonePoints.filter((_, pointIndex) => pointIndex !== index))}
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
                onClick={onCreateCameraZone}
                type="button"
              >
                {editingCameraZoneId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingCameraZoneId ? 'Bolgeyi kaydet' : 'Kamera bolgesi olustur'}
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                onClick={() => onSyncCameraZonePoints(cameraZonePoints.slice(0, -1))}
                type="button"
              >
                <RotateCcw className="h-4 w-4" />
                Son noktayi geri al
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                onClick={() => onSyncCameraZonePoints([])}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                Polygonu temizle
              </button>
              {editingCameraZoneId ? (
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  onClick={onResetCameraZoneForm}
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
                    <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700" onClick={() => onStartCameraEdit(camera)} type="button">Duzenle</button>
                    <button className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700" onClick={() => onDeleteCamera(camera.id)} type="button">Sil</button>
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
                      <button key={`${zone.id}-edit`} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700" onClick={() => onStartCameraZoneEdit(zone, camera.id)} type="button">
                        Bolgeyi duzenle: {zone.name}
                      </button>
                    ))}
                    {camera.zones.map((zone) => (
                      <button key={`${zone.id}-delete`} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700" onClick={() => onDeleteCameraZone(zone.id)} type="button">
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
