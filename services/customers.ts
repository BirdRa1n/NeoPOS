import { supabase } from '@/supabase/client';
import { Customer } from '@/types/database';

export async function createCustomer(data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
  const { data: customer, error } = await supabase
    .schema('core')
    .from('customers')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return customer;
}

export async function updateCustomer(id: string, data: Partial<Customer>) {
  const { data: customer, error } = await supabase
    .schema('core')
    .from('customers')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return customer;
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .schema('core')
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
