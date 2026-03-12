'use client';
import { useEffect, useState } from 'react';
import { ShoppingCart, X, Truck, Package, UtensilsCrossed, ChevronRight } from 'lucide-react';
import { NewOrderNotification } from '@/hooks/useNewOrderNotification';
import { formatCurrency } from '@/lib/utils/format';

const ORDER_TYPE_CONFIG: Record<string, { icon: React.FC<any>; label: string; color: string }> = {
  delivery: { icon: Truck, label: 'Entrega', color: '#6366F1' },
  pickup: { icon: Package, label: 'Retirada', color: '#10B981' },
  table: { icon: UtensilsCrossed, label: 'No Local', color: '#F59E0B' },
};

interface NewOrderToastProps {
  notification: NewOrderNotification;
  onDismiss: (id: string) => void;
  onViewOrder?: (orderId: string) => void;
}

function SingleToast({ notification, onDismiss, onViewOrder }: NewOrderToastProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const typeConfig =
    ORDER_TYPE_CONFIG[notification.orderType] ?? ORDER_TYPE_CONFIG.delivery;
  const TypeIcon = typeConfig.icon;

  useEffect(() => {
    // Entra com animação
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(notification.id), 300);
  };

  return (
    <div
      style={{
        transform: visible && !leaving ? 'translateX(0)' : 'translateX(110%)',
        opacity: visible && !leaving ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
        background: 'linear-gradient(135deg, #0F1117 0%, #161b27 100%)',
        border: '1px solid rgba(99,102,241,0.35)',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
        padding: '14px 16px',
        width: 320,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Barra de progresso no topo */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: 2,
          background: `linear-gradient(90deg, ${typeConfig.color}, #8B5CF6)`,
          borderRadius: '16px 16px 0 0',
          animation: 'progress-shrink 8s linear forwards',
        }}
      />

      {/* Pulse de fundo */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `${typeConfig.color}12`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Ícone animado */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${typeConfig.color}33, ${typeConfig.color}18)`,
            border: `1px solid ${typeConfig.color}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            animation: 'pulse-icon 2s ease-in-out infinite',
          }}
        >
          <ShoppingCart size={18} color={typeConfig.color} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: typeConfig.color,
              }}
            >
              Novo Pedido!
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 6px',
                borderRadius: 99,
                background: `${typeConfig.color}18`,
                border: `1px solid ${typeConfig.color}30`,
              }}
            >
              <TypeIcon size={9} color={typeConfig.color} />
              <span style={{ fontSize: 9, fontWeight: 700, color: typeConfig.color }}>
                {typeConfig.label}
              </span>
            </div>
          </div>

          {/* Info */}
          <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
            #{notification.orderNumber} · {notification.customerName}
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
            {formatCurrency(notification.total)} ·{' '}
            {notification.timestamp.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>

          {/* Ação */}
          {onViewOrder && (
            <button
              onClick={() => {
                onViewOrder(notification.orderId);
                dismiss();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 8,
                background: `linear-gradient(135deg, ${typeConfig.color}, ${typeConfig.color}cc)`,
                border: 'none',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: `0 2px 8px ${typeConfig.color}44`,
              }}
            >
              Ver pedido <ChevronRight size={11} />
            </button>
          )}
        </div>

        {/* Fechar */}
        <button
          onClick={dismiss}
          style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            border: 'none',
            background: 'rgba(255,255,255,0.06)',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)',
            flexShrink: 0,
          }}
        >
          <X size={12} />
        </button>
      </div>

      <style>{`
        @keyframes progress-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes pulse-icon {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}

interface NewOrderToastContainerProps {
  notifications: NewOrderNotification[];
  onDismiss: (id: string) => void;
  onViewOrder?: (orderId: string) => void;
}

/**
 * Container de toasts — renderiza no canto inferior direito da tela.
 * Coloque no Layout ou no root do app.
 */
export function NewOrderToastContainer({
  notifications,
  onDismiss,
  onViewOrder,
}: NewOrderToastContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 12,
        pointerEvents: 'none',
      }}
    >
      {notifications.map((n) => (
        <div key={n.id} style={{ pointerEvents: 'auto' }}>
          <SingleToast
            notification={n}
            onDismiss={onDismiss}
            onViewOrder={onViewOrder}
          />
        </div>
      ))}
    </div>
  );
}
