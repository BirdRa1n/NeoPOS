import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/supabase/client';
import { useStore } from '@/contexts/StoreContext';
import { formatCurrency } from '@/lib/utils/format';

export interface NewOrderNotification {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  total: number;
  orderType: string;
  timestamp: Date;
}

interface UseNewOrderNotificationOptions {
  /** Toca som ao chegar novo pedido (default: true) */
  playSound?: boolean;
  /** Duração do toast em ms (default: 8000) */
  toastDuration?: number;
}

/**
 * Hook que escuta novos pedidos em tempo real e retorna notificações.
 * Pode ser usado no Layout para exibir toasts globais.
 */
export function useNewOrderNotification(options?: UseNewOrderNotificationOptions) {
  const { store } = useStore();
  const { playSound = true, toastDuration = 8000 } = options ?? {};

  const [notifications, setNotifications] = useState<NewOrderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef<AudioContext | null>(null);

  // Toca bip simples via Web Audio API (sem arquivo externo)
  const playNotificationSound = useCallback(() => {
    if (!playSound) return;
    try {
      if (!audioRef.current) {
        audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioRef.current;

      // Dois bips curtos
      const beep = (startTime: number, freq: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        osc.start(startTime);
        osc.stop(startTime + 0.25);
      };

      beep(ctx.currentTime, 880);
      beep(ctx.currentTime + 0.3, 1100);
    } catch {
      // Web Audio não disponível — ignora
    }
  }, [playSound]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (!store) return;

    const channelName = `new-orders-notify-${store.id}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'orders',
          table: 'orders',
          filter: `store_id=eq.${store.id}`,
        },
        async (payload) => {
          // Busca detalhes do pedido com o join de clientes
          const { data } = await supabase
            .schema('orders')
            .from('orders_with_details')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          const order = data ?? payload.new;

          const notification: NewOrderNotification = {
            id: `notif-${Date.now()}`,
            orderId: order.id,
            orderNumber: order.order_number ?? order.id.slice(0, 6).toUpperCase(),
            customerName: order.customer?.name ?? order.customer_name ?? 'Cliente',
            total: order.total ?? 0,
            orderType: order.order_type ?? order.type ?? 'delivery',
            timestamp: new Date(),
          };

          setNotifications((prev) => [notification, ...prev].slice(0, 5)); // max 5 toasts
          setUnreadCount((c) => c + 1);
          playNotificationSound();

          // Auto-dismiss
          setTimeout(() => {
            dismissNotification(notification.id);
          }, toastDuration);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [store, playSound, toastDuration, playNotificationSound, dismissNotification]);

  return {
    notifications,
    unreadCount,
    dismissNotification,
    clearAll,
    markAsRead,
  };
}
