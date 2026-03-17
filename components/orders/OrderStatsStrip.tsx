import { ShoppingCart, Clock, Truck, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface OrderStatsStripProps {
  total: number;
  pending: number;
  delivering: number;
  done: number;
}

export function OrderStatsStrip({ total, pending, delivering, done }: OrderStatsStripProps) {
  const stats = [
    { label: 'Visíveis',   value: total,      color: '#6366F1', icon: ShoppingCart },
    { label: 'Pendentes',  value: pending,    color: '#F59E0B', icon: Clock },
    { label: 'Em entrega', value: delivering, color: '#6366F1', icon: Truck },
    { label: 'Entregues',  value: done,       color: '#10B981', icon: CheckCircle2 },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ label, value, color, icon: Icon }) => (
        <Card key={label} className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
            <Icon size={15} style={{ color }} />
          </div>
          <div>
            <p className="text-lg font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
