import { Plus } from 'lucide-react';
import type { OrganizationHierarchy, OrganizationSummary } from '../shared/services/adminApi';
import CodeGuide from '../shared/components/CodeGuide';
import FieldShell from '../shared/components/FieldShell';
import {
  actionButtonClassName,
  inputClassName,
  rowCardClassName,
  sectionCardClassName,
  subtlePanelClassName,
} from '../shared/utils';

type OrganizationManagementProps = {
  organizations: OrganizationSummary[];
  selectedOrganizationId: string;
  organizationHierarchy: OrganizationHierarchy | null;
  organizationForm: { name: string; description: string };
  isSuperAdmin: boolean;
  busy: boolean;
  sitesCount: number;
  buildingsCount: number;
  camerasCount: number;
  onSelectOrganization: (organizationId: string) => void;
  onOrganizationFormChange: (next: { name: string; description: string }) => void;
  onCreateOrganization: () => void;
  onUpdateOrganization: (organization: OrganizationSummary) => void;
  onDeleteOrganization: (organizationId: string) => void;
};

export default function OrganizationManagement({
  organizations,
  selectedOrganizationId,
  organizationHierarchy,
  organizationForm,
  isSuperAdmin,
  busy,
  sitesCount,
  buildingsCount,
  camerasCount,
  onSelectOrganization,
  onOrganizationFormChange,
  onCreateOrganization,
  onUpdateOrganization,
  onDeleteOrganization,
}: OrganizationManagementProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className={sectionCardClassName()}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Organizasyon kayitlari</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Kurumsal sahiplik yapisi</h3>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
            {organizations.length} kayit
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {organizations.length === 0 ? (
            <div className="border border-dashed border-[#2b3d5f] bg-[#0d1422] p-5 text-sm text-slate-400">
              Henuz organizasyon yok.
            </div>
          ) : (
            organizations.map((organization) => {
              const active = organization.id === selectedOrganizationId;
              return (
                <button
                  key={organization.id}
                  className={rowCardClassName(active)}
                  onClick={() => onSelectOrganization(organization.id)}
                  type="button"
                >
                  <p className="text-sm font-semibold">{organization.name}</p>
                  <p className={`mt-2 text-xs leading-6 ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                    {organization.description || 'Aciklama yok'}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <span
                      className={actionButtonClassName('neutral')}
                      onClick={(event) => {
                        event.stopPropagation();
                        onUpdateOrganization(organization);
                      }}
                    >
                      Duzenle
                    </span>
                    {isSuperAdmin ? (
                      <span
                        className={actionButtonClassName('danger')}
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteOrganization(organization.id);
                        }}
                      >
                        Sil
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="space-y-6">
        {isSuperAdmin ? (
          <div className={sectionCardClassName()}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Organizasyon olustur</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Yeni kurum ekle</h3>
            <div className="mt-6 grid gap-4">
              <FieldShell label="Ad">
                <input
                  className={inputClassName()}
                  placeholder="Ornek: Acibadem Saglik Grubu"
                  value={organizationForm.name}
                  onChange={(event) =>
                    onOrganizationFormChange({ ...organizationForm, name: event.target.value })
                  }
                />
              </FieldShell>
              <FieldShell label="Aciklama">
                <textarea
                  className={`${inputClassName()} min-h-28 resize-y`}
                  placeholder="Bu organizasyonun kapsami ve yonetim notu"
                  value={organizationForm.description}
                  onChange={(event) =>
                    onOrganizationFormChange({ ...organizationForm, description: event.target.value })
                  }
                />
              </FieldShell>
              <CodeGuide>Organizasyon seviyesinde kod yok. Kod yapisi yerleske, bina, kat ve otopark seviyesinde kullanilir.</CodeGuide>
              <button
                className="inline-flex items-center justify-center gap-2 border border-[#38558a] bg-[#16233a] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                disabled={busy || !organizationForm.name.trim()}
                onClick={onCreateOrganization}
                type="button"
              >
                <Plus className="h-4 w-4" />
                Organizasyon olustur
              </button>
            </div>
          </div>
        ) : null}

        <div className={sectionCardClassName()}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Secili organizasyon</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{organizationHierarchy?.name || 'Bir organizasyon secin'}</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className={`${subtlePanelClassName()} p-4`}>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Yerleske</p>
              <p className="mt-2 text-2xl font-semibold text-white">{sitesCount}</p>
            </div>
            <div className={`${subtlePanelClassName()} p-4`}>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Bina</p>
              <p className="mt-2 text-2xl font-semibold text-white">{buildingsCount}</p>
            </div>
            <div className={`${subtlePanelClassName()} p-4`}>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Kamera</p>
              <p className="mt-2 text-2xl font-semibold text-white">{camerasCount}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
