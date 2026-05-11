import type { ReactNode } from 'react';

export default function CodeGuide({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-5 text-slate-400">{children}</p>;
}
