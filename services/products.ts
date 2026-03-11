import { supabase } from '@/supabase/client';
import { Product, Category, ProductImage } from '@/types/database';

export async function createProduct(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  const { data: product, error } = await supabase
    .schema('catalog')
    .from('products')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return product;
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const { data: product, error } = await supabase
    .schema('catalog')
    .from('products')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return product;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .schema('catalog')
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function createCategory(data: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
  const { data: category, error } = await supabase
    .schema('catalog')
    .from('categories')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return category;
}

export async function updateCategory(id: string, data: Partial<Category>) {
  const { data: category, error } = await supabase
    .schema('catalog')
    .from('categories')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return category;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .schema('catalog')
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function uploadProductImage(productId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `stores/${productId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return { storage_path: filePath, url: publicUrl };
}

export async function createProductImage(data: Omit<ProductImage, 'id' | 'created_at'>) {
  const { data: image, error } = await supabase
    .schema('catalog')
    .from('product_images')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return image;
}

export async function deleteProductImage(id: string, storagePath: string) {
  await supabase.storage.from('product-images').remove([storagePath]);

  const { error } = await supabase
    .schema('catalog')
    .from('product_images')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
