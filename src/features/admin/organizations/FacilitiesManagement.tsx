import { Plus } from 'lucide-react';
import type { BuildingHierarchy, OrganizationSummary, SiteHierarchy } from '../shared/services/adminApi';
import SearchableSelect from '../shared/components/SearchableSelect';
import FieldShell from '../shared/components/FieldShell';
import CodeGuide from '../shared/components/CodeGuide';
import type { BuildingForm, FacilityTab, FloorForm, SiteForm } from '../shared/types/admin.types';
import { buildingTypeOptions, siteTypeOptions } from '../shared/constants';
import { enumLabel, inputClassName, sectionCardClassName, selectClassName } from '../shared/utils';

type FacilitiesManagementProps = {
  facilityTab: FacilityTab;
  organizations: OrganizationSummary[];
  selectedOrganizationId: string;
  siteForm: SiteForm;
  buildingForm: BuildingForm;
  floorForm: FloorForm;
  sites: SiteHierarchy[];
  buildings: (BuildingHierarchy & { siteId: string; siteName: string })[];
  busy: boolean;
  onChangeFacilityTab: (tab: FacilityTab) => void;
  onSelectOrganization: (organizationId: string) => void;
  onSiteFormChange: (next: SiteForm) => void;
  onBuildingFormChange: (next: BuildingForm) => void;
  onFloorFormChange: (next: FloorForm) => void;
  onCreateSite: () => void;
  onCreateBuilding: () => void;
  onCreateFloor: () => void;
  onUpdateSite: (site: SiteHierarchy) => void;
  onDeleteSite: (siteId: string) => void;
  onUpdateBuilding: (building: BuildingHierarchy) => void;
  onDeleteBuilding: (buildingId: string) => void;
};

export default function FacilitiesManagement({
  facilityTab,
  organizations,
  selectedOrganizationId,
  siteForm,
  buildingForm,
  floorForm,
  sites,
  buildings,
  busy,
  onChangeFacilityTab,
  onSelectOrganization,
  onSiteFormChange,
  onBuildingFormChange,
  onFloorFormChange,
  onCreateSite,
  onCreateBuilding,
  onCreateFloor,
  onUpdateSite,
  onDeleteSite,
  onUpdateBuilding,
  onDeleteBuilding,
}: FacilitiesManagementProps) {
  return (
    <section className="space-y-6">
      <div className={sectionCardClassName()}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Tesis yonetimi</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Yerleske, bina ve kat akisi</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['sites', 'Yerleskeler'],
              ['buildings', 'Binalar'],
              ['floors', 'Katlar'],
            ].map(([key, label]) => (
              <button
                key={key}
                className={`rounded-full px-4 py-2 text-sm font-medium ${facilityTab === key ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-600'}`}
                onClick={() => onChangeFacilityTab(key as FacilityTab)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {facilityTab === 'sites' ? (
          <div className={sectionCardClassName()}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Yerleske olustur</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Organizasyon altina yerleske ekle</h3>
            <div className="mt-6 grid gap-4">
              <SearchableSelect
                label="Organizasyon"
                value={selectedOrganizationId}
                options={organizations.map((organization) => ({
                  value: organization.id,
                  label: organization.name,
                  hint: organization.description ?? 'Organizasyon',
                }))}
                placeholder="Organizasyon ara"
                emptyText="Organizasyon sec"
                onChange={onSelectOrganization}
              />
              <FieldShell label="Kod">
                <input
                  className={inputClassName()}
                  placeholder="Ornek: MASLAK"
                  value={siteForm.code}
                  onChange={(event) => onSiteFormChange({ ...siteForm, code: event.target.value.toUpperCase() })}
                />
              </FieldShell>
              <CodeGuide>Yerleske kodu kisa ve tekil olmali. Ornek: MASLAK, ATASEHIR, GZTPE.</CodeGuide>
              <FieldShell label="Ad">
                <input className={inputClassName()} value={siteForm.name} onChange={(event) => onSiteFormChange({ ...siteForm, name: event.target.value })} />
              </FieldShell>
              <FieldShell label="Tur">
                <select className={selectClassName()} value={siteForm.siteType} onChange={(event) => onSiteFormChange({ ...siteForm, siteType: Number(event.target.value) })}>
                  {siteTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell label="Adres">
                <textarea className={`${inputClassName()} min-h-24 resize-y`} value={siteForm.address} onChange={(event) => onSiteFormChange({ ...siteForm, address: event.target.value })} />
              </FieldShell>
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy || !selectedOrganizationId || !siteForm.code.trim() || !siteForm.name.trim()} onClick={onCreateSite} type="button">
                <Plus className="h-4 w-4" />
                Yerleske olustur
              </button>
            </div>
          </div>
        ) : null}

        {facilityTab === 'buildings' ? (
          <div className={sectionCardClassName()}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Bina olustur</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Yerleske icindeki ana yapilari kur</h3>
            <div className="mt-6 grid gap-4">
              <SearchableSelect
                label="Yerleske"
                value={buildingForm.siteId}
                options={sites.map((site) => ({
                  value: site.id,
                  label: site.name,
                  hint: site.code,
                }))}
                placeholder="Yerleske ara"
                emptyText="Yerleske sec"
                onChange={(value) => onBuildingFormChange({ ...buildingForm, siteId: value })}
              />
              <FieldShell label="Kod">
                <input className={inputClassName()} placeholder="Ornek: ANA, ACIL, POLIKLINIK" value={buildingForm.code} onChange={(event) => onBuildingFormChange({ ...buildingForm, code: event.target.value.toUpperCase() })} />
              </FieldShell>
              <CodeGuide>Bina kodu yerleske icinde tekil olmali. Kisa, sabit ve yon bulmada kullanilabilir bir ad secin.</CodeGuide>
              <FieldShell label="Ad">
                <input className={inputClassName()} value={buildingForm.name} onChange={(event) => onBuildingFormChange({ ...buildingForm, name: event.target.value })} />
              </FieldShell>
              <FieldShell label="Bina tipi">
                <select className={selectClassName()} value={buildingForm.buildingType} onChange={(event) => onBuildingFormChange({ ...buildingForm, buildingType: Number(event.target.value) })}>
                  {buildingTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy || !buildingForm.siteId || !buildingForm.code.trim() || !buildingForm.name.trim()} onClick={onCreateBuilding} type="button">
                <Plus className="h-4 w-4" />
                Bina olustur
              </button>
            </div>
          </div>
        ) : null}

        {facilityTab === 'floors' ? (
          <div className={sectionCardClassName()}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Kat olustur</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Haritaya hazir katlar olustur</h3>
            <div className="mt-6 grid gap-4">
              <SearchableSelect
                label="Bina"
                value={floorForm.buildingId}
                options={buildings.map((building) => ({
                  value: building.id,
                  label: building.name,
                  hint: `${building.code} Â· ${building.siteName}`,
                }))}
                placeholder="Bina ara"
                emptyText="Bina sec"
                onChange={(value) => onFloorFormChange({ ...floorForm, buildingId: value })}
              />
              <FieldShell label="Kod">
                <input className={inputClassName()} placeholder="Ornek: B2, B1, Z, K1" value={floorForm.code} onChange={(event) => onFloorFormChange({ ...floorForm, code: event.target.value.toUpperCase() })} />
              </FieldShell>
              <CodeGuide>Kat kodu bina icinde tekil olmali. Kullanicinin sahada gorecegi kisaltmayi kullanin.</CodeGuide>
              <FieldShell label="Ad">
                <input className={inputClassName()} value={floorForm.name} onChange={(event) => onFloorFormChange({ ...floorForm, name: event.target.value })} />
              </FieldShell>
              <FieldShell label="Seviye">
                <input className={inputClassName()} type="number" value={floorForm.level} onChange={(event) => onFloorFormChange({ ...floorForm, level: Number(event.target.value) })} />
              </FieldShell>
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy || !floorForm.buildingId || !floorForm.code.trim() || !floorForm.name.trim()} onClick={onCreateFloor} type="button">
                <Plus className="h-4 w-4" />
                Kat olustur
              </button>
            </div>
          </div>
        ) : null}

        <div className={sectionCardClassName()}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Mevcut yapilar</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">Secili organizasyon agaci</h3>
          <div className="mt-6 space-y-4">
            {sites.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-500">
                Bu organizasyon icin henuz yerleske yok.
              </div>
            ) : (
              sites.map((site: SiteHierarchy) => (
                <div key={site.id} className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{site.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{site.code} - {enumLabel(site.siteType, siteTypeOptions)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700" onClick={() => onUpdateSite(site)} type="button">Duzenle</button>
                      <button className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700" onClick={() => onDeleteSite(site.id)} type="button">Sil</button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {site.buildings.map((building) => (
                      <div key={building.id} className="rounded-2xl border border-white bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{building.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{building.code} - {building.floors.length} kat</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700" onClick={() => onUpdateBuilding(building)} type="button">Duzenle</button>
                            <button className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700" onClick={() => onDeleteBuilding(building.id)} type="button">Sil</button>
                          </div>
                        </div>
                        {building.floors.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {building.floors.map((floor) => (
                              <span key={floor.id} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                {floor.code} - {floor.name}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </section>
  );
}
