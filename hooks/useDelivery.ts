import { useState, useEffect } from 'react';
import { DeliveryZone, DeliveryDriver } from '@/types/database';
import { supabase } from '@/supabase/client';
import { useStore } from '@/contexts/StoreContext';

export function useDeliveryZones() {
  const { store } = useStore();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store) return;

    const fetch = async () => {
      const { data } = await supabase
        .schema('core')
        .from('delivery_zones')
        .select('*')
        .eq('store_id', store.id)
        .order('neighborhood');

      if (data) setZones(data);
      setLoading(false);
    };

    fetch();
  }, [store]);

  return { zones, loading };
}

export function useDeliveryDrivers() {
  const { store } = useStore();
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store) return;

    const fetch = async () => {
      const { data } = await supabase
        .schema('core')
        .from('delivery_drivers')
        .select('*')
        .eq('store_id', store.id)
        .order('name');

      if (data) setDrivers(data);
      setLoading(false);
    };

    fetch();
  }, [store]);

  return { drivers, loading };
}
