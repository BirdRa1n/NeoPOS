import { useState, useEffect } from 'react';
import { Supply, StockMovement } from '@/types/database';
import { supabase } from '@/supabase/client';
import { useStore } from '@/contexts/StoreContext';

export function useInventory() {
  return useSupplies();
}

export function useSupplies() {
  const { store } = useStore();
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!store) return;
    setLoading(true);
    const { data } = await supabase
      .schema('inventory')
      .from('supplies')
      .select('*')
      .eq('store_id', store.id)
      .order('name');
    
    if (data) setSupplies(data);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, [store]);

  return { supplies, loading, refetch: fetch };
}

export function useLowStockAlerts() {
  const { store } = useStore();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store) return;

    const fetch = async () => {
      const { data } = await supabase
        .schema('inventory')
        .from('vw_low_stock_alerts')
        .select('*')
        .eq('store_id', store.id);
      
      if (data) setAlerts(data);
      setLoading(false);
    };

    fetch();
  }, [store]);

  return { alerts, loading };
}

export function useStockMovements(supplyId?: string) {
  const { store } = useStore();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store) return;

    const fetch = async () => {
      let query = supabase
        .schema('inventory')
        .from('stock_movements')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });

      if (supplyId) query = query.eq('supply_id', supplyId);

      const { data } = await query;
      if (data) setMovements(data);
      setLoading(false);
    };

    fetch();
  }, [store, supplyId]);

  return { movements, loading };
}
