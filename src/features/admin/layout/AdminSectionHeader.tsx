type AdminSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function AdminSectionHeader({
  eyebrow,
  title,
  description,
  action,
}: AdminSectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">{title}</h3>
        {description ? <p className="mt-2 text-sm text-slate-400">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
