import { ChevronRight, LogOut, Map } from 'lucide-react';
import type { SidebarKey } from '../shared/types/admin.types';
import { sidebarItems } from '../shared/constants';

type AdminSidebarProps = {
  activeView: SidebarKey;
  visibleSidebarItems: typeof sidebarItems;
  profileName?: string | null;
  profileEmail?: string | null;
  onChangeView: (view: SidebarKey) => void;
  onLogout: () => void;
};

export default function AdminSidebar({
  activeView,
  visibleSidebarItems,
  profileName,
  profileEmail,
  onChangeView,
  onLogout,
}: AdminSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[284px] border-r border-[rgba(245,243,239,0.08)] bg-[#090b0d] px-6 py-8 xl:flex xl:flex-col">
      <div className="mb-10 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[8px] border border-[rgba(245,243,239,0.08)] bg-[#0d1013] text-[#F5F3EF]">
            <Map className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-[2rem] font-semibold tracking-[-0.04em] text-[#F5F3EF]">
              Bulocation
            </h1>
            <p className="mt-1 font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[#8f96a3]">
              Enterprise Admin
            </p>
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {visibleSidebarItems.map(({ key, label, icon: Icon }) => {
          const active = key === activeView;
          return (
            <button
              key={key}
              className={`flex w-full items-center gap-3 rounded-none border px-4 py-3 text-left text-sm transition ${
                active
                  ? 'border-[#1836B9] bg-[#0f141c] text-[#F5F3EF]'
                  : 'border-transparent text-[#8f96a3] hover:border-[rgba(245,243,239,0.08)] hover:bg-[#0d1013] hover:text-[#F5F3EF]'
              }`}
              onClick={() => onChangeView(key)}
              type="button"
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{label}</span>
              {active ? <ChevronRight className="ml-auto h-4 w-4" /> : null}
            </button>
          );
        })}
      </nav>

      <div className="admin-panel-card mt-auto p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[8px] border border-[rgba(245,243,239,0.08)] bg-[#0d1013] text-sm font-semibold text-[#F5F3EF]">
            {(profileName ?? 'A').slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#F5F3EF]">{profileName}</p>
            <p className="truncate text-xs text-[#8f96a3]">{profileEmail}</p>
          </div>
        </div>
        <button
          className="admin-action mt-4 flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold"
          onClick={onLogout}
          type="button"
        >
          <LogOut className="h-4 w-4" />
          Oturumu kapat
        </button>
      </div>
    </aside>
  );
}
