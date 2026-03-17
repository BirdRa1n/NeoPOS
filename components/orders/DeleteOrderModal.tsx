import { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { supabase } from '@/supabase/client';
import { useIsDark } from '@/hooks/useIsDark';
import { ModalBackdrop, ModalShell } from '@/components/ui/Modal';

interface DeleteOrderModalProps {
  order: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteOrderModal({ order, onClose, onSuccess }: DeleteOrderModalProps) {
  const isDark = useIsDark();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.schema('orders').from('orders').delete().eq('id', order.id);
      if (error) throw error;
      onSuccess();
    } catch (err: any) { alert(err.message); }
    finally { setDeleting(false); }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell maxW="max-w-sm">
        <div className="p-7 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.07)' }}>
            <AlertTriangle size={26} style={{ color: '#EF4444' }} />
          </div>
          <div>
            <p className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Remover Pedido</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Remover pedido <strong>#{order.order_number || order.id.slice(0, 6)}</strong>? Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              Cancelar
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)' }}>
              {deleting ? <><Loader2 size={14} className="animate-spin" /> Removendo...</> : <><X size={14} /> Remover</>}
            </button>
          </div>
        </div>
      </ModalShell>
    </ModalBackdrop>
  );
}
