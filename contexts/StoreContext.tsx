import { supabase } from '@/supabase/client';
import { Store } from '@/types/database';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface StoreContextType {
  store: Store | null;
  loading: boolean;
  /** true quando todas as buscas terminaram — independente do resultado */
  resolved: boolean;
  /**
   * storeId real do usuário, mesmo quando store=null.
   * Preenchido quando o usuário é membro (qualquer status) de uma loja.
   * Permite que StaffProvider busque o role mesmo sem store carregada.
   */
  resolvedStoreId: string | null;
  refetch: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolved, setResolved] = useState(false);
  const [resolvedStoreId, setResolvedStoreId] = useState<string | null>(null);

  const fetchStore = async () => {
    if (!user) {
      setStore(null);
      setResolvedStoreId(null);
      setLoading(false);
      setResolved(true);
      return;
    }

    setLoading(true);
    setResolved(false);

    try {
      // 1. Tenta buscar como dono
      const { data: ownedStore } = await supabase
        .schema('core')
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (ownedStore) {
        setStore(ownedStore);
        setResolvedStoreId(ownedStore.id);
        return;
      }

      // 2. Busca membership sem filtro de status — pega pending, active, suspended, rejected
      const { data: membership } = await supabase
        .schema('core')
        .from('staff_members')
        .select('store_id, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (membership?.store_id) {
        // Guarda o storeId para o StaffContext usar, mesmo se store não carregar
        setResolvedStoreId(membership.store_id);

        // Só carrega a store completa se o membro está ativo
        if (membership.status === 'active') {
          const { data: memberStore } = await supabase
            .schema('core')
            .from('stores')
            .select('*')
            .eq('id', membership.store_id)
            .maybeSingle();

          if (memberStore) {
            setStore(memberStore);
            return;
          }
        }

        // Membro existe mas não está ativo (pending/suspended/rejected)
        // store fica null, mas resolvedStoreId está preenchido
        setStore(null);
        return;
      }

      // 3. Nenhum vínculo encontrado — onboarding incompleto
      setStore(null);
      setResolvedStoreId(null);
    } catch (err) {
      console.error('StoreContext fetchStore error:', err);
      setStore(null);
      setResolvedStoreId(null);
    } finally {
      setLoading(false);
      setResolved(true);
    }
  };

  useEffect(() => {
    fetchStore();
  }, [user]);

  return (
    <StoreContext.Provider value={{ store, loading, resolved, resolvedStoreId, refetch: fetchStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};