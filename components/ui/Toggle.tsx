import { ToggleLeft, ToggleRight } from 'lucide-react';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all w-full"
      style={{
        background: checked ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.08)',
        border: `1px solid ${checked ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
      }}
    >
      {checked ? (
        <ToggleRight size={20} style={{ color: '#10B981' }} />
      ) : (
        <ToggleLeft size={20} style={{ color: 'var(--text-muted)' }} />
      )}
      <span
        className="text-sm font-medium"
        style={{ color: checked ? '#10B981' : 'var(--text-secondary)' }}
      >
        {label}
      </span>
      <span
        className="ml-auto text-xs font-bold"
        style={{ color: checked ? '#10B981' : 'var(--text-muted)' }}
      >
        {checked ? 'Ativo' : 'Inativo'}
      </span>
    </button>
  );
}
