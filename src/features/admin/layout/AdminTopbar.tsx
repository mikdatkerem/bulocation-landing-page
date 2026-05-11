import { Bell, HelpCircle } from 'lucide-react';
import type { SidebarKey } from '../shared/types/admin.types';

type AdminTopbarTab = {
  key: SidebarKey;
  label: string;
  active: boolean;
};

type AdminTopbarProps = {
  tabs: AdminTopbarTab[];
  onChangeView: (view: SidebarKey) => void;
};

export default function AdminTopbar({ tabs, onChangeView }: AdminTopbarProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(245,243,239,0.08)] pb-5">
      <div className="flex flex-wrap items-center gap-6">
        <nav className="flex items-center gap-8">
          {tabs.map((tab) => (
            <button
              key={`${tab.key}-${tab.label}`}
              className={`border-b-2 pb-1 text-sm font-semibold ${
                tab.active
                  ? 'border-[#1836B9] text-[#F5F3EF]'
                  : 'border-transparent text-[#8f96a3]'
              }`}
              onClick={() => onChangeView(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <button className="admin-action flex h-11 w-11 items-center justify-center" type="button">
          <Bell className="h-4 w-4" />
        </button>
        <button className="admin-action flex h-11 w-11 items-center justify-center" type="button">
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
