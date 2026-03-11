'use client';
import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useDeliveryZones, useDeliveryDrivers } from '@/hooks/useDelivery';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/supabase/client';
import { formatCurrency } from '@/lib/utils/format';
import {
  Truck, MapPin, Clock, CheckCircle2, Navigation, Plus, User,
  Bike, Edit, X, Loader2, AlertTriangle, Trash2,
  ToggleLeft, ToggleRight, DollarSign, Phone, Package, Send,
  Building2,
} from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────
function useIsDark() {
  if (typeof window === 'undefined') return true;
  return (getComputedStyle(document.documentElement).getPropertyValue('--bg') || '').trim().startsWith('#08');
}
type Tab = 'live' | 'zones' | 'drivers';

// Sempre schema core
const db = () => supabase.schema('core');

// ─── Shared modal primitives ──────────────────────────────────────────────────
function Backdrop({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      {children}
    </div>
  );
}
function Shell({ children, maxW = 'max-w-lg' }: { children: React.ReactNode; maxW?: string }) {
  const isDark = useIsDark();
  return (
    <div className={`w-full ${maxW} max-h-[92vh] flex flex-col rounded-2xl overflow-hidden`}
      style={{ background: isDark ? '#0F1117' : '#FFFFFF', border: '1px solid var(--border)', boxShadow: isDark ? '0 24px 64px rgba(0,0,0,0.7)' : '0 24px 64px rgba(0,0,0,0.14)' }}>
      {children}
    </div>
  );
}
function MHead({ title, subtitle, icon: Icon, iconColor = '#6366F1', onClose }: {
  title: string; subtitle?: string; icon: React.FC<any>; iconColor?: string; onClose: () => void;
}) {
  const isDark = useIsDark();
  return (
    <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg,${iconColor},${iconColor}88)` }}>
          <Icon size={15} color="#fff" />
        </div>
        <div>
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          {subtitle && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
        </div>
      </div>
      <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl transition-all" style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: 'var(--text-primary)' })}
        onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}>
        <X size={16} />
      </button>
    </div>
  );
}
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {label}{required && <span style={{ color: '#EF4444' }}>*</span>}
      </label>
      {children}
    </div>
  );
}
function Input({ icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.FC<any> }) {
  return (
    <div className="relative">
      {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><Icon size={13} style={{ color: 'var(--text-muted)' }} /></div>}
      <input {...props}
        className="w-full rounded-xl text-sm outline-none transition-all"
        style={{ paddingLeft: Icon ? '2.25rem' : '0.875rem', paddingRight: '0.875rem', paddingTop: '0.6rem', paddingBottom: '0.6rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
        onFocus={e => (e.currentTarget.style.borderColor = '#6366F1')}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')} />
    </div>
  );
}
function SectionLabel({ label, color = '#6366F1' }: { label: string; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color }}>{label}</p>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  const isDark = useIsDark();
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all w-full"
      style={{
        background: checked ? (isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.07)') : (isDark ? 'rgba(107,114,128,0.1)' : 'rgba(107,114,128,0.06)'),
        border: `1px solid ${checked ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
      }}>
      {checked ? <ToggleRight size={20} style={{ color: '#10B981' }} /> : <ToggleLeft size={20} style={{ color: 'var(--text-muted)' }} />}
      <span className="text-sm font-medium" style={{ color: checked ? '#10B981' : 'var(--text-secondary)' }}>{label}</span>
      <span className="ml-auto text-xs font-bold" style={{ color: checked ? '#10B981' : 'var(--text-muted)' }}>
        {checked ? 'Ativo' : 'Inativo'}
      </span>
    </button>
  );
}
function ModalFooter({ onCancel, saving, saveLabel, accentColor = '#6366F1' }: {
  onCancel: () => void; saving: boolean; saveLabel: string; accentColor?: string;
}) {
  const isDark = useIsDark();
  return (
    <div className="flex items-center justify-end gap-2 px-6 py-4 shrink-0"
      style={{ borderTop: '1px solid var(--border)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
      <button type="button" onClick={onCancel}
        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)'}>
        Cancelar
      </button>
      <button type="submit" disabled={saving}
        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all"
        style={{ background: `linear-gradient(135deg,${accentColor},${accentColor}cc)`, boxShadow: `0 4px 14px ${accentColor}44` }}>
        {saving ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : <><CheckCircle2 size={14} />{saveLabel}</>}
      </button>
    </div>
  );
}
function DeleteConfirm({ title, desc, onClose, onConfirm, loading }: {
  title: string; desc: string; onClose: () => void; onConfirm: () => void; loading: boolean;
}) {
  const isDark = useIsDark();
  return (
    <Backdrop onClose={onClose}>
      <Shell maxW="max-w-sm">
        <div className="p-7 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.07)' }}>
            <AlertTriangle size={26} style={{ color: '#EF4444' }} />
          </div>
          <div>
            <p className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: desc }} />
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)'}>
              Cancelar
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {loading ? 'Removendo...' : 'Remover'}
            </button>
          </div>
        </div>
      </Shell>
    </Backdrop>
  );
}

// ─── Zone modal ───────────────────────────────────────────────────────────────
// Colunas reais: neighborhood, city, state, delivery_fee, estimated_time_min, active
function ZoneModal({ zone, storeId, onClose, onSuccess }: { zone?: any; storeId: string; onClose: () => void; onSuccess: () => void }) {
  const isEdit = !!zone;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    neighborhood: zone?.neighborhood ?? '',
    city: zone?.city ?? '',
    state: zone?.state ?? '',
    delivery_fee: zone?.delivery_fee ?? '',
    estimated_time_min: zone?.estimated_time_min ?? '',
    active: zone?.active ?? true,
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        store_id: storeId,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
        delivery_fee: parseFloat(form.delivery_fee as any) || 0,
        estimated_time_min: parseInt(form.estimated_time_min as any) || null,
        active: form.active,
      };
      if (isEdit) {
        const { error } = await db().from('delivery_zones').update(payload).eq('id', zone.id);
        if (error) throw error;
      } else {
        const { error } = await db().from('delivery_zones').insert(payload);
        if (error) throw error;
      }
      onSuccess();
    } catch (err: any) { alert(err.message ?? 'Erro ao salvar zona'); }
    finally { setSaving(false); }
  };

  return (
    <Backdrop onClose={onClose}>
      <Shell maxW="max-w-md">
        <MHead title={isEdit ? 'Editar Zona' : 'Nova Zona de Entrega'} subtitle="Configure bairro, taxa e tempo estimado" icon={MapPin} iconColor="#10B981" onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <SectionLabel label="Localização" color="#10B981" />
            <Field label="Bairro" required>
              <Input icon={MapPin} value={form.neighborhood} onChange={set('neighborhood')} placeholder="Centro" required />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Field label="Cidade" required>
                  <Input icon={Building2} value={form.city} onChange={set('city')} placeholder="Fortaleza" required />
                </Field>
              </div>
              <Field label="UF">
                <Input value={form.state} onChange={set('state')} placeholder="CE" maxLength={2} />
              </Field>
            </div>
            <div style={{ height: 1, background: 'var(--border)' }} />
            <SectionLabel label="Configurações" color="#6366F1" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Taxa de Entrega (R$)" required>
                <Input icon={DollarSign} type="number" step="0.01" min="0" value={form.delivery_fee} onChange={set('delivery_fee')} placeholder="5,00" required />
              </Field>
              <Field label="Tempo Est. (min)">
                <Input icon={Clock} type="number" min="1" value={form.estimated_time_min} onChange={set('estimated_time_min')} placeholder="30" />
              </Field>
            </div>
            <Field label="Status">
              <Toggle label="Zona disponível para entregas" checked={form.active} onChange={v => setForm(f => ({ ...f, active: v }))} />
            </Field>
          </div>
          <ModalFooter onCancel={onClose} saving={saving} saveLabel={isEdit ? 'Salvar Zona' : 'Criar Zona'} accentColor="#10B981" />
        </form>
      </Shell>
    </Backdrop>
  );
}

// ─── Driver modal ─────────────────────────────────────────────────────────────
// Colunas reais: name, phone, vehicle, plate, active
const VEHICLE_TYPES = ['Moto', 'Bicicleta', 'Carro', 'A pé'];

function DriverModal({ driver, storeId, onClose, onSuccess }: { driver?: any; storeId: string; onClose: () => void; onSuccess: () => void }) {
  const isDark = useIsDark();
  const isEdit = !!driver;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: driver?.name ?? '',
    phone: driver?.phone ?? '',
    vehicle: driver?.vehicle ?? 'Moto',   // coluna: vehicle
    plate: driver?.plate ?? '',        // coluna: plate
    active: driver?.active ?? true,
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, store_id: storeId };
      if (isEdit) {
        const { error } = await db().from('delivery_drivers').update(payload).eq('id', driver.id);
        if (error) throw error;
      } else {
        const { error } = await db().from('delivery_drivers').insert(payload);
        if (error) throw error;
      }
      onSuccess();
    } catch (err: any) { alert(err.message ?? 'Erro ao salvar entregador'); }
    finally { setSaving(false); }
  };

  return (
    <Backdrop onClose={onClose}>
      <Shell maxW="max-w-md">
        <MHead title={isEdit ? 'Editar Entregador' : 'Novo Entregador'} subtitle="Cadastre um entregador na equipe" icon={User} iconColor="#8B5CF6" onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <SectionLabel label="Dados Pessoais" color="#8B5CF6" />
            <Field label="Nome Completo" required>
              <Input icon={User} value={form.name} onChange={set('name')} placeholder="Carlos Souza" required />
            </Field>
            <Field label="Telefone">
              <Input icon={Phone} value={form.phone} onChange={set('phone')} placeholder="(00) 00000-0000" />
            </Field>
            <div style={{ height: 1, background: 'var(--border)' }} />
            <SectionLabel label="Veículo" color="#6366F1" />
            <Field label="Tipo de Veículo">
              <div className="grid grid-cols-4 gap-2">
                {VEHICLE_TYPES.map(v => (
                  <button key={v} type="button" onClick={() => setForm(f => ({ ...f, vehicle: v }))}
                    className="py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: form.vehicle === v ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)') : 'var(--input-bg)',
                      border: `1px solid ${form.vehicle === v ? '#6366F1' : 'var(--input-border)'}`,
                      color: form.vehicle === v ? '#818CF8' : 'var(--text-muted)',
                    }}>
                    {v}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Placa">
              <Input icon={Bike} value={form.plate} onChange={set('plate')} placeholder="ABC-1234" />
            </Field>
            <Field label="Disponibilidade">
              <Toggle label="Entregador disponível para serviço" checked={form.active} onChange={v => setForm(f => ({ ...f, active: v }))} />
            </Field>
          </div>
          <ModalFooter onCancel={onClose} saving={saving} saveLabel={isEdit ? 'Salvar' : 'Cadastrar'} accentColor="#8B5CF6" />
        </form>
      </Shell>
    </Backdrop>
  );
}

// ─── Order row (live) ─────────────────────────────────────────────────────────
function OrderRow({ order, onDispatch, accentColor }: { order: any; onDispatch?: (id: string) => void; accentColor: string }) {
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
      </div>
      {onDispatch && (
        <button onClick={() => onDispatch(order.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shrink-0 transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg,${accentColor},${accentColor}cc)` }}>
          <Send size={11} /> Despachar
        </button>
      )}
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────
export function DeliveryView() {
  const isDark = useIsDark();
  const { store } = useStore();

  const [tab, setTab] = useState<Tab>('live');
  const [modal, setModal] = useState<null | 'zone-create' | 'zone-edit' | 'zone-delete' | 'driver-create' | 'driver-edit' | 'driver-delete'>(null);
  const [sel, setSel] = useState<any>(null);
  const [delLoad, setDL] = useState(false);

  const { orders: delivering = [] } = useOrders('out_for_delivery' as any) as any;
  const { orders: ready = [] } = useOrders('preparing' as any) as any;
  const { orders: delivered = [] } = useOrders('delivered' as any) as any;
  const { zones = [], refetch: refetchZones, loading: zonesLoading } = useDeliveryZones() as any;
  const { drivers = [], refetch: refetchDrivers, loading: driversLoading } = useDeliveryDrivers() as any;

  const activeDeliveries = (delivering as any[]).filter(o => o.order_type === 'delivery');
  const pendingDeliveries = (ready as any[]).filter(o => o.order_type === 'delivery');
  const doneToday = (delivered as any[]).filter(o => o.order_type === 'delivery');
  const activeDrivers = (drivers as any[]).filter(d => d.active);

  const open = (kind: typeof modal, item?: any) => { setSel(item ?? null); setModal(kind); };
  const close = () => { setModal(null); setSel(null); };

  const handleDispatch = async (orderId: string) => {
    try {
      // orders está no schema orders
      const { error } = await supabase.schema('orders').from('orders').update({ status: 'out_for_delivery' }).eq('id', orderId);
      if (error) throw error;
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteZone = async () => {
    setDL(true);
    try {
      const { error } = await db().from('delivery_zones').delete().eq('id', sel.id);
      if (error) throw error;
      await refetchZones?.();
      close();
    } catch (err: any) { alert(err.message); } finally { setDL(false); }
  };

  const handleDeleteDriver = async () => {
    setDL(true);
    try {
      const { error } = await db().from('delivery_drivers').delete().eq('id', sel.id);
      if (error) throw error;
      await refetchDrivers?.();
      close();
    } catch (err: any) { alert(err.message); } finally { setDL(false); }
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'live', label: 'Ao Vivo' },
    { id: 'zones', label: `Zonas (${zones.length})` },
    { id: 'drivers', label: `Entregadores (${drivers.length})` },
  ];

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Entregas</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Monitoramento e configuração de entregas</p>
          </div>
          {tab === 'zones' && (
            <button onClick={() => open('zone-create')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
              <Plus size={15} /> Nova Zona
            </button>
          )}
          {tab === 'drivers' && (
            <button onClick={() => open('driver-create')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', boxShadow: '0 4px 14px rgba(139,92,246,0.3)' }}>
              <Plus size={15} /> Novo Entregador
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Em Trânsito', value: activeDeliveries.length, color: '#6366F1', icon: Truck },
            { label: 'Aguardando', value: pendingDeliveries.length, color: '#F59E0B', icon: Clock },
            { label: 'Entregues Hoje', value: doneToday.length, color: '#10B981', icon: CheckCircle2 },
            { label: 'Entregadores', value: activeDrivers.length, color: '#8B5CF6', icon: Navigation },
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
                background: tab === id ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)') : 'transparent',
                color: tab === id ? '#818CF8' : 'var(--text-muted)',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Ao Vivo ── */}
        {tab === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              { title: 'Em Andamento', list: activeDeliveries, color: '#6366F1', icon: Truck, emptyText: 'Nenhuma entrega em andamento', dispatch: false },
              { title: 'Aguardando Despacho', list: pendingDeliveries, color: '#F59E0B', icon: Package, emptyText: 'Nenhum pedido aguardando', dispatch: true },
            ].map(({ title, list, color, icon: Icon, emptyText, dispatch }) => (
              <div key={title} className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
                <div className="flex items-center gap-2.5 px-5 pt-5 pb-3" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</span>
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${color}18`, color }}>
                    {list.length}
                  </span>
                </div>
                <div className="px-2 py-2 space-y-1 min-h-[160px]">
                  {list.length === 0 ? (
                    <div className="flex flex-col items-center py-12 gap-2">
                      <Icon size={28} style={{ color: 'var(--text-muted)', opacity: 0.25 }} />
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{emptyText}</p>
                    </div>
                  ) : list.map((o: any) => (
                    <OrderRow key={o.id} order={o} accentColor={color} onDispatch={dispatch ? handleDispatch : undefined} />
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
                    {['Bairro', 'Cidade', 'UF', 'Taxa', 'Tempo Est.', 'Status', ''].map(h => (
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
                      <td className="px-5 py-4 font-bold" style={{ color: '#10B981' }}>{formatCurrency(zone.delivery_fee)}</td>
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
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => open('zone-edit', zone)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all" style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(99,102,241,0.12)', color: '#818CF8' })}
                            onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}>
                            <Edit size={14} />
                          </button>
                          <button onClick={() => open('zone-delete', zone)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all" style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(239,68,68,0.12)', color: '#F87171' })}
                            onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {zones.length === 0 && (
              <div className="flex flex-col items-center py-16 gap-3">
                <MapPin size={32} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhuma zona cadastrada</p>
                <button onClick={() => open('zone-create')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}>
                  <Plus size={14} /> Criar Zona
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Entregadores ── */}
        {tab === 'drivers' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(drivers as any[]).map((d: any) => (
              <div key={d.id} className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-base"
                      style={{ background: d.active ? 'linear-gradient(135deg,#8B5CF6,#7C3AED)' : (isDark ? 'rgba(107,114,128,0.2)' : 'rgba(107,114,128,0.15)'), color: d.active ? '#fff' : 'var(--text-muted)' }}>
                      {d.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{d.name}</p>
                      {d.phone && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{d.phone}</p>}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: d.active ? (isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)') : (isDark ? 'rgba(107,114,128,0.12)' : 'rgba(107,114,128,0.08)'),
                      color: d.active ? '#10B981' : (isDark ? '#9CA3AF' : '#6B7280'),
                    }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.active ? '#10B981' : '#6B7280' }} />
                    {d.active ? 'Disponível' : 'Inativo'}
                  </span>
                </div>

                {(d.vehicle || d.plate) && (
                  <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl"
                    style={{ background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)', border: '1px solid var(--border-soft)' }}>
                    <Bike size={13} style={{ color: '#818CF8' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {d.vehicle}{d.plate ? ` · ${d.plate}` : ''}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
                  <button onClick={() => open('driver-edit', d)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)', color: '#818CF8' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.14)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)'}>
                    <Edit size={13} /> Editar
                  </button>
                  <button onClick={() => open('driver-delete', d)}
                    className="w-9 h-[34px] flex items-center justify-center rounded-xl transition-all"
                    style={{ background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)', color: '#F87171' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.12)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)'}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {drivers.length === 0 && (
              <div className="col-span-full flex flex-col items-center py-16 gap-3">
                <User size={32} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum entregador cadastrado</p>
                <button onClick={() => open('driver-create')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' }}>
                  <Plus size={14} /> Cadastrar Entregador
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal === 'zone-create' && store && (
        <ZoneModal storeId={store.id} onClose={close} onSuccess={async () => { await refetchZones?.(); close(); }} />
      )}
      {modal === 'zone-edit' && sel && store && (
        <ZoneModal zone={sel} storeId={store.id} onClose={close} onSuccess={async () => { await refetchZones?.(); close(); }} />
      )}
      {modal === 'zone-delete' && sel && (
        <DeleteConfirm title="Remover Zona" desc={`Remover zona <strong>${sel.neighborhood}</strong>? Esta ação não pode ser desfeita.`} onClose={close} onConfirm={handleDeleteZone} loading={delLoad} />
      )}
      {modal === 'driver-create' && store && (
        <DriverModal storeId={store.id} onClose={close} onSuccess={async () => { await refetchDrivers?.(); close(); }} />
      )}
      {modal === 'driver-edit' && sel && store && (
        <DriverModal driver={sel} storeId={store.id} onClose={close} onSuccess={async () => { await refetchDrivers?.(); close(); }} />
      )}
      {modal === 'driver-delete' && sel && (
        <DeleteConfirm title="Remover Entregador" desc={`Remover entregador <strong>${sel.name}</strong>? Esta ação não pode ser desfeita.`} onClose={close} onConfirm={handleDeleteDriver} loading={delLoad} />
      )}
    </>
  );
}