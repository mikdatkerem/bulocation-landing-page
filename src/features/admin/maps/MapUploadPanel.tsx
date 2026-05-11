import { Upload } from 'lucide-react';
import type { MapAsset, OrganizationSummary } from '../shared/services/adminApi';
import type { MapVersionForm } from '../shared/types/admin.types';
import FieldShell from '../shared/components/FieldShell';
import SearchableSelect from '../shared/components/SearchableSelect';
import { inputClassName, sectionCardClassName, subtlePanelClassName } from '../shared/utils';

type SiteOption = {
  id: string;
  code: string;
  name: string;
};

type BuildingOption = {
  id: string;
  code: string;
  name: string;
  siteName: string;
};

type FloorOption = {
  id: string;
  code: string;
  name: string;
  buildingName: string;
};

type MapUploadPanelProps = {
  busy: boolean;
  uploadedAsset: MapAsset | null;
  organizations: OrganizationSummary[];
  selectedOrganizationId: string;
  selectedMapSiteId: string;
  selectedMapBuildingId: string;
  mapSites: SiteOption[];
  mapBuildings: BuildingOption[];
  mapFloors: FloorOption[];
  mapVersionForm: MapVersionForm;
  onUploadAsset: (file: File | null) => void;
  onSelectOrganization: (organizationId: string) => void;
  onSelectSite: (siteId: string) => void;
  onSelectBuilding: (buildingId: string) => void;
  onSelectFloor: (floorId: string) => void;
  onMapVersionFormChange: (next: MapVersionForm) => void;
  onCreateMapVersion: () => void;
};

export default function MapUploadPanel({
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
  onUploadAsset,
  onSelectOrganization,
  onSelectSite,
  onSelectBuilding,
  onSelectFloor,
  onMapVersionFormChange,
  onCreateMapVersion,
}: MapUploadPanelProps) {
  return (
    <>
      <div className={sectionCardClassName()}>
        <p className="admin-kicker">Harita dosyasi yukleme</p>
        <h3 className="admin-heading mt-2 text-2xl font-semibold">Kat krokisini depolamaya gonder</h3>
        <div className="mt-6 space-y-4">
          <FieldShell label="Dosya">
            <input
              className={inputClassName()}
              type="file"
              accept=".png,.jpg,.jpeg,.svg,.pdf"
              onChange={(event) => onUploadAsset(event.target.files?.[0] ?? null)}
            />
          </FieldShell>
          {uploadedAsset ? (
            <div className={`${subtlePanelClassName()} p-4 text-sm text-[#b5bcc7]`}>
              <p className="font-semibold text-white">{uploadedAsset.originalFileName}</p>
              <p className="mt-1">{uploadedAsset.relativePath}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className={sectionCardClassName()}>
        <p className="admin-kicker">Surum olustur</p>
        <h3 className="admin-heading mt-2 text-2xl font-semibold">Yayina hazir harita taslaklari</h3>
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
          <SearchableSelect
            label="Yerleske"
            value={selectedMapSiteId}
            options={mapSites.map((site) => ({
              value: site.id,
              label: site.name,
              hint: site.code,
            }))}
            placeholder="Yerleske ara"
            emptyText="Yerleske sec"
            onChange={onSelectSite}
          />
          <SearchableSelect
            label="Bina"
            value={selectedMapBuildingId}
            options={mapBuildings.map((building) => ({
              value: building.id,
              label: building.name,
              hint: `${building.code} · ${building.siteName}`,
            }))}
            placeholder="Bina ara"
            emptyText="Bina sec"
            onChange={onSelectBuilding}
          />
          <SearchableSelect
            label="Kat"
            value={mapVersionForm.floorId}
            options={mapFloors.map((floor) => ({
              value: floor.id,
              label: floor.name,
              hint: `${floor.code} · ${floor.buildingName}`,
            }))}
            placeholder="Kat ara"
            emptyText="Kat sec"
            onChange={onSelectFloor}
          />
          <FieldShell label="Surum adi">
            <input
              className={inputClassName()}
              value={mapVersionForm.name}
              onChange={(event) => onMapVersionFormChange({ ...mapVersionForm, name: event.target.value })}
            />
          </FieldShell>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldShell label="Genislik">
              <input
                className={inputClassName()}
                type="number"
                value={mapVersionForm.width}
                onChange={(event) =>
                  onMapVersionFormChange({ ...mapVersionForm, width: Number(event.target.value) })
                }
              />
            </FieldShell>
            <FieldShell label="Yukseklik">
              <input
                className={inputClassName()}
                type="number"
                value={mapVersionForm.height}
                onChange={(event) =>
                  onMapVersionFormChange({ ...mapVersionForm, height: Number(event.target.value) })
                }
              />
            </FieldShell>
          </div>
          <button
            className="admin-action admin-action-accent inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
            disabled={busy || !uploadedAsset || !mapVersionForm.floorId || !mapVersionForm.name.trim()}
            onClick={onCreateMapVersion}
            type="button"
          >
            <Upload className="h-4 w-4" />
            Harita surumu olustur
          </button>
        </div>
      </div>
    </>
  );
}
