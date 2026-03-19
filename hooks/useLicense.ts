'use client';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/supabase/client';
import { useCallback, useEffect, useState } from 'react';

export interface LicenseStatus {
  status:        'active' | 'inactive' | 'suspended' | 'grace';
  is_trial:      boolean;
  expires_at:    string | null;
  grace_until:   string | null;
  trial_ends_at: string | null;
  paid_since:    string | null;
  days_remaining: number;
  /** null = sem aviso, 'trial_expiring' | 'trial_grace' | 'paid_expiring' | 'paid_grace' */
  warning_type:  'trial_expiring' | 'trial_grace' | 'paid_expiring' | 'paid_grace' | null;
  last_renewed_at: string | null;
}

export interface RedemptionRecord {
  id:              string;
  days_added:      number;
  previous_expiry: string | null;
  new_expiry:      string;
  redeemed_at:     string;
}

const ERROR_MESSAGES: Record<string, string> = {
  not_authenticated: 'Você precisa estar logado.',
  not_store_owner:   'Apenas o dono da loja pode resgatar códigos.',
  key_not_found:     'Código inválido ou já utilizado.',
  key_expired:       'Este código de acesso expirou.',
  key_exhausted:     'Este código já foi utilizado o número máximo de vezes.',
};

export function useLicense() {
  const { store } = useStore();
  const [license, setLicense]         = useState<LicenseStatus | null>(null);
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>([]);
  const [loading, setLoading]         = useState(true);
  const [redeeming, setRedeeming]     = useState(false);

  const fetchLicense = useCallback(async () => {
    if (!store) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await supabase
        .schema('billing' as any)
        .from('store_license_status')
        .select('*')
        .eq('store_id', store.id)
        .maybeSingle();
      setLicense(data as LicenseStatus ?? null);
    } catch (err) {
      console.error('useLicense fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  const fetchRedemptions = useCallback(async () => {
    if (!store) return;
    const { data } = await supabase
      .schema('billing' as any)
      .from('license_key_redemptions')
      .select('id, days_added, previous_expiry, new_expiry, redeemed_at')
      .eq('store_id', store.id)
      .order('redeemed_at', { ascending: false })
      .limit(20);
    setRedemptions((data as RedemptionRecord[]) ?? []);
  }, [store?.id]);

  useEffect(() => {
    fetchLicense();
    fetchRedemptions();
  }, [fetchLicense, fetchRedemptions]);

  const redeemKey = async (code: string) => {
    if (!store) return { success: false, message: 'Loja não encontrada.' };
    setRedeeming(true);
    try {
      const { data, error } = await supabase.rpc('redeem_license_key' as any, {
        p_code:     code.trim().toUpperCase(),
        p_store_id: store.id,
      });
      if (error) throw error;
      const result = data as any;
      if (!result.success) {
        return { success: false, message: ERROR_MESSAGES[result.error] ?? 'Erro desconhecido.' };
      }
      await fetchLicense();
      await fetchRedemptions();
      return {
        success:   true,
        message:   `${result.days_added} dias adicionados com sucesso!`,
        daysAdded: result.days_added,
        expiresAt: result.expires_at,
        wasTrial:  result.was_trial,
      };
    } catch (err: any) {
      return { success: false, message: err.message ?? 'Erro ao resgatar código.' };
    } finally {
      setRedeeming(false);
    }
  };

  return { license, redemptions, loading, redeeming, redeemKey, refetch: fetchLicense };
}