import { supabase } from '@/supabase/client';
import { DeliveryZone, DeliveryDriver } from '@/types/database';

export async function createDeliveryZone(data: Omit<DeliveryZone, 'id' | 'created_at' | 'updated_at'>) {
  const { data: zone, error } = await supabase
    .schema('core')
    .from('delivery_zones')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return zone;
}

export async function updateDeliveryZone(id: string, data: Partial<DeliveryZone>) {
  const { data: zone, error } = await supabase
    .schema('core')
    .from('delivery_zones')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return zone;
}

export async function deleteDeliveryZone(id: string) {
  const { error } = await supabase
    .schema('core')
    .from('delivery_zones')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function createDeliveryDriver(data: Omit<DeliveryDriver, 'id' | 'created_at' | 'updated_at'>) {
  const { data: driver, error } = await supabase
    .schema('core')
    .from('delivery_drivers')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return driver;
}

export async function updateDeliveryDriver(id: string, data: Partial<DeliveryDriver>) {
  const { data: driver, error } = await supabase
    .schema('core')
    .from('delivery_drivers')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return driver;
}

export async function deleteDeliveryDriver(id: string) {
  const { error } = await supabase
    .schema('core')
    .from('delivery_drivers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
