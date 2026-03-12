import { useState, useEffect } from 'react';
import { Order, OrderItem, OrderStatus } from '@/types/database';
import { supabase } from '@/supabase/client';
import { useStore } from '@/contexts/StoreContext';

export function useOrders(status?: OrderStatus) {
  const { store } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!store) return;
    setLoading(true);

    // Buscar pedidos com clientes relacionados usando join
    const { data } = await supabase
      .schema('orders')
      .from('orders_with_details')
      .select('*')
      .eq('store_id', store.id);

    if (data) {
      const filtered = status ? data.filter((o) => o.status === status) : data;
      setOrders(filtered);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetch();

    const channel = supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'orders', table: 'orders' }, fetch)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [store, status]);

  return { orders, loading, refetch: fetch };
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
