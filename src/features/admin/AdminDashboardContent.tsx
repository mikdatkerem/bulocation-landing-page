import type { ComponentProps } from 'react';
import DashboardOverview from './dashboard/DashboardOverview';
import OrganizationManagement from './organizations/OrganizationManagement';
import FacilitiesManagement from './organizations/FacilitiesManagement';
import ParkingManagement from './organizations/ParkingManagement';
import AdminDashboardCamerasSection from './cameras/AdminDashboardCamerasSection';
import UserManagement from './users/UserManagement';
import SecurityOverview from './security/SecurityOverview';
import AdminDashboardMapsSection from './maps/AdminDashboardMapsSection';
import type { SidebarKey } from './shared/types/admin.types';

type AdminDashboardContentProps = {
  activeView: SidebarKey;
  isSuperAdmin: boolean;
  overview: ComponentProps<typeof DashboardOverview>;
  organizations: ComponentProps<typeof OrganizationManagement>;
  facilities: ComponentProps<typeof FacilitiesManagement>;
  parking: ComponentProps<typeof ParkingManagement>;
  maps: ComponentProps<typeof AdminDashboardMapsSection>;
  cameras: ComponentProps<typeof AdminDashboardCamerasSection>;
  users: ComponentProps<typeof UserManagement>;
  security: ComponentProps<typeof SecurityOverview>;
};

export default function AdminDashboardContent({
  activeView,
  isSuperAdmin,
  overview,
  organizations,
  facilities,
  parking,
  maps,
  cameras,
  users,
  security,
}: AdminDashboardContentProps) {
  return (
    <>
      {activeView === 'overview' ? <DashboardOverview {...overview} /> : null}
      {activeView === 'organizations' ? <OrganizationManagement {...organizations} /> : null}
      {activeView === 'facilities' ? <FacilitiesManagement {...facilities} /> : null}
      {activeView === 'parking' ? <ParkingManagement {...parking} /> : null}
      {activeView === 'maps' ? <AdminDashboardMapsSection {...maps} /> : null}
      {activeView === 'cameras' ? <AdminDashboardCamerasSection {...cameras} /> : null}
      {isSuperAdmin && activeView === 'users' ? <UserManagement {...users} /> : null}
      {isSuperAdmin && activeView === 'security' ? <SecurityOverview {...security} /> : null}
    </>
  );
}
