import { useEffect, useMemo, useState } from 'react';
import { adminApi, getApiErrorMessage, type AdminUserListItem, type AdminUserSearchResult, type OrganizationSummary, type RoleDto } from '../services/adminApi';
import type { Session, UserActionState } from '../types/admin.types';

type UseAdminUserManagementArgs = {
  session: Session | null;
  isSuperAdmin: boolean;
  organizations: OrganizationSummary[];
  users: AdminUserListItem[];
  assignableRoles: RoleDto[];
  onError: (message: string) => void;
};

export default function useAdminUserManagement({
  session,
  isSuperAdmin,
  organizations,
  users,
  assignableRoles,
  onError,
}: UseAdminUserManagementArgs) {
  const [userActionState, setUserActionState] = useState<UserActionState>({
    selectedUserId: '',
    selectedRoleId: '',
    userSearchTerm: '',
    organizationSearchTerm: '',
    selectedOrganizationAdminOrganizationId: '',
  });
  const [userSearchResults, setUserSearchResults] = useState<AdminUserSearchResult[]>([]);

  const selectedRoleUser = useMemo(
    () =>
      userSearchResults.find((user) => user.id === userActionState.selectedUserId) ??
      users.find((user) => user.id === userActionState.selectedUserId) ??
      null,
    [userActionState.selectedUserId, userSearchResults, users],
  );

  const organizationSearchResults = useMemo(() => {
    const search = userActionState.organizationSearchTerm.trim().toLocaleLowerCase('tr-TR');
    if (search.length < 2) {
      return [] as OrganizationSummary[];
    }

    return organizations
      .filter((organization) => {
        const name = organization.name.toLocaleLowerCase('tr-TR');
        const description = organization.description?.toLocaleLowerCase('tr-TR') ?? '';
        return name.includes(search) || description.includes(search);
      })
      .slice(0, 12);
  }, [organizations, userActionState.organizationSearchTerm]);

  const selectedOrganizationAdminOrganization = useMemo(
    () =>
      organizations.find(
        (organization) => organization.id === userActionState.selectedOrganizationAdminOrganizationId,
      ) ?? null,
    [organizations, userActionState.selectedOrganizationAdminOrganizationId],
  );

  useEffect(() => {
    if (assignableRoles.length === 0) {
      return;
    }

    setUserActionState((current) => ({
      ...current,
      selectedRoleId: assignableRoles.some((role) => role.id === current.selectedRoleId)
        ? current.selectedRoleId
        : assignableRoles[0].id,
    }));
  }, [assignableRoles]);

  useEffect(() => {
    if (!session || !isSuperAdmin) {
      setUserSearchResults([]);
      return;
    }

    const search = userActionState.userSearchTerm.trim();
    if (search.length < 2) {
      setUserSearchResults([]);
      return;
    }

    const activeSession = session;
    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      try {
        const results = await adminApi.searchAdminUsers(activeSession.accessToken, search, 20);
        if (!cancelled) {
          setUserSearchResults(results);
        }
      } catch (searchError) {
        if (!cancelled) {
          onError(getApiErrorMessage(searchError, 'Kullanici aramasi yapilamadi.'));
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [isSuperAdmin, onError, session, userActionState.userSearchTerm]);

  return {
    userActionState,
    setUserActionState,
    userSearchResults,
    setUserSearchResults,
    selectedRoleUser,
    organizationSearchResults,
    selectedOrganizationAdminOrganization,
  };
}
