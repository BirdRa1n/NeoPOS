import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/supabase/client';
import { DailySummary } from '@/types/database';
import { useEffect, useState } from 'react';

/** Timezone detectado automaticamente pelo browser do usuário */
const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
// ex: "America/Fortaleza", "America/Sao_Paulo", "Europe/Lisbon", etc.

/** Retorna a data atual no timezone do browser no formato YYYY-MM-DD */
function getToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}

/**
 * Retorna o offset UTC em horas do timezone do browser para uma data específica.
 * Ex: America/Fortaleza = -3, America/Sao_Paulo = -3 (ou -2 no horário de verão)
 */
function getTimezoneOffsetHours(dateStr: string): number {
  // Compara a data/hora local com UTC para descobrir o offset real
  const date = new Date(`${dateStr}T12:00:00`);
  const utcStr = date.toLocaleString('en-CA', { timeZone: 'UTC', hour12: false });
  const localStr = date.toLocaleString('en-CA', { timeZone: TIMEZONE, hour12: false });

  const utcDate = new Date(utcStr);
  const localDate = new Date(localStr);
  return (localDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
}

/**
 * Converte "YYYY-MM-DD" para o intervalo UTC correspondente à meia-noite
 * até 23:59:59 no timezone do browser.
 */
function getDayUTCRange(dateStr: string): { start: string; end: string } {
  const offsetHours = getTimezoneOffsetHours(dateStr);
  const offsetMs = offsetHours * 60 * 60 * 1000;

  // meia-noite local em UTC
  const startUTC = new Date(`${dateStr}T00:00:00.000Z`).getTime() - offsetMs;
  // 23:59:59.999 local em UTC
  const endUTC = new Date(`${dateStr}T23:59:59.999Z`).getTime() - offsetMs;

  return {
    start: new Date(startUTC).toISOString(),
    end: new Date(endUTC).toISOString(),
  };
}

/**
 * Converte uma data "YYYY-MM-DD" para Date sem o bug UTC do JS.
 * Use esta função sempre que precisar exibir uma data vinda do banco.
 */
export function parseDateSafe(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function useFinance() {
  return useTodaySummary();
}

export function useDailySummaries(startDate?: string, endDate?: string) {
  const { store } = useStore();
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store) return;

    const fetch = async () => {
      let query = supabase
        .schema('finance')
        .from('daily_summaries')
        .select('*')
        .eq('store_id', store.id)
        .order('date', { ascending: false });

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data } = await query;
      if (data) setSummaries(data);
      setLoading(false);
    };

    fetch();
  }, [store, startDate, endDate]);

  return { summaries, loading };
}

export function useTodaySummary() {
  const { store } = useStore();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store) return;

    const fetch = async () => {
      const today = getToday(); // data correta no timezone do browser

      // Busca o resumo do dia na view
      const { data: existing } = await supabase
        .schema('finance')
        .from('daily_summaries')
        .select('*')
        .eq('store_id', store.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        setSummary(existing as DailySummary);
        setLoading(false);
        return;
      }

      // Fallback: calcular direto dos pedidos usando o range UTC correto
      const { start: todayStart, end: todayEnd } = getDayUTCRange(today);

      const { data: orders } = await supabase
        .schema('orders')
        .from('orders')
        .select('total, subtotal, discount, delivery_fee, status, payment_method')
        .eq('store_id', store.id)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      if (orders) {
        const completed = orders.filter(o =>
          ['delivered', 'finished', 'served'].includes(o.status)
        );
        const cancelled = orders.filter(o => o.status === 'cancelled');

        const grossRevenue = completed.reduce((s, o) => s + (Number(o.subtotal) || 0), 0);
        const totalDiscounts = completed.reduce((s, o) => s + (Number(o.discount) || 0), 0);
        const totalDeliveryFees = completed.reduce((s, o) => s + (Number(o.delivery_fee) || 0), 0);
        const netRevenue = completed.reduce((s, o) => s + (Number(o.total) || 0), 0);
        const cashRevenue = completed
          .filter(o => o.payment_method === 'cash')
          .reduce((s, o) => s + (Number(o.total) || 0), 0);
        const cardRevenue = completed
          .filter(o => ['credit_card', 'debit_card'].includes(o.payment_method))
          .reduce((s, o) => s + (Number(o.total) || 0), 0);
        const pixRevenue = completed
          .filter(o => o.payment_method === 'pix')
          .reduce((s, o) => s + (Number(o.total) || 0), 0);

        setSummary({
          id: 'today-live',
          store_id: store.id,
          date: today,
          total_orders: orders.length,
          completed_orders: completed.length,
          cancelled_orders: cancelled.length,
          gross_revenue: grossRevenue,
          net_revenue: netRevenue,
          total_discounts: totalDiscounts,
          total_delivery_fees: totalDeliveryFees,
          average_order_value: completed.length > 0 ? netRevenue / completed.length : 0,
          cash_revenue: cashRevenue,
          card_revenue: cardRevenue,
          pix_revenue: pixRevenue,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any);
      }

      setLoading(false);
    };

    fetch();
  }, [store]);

  return { summary, loading };
}