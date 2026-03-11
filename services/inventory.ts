import { supabase } from '@/supabase/client';
import { Supply, StockMovement, ProductSupply, StockMovementType } from '@/types/database';

export async function createSupply(data: Omit<Supply, 'id' | 'created_at' | 'updated_at'>) {
  const { data: supply, error } = await supabase
    .schema('inventory')
    .from('supplies')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return supply;
}

export async function updateSupply(id: string, data: Partial<Supply>) {
  const { data: supply, error } = await supabase
    .schema('inventory')
    .from('supplies')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return supply;
}

export async function deleteSupply(id: string) {
  const { error } = await supabase
    .schema('inventory')
    .from('supplies')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function createStockMovement(data: Omit<StockMovement, 'id' | 'created_at'>) {
  const { data: movement, error } = await supabase
    .schema('inventory')
    .from('stock_movements')
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  if (data.movement_type === 'purchase') {
    await supabase
      .schema('inventory')
      .from('supplies')
      .update({ current_quantity: supabase.raw(`current_quantity + ${data.quantity}`) })
      .eq('id', data.supply_id);
  } else if (data.movement_type === 'manual_out' || data.movement_type === 'adjustment') {
    await supabase
      .schema('inventory')
      .from('supplies')
      .update({ current_quantity: supabase.raw(`current_quantity + ${data.quantity}`) })
      .eq('id', data.supply_id);
  }

  return movement;
}

export async function createProductSupply(data: Omit<ProductSupply, 'id' | 'created_at' | 'updated_at'>) {
  const { data: productSupply, error } = await supabase
    .schema('inventory')
    .from('product_supplies')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return productSupply;
}

export async function updateProductSupply(id: string, data: Partial<ProductSupply>) {
  const { data: productSupply, error } = await supabase
    .schema('inventory')
    .from('product_supplies')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return productSupply;
}

export async function deleteProductSupply(id: string) {
  const { error } = await supabase
    .schema('inventory')
    .from('product_supplies')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
