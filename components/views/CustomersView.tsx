'use client';
import { useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { ModalBackdrop, ModalShell, ModalHeader, ModalFooter } from '@/components/ui/Modal';
import { SearchBar } from '@/components/forms/SearchBar';
import { FormField } from '@/components/forms/FormField';
import { Textarea } from '@/components/forms/Textarea';
import { StatCard } from '@/components/data/StatCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/data/EmptyState';
import {
  Plus, Edit, Trash2, Phone, Mail, MapPin,
  Users, UserPlus, UserCheck, Loader2,
  User, Hash, Building2, AlertTriangle, ChevronRight, FileText,
} from 'lucide-react';
import { useIsDark } from '@/hooks/useIsDark';

const db = () => supabase.schema('core');

function SectionDivider({ label, color = '#6366F1' }: { label: string; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color }}>{label}</p>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  );
}

function CustomerModal({ customer, storeId, onClose, onSuccess }: {
  customer?: any; storeId: string; onClose: () => void; onSuccess: () => void;
}) {
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
    <ModalBackdrop onClose={onClose}>
      <ModalShell>
        <ModalHeader title={isEdit ? 'Editar Cliente' : 'Novo Cliente'} subtitle={isEdit ? `Editando: ${customer.name}` : 'Preencha os dados do cliente'} icon={User} onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <SectionDivider label="Dados Pessoais" color="#6366F1" />
            <FormField label="Nome Completo" required>
              <Input icon={User} value={form.name} onChange={set('name')} placeholder="João da Silva" required />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Telefone / WhatsApp">
                <Input icon={Phone} value={form.phone} onChange={set('phone')} placeholder="(00) 00000-0000" />
              </FormField>
              <FormField label="E-mail">
                <Input icon={Mail} type="email" value={form.email} onChange={set('email')} placeholder="email@exemplo.com" />
              </FormField>
            </div>

            <div style={{ height: 1, background: 'var(--border)' }} />
            <SectionDivider label="Endereço" color="#8B5CF6" />

            <FormField label="Endereço (rua e número)">
              <Input icon={MapPin} value={form.address} onChange={set('address')} placeholder="Rua das Flores, 123" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Complemento">
                <Input value={form.complement} onChange={set('complement')} placeholder="Apto 12, Bloco B" />
              </FormField>
              <FormField label="Bairro">
                <Input icon={Building2} value={form.neighborhood} onChange={set('neighborhood')} placeholder="Centro" />
              </FormField>
            </div>
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-2">
                <FormField label="Cidade">
                  <Input value={form.city} onChange={set('city')} placeholder="Fortaleza" />
                </FormField>
              </div>
              <FormField label="UF">
                <Input value={form.state} onChange={set('state')} placeholder="CE" maxLength={2} />
              </FormField>
              <div className="col-span-2">
                <FormField label="CEP">
                  <Input icon={Hash} value={form.zip_code} onChange={set('zip_code')} placeholder="60000-000" />
                </FormField>
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border)' }} />
            <SectionDivider label="Observações" color="#F59E0B" />
            <FormField label="Notas internas">
              <Textarea value={form.notes} onChange={set('notes')} placeholder="Preferências, alergias, informações extras..." rows={3} />
            </FormField>
          </div>

          <ModalFooter onCancel={onClose} saving={saving} saveLabel={isEdit ? 'Salvar' : 'Criar Cliente'} />
        </form>
      </ModalShell>
    </ModalBackdrop>
  );
}

function CustomerDetail({ customer, onClose, onEdit }: { customer: any; onClose: () => void; onEdit: () => void }) {
  const isDark = useIsDark();
  const addressParts = [
    customer.address,
    customer.complement,
    customer.neighborhood,
    [customer.city, customer.state].filter(Boolean).join(' - '),
    customer.zip_code,
  ].filter(Boolean);

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell maxW="max-w-sm">
        <ModalHeader title="Perfil do Cliente" icon={User} onClose={onClose} />
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center gap-2 px-6 pt-7 pb-5"
            style={{ background: isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.03)', borderBottom: '1px solid var(--border)' }}>
            <Avatar name={customer.name} size="xl" />
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
          <Button onClick={onEdit} icon={<Edit size={14} />} className="w-full">
            Editar Cliente
          </Button>
        </div>
      </ModalShell>
    </ModalBackdrop>
  );
}

function DeleteConfirm({ customer, onClose, onConfirm, loading }: { customer: any; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  const isDark = useIsDark();
  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell maxW="max-w-sm">
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
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button variant="danger" onClick={onConfirm} loading={loading} className="flex-1" icon={<Trash2 size={14} />}>
              Remover
            </Button>
          </div>
        </div>
      </ModalShell>
    </ModalBackdrop>
  );
}

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
        <PageHeader
          title="Clientes"
          subtitle="Gerencie sua base de clientes"
          action={<Button onClick={() => open('create')} icon={<Plus size={15} />}>Novo Cliente</Button>}
        />

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total de Clientes" value={list.length} icon={Users} color="#6366F1" />
          <StatCard label="Novos este mês" value={newThisMonth} icon={UserPlus} color="#10B981" />
          <StatCard label="Ativos" value={list.filter((c: any) => c.active !== false).length} icon={UserCheck} color="#8B5CF6" />
        </div>

        <SearchBar
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, telefone ou e-mail..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c: any) => (
            <div key={c.id} onClick={() => open('detail', c)}>
              <Card hover className="p-5 cursor-pointer">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar name={c.name} size="md" />
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
              </Card>
            </div>
          ))}
        </div>

        {filtered.length === 0 && !loading && (
          <EmptyState
            icon={Users}
            message={search ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda. Crie o primeiro!'}
            action={!search ? <Button onClick={() => open('create')} icon={<Plus size={14} />}>Criar Cliente</Button> : undefined}
          />
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
