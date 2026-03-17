interface StockStatusBadgeProps {
  isLow: boolean;
  isDark: boolean;
}

export function StockStatusBadge({ isLow, isDark }: StockStatusBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{
        background: isLow
          ? (isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)')
          : (isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)'),
        color: isLow
          ? (isDark ? '#FCA5A5' : '#991B1B')
          : (isDark ? '#6EE7B7' : '#065F46'),
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: isLow ? '#EF4444' : '#10B981' }} />
      {isLow ? 'Baixo' : 'Normal'}
    </span>
  );
}
