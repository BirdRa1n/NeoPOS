import { useTheme } from '@/contexts/ThemeContext';
import { STATUS_MAP } from '@/lib/constants/status';
import { COLORS, ALPHA } from '@/lib/constants';

export function StatusBadge({ status }: { status: string }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const cfg = STATUS_MAP[status] ?? { 
    label: status, 
    dot: COLORS.neutral, 
    bgD: ALPHA.neutralBg, 
    bgL: ALPHA.neutralBg, 
    txD: COLORS.neutralSoft, 
    txL: '#374151' 
  };
  
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ background: isDark ? cfg.bgD : cfg.bgL, color: isDark ? cfg.txD : cfg.txL }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}
