import type { ReactNode } from 'react';
import type { MapAsset, MapVersionEditor, OrganizationSummary } from '../shared/services/adminApi';
import type { MapVersionForm } from '../shared/types/admin.types';
import MapUploadPanel from './MapUploadPanel';
import MapVersionPanel from './MapVersionPanel';
import MapPublishPanel from './MapPublishPanel';

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

type VersionOption = {
  id: string;
  siteId: string;
  buildingId: string;
  floorId: string;
  floorCode: string;
  floorName: string;
  name: string;
  status: number | string;
};

type MapManagementProps = {
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
  selectedMapVersionId: string;
  filteredMapVersions: VersionOption[];
  mapEditor: MapVersionEditor | null;
  copiedNodeLinkType: string;
  selectedMapsiteFloorUrl: string;
  selectedMapsiteEmbedUrl: string;
  readinessContent: ReactNode;
  canvasContent: ReactNode;
  editorSidebarContent: ReactNode;
  onUploadAsset: (file: File | null) => void;
  onSelectOrganization: (value: string) => void;
  onSelectSite: (value: string) => void;
  onSelectBuilding: (value: string) => void;
  onSelectFloor: (value: string) => void;
  onMapVersionFormChange: (next: MapVersionForm) => void;
  onCreateMapVersion: () => void;
  onSelectVersion: (version: VersionOption) => void;
  onRenameVersion: (versionId: string, versionName: string) => void;
  onDuplicateVersion: (versionId: string, versionName: string) => void;
  onArchiveVersion: (versionId: string) => void;
  onDeleteVersion: (versionId: string) => void;
  onPublish: () => void;
  onCopyEmbedHeader: () => void;
  onCopyFloorLink: () => void;
  onCopyEmbedLink: () => void;
};

export default function MapManagement({
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
  selectedMapVersionId,
  filteredMapVersions,
  mapEditor,
  copiedNodeLinkType,
  selectedMapsiteFloorUrl,
  selectedMapsiteEmbedUrl,
  readinessContent,
  canvasContent,
  editorSidebarContent,
  onUploadAsset,
  onSelectOrganization,
  onSelectSite,
  onSelectBuilding,
  onSelectFloor,
  onMapVersionFormChange,
  onCreateMapVersion,
  onSelectVersion,
  onRenameVersion,
  onDuplicateVersion,
  onArchiveVersion,
  onDeleteVersion,
  onPublish,
  onCopyEmbedHeader,
  onCopyFloorLink,
  onCopyEmbedLink,
}: MapManagementProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-6">
        <MapUploadPanel
          busy={busy}
          uploadedAsset={uploadedAsset}
          organizations={organizations}
          selectedOrganizationId={selectedOrganizationId}
          selectedMapSiteId={selectedMapSiteId}
          selectedMapBuildingId={selectedMapBuildingId}
          mapSites={mapSites}
          mapBuildings={mapBuildings}
          mapFloors={mapFloors}
          mapVersionForm={mapVersionForm}
          onUploadAsset={onUploadAsset}
          onSelectOrganization={onSelectOrganization}
          onSelectSite={onSelectSite}
          onSelectBuilding={onSelectBuilding}
          onSelectFloor={onSelectFloor}
          onMapVersionFormChange={onMapVersionFormChange}
          onCreateMapVersion={onCreateMapVersion}
        />

        <MapVersionPanel
          selectedMapVersionId={selectedMapVersionId}
          filteredMapVersions={filteredMapVersions}
          onSelectVersion={onSelectVersion}
          onRename={onRenameVersion}
          onDuplicate={onDuplicateVersion}
          onArchive={onArchiveVersion}
          onDelete={onDeleteVersion}
        />
      </div>

      <div className="space-y-6">
        <MapPublishPanel
          busy={busy}
          mapEditor={mapEditor}
          copiedNodeLinkType={copiedNodeLinkType}
          selectedMapsiteFloorUrl={selectedMapsiteFloorUrl}
          selectedMapsiteEmbedUrl={selectedMapsiteEmbedUrl}
          readinessContent={readinessContent}
          onPublish={onPublish}
          onCopyEmbedHeader={onCopyEmbedHeader}
          onCopyFloorLink={onCopyFloorLink}
          onCopyEmbedLink={onCopyEmbedLink}
        />

        {canvasContent}
        {editorSidebarContent}
      </div>
    </section>
  );
}
