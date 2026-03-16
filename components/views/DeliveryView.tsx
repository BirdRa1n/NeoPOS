'use client';
import { useState, useEffect } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useDeliveryZones, useDeliveryDrivers } from '@/hooks/useDelivery';
import { useStore } from '@/contexts/StoreContext';
import { useStaff } from '@/contexts/StaffContext';
import { supabase } from '@/supabase/client';
import { formatCurrency } from '@/lib/utils/format';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/forms/FormField';
import { ModalBackdrop, ModalShell, ModalHeader, ModalFooter } from '@/components/ui/Modal';
import { Toggle } from '@/components/ui/Toggle';
import { DeleteConfirm } from '@/components/ui/DeleteConfirm';
import { COLORS, ALPHA } from '@/lib/constants';
import {
  Truck, MapPin, Clock, CheckCircle2, Navigation, Plus, User,
  Bike, Edit, Loader2, Package, Send, Building2, DollarSign, Phone, Trash2,
  Users, TrendingUp, Calendar, BarChart3, Link2, Activity, ChevronDown, ChevronUp, Award,
} from 'lucide-react';

type Tab = 'live' | 'zones' | 'drivers';
const db = () => supabase.schema('core');

function useIsDark() {
  if (typeof window === 'undefined') return true;
  return (getComputedStyle(document.documentElement).getPropertyValue('--bg') || '').trim().startsWith('#08');
}

function SectionLabel({ label, color = '#6366F1' }: { label: string; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color }}>{label}</p>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  );
}

const VEHICLE_TYPES = ['Moto', 'Bicicleta', 'Carro', 'A pé'];

const selStyle: React.CSSProperties = {
  padding: '0.6rem 0.875rem',
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  color: 'var(--text-primary)',
  borderRadius: 12,
  fontSize: 13,
  width: '100%',
  outline: 'none',
};

// ─── Driver Stats interface ───────────────────────────────────────────────────
interface DriverStats {
  driver_id: string;
  name: string;
  phone: string | null;
  vehicle: string | null;
  plate: string | null;
  active: boolean;
  staff_member_id: string | null;
  deliveries_today: number;
  fee_today: number;
  deliveries_week: number;
  fee_week: number;
  deliveries_month: number;
  fee_month: number;
  deliveries_year: number;
  fee_year: number;
  last_delivery_at: string | null;
}

function useDriverStats(storeId?: string) {
  const [stats, setStats] = useState<DriverStats[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = async () => {
    if (!storeId) return;
    setLoading(true);
    const { data } = await supabase.schema('core').from('driver_delivery_stats').select('*').eq('store_id', storeId);
    if (data) setStats(data as DriverStats[]);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, [storeId]);
  return { stats, loading, refetch: fetch };
}

// ─── Staff Members ────────────────────────────────────────────────────────────
interface StaffMember {
  id: string;
  display_name: string | null;
  user: { email: string; raw_user_meta_data: { name?: string } } | null;
}

function useActiveStaffMembers(storeId?: string) {
  const [members, setMembers] = useState<StaffMember[]>([]);
  useEffect(() => {
    if (!storeId) return;
    // Usa a view staff_members_with_user que já une com auth.users via SQL
    // evitando o join cross-schema que o PostgREST não suporta automaticamente
    supabase.schema('core').from('staff_members_with_user')
      .select('id, display_name, user_email, user_name, user_meta')
      .eq('store_id', storeId).eq('status', 'active')
      .then(({ data }) => {
        const mapped: StaffMember[] = (data ?? []).map((row: any) => ({
          id: row.id,
          display_name: row.display_name,
          user: {
            email: row.user_email ?? '',
            raw_user_meta_data: row.user_meta ?? {},
          },
        }));
        setMembers(mapped);
      });
  }, [storeId]);
  return members;
}

function memberName(m: StaffMember): string {
  return m.display_name || m.user?.raw_user_meta_data?.name || m.user?.email?.split('@')[0] || m.id.slice(0, 8);
}

// ─── Zone Modal ───────────────────────────────────────────────────────────────
function ZoneModal({ zone, storeId, onClose, onSuccess }: { zone?: any; storeId: string; onClose: () => void; onSuccess: () => void }) {
  const isEdit = !!zone;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    neighborhood: zone?.neighborhood ?? '', city: zone?.city ?? '', state: zone?.state ?? '',
    delivery_fee: zone?.delivery_fee ?? '', estimated_time_min: zone?.estimated_time_min ?? '',
    active: zone?.active ?? true,
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        store_id: storeId, neighborhood: form.neighborhood, city: form.city, state: form.state,
        delivery_fee: parseFloat(form.delivery_fee as any) || 0,
        estimated_time_min: parseInt(form.estimated_time_min as any) || null, active: form.active,
      };
      if (isEdit) { const { error } = await db().from('delivery_zones').update(payload).eq('id', zone.id); if (error) throw error; }
      else { const { error } = await db().from('delivery_zones').insert(payload); if (error) throw error; }
      onSuccess();
    } catch (err: any) { alert(err.message ?? 'Erro ao salvar zona'); }
    finally { setSaving(false); }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell maxW="max-w-md">
        <ModalHeader title={isEdit ? 'Editar Zona' : 'Nova Zona de Entrega'} subtitle="Configure bairro, taxa e tempo estimado" icon={MapPin} iconColor="#10B981" onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <SectionLabel label="Localização" color="#10B981" />
            <FormField label="Bairro" required><Input icon={MapPin} value={form.neighborhood} onChange={set('neighborhood')} placeholder="Centro" required /></FormField>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2"><FormField label="Cidade" required><Input icon={Building2} value={form.city} onChange={set('city')} placeholder="Fortaleza" required /></FormField></div>
              <FormField label="UF"><Input value={form.state} onChange={set('state')} placeholder="CE" maxLength={2} /></FormField>
            </div>
            <div style={{ height: 1, background: 'var(--border)' }} />
            <SectionLabel label="Configurações" color="#6366F1" />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Taxa de Entrega (R$)" required><Input icon={DollarSign} type="number" step="0.01" min="0" value={form.delivery_fee} onChange={set('delivery_fee')} placeholder="5,00" required /></FormField>
              <FormField label="Tempo Est. (min)"><Input icon={Clock} type="number" min="1" value={form.estimated_time_min} onChange={set('estimated_time_min')} placeholder="30" /></FormField>
            </div>
            <FormField label="Status"><Toggle label="Zona disponível para entregas" checked={form.active} onChange={v => setForm(f => ({ ...f, active: v }))} /></FormField>
          </div>
          <ModalFooter onCancel={onClose} saving={saving} saveLabel={isEdit ? 'Salvar Zona' : 'Criar Zona'} />
        </form>
      </ModalShell>
    </ModalBackdrop>
  );
}

// ─── Driver Modal ─────────────────────────────────────────────────────────────
function DriverModal({ driver, storeId, staffMembers, onClose, onSuccess }: {
  driver?: any; storeId: string; staffMembers: StaffMember[]; onClose: () => void; onSuccess: () => void;
}) {
  const isDark = useIsDark();
  const isEdit = !!driver;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: driver?.name ?? '', phone: driver?.phone ?? '',
    vehicle: driver?.vehicle ?? 'Moto', plate: driver?.plate ?? '',
    active: driver?.active ?? true, staff_member_id: driver?.staff_member_id ?? '',
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleStaffChange = (memberId: string) => {
    const m = staffMembers.find(s => s.id === memberId);
    const autoName = m ? memberName(m) : '';
    setForm(f => ({
      ...f,
      staff_member_id: memberId,
      // auto-preenche nome apenas ao criar e campo vazio
      ...(!isEdit && !f.name && autoName ? { name: autoName } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { alert('Nome obrigatório'); return; }
    setSaving(true);
    try {
      const payload = {
        store_id: storeId, name: form.name, phone: form.phone || null,
        vehicle: form.vehicle, plate: form.plate || null,
        active: form.active, staff_member_id: form.staff_member_id || null,
      };
      if (isEdit) { const { error } = await db().from('delivery_drivers').update(payload).eq('id', driver.id); if (error) throw error; }
      else { const { error } = await db().from('delivery_drivers').insert(payload); if (error) throw error; }
      onSuccess();
    } catch (err: any) { alert(err.message ?? 'Erro ao salvar entregador'); }
    finally { setSaving(false); }
  };

  const linked = staffMembers.find(m => m.id === form.staff_member_id);

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell maxW="max-w-md">
        <ModalHeader title={isEdit ? 'Editar Entregador' : 'Novo Entregador'} subtitle="Cadastre um entregador na equipe" icon={User} iconColor="#8B5CF6" onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">

            {/* Vínculo PRIMEIRO para auto-preencher nome */}
            <SectionLabel label="Vínculo com Equipe" color="#10B981" />
            <FormField
              label="Membro da Equipe"
              hint={staffMembers.length === 0
                ? 'Sem membros ativos. Cadastre em Configurações → Equipe.'
                : 'Vincule a um membro ou deixe vazio para entregador externo'}
            >
              <div style={{ position: 'relative' }}>
                <Users size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <select
                  value={form.staff_member_id}
                  onChange={e => handleStaffChange(e.target.value)}
                  style={{ ...selStyle, paddingLeft: '2.25rem' }}
                  disabled={staffMembers.length === 0}
                >
                  <option value="">Entregador externo (sem vínculo)</option>
                  {staffMembers.map(m => <option key={m.id} value={m.id}>{memberName(m)}</option>)}
                </select>
              </div>
              {linked && (
                <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl text-xs"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
                  <Link2 size={11} /> Vinculado a <strong>{memberName(linked)}</strong>
                </div>
              )}
            </FormField>

            <div style={{ height: 1, background: 'var(--border)' }} />
            <SectionLabel label="Dados Pessoais" color="#8B5CF6" />
            <FormField label="Nome Completo" required>
              <Input icon={User} value={form.name} onChange={set('name')} placeholder="Carlos Souza" required />
            </FormField>
            <FormField label="Telefone">
              <Input icon={Phone} value={form.phone} onChange={set('phone')} placeholder="(00) 00000-0000" />
            </FormField>

            <div style={{ height: 1, background: 'var(--border)' }} />
            <SectionLabel label="Veículo" color="#6366F1" />
            <FormField label="Tipo de Veículo">
              <div className="grid grid-cols-4 gap-2">
                {VEHICLE_TYPES.map(v => (
                  <button key={v} type="button" onClick={() => setForm(f => ({ ...f, vehicle: v }))}
                    className="py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: form.vehicle === v ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)') : 'var(--input-bg)',
                      border: `1px solid ${form.vehicle === v ? '#6366F1' : 'var(--input-border)'}`,
                      color: form.vehicle === v ? '#818CF8' : 'var(--text-muted)',
                    }}>{v}</button>
                ))}
              </div>
            </FormField>
            <FormField label="Placa"><Input icon={Bike} value={form.plate} onChange={set('plate')} placeholder="ABC-1234" /></FormField>
            <FormField label="Disponibilidade"><Toggle label="Entregador disponível para serviço" checked={form.active} onChange={v => setForm(f => ({ ...f, active: v }))} /></FormField>
          </div>
          <ModalFooter onCancel={onClose} saving={saving} saveLabel={isEdit ? 'Salvar' : 'Cadastrar'} />
        </form>
      </ModalShell>
    </ModalBackdrop>
  );
}

// ─── Driver Stats Card ────────────────────────────────────────────────────────
function DriverStatsCard({ stats, isDark, staffMembers, isAdmin, onEdit, onDelete }: {
  stats: DriverStats; isDark: boolean; staffMembers: StaffMember[];
  isAdmin: boolean; onEdit: () => void; onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  type P = 'today' | 'week' | 'month' | 'year';
  const [period, setPeriod] = useState<P>('week');

  const linked = staffMembers.find(m => m.id === stats.staff_member_id);
  const periods = {
    today: { deliveries: stats.deliveries_today, fee: stats.fee_today, label: 'Hoje' },
    week: { deliveries: stats.deliveries_week, fee: stats.fee_week, label: 'Semana' },
    month: { deliveries: stats.deliveries_month, fee: stats.fee_month, label: 'Mês' },
    year: { deliveries: stats.deliveries_year, fee: stats.fee_year, label: 'Ano' },
  };
  const cur = periods[period];

  return (
    <div className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>

      {/* Header */}
      <div className="flex items-start gap-3 p-5">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0"
          style={{ background: stats.active ? 'linear-gradient(135deg,#8B5CF6,#7C3AED)' : (isDark ? 'rgba(107,114,128,0.2)' : 'rgba(107,114,128,0.15)') }}>
          {stats.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{stats.name}</p>
              {stats.phone && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{stats.phone}</p>}
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
              style={{
                background: stats.active ? (isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)') : (isDark ? 'rgba(107,114,128,0.12)' : 'rgba(107,114,128,0.08)'),
                color: stats.active ? '#10B981' : (isDark ? '#9CA3AF' : '#6B7280'),
              }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: stats.active ? '#10B981' : '#6B7280' }} />
              {stats.active ? 'Disponível' : 'Inativo'}
            </span>
          </div>
          {(stats.vehicle || stats.plate) && (
            <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-lg w-fit"
              style={{ background: isDark ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.05)', border: '1px solid var(--border-soft)' }}>
              <Bike size={11} style={{ color: '#818CF8' }} />
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                {stats.vehicle}{stats.plate ? ` · ${stats.plate}` : ''}
              </span>
            </div>
          )}
          {linked && (
            <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-lg w-fit"
              style={{ background: isDark ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <Link2 size={10} style={{ color: '#10B981' }} />
              <span className="text-[11px] font-medium" style={{ color: '#10B981' }}>{memberName(linked)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-1 mx-5 mb-3 p-1 rounded-xl"
        style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: '1px solid var(--border-soft)' }}>
        {(['today', 'week', 'month', 'year'] as P[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all"
            style={{
              background: period === p ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)') : 'transparent',
              color: period === p ? '#818CF8' : 'var(--text-muted)',
            }}>
            {periods[p].label}
          </button>
        ))}
      </div>

      {/* Numbers */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-4">
        <div className="rounded-xl p-3" style={{ background: isDark ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.05)', border: '1px solid var(--border-soft)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Truck size={11} style={{ color: COLORS.accent }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Entregas</span>
          </div>
          <p className="text-xl font-black" style={{ color: COLORS.accent }}>{cur.deliveries}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: isDark ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.05)', border: '1px solid var(--border-soft)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign size={11} style={{ color: COLORS.success }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Taxas</span>
          </div>
          <p className="text-base font-black" style={{ color: COLORS.success }}>{formatCurrency(Number(cur.fee))}</p>
        </div>
      </div>

      {/* Histórico expandível */}
      <div style={{ borderTop: '1px solid var(--border-soft)' }}>
        <button onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
          <span className="flex items-center gap-2"><Activity size={12} />Histórico completo</span>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {expanded && (
          <div className="px-5 pb-4 space-y-2">
            {[
              { label: 'Hoje', deliveries: stats.deliveries_today, fee: stats.fee_today, icon: Clock },
              { label: 'Esta semana', deliveries: stats.deliveries_week, fee: stats.fee_week, icon: Calendar },
              { label: 'Este mês', deliveries: stats.deliveries_month, fee: stats.fee_month, icon: BarChart3 },
              { label: 'Este ano', deliveries: stats.deliveries_year, fee: stats.fee_year, icon: Award },
            ].map(({ label, deliveries, fee, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-soft)' }}>
                <Icon size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <span className="flex-1 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{deliveries} entregas</span>
                <span className="text-xs font-semibold" style={{ color: COLORS.success }}>{formatCurrency(Number(fee))}</span>
              </div>
            ))}
            {stats.last_delivery_at && (
              <p className="text-[11px] text-center mt-1" style={{ color: 'var(--text-muted)' }}>
                Última entrega: {new Date(stats.last_delivery_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Ações — somente admin */}
      {isAdmin && (
        <div className="flex gap-2 px-5 pb-5 pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
          <button onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)', color: '#818CF8' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.14)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)'}>
            <Edit size={13} /> Editar
          </button>
          <button onClick={onDelete}
            className="w-9 h-[34px] flex items-center justify-center rounded-xl transition-all"
            style={{ background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)', color: '#F87171' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.12)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)'}>
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Order Row (live) ─────────────────────────────────────────────────────────
function OrderRow({ order, onDispatch, accentColor, isAdmin }: {
  order: any; onDispatch?: (id: string) => void; accentColor: string; isAdmin: boolean;
}) {
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

// ─── Dispatch Modal ───────────────────────────────────────────────────────────
function DispatchModal({ orderId, drivers, onClose, onSuccess }: {
  orderId: string; drivers: any[]; onClose: () => void; onSuccess: () => void;
}) {
  const isDark = useIsDark();
  const [driverId, setDriverId] = useState('');
  const [saving, setSaving] = useState(false);
  const activeDrivers = drivers.filter(d => d.active);

  const handleDispatch = async () => {
    setSaving(true);
    try {
      const payload: any = { status: 'out_for_delivery' };
      if (driverId) payload.driver_id = driverId;
      const { error } = await supabase.schema('orders').from('orders').update(payload).eq('id', orderId);
      if (error) throw error;
      onSuccess(); onClose();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell maxW="max-w-sm">
        <ModalHeader title="Despachar Pedido" subtitle="Selecione o entregador responsável" icon={Send} iconColor={COLORS.accent} onClose={onClose} />
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Entregador</label>
            <div style={{ position: 'relative' }}>
              <User size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <select value={driverId} onChange={e => setDriverId(e.target.value)} style={{ ...selStyle, paddingLeft: '2.25rem' }}>
                <option value="">Sem entregador específico</option>
                {activeDrivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}{d.vehicle ? ` · ${d.vehicle}` : ''}{d.plate ? ` (${d.plate})` : ''}</option>
                ))}
              </select>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Você pode despachar sem atribuir e editar depois.</p>
          </div>
          {activeDrivers.length === 0 && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
              style={{ background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
              Nenhum entregador ativo cadastrado.
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Cancelar</button>
            <button onClick={handleDispatch} disabled={saving}
              className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: `linear-gradient(135deg,${COLORS.accent},${COLORS.purple})`, boxShadow: COLORS.accentShadow }}>
              {saving ? <><Loader2 size={14} className="animate-spin" />Despachando...</> : <><Send size={14} />Despachar</>}
            </button>
          </div>
        </div>
      </ModalShell>
    </ModalBackdrop>
  );
}

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
              style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
              <Plus size={15} /> Nova Zona
            </button>
          )}
          {isAdmin && tab === 'drivers' && (
            <button onClick={() => open('driver-create')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', boxShadow: '0 4px 14px rgba(139,92,246,0.3)' }}>
              <Plus size={15} /> Novo Entregador
            </button>
          )}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Em Trânsito', value: activeDeliveries.length, color: '#6366F1', icon: Truck },
            { label: 'Aguardando', value: pendingDeliveries.length, color: '#F59E0B', icon: Clock },
            { label: tab === 'drivers' ? 'Entregas hoje' : 'Entregues Hoje', value: tab === 'drivers' ? totalDeliveriesToday : doneToday.length, color: '#10B981', icon: CheckCircle2 },
            { label: tab === 'drivers' ? 'Entregas (mês)' : 'Entregadores Ativos', value: tab === 'drivers' ? totalDeliveriesMonth : activeDrivers.length, color: '#8B5CF6', icon: tab === 'drivers' ? TrendingUp : Navigation },
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
                      {isAdmin && (
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => open('zone-edit', zone)} className="w-8 h-8 flex items-center justify-center rounded-xl transition-all" style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(99,102,241,0.12)', color: '#818CF8' })}
                              onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}><Edit size={14} /></button>
                            <button onClick={() => open('zone-delete', zone)} className="w-8 h-8 flex items-center justify-center rounded-xl transition-all" style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(239,68,68,0.12)', color: '#F87171' })}
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
                    style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}>
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
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                </div>
              ) : driverStats.length === 0 ? (
                <div className="col-span-full flex flex-col items-center py-16 gap-3">
                  <User size={32} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum entregador cadastrado</p>
                  {isAdmin && (
                    <button onClick={() => open('driver-create')}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' }}>
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