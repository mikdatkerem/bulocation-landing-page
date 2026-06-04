import type { ComponentProps } from 'react';
import CameraManagement from './CameraManagement';
import CameraZoneCanvas from './CameraZoneCanvas';

type CameraManagementBaseProps = Omit<ComponentProps<typeof CameraManagement>, 'cameraZoneCanvas'>;

type AdminDashboardCamerasSectionProps = {
  management: CameraManagementBaseProps;
  canvas: ComponentProps<typeof CameraZoneCanvas>;
};

export default function AdminDashboardCamerasSection({
  management,
  canvas,
}: AdminDashboardCamerasSectionProps) {
  return (
    <CameraManagement
      {...management}
      cameraZoneCanvas={<CameraZoneCanvas {...canvas} />}
    />
  );
}
