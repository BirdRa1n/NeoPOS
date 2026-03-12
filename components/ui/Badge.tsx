interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  dot?: boolean;
}

export function Badge({ children, variant = 'neutral', dot = false }: BadgeProps) {
  const variants = {
    success: { bg: 'rgba(16,185,129,0.15)', color: '#6EE7B7', dotColor: '#10B981' },
    warning: { bg: 'rgba(245,158,11,0.15)', color: '#FCD34D', dotColor: '#F59E0B' },
    danger: { bg: 'rgba(239,68,68,0.15)', color: '#FCA5A5', dotColor: '#EF4444' },
    info: { bg: 'rgba(99,102,241,0.15)', color: '#A5B4FC', dotColor: '#6366F1' },
    neutral: { bg: 'rgba(156,163,175,0.15)', color: '#D1D5DB', dotColor: '#9CA3AF' },
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
