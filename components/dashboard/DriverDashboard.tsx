import { useStore } from "@/contexts/StoreContext";
import { useIsDark } from "@/hooks/useIsDark";
import { useOrders } from "@/hooks/useOrders";
import { COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils/format";
import { supabase } from "@/supabase/client";
import { DriverStats } from "@/types/delivery";
import { Award, BarChart3, Calendar, DollarSign, TrendingUp, Truck } from "lucide-react";
import { useEffect, useState } from "react";

// ─── Driver Dashboard (para membros que são entregadores) ─────────────────────
export function DriverDashboard({ staffMemberId }: { staffMemberId: string }) {
  const isDark = useIsDark();
  const { store } = useStore();
  const [driverStats, setDriverStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store?.id || !staffMemberId) return;
    supabase.schema('core').from('driver_delivery_stats')
      .select('*')
      .eq('store_id', store.id)
      .eq('staff_member_id', staffMemberId)
      .maybeSingle()
      .then(({ data }) => {
        setDriverStats(data as DriverStats ?? null);
        setLoading(false);
      });
  }, [store?.id, staffMemberId]);

  const { orders: activeDeliveries = [] } = useOrders('out_for_delivery' as any) as any;
  const myDeliveries = (activeDeliveries as any[]).filter(o =>
    (o.order_type === 'delivery' || o.type === 'delivery') && o.driver_id === driverStats?.driver_id
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  );

  if (!driverStats) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <Truck size={28} style={{ color: '#818CF8', opacity: 0.6 }} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Conta não vinculada</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Peça ao administrador para vincular seu perfil a um entregador.
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Saudação */}
      <div className="rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}>
            {driverStats.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#818CF8' }}>Bem-vindo de volta</p>
            <p className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{driverStats.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full" style={{ background: driverStats.active ? '#10B981' : '#6B7280' }} />
              <span className="text-xs font-medium" style={{ color: driverStats.active ? '#10B981' : 'var(--text-muted)' }}>
                {driverStats.active ? 'Disponível para entregas' : 'Inativo no momento'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats do dia */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Entregas hoje', value: driverStats.deliveries_today, color: COLORS.accent, icon: Truck },
          { label: 'Taxas hoje', value: formatCurrency(Number(driverStats.fee_today)), color: COLORS.success, icon: DollarSign },
          { label: 'Entregas na semana', value: driverStats.deliveries_week, color: COLORS.purple, icon: Calendar },
          { label: 'Taxas na semana', value: formatCurrency(Number(driverStats.fee_week)), color: COLORS.warning, icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-2xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon size={13} style={{ color }} />
              </div>
            </div>
            <p className="text-xl font-black" style={{ color }}>{value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Histórico mensal/anual */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border-soft)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Resumo de Performance</p>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: 'Este mês', deliveries: driverStats.deliveries_month, fee: driverStats.fee_month, icon: BarChart3, color: COLORS.accent },
            { label: 'Este ano', deliveries: driverStats.deliveries_year, fee: driverStats.fee_year, icon: Award, color: COLORS.purple },
          ].map(({ label, deliveries, fee, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-4 px-4 py-3 rounded-xl"
              style={{ background: isDark ? `${color}08` : `${color}05`, border: `1px solid ${color}20` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{deliveries} entregas</p>
              </div>
              <p className="text-base font-black" style={{ color }}>{formatCurrency(Number(fee))}</p>
            </div>
          ))}
          {driverStats.last_delivery_at && (
            <p className="text-[11px] text-center" style={{ color: 'var(--text-muted)' }}>
              Última entrega: {new Date(driverStats.last_delivery_at).toLocaleString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>

      {/* Entregas ativas */}
      {myDeliveries.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
          <div className="flex items-center gap-2.5 px-5 pt-5 pb-3" style={{ borderBottom: '1px solid var(--border-soft)' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Truck size={14} style={{ color: '#818CF8' }} />
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Minhas Entregas Ativas</span>
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#818CF8' }}>
              {myDeliveries.length}
            </span>
          </div>
          <div className="px-2 py-2 space-y-1">
            {myDeliveries.map((o: any) => (
              <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl"
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(99,102,241,0.12)' }}>
                  <Truck size={14} style={{ color: '#818CF8' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    #{o.order_number ?? o.id.slice(0, 6)}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {o.customer?.name ?? 'Cliente'}{o.delivery_address ? ` · ${o.delivery_address}` : ''}
                  </p>
                </div>
                <span className="text-sm font-bold" style={{ color: COLORS.success }}>{formatCurrency(o.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}