import { formatCurrency } from '@/lib/utils/format';
import { Truck, MapPin, User, Send } from 'lucide-react';

interface Props {
  order: any;
  onDispatch?: (id: string) => void;
  accentColor: string;
  isAdmin: boolean;
}

export function OrderRow({ order, onDispatch, accentColor, isAdmin }: Props) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl transition-all"
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accentColor}18` }}>
        <Truck size={16} style={{ color: accentColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
            #{order.order_number ?? order.id.slice(0, 6).toUpperCase()}
          </p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
            style={{ background: `${accentColor}18`, color: accentColor }}>
            {onDispatch ? 'Aguardando' : 'Em trânsito'}
          </span>
        </div>
        <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
          {order.customer?.name ?? 'Cliente'} · {formatCurrency(order.total)}
        </p>
        {order.delivery_address && (
          <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
            <MapPin size={9} className="inline mr-1" />{order.delivery_address}
          </p>
        )}
        {order.driver && (
          <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: '#818CF8' }}>
            <User size={9} /> {order.driver.name}
          </p>
        )}
      </div>
      {onDispatch && isAdmin && (
        <button onClick={() => onDispatch(order.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shrink-0 transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg,${accentColor},${accentColor}cc)` }}>
          <Send size={11} /> Despachar
        </button>
      )}
    </div>
  );
}
