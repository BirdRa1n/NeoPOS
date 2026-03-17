import { BarChart3 } from 'lucide-react';
import { DailySummary } from '@/types/database';
import { formatCurrency, formatDate } from '@/lib/utils/format';

const HEADERS = ['Data', 'Pedidos', 'Receita Bruta', 'Descontos', 'Taxa Entrega', 'Líquido'];

interface DailyHistoryTableProps {
  summaries: DailySummary[];
  isDark: boolean;
}

export function DailyHistoryTable({ summaries, isDark }: DailyHistoryTableProps) {
  if (summaries.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 gap-3">
        <BarChart3 size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Sem dados para o período selecionado
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {HEADERS.map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--text-label)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {summaries.map((s) => (
            <tr
              key={s.id}
              className="transition-colors"
              style={{ borderBottom: '1px solid var(--border-soft)' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--text-primary)' }}>
                {formatDate(s.date)}
              </td>
              <td className="px-5 py-3.5">
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-bold"
                  style={{
                    background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
                    color: '#818CF8',
                  }}
                >
                  {s.total_orders}
                </span>
              </td>
              <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(s.gross_revenue)}
              </td>
              <td className="px-5 py-3.5" style={{ color: isDark ? '#FCA5A5' : '#DC2626' }}>
                {formatCurrency((s as any).total_discounts ?? (s as any).total_discount ?? 0)}
              </td>
              <td className="px-5 py-3.5" style={{ color: isDark ? '#FCD34D' : '#D97706' }}>
                {formatCurrency(s.total_delivery_fees)}
              </td>
              <td className="px-5 py-3.5 font-bold" style={{ color: '#10B981' }}>
                {formatCurrency(s.net_revenue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
