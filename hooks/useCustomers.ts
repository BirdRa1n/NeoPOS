import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';
import { useStore } from '@/contexts/StoreContext';

export function useCustomers() {
  const { store } = useStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!store) return;
    setLoading(true);
    const { data } = await supabase
      .schema('core')
      .from('customers')
      .select('*')
      .eq('store_id', store.id)
      .order('name');

    if (data) setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, [store]);

  return { customers, loading, refetch: fetch };
}
