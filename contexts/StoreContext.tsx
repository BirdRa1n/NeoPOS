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

    const { data, error } = await supabase
      .schema('core')
      .from('stores')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) setStore(data);
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
