import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { ModalBackdrop, ModalShell } from './Modal';
import { Button } from './Button';

interface DeleteConfirmProps {
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteConfirm({ title, description, onClose, onConfirm, loading }: DeleteConfirmProps) {
  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell maxW="max-w-sm">
        <div className="p-7 flex flex-col items-center text-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.1)' }}
          >
            <AlertTriangle size={26} style={{ color: '#EF4444' }} />
          </div>
          <div>
            <p className="font-bold text-base mb-1 text-[var(--text-primary)]">{title}</p>
            <p
              className="text-sm text-[var(--text-secondary)]"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
          <div className="flex gap-3 w-full">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={onConfirm}
              loading={loading}
              className="flex-1"
              icon={!loading && <Trash2 size={14} />}
            >
              {loading ? 'Removendo...' : 'Remover'}
            </Button>
          </div>
        </div>
      </ModalShell>
    </ModalBackdrop>
  );
}
