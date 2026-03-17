interface StockQuantityCellProps {
  quantity: number;
  isLow: boolean;
  pct: number;
}

export function StockQuantityCell({ quantity, isLow, pct }: StockQuantityCellProps) {
  return (
    <div>
      <span className="font-bold text-sm" style={{ color: isLow ? '#EF4444' : 'var(--text-primary)' }}>
        {quantity}
      </span>
      <div className="mt-1 h-1 w-16 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: isLow ? '#EF4444' : '#10B981' }}
        />
      </div>
    </div>
  );
}
