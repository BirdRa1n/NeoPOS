import { formatCurrency } from '@/lib/utils/format';

interface SummaryLineProps {
  label: string;
  value: number;
  color: string;
  positive: boolean;
  isDark: boolean;
}

export function SummaryLine({ label, value, color, positive, isDark }: SummaryLineProps) {
  return (
    <div
      className="flex items-center justify-between px-3 py-3 rounded-xl"
      style={{
        background: isDark ? `${color}08` : `${color}05`,
        border: `1px solid ${color}18`,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      <span className="text-sm font-bold" style={{ color }}>
        {positive ? '+' : ''}{formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}
