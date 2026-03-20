import { useState, useEffect, useRef, useCallback } from 'react';
import { Order, OrderItem, OrderStatus } from '@/types/database';
import { supabase } from '@/supabase/client';
import { useStore } from '@/contexts/StoreContext';

interface UseOrdersOptions {
  onNewOrder?: (order: any) => void;
  dateFrom?: string; // ISO string — filtra created_at >= dateFrom no servidor
}

export function useOrders(status?: OrderStatus, options?: UseOrdersOptions) {
  const { store } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const ordersRef = useRef<Order[]>([]);
  const onNewOrderRef = useRef(options?.onNewOrder);
  onNewOrderRef.current = options?.onNewOrder;

  const fetchOrders = useCallback(async () => {
    if (!store) return;

    let query = supabase
      .schema('orders')
      .from('orders_with_details')
      .select('*')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (options?.dateFrom) query = query.gte('created_at', options.dateFrom);

    const { data } = await query;

    if (data) {
      setOrders(data);
      ordersRef.current = data;
    }
    setLoading(false);
  }, [store, status, options?.dateFrom]);

  useEffect(() => {
    if (!store) return;

    fetchOrders();

    // Canal com filtro por store_id para não receber eventos de outras lojas
    const channelName = `orders-store-${store.id}${status ? `-${status}` : ''}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'orders',
          table: 'orders',
          filter: `store_id=eq.${store.id}`,
        },
        async (payload) => {
          if (payload.new.type === 'table' || payload.new.order_type === 'table') {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
          const { data } = await supabase
            .schema('orders')
            .from('orders_with_details')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (data) {
            const afterDate = !options?.dateFrom || data.created_at >= options.dateFrom;
            const shouldInclude = (!status || data.status === status) && afterDate;

            if (shouldInclude) {
              setOrders((prev) => {
                const updated = [data, ...prev];
                ordersRef.current = updated;
                return updated;
              });
            }

            // Dispara callback de novo pedido independente do filtro de status
            onNewOrderRef.current?.(data);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'orders',
          table: 'orders',
          filter: `store_id=eq.${store.id}`,
        },
        async (payload) => {
          const { data } = await supabase
            .schema('orders')
            .from('orders_with_details')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setOrders((prev) => {
              const existsInList = prev.some((o) => (o as any).id === data.id);
              const shouldBeInList = !status || data.status === status;

              let updated: Order[];
              if (shouldBeInList && existsInList) {
                // Atualiza no lugar
                updated = prev.map((o) => ((o as any).id === data.id ? data : o));
              } else if (shouldBeInList && !existsInList) {
                // Passou a satisfazer o filtro (ex: status mudou para 'pending')
                updated = [data, ...prev];
              } else {
                // Saiu do filtro (ex: pedido confirmado, não é mais 'pending')
                updated = prev.filter((o) => (o as any).id !== data.id);
              }

              ordersRef.current = updated;
              return updated;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'orders',
          table: 'orders',
          filter: `store_id=eq.${store.id}`,
        },
        (payload) => {
          setOrders((prev) => {
            const updated = prev.filter((o) => (o as any).id !== payload.old.id);
            ordersRef.current = updated;
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [store, status, fetchOrders]);

  return { orders, loading, refetch: fetchOrders };
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
