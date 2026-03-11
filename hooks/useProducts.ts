import { useState, useEffect } from 'react';
import { Product, Category, ProductImage } from '@/types/database';
import { supabase } from '@/supabase/client';
import { useStore } from '@/contexts/StoreContext';

export function useProducts() {
  const { store } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!store) return;
    setLoading(true);
    const { data } = await supabase
      .schema('catalog')
      .from('products')
      .select('*,product_images(*)')
      .eq('store_id', store.id)
      .order('sort_order');

    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, [store]);

  return { products, loading, refetch: fetch };
}

export function useCategories() {
  const { store } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!store) return;
    setLoading(true);
    const { data } = await supabase
      .schema('catalog')
      .from('categories')
      .select('*')
      .eq('store_id', store.id)
      .order('sort_order');

    if (data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, [store]);

  return { categories, loading, refetch: fetch };
}

export function useProductImages(productId: string) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .schema('catalog')
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order');

      if (data) setImages(data);
      setLoading(false);
    };

    fetch();
  }, [productId]);

  return { images, loading };
}
