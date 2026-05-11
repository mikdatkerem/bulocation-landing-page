import { ChevronRight } from 'lucide-react';
import type { SidebarKey } from '../shared/types/admin.types';
import { subtlePanelClassName, sectionCardClassName } from '../shared/utils';

type DashboardOverviewProps = {
  organizationName?: string | null;
  organizationDescription?: string | null;
  profileName?: string | null;
  profileEmail?: string | null;
  onChangeView: (view: SidebarKey) => void;
};

export default function DashboardOverview({
  organizationName,
  organizationDescription,
  profileName,
  profileEmail,
  onChangeView,
}: DashboardOverviewProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className={sectionCardClassName()}>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Durum ozeti</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Secili operasyon resmi</h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className={`${subtlePanelClassName()} p-4`}>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Secili organizasyon</p>
            <p className="mt-2 text-lg font-semibold text-white">{organizationName || 'Secim yok'}</p>
            <p className="mt-2 text-sm text-slate-400">
              {organizationDescription || 'Detay icin organizasyonlar sekmesini kullanin.'}
            </p>
          </div>
          <div className={`${subtlePanelClassName()} p-4`}>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Yonetici hesabi</p>
            <p className="mt-2 text-lg font-semibold text-white">{profileName || 'Bilinmiyor'}</p>
            <p className="mt-2 text-sm text-slate-400">{profileEmail || 'Oturum yok'}</p>
          </div>
        </div>
      </div>

      <div className={sectionCardClassName()}>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Hizli gecis</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Siradaki islem</h3>
        <div className="mt-6 space-y-3">
          {[
            ['organizations', 'Organizasyonlar', 'Kurumsal sahiplik ve secim'],
            ['facilities', 'Tesisler', 'Yerleske, bina ve kat yapisi'],
            ['maps', 'Haritalar', 'Kroki surumleri ve editor'],
            ['cameras', 'Kameralar', 'Canli izleme cihazi ve bolge baglari'],
          ].map(([key, title, text]) => (
            <button
              key={key}
              className={`flex w-full items-center justify-between px-4 py-4 text-left ${subtlePanelClassName()}`}
              onClick={() => onChangeView(key as SidebarKey)}
              type="button"
            >
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs text-slate-400">{text}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
