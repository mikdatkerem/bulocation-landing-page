import type { FieldShellProps } from '../types/admin.types';

export default function FieldShell({ label, children }: FieldShellProps) {
  return (
    <label className="block">
      <span className="admin-kicker mb-2 block">{label}</span>
      {children}
    </label>
  );
}
