import { COLORS, ALPHA } from '@/lib/constants';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  dot?: boolean;
}

export function Badge({ children, variant = 'neutral', dot = false }: BadgeProps) {
  const variants = {
    success: { bg: ALPHA.successBgD, color: COLORS.successSoft, dotColor: COLORS.success },
    warning: { bg: ALPHA.warningBgD, color: COLORS.warningLight, dotColor: COLORS.warning },
    danger:  { bg: ALPHA.dangerBgD,  color: COLORS.dangerSoft,  dotColor: COLORS.danger },
    info:    { bg: ALPHA.accentBgD,  color: COLORS.accentSoft,  dotColor: COLORS.accent },
    neutral: { bg: 'rgba(156,163,175,0.15)', color: COLORS.neutralSoft, dotColor: COLORS.neutralLight },
  };

  const config = variants[variant];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ background: config.bg, color: config.color }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.dotColor }} />}
      {children}
    </span>
  );
}
