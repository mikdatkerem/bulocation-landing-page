import { Plus } from 'lucide-react';
import type { ParkingFacilityHierarchy } from '../shared/services/adminApi';
import FieldShell from '../shared/components/FieldShell';
import CodeGuide from '../shared/components/CodeGuide';
import type { ParkingFacilityForm, ParkingTab, ParkingZoneForm } from '../shared/types/admin.types';
import { parkingFacilityTypeOptions } from '../shared/constants';
import { enumLabel, inputClassName, sectionCardClassName, selectClassName } from '../shared/utils';

type FloorOption = {
  id: string;
  name: string;
};

type SiteOption = {
  id: string;
  name: string;
};

type BuildingOption = {
  id: string;
  name: string;
};

type ParkingManagementProps = {
  parkingTab: ParkingTab;
  parkingFacilityForm: ParkingFacilityForm;
  parkingZoneForm: ParkingZoneForm;
  parkingFacilities: ParkingFacilityHierarchy[];
  sites: SiteOption[];
  buildings: BuildingOption[];
  floors: FloorOption[];
  busy: boolean;
  onChangeParkingTab: (tab: ParkingTab) => void;
  onParkingFacilityFormChange: (next: ParkingFacilityForm) => void;
  onParkingZoneFormChange: (next: ParkingZoneForm) => void;
  onCreateParkingFacility: () => void;
  onCreateParkingZone: () => void;
  onUpdateParkingFacility: (facility: ParkingFacilityHierarchy) => void;
  onDeleteParkingFacility: (facilityId: string) => void;
  onUpdateParkingZone: (zone: { id: string; code: string; name: string; floorId: string | null }) => void;
  onDeleteParkingZone: (zoneId: string) => void;
};

export default function ParkingManagement({
  parkingTab,
  parkingFacilityForm,
  parkingZoneForm,
  parkingFacilities,
  sites,
  buildings,
  floors,
  busy,
  onChangeParkingTab,
  onParkingFacilityFormChange,
  onParkingZoneFormChange,
  onCreateParkingFacility,
  onCreateParkingZone,
  onUpdateParkingFacility,
  onDeleteParkingFacility,
  onUpdateParkingZone,
  onDeleteParkingZone,
}: ParkingManagementProps) {
  return (
    <section className="space-y-6">
      <div className={sectionCardClassName()}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Otopark yonetimi</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Tesis ve bolge planlamasi</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['facilities', 'Tesisler'],
              ['zones', 'Bolgeler'],
            ].map(([key, label]) => (
              <button
                key={key}
                className={`rounded-full px-4 py-2 text-sm font-medium ${parkingTab === key ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-600'}`}
                onClick={() => onChangeParkingTab(key as ParkingTab)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {parkingTab === 'facilities' ? (
          <div className={sectionCardClassName()}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Otopark tesisi</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Otopark yapisini yerleskeye bagla</h3>
            <div className="mt-6 grid gap-4">
              <FieldShell label="Yerleske">
                <select className={selectClassName()} value={parkingFacilityForm.siteId} onChange={(event) => onParkingFacilityFormChange({ ...parkingFacilityForm, siteId: event.target.value })}>
                  <option value="">Yerleske sec</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell label="Bagli bina">
                <select className={selectClassName()} value={parkingFacilityForm.buildingId} onChange={(event) => onParkingFacilityFormChange({ ...parkingFacilityForm, buildingId: event.target.value })}>
                  <option value="">Yok</option>
                  {buildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell label="Kod">
                <input className={inputClassName()} placeholder="Ornek: KAPALI-A, VALE-1" value={parkingFacilityForm.code} onChange={(event) => onParkingFacilityFormChange({ ...parkingFacilityForm, code: event.target.value.toUpperCase() })} />
              </FieldShell>
              <CodeGuide>Otopark tesisi kodu yerleske icinde tekil olmali. Tesis turunu ve fiziki bolgeyi ayirt etsin.</CodeGuide>
              <FieldShell label="Ad">
                <input className={inputClassName()} value={parkingFacilityForm.name} onChange={(event) => onParkingFacilityFormChange({ ...parkingFacilityForm, name: event.target.value })} />
              </FieldShell>
              <FieldShell label="Tesis tipi">
                <select className={selectClassName()} value={parkingFacilityForm.facilityType} onChange={(event) => onParkingFacilityFormChange({ ...parkingFacilityForm, facilityType: Number(event.target.value) })}>
                  {parkingFacilityTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy || !parkingFacilityForm.siteId || !parkingFacilityForm.code.trim() || !parkingFacilityForm.name.trim()} onClick={onCreateParkingFacility} type="button">
                <Plus className="h-4 w-4" />
                Otopark tesisi olustur
              </button>
            </div>
          </div>
        ) : parkingTab === 'zones' ? (
          <div className={sectionCardClassName()}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Otopark bolgesi</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Tesis icindeki bolgeleri ayir</h3>
            <div className="mt-6 grid gap-4">
              <FieldShell label="Otopark tesisi">
                <select className={selectClassName()} value={parkingZoneForm.parkingFacilityId} onChange={(event) => onParkingZoneFormChange({ ...parkingZoneForm, parkingFacilityId: event.target.value })}>
                  <option value="">Otopark tesisi sec</option>
                  {parkingFacilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell label="Bagli kat">
                <select className={selectClassName()} value={parkingZoneForm.floorId} onChange={(event) => onParkingZoneFormChange({ ...parkingZoneForm, floorId: event.target.value })}>
                  <option value="">Yok</option>
                  {floors.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell label="Kod">
                <input className={inputClassName()} placeholder="Ornek: A1, B2, ENGELLI" value={parkingZoneForm.code} onChange={(event) => onParkingZoneFormChange({ ...parkingZoneForm, code: event.target.value.toUpperCase() })} />
              </FieldShell>
              <CodeGuide>Bolge kodu otopark tesisi icinde tekil olmali. Saha ekiplerinin gunluk kullandigi isimlendirmeyi tercih edin.</CodeGuide>
              <FieldShell label="Ad">
                <input className={inputClassName()} value={parkingZoneForm.name} onChange={(event) => onParkingZoneFormChange({ ...parkingZoneForm, name: event.target.value })} />
              </FieldShell>
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy || !parkingZoneForm.parkingFacilityId || !parkingZoneForm.code.trim() || !parkingZoneForm.name.trim()} onClick={onCreateParkingZone} type="button">
                <Plus className="h-4 w-4" />
                Otopark bolgesi olustur
              </button>
            </div>
          </div>
        ) : null}

        <div className={sectionCardClassName()}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Mevcut envanter</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Tesisler ve bolgeler</h3>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {parkingFacilities.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-500">
                Henuz otopark tesisi yok.
              </div>
            ) : (
              parkingFacilities.map((facility) => (
                <div key={facility.id} className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{facility.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{facility.code} - {enumLabel(facility.facilityType, parkingFacilityTypeOptions)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700" onClick={() => onUpdateParkingFacility(facility)} type="button">Duzenle</button>
                      <button className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700" onClick={() => onDeleteParkingFacility(facility.id)} type="button">Sil</button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {facility.zones.length === 0 ? (
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">Henuz bolge yok</span>
                    ) : (
                      facility.zones.map((zone) => (
                        <button key={zone.id} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700" onClick={() => onUpdateParkingZone(zone)} type="button">
                          {zone.code} - {zone.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {parkingFacilities.some((facility) => facility.zones.length > 0) ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {parkingFacilities.flatMap((facility) =>
                facility.zones.map((zone) => (
                  <button key={`${zone.id}-edit`} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700" onClick={() => onUpdateParkingZone(zone)} type="button">
                    Bolge duzenle: {zone.code}
                  </button>
                )),
              )}
              {parkingFacilities.flatMap((facility) =>
                facility.zones.map((zone) => (
                  <button key={`${zone.id}-delete`} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700" onClick={() => onDeleteParkingZone(zone.id)} type="button">
                    Bolge sil: {zone.code}
                  </button>
                )),
              )}
            </div>
          ) : null}
        </div>
      </section>
    </section>
  );
}
