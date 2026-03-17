import { SectionCard } from '@/components/dashboard/SectionCard';
import { StatCard } from '@/components/data/StatCard';
import { DailyHistoryTable, NetRevenueRow, PaymentMethodBar, SummaryLine } from '@/components/finance';
import { PeriodSelector } from '@/components/ui/PeriodSelector';
import { ViewLoadingSpinner } from '@/components/ui/ViewLoadingSpinner';
import { useTheme } from '@/contexts/ThemeContext';
import { useDailySummaries } from '@/hooks/useFinance';
import { formatCurrency } from '@/lib/utils/format';
import { BRAND, COLORS } from '@/lib/constants';
import { FinanceTotals, Period, PERIOD_DAYS, PERIOD_LABELS } from '@/types/finance';
import {
  Banknote,
  BarChart3,
  Calendar,
  CreditCard,
  DollarSign,
  Receipt,
  Smartphone,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

export function FinanceView() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [period, setPeriod] = useState<Period>('today');

  const days = PERIOD_DAYS[period];
  const startDate = new Date(Date.now() - (days - 1) * 86400000).toISOString().split('T')[0];
  const { summaries, loading } = useDailySummaries(startDate);

  const totals: FinanceTotals = summaries.reduce(
    (acc, s) => ({
      orders: acc.orders + (s.total_orders ?? 0),
      gross: acc.gross + (s.gross_revenue ?? 0),
      discount: acc.discount + ((s as any).total_discounts ?? (s as any).total_discount ?? 0),
      fees: acc.fees + (s.total_delivery_fees ?? 0),
      net: acc.net + (s.net_revenue ?? 0),
      cash: acc.cash + ((s as any).cash_revenue ?? 0),
      card: acc.card + ((s as any).card_revenue ?? 0),
      pix: acc.pix + ((s as any).pix_revenue ?? 0),
    }),
    { orders: 0, gross: 0, discount: 0, fees: 0, net: 0, cash: 0, card: 0, pix: 0 }
  );

  const avgTicket = totals.orders > 0 ? totals.gross / totals.orders : 0;
  const margin = totals.gross > 0 ? ((totals.net / totals.gross) * 100).toFixed(1) : '0';

  if (loading) return <ViewLoadingSpinner />;

  const PAYMENT_METHODS = [
    { label: 'Dinheiro', value: totals.cash, color: COLORS.success, icon: Banknote, pct: totals.gross > 0 ? (totals.cash / totals.gross) * 100 : 0 },
    { label: 'Cartão', value: totals.card, color: COLORS.accent, icon: CreditCard, pct: totals.gross > 0 ? (totals.card / totals.gross) * 100 : 0 },
    { label: 'PIX', value: totals.pix, color: COLORS.purple, icon: Smartphone, pct: totals.gross > 0 ? (totals.pix / totals.gross) * 100 : 0 },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Financeiro</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Acompanhe receitas e relatórios</p>
        </div>
        <PeriodSelector period={period} setPeriod={setPeriod} periods={PERIOD_LABELS} />
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Receita Bruta" value={formatCurrency(totals.gross)} icon={DollarSign} color={COLORS.accent} sub={`${totals.orders} pedidos`} glow />
        <StatCard label="Receita Líquida" value={formatCurrency(totals.net)} icon={TrendingUp} color={COLORS.success} sub={`Margem ${margin}%`} trend="up" glow />
        <StatCard label="Descontos" value={formatCurrency(totals.discount)} icon={TrendingDown} color={COLORS.danger} sub="Total de desconto" glow />
        <StatCard label="Ticket Médio" value={formatCurrency(avgTicket)} icon={BarChart3} color={COLORS.warning} sub={`${totals.orders} pedidos`} glow />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Métodos de Pagamento" icon={CreditCard} iconColor={COLORS.accent}>
          <div className="px-5 pb-5 space-y-4">
            {PAYMENT_METHODS.map((pm) => <PaymentMethodBar key={pm.label} {...pm} />)}
          </div>
        </SectionCard>

        <SectionCard title="Resumo do Período" icon={Receipt} iconColor={COLORS.success}>
          <div className="px-5 pb-5 space-y-3">
            <SummaryLine label="Receita Bruta" value={totals.gross} color={COLORS.accent} positive isDark={isDark} />
            <SummaryLine label="Descontos" value={-totals.discount} color={COLORS.danger} positive={false} isDark={isDark} />
            <SummaryLine label="Taxa de Entrega" value={totals.fees} color={COLORS.warning} positive isDark={isDark} />
            <NetRevenueRow value={totals.net} isDark={isDark} />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Histórico Diário" icon={Calendar} iconColor={COLORS.accent}>
        <DailyHistoryTable summaries={summaries} isDark={isDark} />
      </SectionCard>
    </div>
  );
}
