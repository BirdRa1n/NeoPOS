'use client';
import { useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/supabase/client';
import {
  Search, Plus, Edit, Trash2, Phone, Mail, MapPin,
  Users, UserPlus, UserCheck, X, Loader2, CheckCircle2,
  User, Hash, Building2, AlertTriangle, ChevronRight, FileText,
} from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────
function useIsDark() {
  if (typeof window === 'undefined') return true;
  return (getComputedStyle(document.documentElement).getPropertyValue('--bg') || '').trim().startsWith('#08');
}
const PALETTE = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#14B8A6'];
const avatarColor = (name: string) => PALETTE[name.charCodeAt(0) % PALETTE.length];
const initials = (name: string) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

// ─── Supabase helper — sempre schema core ────────────────────────────────────
const db = () => supabase.schema('core');

// ─── Shared primitives ────────────────────────────────────────────────────────
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
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg,${iconColor},${iconColor}99)` }}>
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
function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props}
      className="w-full rounded-xl text-sm outline-none transition-all resize-none"
      style={{ padding: '0.6rem 0.875rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', minHeight: 72 }}
      onFocus={e => (e.currentTarget.style.borderColor = '#6366F1')}
      onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')} />
  );
}
function SectionDivider({ label, color = '#6366F1' }: { label: string; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color }}>{label}</p>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  );
}

// ─── Customer form
// Colunas reais: name, phone, email, address, complement, neighborhood, city, state, zip_code, notes, active
// ─────────────────────────────────────────────────────────────────────────────
function CustomerModal({ customer, storeId, onClose, onSuccess }: {
  customer?: any; storeId: string; onClose: () => void; onSuccess: () => void;
}) {
  const isDark = useIsDark();
  const isEdit = !!customer;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: customer?.name ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
    address: customer?.address ?? '',
    complement: customer?.complement ?? '',
    neighborhood: customer?.neighborhood ?? '',
    city: customer?.city ?? '',
    state: customer?.state ?? '',
    zip_code: customer?.zip_code ?? '',
    notes: customer?.notes ?? '',
    active: customer?.active ?? true,
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, store_id: storeId };
      if (isEdit) {
        const { error } = await db().from('customers').update(payload).eq('id', customer.id);
        if (error) throw error;
      } else {
        const { error } = await db().from('customers').insert(payload);
        if (error) throw error;
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message ?? 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Backdrop onClose={onClose}>
      <Shell>
        <MHead title={isEdit ? 'Editar Cliente' : 'Novo Cliente'} subtitle={isEdit ? `Editando: ${customer.name}` : 'Preencha os dados do cliente'} icon={User} onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <SectionDivider label="Dados Pessoais" color="#6366F1" />
            <Field label="Nome Completo" required>
              <Input icon={User} value={form.name} onChange={set('name')} placeholder="João da Silva" required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Telefone / WhatsApp">
                <Input icon={Phone} value={form.phone} onChange={set('phone')} placeholder="(00) 00000-0000" />
              </Field>
              <Field label="E-mail">
                <Input icon={Mail} type="email" value={form.email} onChange={set('email')} placeholder="email@exemplo.com" />
              </Field>
            </div>

            <div style={{ height: 1, background: 'var(--border)' }} />
            <SectionDivider label="Endereço" color="#8B5CF6" />

            {/* address = rua + número em texto livre, como está no banco */}
            <Field label="Endereço (rua e número)">
              <Input icon={MapPin} value={form.address} onChange={set('address')} placeholder="Rua das Flores, 123" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Complemento">
                <Input value={form.complement} onChange={set('complement')} placeholder="Apto 12, Bloco B" />
              </Field>
              <Field label="Bairro">
                <Input icon={Building2} value={form.neighborhood} onChange={set('neighborhood')} placeholder="Centro" />
              </Field>
            </div>
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-2">
                <Field label="Cidade">
                  <Input value={form.city} onChange={set('city')} placeholder="Fortaleza" />
                </Field>
              </div>
              <Field label="UF">
                <Input value={form.state} onChange={set('state')} placeholder="CE" maxLength={2} />
              </Field>
              <div className="col-span-2">
                <Field label="CEP">
                  <Input icon={Hash} value={form.zip_code} onChange={set('zip_code')} placeholder="60000-000" />
                </Field>
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border)' }} />
            <SectionDivider label="Observações" color="#F59E0B" />
            <Field label="Notas internas">
              <Textarea value={form.notes} onChange={set('notes')} placeholder="Preferências, alergias, informações extras..." rows={3} />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-3 px-6 py-4 shrink-0"
            style={{ borderTop: '1px solid var(--border)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>* campos obrigatórios</p>
            <div className="flex gap-2">
              <button type="button" onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)'}>
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all"
                style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
                {saving ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : <><CheckCircle2 size={14} />{isEdit ? 'Salvar' : 'Criar Cliente'}</>}
              </button>
            </div>
          </div>
        </form>
      </Shell>
    </Backdrop>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────
function CustomerDetail({ customer, onClose, onEdit }: { customer: any; onClose: () => void; onEdit: () => void }) {
  const isDark = useIsDark();
  const color = avatarColor(customer.name);
  const ini = initials(customer.name);
  const addressParts = [
    customer.address,
    customer.complement,
    customer.neighborhood,
    [customer.city, customer.state].filter(Boolean).join(' - '),
    customer.zip_code,
  ].filter(Boolean);

  return (
    <Backdrop onClose={onClose}>
      <Shell maxW="max-w-sm">
        <MHead title="Perfil do Cliente" icon={User} onClose={onClose} />
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center gap-2 px-6 pt-7 pb-5"
            style={{ background: isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.03)', borderBottom: '1px solid var(--border)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
              style={{ background: `linear-gradient(135deg,${color},${color}aa)`, boxShadow: `0 8px 24px ${color}44` }}>
              {ini}
            </div>
            <p className="font-bold text-base mt-1" style={{ color: 'var(--text-primary)' }}>{customer.name}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Cliente desde {new Date(customer.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            {!customer.active && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(107,114,128,0.15)', color: '#9CA3AF' }}>Inativo</span>
            )}
          </div>

          <div className="p-5 space-y-4">
            {(customer.phone || customer.email) && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6366F1' }}>Contato</p>
                {customer.phone && (
                  <a href={`tel:${customer.phone}`}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all"
                    style={{ background: isDark ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}><Phone size={13} style={{ color: '#10B981' }} /></div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{customer.phone}</span>
                  </a>
                )}
                {customer.email && (
                  <a href={`mailto:${customer.email}`}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all"
                    style={{ background: isDark ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}><Mail size={13} style={{ color: '#6366F1' }} /></div>
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{customer.email}</span>
                  </a>
                )}
              </div>
            )}

            {addressParts.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8B5CF6' }}>Endereço</p>
                <div className="flex items-start gap-3 px-3.5 py-3 rounded-xl"
                  style={{ background: isDark ? 'rgba(139,92,246,0.07)' : 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.12)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(139,92,246,0.15)' }}><MapPin size={13} style={{ color: '#8B5CF6' }} /></div>
                  <div className="space-y-0.5">
                    {addressParts.map((line, i) => (
                      <p key={i} className="text-sm" style={{ color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {customer.notes && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#F59E0B' }}>Observações</p>
                <div className="flex items-start gap-3 px-3.5 py-3 rounded-xl"
                  style={{ background: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(245,158,11,0.15)' }}><FileText size={13} style={{ color: '#F59E0B' }} /></div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{customer.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
            <Edit size={14} /> Editar Cliente
          </button>
        </div>
      </Shell>
    </Backdrop>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ customer, onClose, onConfirm, loading }: { customer: any; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  const isDark = useIsDark();
  return (
    <Backdrop onClose={onClose}>
      <Shell maxW="max-w-sm">
        <div className="p-7 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.07)' }}>
            <AlertTriangle size={26} style={{ color: '#EF4444' }} />
          </div>
          <div>
            <p className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Remover Cliente</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Tem certeza que deseja remover <strong>{customer.name}</strong>? Esta ação não pode ser desfeita.
            </p>
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

// ─── Main view ────────────────────────────────────────────────────────────────
export function CustomersView() {
  const isDark = useIsDark();
  const { store } = useStore();
  const { customers, loading, refetch } = useCustomers() as any;

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<null | 'create' | 'edit' | 'delete' | 'detail'>(null);
  const [selected, setSelected] = useState<any>(null);
  const [delLoad, setDelLoad] = useState(false);

  const list = (customers ?? []) as any[];

  const filtered = list.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const newThisMonth = list.filter((c: any) => {
    const d = new Date(c.created_at), now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const open = (kind: typeof modal, c?: any) => { setSelected(c ?? null); setModal(kind); };
  const close = () => { setModal(null); setSelected(null); };
  const onSaved = () => { refetch?.(); close(); };

  const handleDelete = async () => {
    if (!selected) return;
    setDelLoad(true);
    try {
      const { error } = await db().from('customers').delete().eq('id', selected.id);
      if (error) throw error;
      refetch?.();
      close();
    } catch (err: any) {
      alert(err.message ?? 'Erro ao remover');
    } finally {
      setDelLoad(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Clientes</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Gerencie sua base de clientes</p>
          </div>
          <button onClick={() => open('create')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
            <Plus size={15} /> Novo Cliente
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total de Clientes', value: list.length, color: '#6366F1', icon: Users },
            { label: 'Novos este mês', value: newThisMonth, color: '#10B981', icon: UserPlus },
            { label: 'Ativos', value: list.filter((c: any) => c.active !== false).length, color: '#8B5CF6', icon: UserCheck },
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

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone ou e-mail..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', boxShadow: 'var(--surface-box)' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#6366F1')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')} />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c: any) => {
            const color = avatarColor(c.name);
            const ini = initials(c.name);
            return (
              <div key={c.id}
                className="rounded-2xl p-5 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}
                onClick={() => open('detail', c)}>

                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: `linear-gradient(135deg,${color},${color}99)` }}>
                    {ini}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      Desde {new Date(c.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <ChevronRight size={14} className="shrink-0 mt-1" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                </div>

                <div className="space-y-1.5 mb-4">
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={12} style={{ color: '#10B981' }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.phone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={12} style={{ color: '#6366F1' }} />
                      <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{c.email}</span>
                    </div>
                  )}
                  {(c.neighborhood || c.city) && (
                    <div className="flex items-center gap-2">
                      <MapPin size={12} style={{ color: '#8B5CF6' }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {[c.neighborhood, c.city].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}
                  onClick={e => e.stopPropagation()}>
                  <button onClick={() => open('edit', c)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)', color: '#818CF8' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.14)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)'}>
                    <Edit size={13} /> Editar
                  </button>
                  <button onClick={() => open('delete', c)}
                    className="w-9 h-[34px] flex items-center justify-center rounded-xl transition-all"
                    style={{ background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)', color: '#F87171' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.12)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)'}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Users size={36} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda. Crie o primeiro!'}
            </p>
            {!search && (
              <button onClick={() => open('create')}
                className="mt-1 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                <Plus size={14} /> Criar Cliente
              </button>
            )}
          </div>
        )}
      </div>

      {modal === 'create' && store && (
        <CustomerModal storeId={store.id} onClose={close} onSuccess={onSaved} />
      )}
      {modal === 'edit' && selected && store && (
        <CustomerModal customer={selected} storeId={store.id} onClose={close} onSuccess={onSaved} />
      )}
      {modal === 'detail' && selected && (
        <CustomerDetail customer={selected} onClose={close} onEdit={() => setModal('edit')} />
      )}
      {modal === 'delete' && selected && (
        <DeleteConfirm customer={selected} onClose={close} onConfirm={handleDelete} loading={delLoad} />
      )}
    </>
  );
}