import { supabase } from '@/supabase/client';
import { Store } from '@/types/database';

export async function createStore(data: Omit<Store, 'id' | 'created_at' | 'updated_at'>) {
  const { data: store, error } = await supabase
    .schema('core')
    .from('stores')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return store;
}

export async function updateStore(id: string, data: Partial<Store>) {
  const { data: store, error } = await supabase
    .schema('core')
    .from('stores')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return store;
}

export async function deleteStore(id: string) {
  const { error } = await supabase
    .schema('core')
    .from('stores')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
