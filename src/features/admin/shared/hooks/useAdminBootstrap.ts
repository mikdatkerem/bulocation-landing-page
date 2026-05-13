import { useCallback, useEffect, useState } from 'react';
import {
  adminApi,
  getApiErrorMessage,
  isApiClientError,
  type AdminUserListItem,
  type OrganizationHierarchy,
  type OrganizationSummary,
  type PagedResult,
  type RoleDto,
  type UserProfile,
} from '../services/adminApi';
import type { Session } from '../types/admin.types';

type UseAdminBootstrapArgs = {
  session: Session | null;
  selectedOrganizationId: string;
  setSelectedOrganizationId: (value: string) => void;
  onBusyChange: (busy: boolean) => void;
  onError: (message: string | null) => void;
  onInvalidSession: () => void;
};

export default function useAdminBootstrap({
  session,
  selectedOrganizationId,
  setSelectedOrganizationId,
  onBusyChange,
  onError,
  onInvalidSession,
}: UseAdminBootstrapArgs) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [organizationHierarchy, setOrganizationHierarchy] = useState<OrganizationHierarchy | null>(null);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [usersPage, setUsersPage] = useState<PagedResult<AdminUserListItem> | null>(null);

  const refreshUsers = useCallback(
    async (
      activeSession: Session,
      isCurrentSuperAdmin = profile?.roles.some((role) => role.toLowerCase() === 'superadmin') ?? false,
    ) => {
      if (!isCurrentSuperAdmin) {
        setUsersPage(null);
        return;
      }

      const nextUsersPage = await adminApi.getAdminUsers(activeSession.accessToken);
      setUsersPage(nextUsersPage);
    },
    [profile],
  );

  const refreshHierarchy = useCallback(
    async (activeSession: Session, organizationId = selectedOrganizationId) => {
      if (!organizationId) {
        setOrganizationHierarchy(null);
        return;
      }

      const hierarchy = await adminApi.getOrganizationHierarchy(activeSession.accessToken, organizationId);
      setOrganizationHierarchy(hierarchy);
    },
    [selectedOrganizationId],
  );

  useEffect(() => {
    if (!session) {
      setProfile(null);
      setOrganizations([]);
      setOrganizationHierarchy(null);
      setRoles([]);
      setUsersPage(null);
    }
  }, [session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const activeSession = session;
    let cancelled = false;

    async function loadDashboard() {
      try {
        onBusyChange(true);
        onError(null);

        const [currentUser, organizationsResponse] = await Promise.all([
          adminApi.getCurrentUser(activeSession.accessToken),
          adminApi.getOrganizations(activeSession.accessToken),
        ]);
        const currentUserIsSuperAdmin = currentUser.roles.some((role) => role.toLowerCase() === 'superadmin');
        const [rolesResponse, usersResponse] = currentUserIsSuperAdmin
          ? await Promise.all([
              adminApi.getRoles(activeSession.accessToken),
              adminApi.getAdminUsers(activeSession.accessToken),
            ])
          : [[], null] satisfies [RoleDto[], PagedResult<AdminUserListItem> | null];

        if (cancelled) {
          return;
        }

        setProfile(currentUser);
        setOrganizations(organizationsResponse);
        setRoles(rolesResponse);
        setUsersPage(usersResponse);

        const nextOrganizationId = selectedOrganizationId || organizationsResponse[0]?.id || '';
        if (nextOrganizationId !== selectedOrganizationId) {
          setSelectedOrganizationId(nextOrganizationId);
        }

        if (nextOrganizationId) {
          const hierarchy = await adminApi.getOrganizationHierarchy(activeSession.accessToken, nextOrganizationId);
          if (!cancelled) {
            setOrganizationHierarchy(hierarchy);
          }
        } else {
          setOrganizationHierarchy(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          const message = getApiErrorMessage(loadError, 'Yonetim paneli yuklenemedi.');
          onError(message);

          if (
            isApiClientError(loadError) &&
            (loadError.status === 401 || loadError.status === 403 || loadError.code === 'invalid_token')
          ) {
            onInvalidSession();
          }
        }
      } finally {
        if (!cancelled) {
          onBusyChange(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [onBusyChange, onError, onInvalidSession, selectedOrganizationId, session, setSelectedOrganizationId]);

  useEffect(() => {
    if (!session || !selectedOrganizationId) {
      return;
    }

    const activeSession = session;
    let cancelled = false;

    async function loadHierarchy() {
      try {
        const hierarchy = await adminApi.getOrganizationHierarchy(activeSession.accessToken, selectedOrganizationId);
        if (!cancelled) {
          setOrganizationHierarchy(hierarchy);
        }
      } catch (loadError) {
        if (!cancelled) {
          onError(getApiErrorMessage(loadError, 'Organizasyon hiyerarsisi yuklenemedi.'));
        }
      }
    }

    void loadHierarchy();

    return () => {
      cancelled = true;
    };
  }, [onError, selectedOrganizationId, session]);

  return {
    profile,
    setProfile,
    organizations,
    setOrganizations,
    organizationHierarchy,
    setOrganizationHierarchy,
    roles,
    setRoles,
    usersPage,
    setUsersPage,
    refreshUsers,
    refreshHierarchy,
  };
}
