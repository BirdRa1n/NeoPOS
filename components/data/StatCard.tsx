import { Card } from '../ui/Card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.FC<any>;
  color: string;
  subtitle?: string;
}

export function StatCard({ label, value, icon: Icon, color, subtitle }: StatCardProps) {
  return (
    <Card className="px-4 py-3 flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon size={15} style={{ color }} />
      </div>
      <div>
        <p className="text-lg font-bold leading-none text-[var(--text-primary)]">{value}</p>
        <p className="text-[11px] mt-0.5 text-[var(--text-muted)]">{label}</p>
        {subtitle && <p className="text-[10px] text-[var(--text-muted)]">{subtitle}</p>}
      </div>
    </Card>
  );
}
