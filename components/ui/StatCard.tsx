interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.FC<any>;
  color: string;
}

export function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--surface-box)',
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon size={15} style={{ color }} />
      </div>
      <div>
        <p className="text-lg font-bold leading-none text-[var(--text-primary)]">{value}</p>
        <p className="text-[11px] mt-0.5 text-[var(--text-muted)]">{label}</p>
      </div>
    </div>
  );
}
