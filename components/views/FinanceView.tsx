import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useDailySummaries } from '@/hooks/useFinance';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { StatCard } from '@/components/data/StatCard';
import { SectionCard } from '@/components/dashboard/SectionCard';
import { PeriodSelector } from '@/components/ui/PeriodSelector';
import { ViewLoadingSpinner } from '@/components/ui/ViewLoadingSpinner';
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard,
  Banknote, Smartphone, Calendar, BarChart3, Receipt,
} from 'lucide-react';

type Period = 'today' | 'week' | 'month';
const PERIOD_DAYS: Record<Period, number> = { today: 1, week: 7, month: 30 };
const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hoje',
  week: 'Esta Semana',
  month: 'Este Mês',
};

interface PaymentMethodBarProps {
  label: string;
  value: number;
  color: string;
  icon: React.FC<any>;
  pct: number;
}

function PaymentMethodBar({ label, value, color, icon: Icon, pct }: PaymentMethodBarProps) {
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
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}99, ${color})`,
          }}
        />
      </div>
    </div>
  );
}

interface SummaryLineProps {
  label: string;
  value: number;
  color: string;
  positive: boolean;
  isDark: boolean;
}

function SummaryLine({ label, value, color, positive, isDark }: SummaryLineProps) {
  return (
    <div
      className="flex items-center justify-between px-3 py-3 rounded-xl"
      style={{
        background: isDark ? `${color}08` : `${color}05`,
        border: `1px solid ${color}18`,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
      </div>
      <span className="text-sm font-bold" style={{ color }}>
        {positive ? '+' : ''}
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}

export function FinanceView() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [period, setPeriod] = useState<Period>('today');

  const days = PERIOD_DAYS[period];
  const startDate = new Date(Date.now() - (days - 1) * 86400000)
    .toISOString()
    .split('T')[0];
  const { summaries, loading } = useDailySummaries(startDate);

  const totals = summaries.reduce(
    (acc, s) => ({
      orders: acc.orders + (s.total_orders ?? 0),
      gross: acc.gross + (s.gross_revenue ?? 0),
      discount:
        acc.discount +
        ((s as any).total_discounts ?? (s as any).total_discount ?? 0),
      fees: acc.fees + (s.total_delivery_fees ?? 0),
      net: acc.net + (s.net_revenue ?? 0),
      cash: acc.cash + ((s as any).cash_revenue ?? 0),
      card: acc.card + ((s as any).card_revenue ?? 0),
      pix: acc.pix + ((s as any).pix_revenue ?? 0),
    }),
    { orders: 0, gross: 0, discount: 0, fees: 0, net: 0, cash: 0, card: 0, pix: 0 }
  );

  const avgTicket = totals.orders > 0 ? totals.gross / totals.orders : 0;
  const margin =
    totals.gross > 0 ? ((totals.net / totals.gross) * 100).toFixed(1) : '0';

  if (loading) return <ViewLoadingSpinner />;

  const PAYMENT_METHODS = [
    {
      label: 'Dinheiro',
      value: totals.cash,
      color: '#10B981',
      icon: Banknote,
      pct: totals.gross > 0 ? (totals.cash / totals.gross) * 100 : 0,
    },
    {
      label: 'Cartão',
      value: totals.card,
      color: '#6366F1',
      icon: CreditCard,
      pct: totals.gross > 0 ? (totals.card / totals.gross) * 100 : 0,
    },
    {
      label: 'PIX',
      value: totals.pix,
      color: '#8B5CF6',
      icon: Smartphone,
      pct: totals.gross > 0 ? (totals.pix / totals.gross) * 100 : 0,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Financeiro
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Acompanhe receitas e relatórios
          </p>
        </div>
        <PeriodSelector period={period} setPeriod={setPeriod} periods={PERIOD_LABELS} />
      </div>

      {/* KPI cards — using canonical StatCard with glow + sub */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Receita Bruta"
          value={formatCurrency(totals.gross)}
          icon={DollarSign}
          color="#6366F1"
          sub={`${totals.orders} pedidos`}
          glow
        />
        <StatCard
          label="Receita Líquida"
          value={formatCurrency(totals.net)}
          icon={TrendingUp}
          color="#10B981"
          sub={`Margem ${margin}%`}
          trend="up"
          glow
        />
        <StatCard
          label="Descontos"
          value={formatCurrency(totals.discount)}
          icon={TrendingDown}
          color="#EF4444"
          sub="Total de desconto"
          glow
        />
        <StatCard
          label="Ticket Médio"
          value={formatCurrency(avgTicket)}
          icon={BarChart3}
          color="#F59E0B"
          sub={`${totals.orders} pedidos`}
          glow
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Métodos de Pagamento" icon={CreditCard} iconColor="#6366F1">
          <div className="px-5 pb-5 space-y-4">
            {PAYMENT_METHODS.map((pm) => (
              <PaymentMethodBar key={pm.label} {...pm} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Resumo do Período" icon={Receipt} iconColor="#10B981">
          <div className="px-5 pb-5 space-y-3">
            <SummaryLine
              label="Receita Bruta"
              value={totals.gross}
              color="#6366F1"
              positive
              isDark={isDark}
            />
            <SummaryLine
              label="Descontos"
              value={-totals.discount}
              color="#EF4444"
              positive={false}
              isDark={isDark}
            />
            <SummaryLine
              label="Taxa de Entrega"
              value={totals.fees}
              color="#F59E0B"
              positive
              isDark={isDark}
            />

            <div
              className="flex items-center justify-between px-3 py-4 rounded-xl"
              style={{
                background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.07)',
                border: '1px solid rgba(16,185,129,0.25)',
              }}
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={16} style={{ color: '#10B981' }} />
                <span
                  className="text-sm font-bold"
                  style={{ color: isDark ? '#6EE7B7' : '#065F46' }}
                >
                  Receita Líquida
                </span>
              </div>
              <span className="text-lg font-bold" style={{ color: '#10B981' }}>
                {formatCurrency(totals.net)}
              </span>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Histórico Diário" icon={Calendar} iconColor="#6366F1">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {[
                  'Data',
                  'Pedidos',
                  'Receita Bruta',
                  'Descontos',
                  'Taxa Entrega',
                  'Líquido',
                ].map((h) => (
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
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      'var(--surface-hover)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = 'transparent')
                  }
                >
                  <td
                    className="px-5 py-3.5 font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formatDate(s.date)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-bold"
                      style={{
                        background: isDark
                          ? 'rgba(99,102,241,0.12)'
                          : 'rgba(99,102,241,0.08)',
                        color: '#818CF8',
                      }}
                    >
                      {s.total_orders}
                    </span>
                  </td>
                  <td
                    className="px-5 py-3.5 font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formatCurrency(s.gross_revenue)}
                  </td>
                  <td
                    className="px-5 py-3.5"
                    style={{ color: isDark ? '#FCA5A5' : '#DC2626' }}
                  >
                    {formatCurrency(
                      (s as any).total_discounts ?? (s as any).total_discount ?? 0
                    )}
                  </td>
                  <td
                    className="px-5 py-3.5"
                    style={{ color: isDark ? '#FCD34D' : '#D97706' }}
                  >
                    {formatCurrency(s.total_delivery_fees)}
                  </td>
                  <td
                    className="px-5 py-3.5 font-bold"
                    style={{ color: '#10B981' }}
                  >
                    {formatCurrency(s.net_revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {summaries.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <BarChart3 size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Sem dados para o período selecionado
            </p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
