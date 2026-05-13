import type { RoleDto, UserProfile } from '../shared/services/adminApi';
import { formatDate, sectionCardClassName } from '../shared/utils';

type SecurityOverviewProps = {
  profile: UserProfile | null;
  roles: RoleDto[];
};

export default function SecurityOverview({ profile, roles }: SecurityOverviewProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[34px] border border-slate-200/80 bg-slate-950 p-6 text-white shadow-[0_26px_70px_rgba(15,23,42,0.34)] lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200/80">Proxy ve oturum</p>
        <h3 className="mt-2 text-2xl font-semibold">Operasyonel guvenlik gorunumu</h3>
        <div className="mt-6 grid gap-4">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Proxy tarafindan eklenen uygulama gizli anahtari</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Yonetim paneli `/admin-api` yolunu cagirir ve proxy katmani `x-app-secret` ekler. Tarayici bundle&apos;i
              uygulama gizli anahtarini hicbir zaman icermez.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">JWT rol kapisi</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Yonetici islemleri dogrulanmis JWT oturumu ve backend admin politikasi gerektirir.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Guncel operator</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {profile?.fullName || 'Bilinmiyor'} / {profile?.email || 'Oturum yok'}
            </p>
          </div>
        </div>
      </div>

      <div className={sectionCardClassName()}>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Rol katalogu</p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-950">Yetkilendirme yuzeyleri</h3>
        <div className="mt-6 grid gap-3">
          {roles.map((role) => (
            <div key={role.id} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{role.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{role.description}</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  {role.isSystemRole ? 'Sistem' : 'Ozel'}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-400">Olusturulma: {formatDate(role.createdAt)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
