import { useIsDark } from '@/hooks/useIsDark';
import { STATUS_CFG } from '@/types/orders';

export function OrderStatusBadge({ status }: { status: string }) {
  const isDark = useIsDark();
  const cfg = STATUS_CFG[status] ?? {
    label: status, dot: '#9CA3AF',
    bgD: 'rgba(156,163,175,0.15)', bgL: 'rgba(156,163,175,0.1)',
    txD: '#D1D5DB', txL: '#374151',
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ background: isDark ? cfg.bgD : cfg.bgL, color: isDark ? cfg.txD : cfg.txL }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}
