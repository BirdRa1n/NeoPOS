import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.FC<any>;
  accent: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricCard({ label, value, sub, icon: Icon, accent, trend }: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;
  const trendColor = trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : 'var(--text-muted)';
  
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
      <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-[0.07] blur-2xl pointer-events-none"
        style={{ background: accent, transform: 'translate(35%,-35%)' }} />
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
          <Icon size={17} style={{ color: accent }} />
        </div>
        {sub && (
          <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: trendColor }}>
            <TrendIcon size={12} />{sub}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}
