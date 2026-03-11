import { supabase } from '@/supabase/client';
import { Order, OrderItem, OrderItemAddon, OrderStatus } from '@/types/database';

export async function createOrder(data: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
  const { data: order, error } = await supabase
    .schema('orders')
    .from('orders')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return order;
}

export async function updateOrder(id: string, data: Partial<Order>) {
  const { data: order, error } = await supabase
    .schema('orders')
    .from('orders')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return order;
}

export async function deleteOrder(id: string) {
  const { error } = await supabase
    .schema('orders')
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { data: order, error } = await supabase
    .schema('orders')
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return order;
}

export async function createOrderItem(data: Omit<OrderItem, 'id' | 'created_at'>) {
  const { data: item, error } = await supabase
    .schema('orders')
    .from('order_items')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return item;
}

export async function deleteOrderItem(id: string) {
  const { error } = await supabase
    .schema('orders')
    .from('order_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function createOrderItemAddon(data: Omit<OrderItemAddon, 'id' | 'created_at'>) {
  const { data: addon, error } = await supabase
    .schema('orders')
    .from('order_item_addons')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return addon;
}
