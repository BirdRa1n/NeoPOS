import { Package, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';

interface InventoryStatsStripProps {
  totalItems: number;
  lowStockCount: number;
  totalValue: number;
}

export function InventoryStatsStrip({ totalItems, lowStockCount, totalValue }: InventoryStatsStripProps) {
  const stats = [
    { label: 'Total de Itens', value: totalItems, color: '#6366F1', icon: Package },
    { label: 'Estoque Baixo', value: lowStockCount, color: '#EF4444', icon: AlertTriangle },
    { label: 'Valor em Estoque', value: formatCurrency(totalValue), color: '#10B981', icon: DollarSign },
    { label: 'Itens OK', value: totalItems - lowStockCount, color: '#F59E0B', icon: BarChart3 },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ label, value, color, icon: Icon }) => (
        <div
          key={label}
          className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
            <Icon size={15} style={{ color }} />
          </div>
          <div>
            <p className="text-lg font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
