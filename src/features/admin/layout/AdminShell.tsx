import type { ReactNode } from 'react';

type AdminShellProps = {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
};

export default function AdminShell({ sidebar, topbar, children }: AdminShellProps) {
  return (
    <div className="admin-shell min-h-screen text-slate-100">
      <div className="flex min-h-screen">
        {sidebar}
        <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6 xl:ml-[284px]">
          <div className="mx-auto max-w-[1480px] space-y-6">
            {topbar}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
