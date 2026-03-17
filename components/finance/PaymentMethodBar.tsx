import { formatCurrency } from '@/lib/utils/format';
import { PaymentMethodItem } from '@/types/finance';

export function PaymentMethodBar({ label, value, color, icon: Icon, pct }: PaymentMethodItem) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `${color}18` }}
          >
            <Icon size={15} style={{ color }} />
          </div>
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(value)}
          </span>
          <span className="text-xs font-semibold w-10 text-right" style={{ color }}>
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bar-track)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>
    </div>
  );
}
