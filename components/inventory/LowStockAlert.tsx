import { AlertTriangle } from 'lucide-react';

interface LowStockAlertProps {
  items: { name: string }[];
  isDark: boolean;
}

export function LowStockAlert({ items, isDark }: LowStockAlertProps) {
  if (items.length === 0) return null;

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)',
        border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.15)'}`,
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)' }}
      >
        <AlertTriangle size={16} style={{ color: '#EF4444' }} />
      </div>
      <div>
        <p className="text-sm font-bold" style={{ color: isDark ? '#FCA5A5' : '#991B1B' }}>
          {items.length} {items.length === 1 ? 'item abaixo' : 'itens abaixo'} do estoque mínimo
        </p>
        <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(252,165,165,0.7)' : '#B91C1C' }}>
          {items.map(s => s.name).slice(0, 4).join(', ')}
          {items.length > 4 ? ` e mais ${items.length - 4}...` : ''}
        </p>
      </div>
    </div>
  );
}
