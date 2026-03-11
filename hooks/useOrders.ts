import { useState, useEffect } from 'react';
import { Order, OrderItem, OrderStatus } from '@/types/database';
import { supabase } from '@/supabase/client';
import { useStore } from '@/contexts/StoreContext';

export function useOrders(status?: OrderStatus) {
  const { store } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store) return;

    const fetch = async () => {
      let query = supabase
        .schema('orders')
        .from('orders')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);

      const { data } = await query;
      if (data) setOrders(data);
      setLoading(false);
    };

    fetch();

    const channel = supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'orders', table: 'orders' }, fetch)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [store, status]);

  return { orders, loading };
}

export function useOrderItems(orderId: string) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .schema('orders')
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      
      if (data) setItems(data);
      setLoading(false);
    };

    fetch();
  }, [orderId]);

  return { items, loading };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { error } = await supabase
    .schema('orders')
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) throw error;
}
