import { useState, useEffect } from 'react';
import { DailySummary } from '@/types/database';
import { supabase } from '@/supabase/client';
import { useStore } from '@/contexts/StoreContext';

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
      const today = new Date().toISOString().split('T')[0];

      // Primeiro tenta buscar o resumo pré-calculado do dia de hoje
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

      // Fallback: calcular na hora a partir dos pedidos (se o trigger ainda não rodou)
      const todayStart = `${today}T00:00:00.000Z`;

      const { data: orders } = await supabase
        .schema('orders')
        .from('orders')
        .select('total, subtotal, discount, delivery_fee, status, payment_method')
        .eq('store_id', store.id)
        .gte('created_at', todayStart);

      if (orders) {
        const completed = orders.filter(o =>
          o.status === 'delivered' || o.status === 'finished'
        );

        const grossRevenue = completed.reduce((s, o) => s + (Number(o.total) || 0), 0);
        const totalDiscounts = completed.reduce((s, o) => s + (Number(o.discount) || 0), 0);
        const totalDeliveryFees = completed.reduce((s, o) => s + (Number(o.delivery_fee) || 0), 0);
        // net_revenue = gross - discounts (subtotal já exclui entrega, mas inclui desconto)
        const netRevenue = grossRevenue - totalDiscounts;
        const cashRevenue = completed.filter(o => o.payment_method === 'cash').reduce((s, o) => s + (Number(o.total) || 0), 0);
        const cardRevenue = completed.filter(o => ['credit_card', 'debit_card'].includes(o.payment_method)).reduce((s, o) => s + (Number(o.total) || 0), 0);
        const pixRevenue = completed.filter(o => o.payment_method === 'pix').reduce((s, o) => s + (Number(o.total) || 0), 0);

        setSummary({
          id: 'today-live',
          store_id: store.id,
          date: today,
          total_orders: orders.length,
          completed_orders: completed.length,
          cancelled_orders: orders.filter(o => o.status === 'cancelled').length,
          gross_revenue: grossRevenue,
          net_revenue: netRevenue,
          total_discounts: totalDiscounts,
          total_delivery_fees: totalDeliveryFees,
          average_order_value: completed.length > 0 ? grossRevenue / completed.length : 0,
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