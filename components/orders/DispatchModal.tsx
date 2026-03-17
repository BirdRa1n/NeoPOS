import { useState } from 'react';
import { supabase } from '@/supabase/client';
import { ModalBackdrop, ModalShell, ModalHeader } from '@/components/ui/Modal';
import { useIsDark } from '@/hooks/useIsDark';
import { COLORS } from '@/lib/constants';
import { Send, User, Loader2, AlertTriangle } from 'lucide-react';

const selStyle: React.CSSProperties = {
  padding: '0.6rem 0.875rem 0.6rem 2.25rem',
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  color: 'var(--text-primary)',
  borderRadius: 12,
  fontSize: 13,
  width: '100%',
  outline: 'none',
};

interface DispatchModalProps {
  orderId: string;
  drivers: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export function DispatchModal({ orderId, drivers, onClose, onSuccess }: DispatchModalProps) {
  const isDark = useIsDark();
  const [driverId, setDriverId] = useState('');
  const [saving, setSaving] = useState(false);
  const activeDrivers = drivers.filter(d => d.active);

  const handleDispatch = async () => {
    setSaving(true);
    try {
      const payload: any = { status: 'out_for_delivery' };
      if (driverId) payload.driver_id = driverId;
      const { error } = await supabase.schema('orders').from('orders').update(payload).eq('id', orderId);
      if (error) throw error;
      onSuccess();
      onClose();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell maxW="max-w-sm">
        <ModalHeader title="Despachar Pedido" subtitle="Selecione o entregador responsável" icon={Send} iconColor={COLORS.accent} onClose={onClose} />
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Entregador</label>
            <div style={{ position: 'relative' }}>
              <User size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <select value={driverId} onChange={e => setDriverId(e.target.value)} style={selStyle}>
                <option value="">Sem entregador específico</option>
                {activeDrivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}{d.vehicle ? ` · ${d.vehicle}` : ''}{d.plate ? ` (${d.plate})` : ''}</option>
                ))}
              </select>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Você pode despachar sem atribuir e editar depois.</p>
          </div>

          {activeDrivers.length === 0 && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
              style={{ background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
              <AlertTriangle size={13} />
              Nenhum entregador ativo cadastrado.
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Cancelar</button>
            <button onClick={handleDispatch} disabled={saving}
              className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: `linear-gradient(135deg,${COLORS.accent},${COLORS.purple})`, boxShadow: COLORS.accentShadow }}>
              {saving ? <><Loader2 size={14} className="animate-spin" />Despachando...</> : <><Send size={14} />Despachar</>}
            </button>
          </div>
        </div>
      </ModalShell>
    </ModalBackdrop>
  );
}
