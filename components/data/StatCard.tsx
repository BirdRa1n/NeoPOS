import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/lib/constants';

interface StatCardProps {
  label: string;
  value: string | number;
  /** Small subtitle text shown top-right (e.g. "12 pedidos" or "+8%") */
  sub?: string;
  icon: React.FC<any>;
  color: string;
  /** Optional trend indicator */
  trend?: 'up' | 'down' | 'neutral';
  /** Optional glow / background glow effect (used in FinanceView style) */
  glow?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  trend,
  glow = false,
  className = '',
}: StatCardProps) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;
  const trendColor =
    trend === 'up'
      ? COLORS.success
      : trend === 'down'
      ? COLORS.danger
      : 'var(--text-muted)';

  return (
    <Card
      className={`px-4 py-3 flex items-center gap-3 relative overflow-hidden ${className}`}
    >
      {glow && (
        <div
          className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.06] blur-2xl pointer-events-none"
          style={{ background: color, transform: 'translate(35%,-35%)' }}
        />
      )}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon size={15} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-lg font-bold leading-none text-[var(--text-primary)]">
          {value}
        </p>
        <p className="text-[11px] mt-0.5 text-[var(--text-muted)]">{label}</p>
      </div>
      {sub && (
        <div
          className="flex items-center gap-1 text-xs font-semibold shrink-0"
          style={{ color: trend ? trendColor : 'var(--text-muted)' }}
        >
          {trend && <TrendIcon size={12} />}
          {sub}
        </div>
      )}
    </Card>
  );
}
