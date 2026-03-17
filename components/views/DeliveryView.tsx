'use client';
import { DispatchModal } from '@/components/orders/DispatchModal';
import { DeleteConfirm } from '@/components/ui/DeleteConfirm';
import { useStaff } from '@/contexts/StaffContext';
import { useStore } from '@/contexts/StoreContext';
import { useActiveStaffMembers } from '@/hooks/useActiveStaffMembers';
import { useDeliveryDrivers, useDeliveryZones } from '@/hooks/useDelivery';
import { useDriverStats } from '@/hooks/useDriverStats';
import { useIsDark } from '@/hooks/useIsDark';
import { useOrders } from '@/hooks/useOrders';
import { COLORS, ALPHA } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils/format';
import { supabase } from '@/supabase/client';
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Edit,
  Link2,
  MapPin,
  Navigation,
  Package,
  Plus,
  Trash2,
  TrendingUp,
  Truck,
  User,
  Users
} from 'lucide-react';
import { useState } from 'react';
import { DriverModal, DriverStatsCard, OrderRow, ZoneModal } from '../delivery';

type Tab = 'live' | 'zones' | 'drivers';
const db = () => supabase.schema('core');

// ─── Main View ────────────────────────────────────────────────────────────────
export function DeliveryView() {
  const isDark = useIsDark();
  const { store } = useStore();
  const { userRole, can } = useStaff();
  const isAdmin = userRole === 'owner' || can('perm_store_settings' as any);

  const [tab, setTab] = useState<Tab>('live');
  const [modal, setModal] = useState<null | 'zone-create' | 'zone-edit' | 'zone-delete' | 'driver-create' | 'driver-edit' | 'driver-delete' | 'dispatch'>(null);
  const [sel, setSel] = useState<any>(null);
  const [dispatchOrderId, setDispatchOrderId] = useState<string | null>(null);
  const [delLoad, setDL] = useState(false);

  const { orders: delivering = [] } = useOrders('out_for_delivery' as any) as any;
  const { orders: ready = [] } = useOrders('preparing' as any) as any;
  const { orders: delivered = [] } = useOrders('delivered' as any) as any;
  const { zones = [], refetch: refetchZones } = useDeliveryZones() as any;
  const { drivers = [], refetch: refetchDrivers } = useDeliveryDrivers() as any;
  const { stats: driverStats, loading: statsLoading, refetch: refetchStats } = useDriverStats(store?.id);
  const staffMembers = useActiveStaffMembers(store?.id);

  const activeDeliveries = (delivering as any[]).filter(o => o.order_type === 'delivery' || o.type === 'delivery');
  const pendingDeliveries = (ready as any[]).filter(o => o.order_type === 'delivery' || o.type === 'delivery');
  const doneToday = (delivered as any[]).filter(o => o.order_type === 'delivery' || o.type === 'delivery');
  const activeDrivers = (drivers as any[]).filter(d => d.active);

  const totalDeliveriesToday = driverStats.reduce((s, d) => s + d.deliveries_today, 0);
  const totalFeesToday = driverStats.reduce((s, d) => s + Number(d.fee_today), 0);
  const totalDeliveriesMonth = driverStats.reduce((s, d) => s + d.deliveries_month, 0);

  const open = (kind: typeof modal, item?: any) => { setSel(item ?? null); setModal(kind); };
  const close = () => { setModal(null); setSel(null); };

  const handleDeleteZone = async () => {
    setDL(true);
    try { const { error } = await db().from('delivery_zones').delete().eq('id', sel.id); if (error) throw error; await refetchZones?.(); close(); }
    catch (err: any) { alert(err.message); } finally { setDL(false); }
  };

  const handleDeleteDriver = async () => {
    setDL(true);
    try { const { error } = await db().from('delivery_drivers').delete().eq('id', sel.id); if (error) throw error; await refetchDrivers?.(); await refetchStats(); close(); }
    catch (err: any) { alert(err.message); } finally { setDL(false); }
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'live', label: 'Ao Vivo' },
    { id: 'zones', label: `Zonas (${zones.length})` },
    { id: 'drivers', label: `Entregadores (${driverStats.length})` },
  ];

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Entregas</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Monitoramento e configuração de entregas</p>
          </div>
          {isAdmin && tab === 'zones' && (
            <button onClick={() => open('zone-create')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: COLORS.successGradient, boxShadow: COLORS.successShadow }}>
              <Plus size={15} /> Nova Zona
            </button>
          )}
          {isAdmin && tab === 'drivers' && (
            <button onClick={() => open('driver-create')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg,${COLORS.purple},#7C3AED)`, boxShadow: `0 4px 14px ${ALPHA.purpleBgD}` }}>
              <Plus size={15} /> Novo Entregador
            </button>
          )}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Em Trânsito', value: activeDeliveries.length, color: COLORS.accent, icon: Truck },
            { label: 'Aguardando', value: pendingDeliveries.length, color: COLORS.warning, icon: Clock },
            { label: tab === 'drivers' ? 'Entregas hoje' : 'Entregues Hoje', value: tab === 'drivers' ? totalDeliveriesToday : doneToday.length, color: COLORS.success, icon: CheckCircle2 },
            { label: tab === 'drivers' ? 'Entregas (mês)' : 'Entregadores Ativos', value: tab === 'drivers' ? totalDeliveriesMonth : activeDrivers.length, color: COLORS.purple, icon: tab === 'drivers' ? TrendingUp : Navigation },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                <Icon size={15} style={{ color }} />
              </div>
              <div>
                <p className="text-lg font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{value}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: tab === id ? (isDark ? ALPHA.accentBgD : ALPHA.accentBgL) : 'transparent',
                color: tab === id ? COLORS.accentLight : 'var(--text-muted)',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Ao Vivo ── */}
        {tab === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              { title: 'Em Andamento', list: activeDeliveries, color: COLORS.accent, icon: Truck, emptyText: 'Nenhuma entrega em andamento', dispatch: false },
              { title: 'Aguardando Despacho', list: pendingDeliveries, color: COLORS.warning, icon: Package, emptyText: 'Nenhum pedido aguardando', dispatch: true },
            ].map(({ title, list, color, icon: Icon, emptyText, dispatch }) => (
              <div key={title} className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
                <div className="flex items-center gap-2.5 px-5 pt-5 pb-3" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</span>
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>{list.length}</span>
                </div>
                <div className="px-2 py-2 space-y-1 min-h-[160px]">
                  {list.length === 0 ? (
                    <div className="flex flex-col items-center py-12 gap-2">
                      <Icon size={28} style={{ color: 'var(--text-muted)', opacity: 0.25 }} />
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{emptyText}</p>
                    </div>
                  ) : list.map((o: any) => (
                    <OrderRow key={o.id} order={o} accentColor={color} isAdmin={isAdmin}
                      onDispatch={dispatch ? (id) => { setDispatchOrderId(id); setModal('dispatch'); } : undefined} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Zonas ── */}
        {tab === 'zones' && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Bairro', 'Cidade', 'UF', 'Taxa', 'Tempo Est.', 'Status', ...(isAdmin ? [''] : [])].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(zones as any[]).map((zone: any) => (
                    <tr key={zone.id} className="transition-colors group" style={{ borderBottom: '1px solid var(--border-soft)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <td className="px-5 py-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{zone.neighborhood}</td>
                      <td className="px-5 py-4" style={{ color: 'var(--text-secondary)' }}>{zone.city}</td>
                      <td className="px-5 py-4 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{zone.state}</td>
                      <td className="px-5 py-4 font-bold" style={{ color: COLORS.success }}>{formatCurrency(zone.delivery_fee)}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                          {zone.estimated_time_min ? `${zone.estimated_time_min} min` : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                          style={{
                            background: zone.active ? (isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)') : (isDark ? 'rgba(107,114,128,0.12)' : 'rgba(107,114,128,0.08)'),
                            color: zone.active ? '#10B981' : (isDark ? '#9CA3AF' : '#6B7280'),
                          }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: zone.active ? '#10B981' : '#6B7280' }} />
                          {zone.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => open('zone-edit', zone)} className="w-8 h-8 flex items-center justify-center rounded-xl transition-all" style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: ALPHA.accentBgSubtleD, color: COLORS.accentLight })}
                              onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}><Edit size={14} /></button>
                            <button onClick={() => open('zone-delete', zone)} className="w-8 h-8 flex items-center justify-center rounded-xl transition-all" style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: ALPHA.dangerBgSubtle, color: COLORS.dangerLight })}
                              onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {zones.length === 0 && (
              <div className="flex flex-col items-center py-16 gap-3">
                <MapPin size={32} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhuma zona cadastrada</p>
                {isAdmin && (
                  <button onClick={() => open('zone-create')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                    style={{ background: COLORS.successGradient }}>
                    <Plus size={14} /> Criar Zona
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Entregadores ── */}
        {tab === 'drivers' && (
          <>
            {driverStats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Taxas hoje', value: formatCurrency(totalFeesToday), color: COLORS.success, icon: DollarSign },
                  { label: 'Entregas mês', value: totalDeliveriesMonth, color: COLORS.accent, icon: TrendingUp },
                  { label: 'Ativos', value: activeDrivers.length, color: COLORS.purple, icon: Users },
                  { label: 'Vinculados à equipe', value: driverStats.filter(d => d.staff_member_id).length, color: COLORS.warning, icon: Link2 },
                ].map(({ label, value, color, icon: Icon }) => (
                  <div key={label} className="rounded-2xl px-4 py-3 flex items-center gap-3"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                      <Icon size={15} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-base font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{value}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {statsLoading ? (
                <div className="col-span-full flex justify-center py-16">
                  <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: COLORS.accent, borderTopColor: 'transparent' }} />
                </div>
              ) : driverStats.length === 0 ? (
                <div className="col-span-full flex flex-col items-center py-16 gap-3">
                  <User size={32} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum entregador cadastrado</p>
                  {isAdmin && (
                    <button onClick={() => open('driver-create')}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                      style={{ background: `linear-gradient(135deg,${COLORS.purple},#7C3AED)` }}>
                      <Plus size={14} /> Cadastrar Entregador
                    </button>
                  )}
                </div>
              ) : driverStats.map(d => {
                const driverRecord = (drivers as any[]).find(dr => dr.id === d.driver_id);
                return (
                  <DriverStatsCard key={d.driver_id} stats={d} isDark={isDark} staffMembers={staffMembers} isAdmin={isAdmin}
                    onEdit={() => open('driver-edit', driverRecord ?? { ...d, id: d.driver_id })}
                    onDelete={() => open('driver-delete', driverRecord ?? { ...d, id: d.driver_id })} />
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modals — somente admin pode abrir os de mutação */}
      {isAdmin && modal === 'zone-create' && store && <ZoneModal storeId={store.id} onClose={close} onSuccess={async () => { await refetchZones?.(); close(); }} />}
      {isAdmin && modal === 'zone-edit' && sel && store && <ZoneModal zone={sel} storeId={store.id} onClose={close} onSuccess={async () => { await refetchZones?.(); close(); }} />}
      {isAdmin && modal === 'zone-delete' && sel && <DeleteConfirm title="Remover Zona" description={`Remover zona <strong>${sel.neighborhood}</strong>?`} onClose={close} onConfirm={handleDeleteZone} loading={delLoad} />}
      {isAdmin && modal === 'driver-create' && store && <DriverModal storeId={store.id} staffMembers={staffMembers} onClose={close} onSuccess={async () => { await refetchDrivers?.(); await refetchStats(); close(); }} />}
      {isAdmin && modal === 'driver-edit' && sel && store && <DriverModal driver={sel} storeId={store.id} staffMembers={staffMembers} onClose={close} onSuccess={async () => { await refetchDrivers?.(); await refetchStats(); close(); }} />}
      {isAdmin && modal === 'driver-delete' && sel && <DeleteConfirm title="Remover Entregador" description={`Remover entregador <strong>${sel.name}</strong>?`} onClose={close} onConfirm={handleDeleteDriver} loading={delLoad} />}
      {modal === 'dispatch' && dispatchOrderId && (
        <DispatchModal orderId={dispatchOrderId} drivers={drivers as any[]}
          onClose={() => { setModal(null); setDispatchOrderId(null); }} onSuccess={() => { }} />
      )}
    </>
  );
}