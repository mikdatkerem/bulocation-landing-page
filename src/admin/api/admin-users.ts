import { request } from './client';
import type {
  AdminUserListItem,
  AdminUserSearchResult,
  OrganizationAdmin,
  PagedResult,
  RoleDto,
} from './types';

export const adminUsersApi = {
  getRoles: (token: string) => request<RoleDto[]>('/api/roles', {}, token),

  getAdminUsers: (token: string) =>
    request<PagedResult<AdminUserListItem>>('/api/admin/users?pageNumber=1&pageSize=10', {}, token),

  searchAdminUsers: (token: string, search: string, limit = 20) =>
    request<AdminUserSearchResult[]>(
      `/api/admin/users/search?search=${encodeURIComponent(search)}&limit=${limit}`,
      {},
      token,
    ),

  getAdminUser: (token: string, userId: string) =>
    request<AdminUserListItem & { updatedAt?: string | null; deletedAt?: string | null }>(
      `/api/admin/users/${userId}`,
      {},
      token,
    ),

  setAdminUserStatus: (token: string, userId: string, isActive: boolean) =>
    request<void>(
      `/api/admin/users/${userId}/status`,
      { method: 'PATCH', body: JSON.stringify({ isActive }) },
      token,
    ),

  softDeleteAdminUser: (token: string, userId: string) =>
    request<void>(`/api/admin/users/${userId}`, { method: 'DELETE' }, token),

  restoreAdminUser: (token: string, userId: string) =>
    request<void>(`/api/admin/users/${userId}/restore`, { method: 'POST' }, token),

  assignRole: (token: string, userId: string, roleId: string) =>
    request<void>(
      `/api/admin/users/${userId}/roles`,
      { method: 'POST', body: JSON.stringify({ roleId }) },
      token,
    ),

  removeRole: (token: string, userId: string, roleId: string) =>
    request<void>(`/api/admin/users/${userId}/roles/${roleId}`, { method: 'DELETE' }, token),

  getOrganizationAdmins: (token: string, organizationId: string) =>
    request<OrganizationAdmin[]>(`/api/admin/organizations/${organizationId}/admins`, {}, token),

  assignOrganizationAdmin: (token: string, organizationId: string, userId: string) =>
    request<void>(
      `/api/admin/organizations/${organizationId}/admins`,
      { method: 'POST', body: JSON.stringify({ userId }) },
      token,
    ),

  removeOrganizationAdmin: (token: string, organizationId: string, userId: string) =>
    request<void>(`/api/admin/organizations/${organizationId}/admins/${userId}`, { method: 'DELETE' }, token),
};
