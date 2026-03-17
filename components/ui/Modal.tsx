import { X } from 'lucide-react';
import { ReactNode } from 'react';
import { COLORS, ALPHA } from '@/lib/constants';



interface ModalBackdropProps {
  onClose: () => void;
  children: ReactNode;
}

export function ModalBackdrop({ onClose, children }: ModalBackdropProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: ALPHA.overlayLight, backdropFilter: ALPHA.backdropBlur }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>
  );
}

interface ModalShellProps {
  children: ReactNode;
  maxW?: string;
}

export function ModalShell({ children, maxW = 'max-w-lg' }: ModalShellProps) {
  return (
    <div
      className={`w-full ${maxW} max-h-[92vh] flex flex-col rounded-2xl overflow-hidden`}
      style={{
        background: 'var(--modal-bg)',
        border: '1px solid var(--border)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}
    >
      {children}
    </div>
  );
}

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  icon: React.FC<any>;
  iconColor?: string;
  onClose: () => void;
}

export function ModalHeader({ title, subtitle, icon: Icon, iconColor = COLORS.accent, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-[var(--border)]">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg,${iconColor},${iconColor}88)` }}
        >
          <Icon size={15} color="#fff" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)]">{title}</h2>
          {subtitle && <p className="text-[11px] text-[var(--text-muted)]">{subtitle}</p>}
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-8 h-8 flex items-center justify-center rounded-xl transition-all text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
      >
        <X size={16} />
      </button>
    </div>
  );
}

interface ModalFooterProps {
  onCancel: () => void;
  onSubmit?: () => void;
  saving?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
}

export function ModalFooter({ onCancel, onSubmit, saving, saveLabel = 'Salvar', cancelLabel = 'Cancelar' }: ModalFooterProps) {
  return (
    <div
      className="flex items-center justify-end gap-2 px-6 py-4 shrink-0 border-t border-[var(--border)] bg-[var(--surface-hover)]"
    >
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-all"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30"
      >
        {saveLabel}
      </button>
    </div>
  );
}
