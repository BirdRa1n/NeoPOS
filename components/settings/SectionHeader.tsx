interface SectionHeaderProps {
  icon: React.FC<any>;
  label: string;
  color?: string;
  subtitle?: string;
}

export function SectionHeader({ icon: Icon, label, color = '#6366F1', subtitle }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg,${color},${color}99)` }}
      >
        <Icon size={16} color="#fff" />
      </div>
      <div>
        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {subtitle && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>
    </div>
  );
}
