import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';

export interface DriverStats {
  driver_id: string;
  name: string;
  phone: string | null;
  vehicle: string | null;
  plate: string | null;
  active: boolean;
  staff_member_id: string | null;
  deliveries_today: number;
  fee_today: number;
  deliveries_week: number;
  fee_week: number;
  deliveries_month: number;
  fee_month: number;
  deliveries_year: number;
  fee_year: number;
  last_delivery_at: string | null;
}

export function useDriverStats(storeId?: string) {
  const [stats, setStats] = useState<DriverStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!storeId) return;
    setLoading(true);
    const { data } = await supabase
      .schema('core')
      .from('driver_delivery_stats')
      .select('*')
      .eq('store_id', storeId);
    if (data) setStats(data as DriverStats[]);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [storeId]);

  return { stats, loading, refetch: fetch };
}
