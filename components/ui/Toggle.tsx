import { ToggleLeft, ToggleRight } from 'lucide-react';
import { COLORS, ALPHA } from '@/lib/constants';

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
        background: checked ? ALPHA.successBgSubtle : ALPHA.neutralBg,
        border: `1px solid ${checked ? ALPHA.successBorder : 'var(--border)'}`,
      }}
    >
      {checked ? (
        <ToggleRight size={20} style={{ color: COLORS.success }} />
      ) : (
        <ToggleLeft size={20} style={{ color: 'var(--text-muted)' }} />
      )}
      <span
        className="text-sm font-medium"
        style={{ color: checked ? COLORS.success : 'var(--text-secondary)' }}
      >
        {label}
      </span>
      <span
        className="ml-auto text-xs font-bold"
        style={{ color: checked ? COLORS.success : 'var(--text-muted)' }}
      >
        {checked ? 'Ativo' : 'Inativo'}
      </span>
    </button>
  );
}
