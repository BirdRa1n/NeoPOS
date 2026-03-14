import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Store } from '@/types/database';
import { supabase } from '@/supabase/client';
import { useAuth } from './AuthContext';

interface StoreContextType {
  store: Store | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStore = async () => {
    if (!user) {
      setStore(null);
      setLoading(false);
      return;
    }

    // 1. Tenta buscar como dono
    const { data: ownedStore } = await supabase
      .schema('core')
      .from('stores')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (ownedStore) {
      setStore(ownedStore);
      setLoading(false);
      return;
    }

    // 2. Tenta buscar como membro ativo de uma loja
    const { data: membership } = await supabase
      .schema('core')
      .from('staff_members')
      .select('store_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (membership?.store_id) {
      const { data: memberStore } = await supabase
        .schema('core')
        .from('stores')
        .select('*')
        .eq('id', membership.store_id)
        .maybeSingle();

      if (memberStore) {
        setStore(memberStore);
        setLoading(false);
        return;
      }
    }

    setStore(null);
    setLoading(false);
  };

  useEffect(() => {
    fetchStore();
  }, [user]);

  return (
    <StoreContext.Provider value={{ store, loading, refetch: fetchStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
