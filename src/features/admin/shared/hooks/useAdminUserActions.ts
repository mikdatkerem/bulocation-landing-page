import type { Dispatch, SetStateAction } from 'react';
import { adminApi, type AdminUserListItem, type AdminUserSearchResult } from '../services/adminApi';
import type { Session, UserActionState } from '../types/admin.types';

type RunAction = (
  action: () => Promise<void>,
  successMessage: string,
  errorMessage?: string,
) => Promise<void>;

type UseAdminUserActionsArgs = {
  session: Session | null;
  isSuperAdmin: boolean;
  userActionState: UserActionState;
  selectedRoleUser: { email: string } | null;
  selectedOrganizationAdminOrganization: { name: string } | null;
  setUserSearchResults: Dispatch<SetStateAction<AdminUserSearchResult[]>>;
  refreshUsers: (activeSession: Session, isCurrentSuperAdmin?: boolean) => Promise<void>;
  runAction: RunAction;
};

export default function useAdminUserActions({
  session,
  isSuperAdmin,
  userActionState,
  selectedRoleUser,
  selectedOrganizationAdminOrganization,
  setUserSearchResults,
  refreshUsers,
  runAction,
}: UseAdminUserActionsArgs) {
  async function refreshUserSearchResults(activeSession: Session) {
    const search = userActionState.userSearchTerm.trim();
    if (!isSuperAdmin || search.length < 2) {
      setUserSearchResults([]);
      return;
    }

    const results = await adminApi.searchAdminUsers(activeSession.accessToken, search, 20);
    setUserSearchResults(results);
  }

  async function handleToggleUserStatus(user: AdminUserListItem) {
    if (!session) {
      return;
    }

    await runAction(async () => {
      await adminApi.setAdminUserStatus(session.accessToken, user.id, !user.isActive);
      await refreshUsers(session);
    }, 'Kullanici durumu guncellendi.');
  }

  async function handleDeleteOrRestoreUser(user: AdminUserListItem) {
    if (!session) {
      return;
    }

    await runAction(async () => {
      if (user.isDeleted) {
        await adminApi.restoreAdminUser(session.accessToken, user.id);
      } else {
        await adminApi.softDeleteAdminUser(session.accessToken, user.id);
      }
      await refreshUsers(session);
    }, user.isDeleted ? 'Kullanici geri yuklendi.' : 'Kullanici pasife alindi.');
  }

  async function handleAssignRole() {
    if (!session || !userActionState.selectedUserId || !userActionState.selectedRoleId) {
      return;
    }

    await runAction(async () => {
      await adminApi.assignRole(
        session.accessToken,
        userActionState.selectedUserId,
        userActionState.selectedRoleId,
      );
      await refreshUsers(session);
      await refreshUserSearchResults(session);
    }, 'Rol atandi.');
  }

  async function handleRemoveRole() {
    if (!session || !userActionState.selectedUserId || !userActionState.selectedRoleId) {
      return;
    }

    await runAction(async () => {
      await adminApi.removeRole(
        session.accessToken,
        userActionState.selectedUserId,
        userActionState.selectedRoleId,
      );
      await refreshUsers(session);
      await refreshUserSearchResults(session);
    }, 'Rol kaldirildi.');
  }

  async function handleAssignOrganizationAdmin() {
    if (
      !session ||
      !userActionState.selectedUserId ||
      !userActionState.selectedOrganizationAdminOrganizationId
    ) {
      return;
    }

    const organizationName = selectedOrganizationAdminOrganization?.name ?? 'secilen sirket';

    await runAction(async () => {
      await adminApi.assignOrganizationAdmin(
        session.accessToken,
        userActionState.selectedOrganizationAdminOrganizationId,
        userActionState.selectedUserId,
      );
      await Promise.all([
        refreshUsers(session),
        refreshUserSearchResults(session),
      ]);
    }, `${selectedRoleUser?.email ?? 'Kullanici'} ${organizationName} icin sirket admini yapildi.`);
  }

  return {
    refreshUserSearchResults,
    handleToggleUserStatus,
    handleDeleteOrRestoreUser,
    handleAssignRole,
    handleRemoveRole,
    handleAssignOrganizationAdmin,
  };
}
