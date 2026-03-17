export type Period = 'today' | 'week' | 'month';

export const PERIOD_DAYS: Record<Period, number> = { today: 1, week: 7, month: 30 };
export const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hoje',
  week: 'Esta Semana',
  month: 'Este Mês',
};

export interface FinanceTotals {
  orders: number;
  gross: number;
  discount: number;
  fees: number;
  net: number;
  cash: number;
  card: number;
  pix: number;
}

export interface PaymentMethodItem {
  label: string;
  value: number;
  color: string;
  icon: React.FC<any>;
  pct: number;
}
