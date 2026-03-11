import { useState, useEffect } from 'react';
import { DeliveryZone, DeliveryDriver } from '@/types/database';
import { supabase } from '@/supabase/client';
import { useStore } from '@/contexts/StoreContext';

export function useDeliveryZones() {
  const { store } = useStore();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!store) return;
    setLoading(true);
    const { data } = await supabase
      .schema('core')
      .from('delivery_zones')
      .select('*')
      .eq('store_id', store.id)
      .order('neighborhood');

    if (data) setZones(data);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, [store]);

  return { zones, loading, refetch: fetch };
}

export function useDeliveryDrivers() {
  const { store } = useStore();
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!store) return;
    setLoading(true);
    const { data } = await supabase
      .schema('core')
      .from('delivery_drivers')
      .select('*')
      .eq('store_id', store.id)
      .order('name');

    if (data) setDrivers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, [store]);

  return { drivers, loading, refetch: fetch };
}
