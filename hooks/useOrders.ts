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
    
    // Buscar pedidos
    let query = supabase
      .schema('orders')
      .from('orders')
      .select('*')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data: ordersData } = await query;
    
    if (ordersData && ordersData.length > 0) {
      // Buscar clientes relacionados
      const customerIds = ordersData
        .map(o => o.customer_id)
        .filter(id => id != null);
      
      let customersMap: Record<string, any> = {};
      
      if (customerIds.length > 0) {
        const { data: customersData } = await supabase
          .schema('core')
          .from('customers')
          .select('*')
          .in('id', customerIds);
        
        if (customersData) {
          customersMap = customersData.reduce((acc, customer) => {
            acc[customer.id] = customer;
            return acc;
          }, {} as Record<string, any>);
        }
      }
      
      // Combinar pedidos com clientes
      const ordersWithCustomers = ordersData.map(order => ({
        ...order,
        customer: order.customer_id ? customersMap[order.customer_id] : null
      }));
      
      setOrders(ordersWithCustomers);
    } else {
      setOrders([]);
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
