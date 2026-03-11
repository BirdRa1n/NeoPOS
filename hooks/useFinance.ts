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
  const today = new Date().toISOString().split('T')[0];
  const { summaries, loading } = useDailySummaries(today, today);
  return { summary: summaries[0] || null, loading };
}
