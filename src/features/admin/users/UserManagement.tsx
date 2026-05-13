import FieldShell from '../shared/components/FieldShell';
import type {
  AdminUserListItem,
  AdminUserSearchResult,
  OrganizationSummary,
  PagedResult,
  RoleDto,
} from '../shared/services/adminApi';
import type { UserActionState } from '../shared/types/admin.types';
import { inputClassName, sectionCardClassName, selectClassName } from '../shared/utils';

type UserManagementProps = {
  busy: boolean;
  usersPage: PagedResult<AdminUserListItem> | null;
  users: AdminUserListItem[];
  userSearchResults: AdminUserSearchResult[];
  selectedRoleUser: AdminUserSearchResult | null;
  organizationSearchResults: OrganizationSummary[];
  selectedOrganizationAdminOrganization: OrganizationSummary | null;
  userActionState: UserActionState;
  assignableRoles: RoleDto[];
  onUserActionStateChange: (updater: (current: UserActionState) => UserActionState) => void;
  onToggleUserStatus: (user: AdminUserListItem) => void;
  onDeleteOrRestoreUser: (user: AdminUserListItem) => void;
  onAssignOrganizationAdmin: () => void;
  onAssignRole: () => void;
  onRemoveRole: () => void;
};

export default function UserManagement({
  busy,
  usersPage,
  users,
  userSearchResults,
  selectedRoleUser,
  organizationSearchResults,
  selectedOrganizationAdminOrganization,
  userActionState,
  assignableRoles,
  onUserActionStateChange,
  onToggleUserStatus,
  onDeleteOrRestoreUser,
  onAssignOrganizationAdmin,
  onAssignRole,
  onRemoveRole,
}: UserManagementProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className={sectionCardClassName()}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Kullanici islemleri</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Durum ve yasam dongusu</h3>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
            {usersPage?.totalCount ?? 0} toplam
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {users.map((user) => (
            <div key={user.id} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.isDeleted
                        ? 'bg-rose-100 text-rose-700'
                        : user.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {user.isDeleted ? 'Silinmis' : user.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                  <button
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                    onClick={() => onToggleUserStatus(user)}
                    type="button"
                  >
                    {user.isActive ? 'Pasif yap' : 'Aktif yap'}
                  </button>
                  <button
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                    onClick={() => onDeleteOrRestoreUser(user)}
                    type="button"
                  >
                    {user.isDeleted ? 'Geri yukle' : 'Sil'}
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {user.roles.filter((role) => role.toLowerCase() !== 'admin').map((role) => (
                  <span
                    key={`${user.id}-${role}`}
                    className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={sectionCardClassName()}>
        <p className="admin-kicker">Yetki atama</p>
        <h3 className="admin-heading mt-2 text-2xl font-semibold">Kullanici ara ve sirket yetkisi ver</h3>
        <p className="mt-2 text-sm leading-6 text-[#8f96a3]">
          Bu ekran yalnizca SuperAdmin tarafindan kullanilir. Once kullaniciyi, sonra sirketi sec; atama sonrasi
          kullanici sadece o sirketin panel verilerini gorur.
        </p>

        <div className="mt-6 grid gap-4">
          <FieldShell label="Kullanici ara">
            <input
              className={inputClassName()}
              placeholder="E-posta, kullanici adi, ad veya soyad"
              value={userActionState.userSearchTerm}
              onChange={(event) =>
                onUserActionStateChange((current) => ({
                  ...current,
                  userSearchTerm: event.target.value,
                  selectedUserId: '',
                }))
              }
            />
          </FieldShell>

          <div className="grid gap-2">
            {userActionState.userSearchTerm.trim().length < 2 ? (
              <div className="admin-panel-subtle border-dashed p-4 text-sm text-[#8f96a3]">
                Arama icin en az 2 karakter yaz.
              </div>
            ) : userSearchResults.length === 0 ? (
              <div className="admin-panel-subtle border-dashed p-4 text-sm text-[#8f96a3]">
                Eslesen kullanici bulunamadi.
              </div>
            ) : (
              userSearchResults.map((user) => {
                const selected = user.id === userActionState.selectedUserId;
                const visibleRoles = user.roles.filter((role) => role.toLowerCase() !== 'admin');
                return (
                  <button
                    key={user.id}
                    className={`admin-action flex items-center justify-between gap-4 px-4 py-3 text-left transition ${
                      selected ? 'admin-action-accent' : ''
                    }`}
                    onClick={() =>
                      onUserActionStateChange((current) => ({
                        ...current,
                        selectedUserId: user.id,
                      }))
                    }
                    type="button"
                  >
                    <span>
                      <span className="block text-sm font-semibold">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="mt-1 block text-xs text-[#8f96a3]">{user.email}</span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {visibleRoles.length === 0 ? (
                          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[#8f96a3]">
                            Rol yok
                          </span>
                        ) : (
                          visibleRoles.map((role) => (
                            <span
                              key={`${user.id}-${role}`}
                              className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[#d7d2ca]"
                            >
                              {role}
                            </span>
                          ))
                        )}
                      </span>
                    </span>
                    <span className="text-xs uppercase tracking-[0.16em] text-[#8f96a3]">
                      {selected ? 'Secildi' : 'Sec'}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {selectedRoleUser ? (
            <div className="admin-panel-subtle p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f96a3]">Secili kullanici</p>
              <p className="mt-2 text-sm font-semibold text-[#f5f3ef]">
                {selectedRoleUser.firstName} {selectedRoleUser.lastName}
              </p>
              <p className="mt-1 text-xs text-[#8f96a3]">{selectedRoleUser.email}</p>
            </div>
          ) : null}

          <div className="admin-panel-subtle border-dashed p-4">
            <p className="admin-kicker">Sirket admini atama</p>
            <div className="mt-4 grid gap-4">
              <FieldShell label="Sirket ara">
                <input
                  className={inputClassName()}
                  placeholder="Organizasyon veya aciklama ara"
                  value={userActionState.organizationSearchTerm}
                  onChange={(event) =>
                    onUserActionStateChange((current) => ({
                      ...current,
                      organizationSearchTerm: event.target.value,
                      selectedOrganizationAdminOrganizationId: '',
                    }))
                  }
                />
              </FieldShell>

              <div className="grid gap-2">
                {userActionState.organizationSearchTerm.trim().length < 2 ? (
                  <div className="admin-panel-subtle border-dashed p-4 text-sm text-[#8f96a3]">
                    Sirket aramak icin en az 2 karakter yaz.
                  </div>
                ) : organizationSearchResults.length === 0 ? (
                  <div className="admin-panel-subtle border-dashed p-4 text-sm text-[#8f96a3]">
                    Eslesen sirket bulunamadi.
                  </div>
                ) : (
                  organizationSearchResults.map((organization) => {
                    const selected =
                      organization.id === userActionState.selectedOrganizationAdminOrganizationId;
                    return (
                      <button
                        key={organization.id}
                        className={`admin-action flex items-center justify-between gap-4 px-4 py-3 text-left transition ${
                          selected ? 'admin-action-accent' : ''
                        }`}
                        onClick={() =>
                          onUserActionStateChange((current) => ({
                            ...current,
                            selectedOrganizationAdminOrganizationId: organization.id,
                          }))
                        }
                        type="button"
                      >
                        <span>
                          <span className="block text-sm font-semibold">{organization.name}</span>
                          <span className="mt-1 block text-xs text-[#8f96a3]">
                            {organization.description || 'Aciklama yok'}
                          </span>
                        </span>
                        <span className="text-xs uppercase tracking-[0.16em] text-[#8f96a3]">
                          {selected ? 'Secildi' : 'Sec'}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {selectedOrganizationAdminOrganization ? (
                <div className="admin-panel-subtle p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f96a3]">
                    Secili sirket
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#f5f3ef]">
                    {selectedOrganizationAdminOrganization.name}
                  </p>
                  <p className="mt-1 text-xs text-[#8f96a3]">
                    {selectedOrganizationAdminOrganization.description || 'Aciklama yok'}
                  </p>
                </div>
              ) : null}

              <button
                className="admin-action admin-action-accent inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
                disabled={
                  busy ||
                  !userActionState.selectedUserId ||
                  !userActionState.selectedOrganizationAdminOrganizationId
                }
                onClick={onAssignOrganizationAdmin}
                type="button"
              >
                Secili kullaniciyi bu sirketin admini yap
              </button>
            </div>
          </div>

          <FieldShell label="Rol">
            <select
              className={selectClassName()}
              value={userActionState.selectedRoleId}
              onChange={(event) =>
                onUserActionStateChange((current) => ({ ...current, selectedRoleId: event.target.value }))
              }
            >
              <option value="">Rol sec</option>
              {assignableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </FieldShell>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className="admin-action admin-action-accent inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
              disabled={busy || !userActionState.selectedUserId || !userActionState.selectedRoleId}
              onClick={onAssignRole}
              type="button"
            >
              Rol ata
            </button>
            <button
              className="admin-action inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
              disabled={busy || !userActionState.selectedUserId || !userActionState.selectedRoleId}
              onClick={onRemoveRole}
              type="button"
            >
              Rolu kaldir
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
