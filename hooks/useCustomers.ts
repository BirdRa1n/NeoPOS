import { useState, useEffect } from 'react';
import { Customer } from '@/types/database';
import { supabase } from '@/supabase/client';
import { useStore } from '@/contexts/StoreContext';

export function useCustomers() {
  const { store } = useStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store) return;

    const fetch = async () => {
      const { data } = await supabase
        .schema('core')
        .from('customers')
        .select('*')
        .eq('store_id', store.id)
        .order('name');
      
      if (data) setCustomers(data);
      setLoading(false);
    };

    fetch();
  }, [store]);

  return { customers, loading };
}
