import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';

interface NetRevenueRowProps {
  value: number;
  isDark: boolean;
}

export function NetRevenueRow({ value, isDark }: NetRevenueRowProps) {
  return (
    <div
      className="flex items-center justify-between px-3 py-4 rounded-xl"
      style={{
        background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.07)',
        border: '1px solid rgba(16,185,129,0.25)',
      }}
    >
      <div className="flex items-center gap-2">
        <TrendingUp size={16} style={{ color: '#10B981' }} />
        <span className="text-sm font-bold" style={{ color: isDark ? '#6EE7B7' : '#065F46' }}>
          Receita Líquida
        </span>
      </div>
      <span className="text-lg font-bold" style={{ color: '#10B981' }}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}
