import type { ComponentProps } from 'react';
import MapManagement from './MapManagement';
import MapPublishReadinessPanel from './MapPublishReadinessPanel';
import MapCanvas from './editor/MapCanvas';
import MapEditorSidebar from './editor/MapEditorSidebar';

type MapManagementBaseProps = Omit<
  ComponentProps<typeof MapManagement>,
  'canvasContent' | 'editorSidebarContent' | 'readinessContent'
>;

type AdminDashboardMapsSectionProps = {
  management: MapManagementBaseProps;
  publishReadiness: ComponentProps<typeof MapPublishReadinessPanel>['mapPublishReadiness'];
  canvas: ComponentProps<typeof MapCanvas> | null;
  sidebar: ComponentProps<typeof MapEditorSidebar>;
};

export default function AdminDashboardMapsSection({
  management,
  publishReadiness,
  canvas,
  sidebar,
}: AdminDashboardMapsSectionProps) {
  return (
    <MapManagement
      {...management}
      readinessContent={
        management.mapEditor ? <MapPublishReadinessPanel mapPublishReadiness={publishReadiness} /> : null
      }
      canvasContent={canvas ? <MapCanvas {...canvas} /> : null}
      editorSidebarContent={<MapEditorSidebar {...sidebar} />}
    />
  );
}
