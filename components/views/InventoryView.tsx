'use client';
import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/supabase/client';
import { formatCurrency } from '@/lib/utils/format';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/forms/FormField';
import { ModalBackdrop, ModalShell, ModalHeader, ModalFooter } from '@/components/ui/Modal';
import {
  Search, Plus, Edit, AlertTriangle, Package,
  TrendingUp, DollarSign, BarChart3, ArrowUpCircle, ArrowDownCircle,
} from 'lucide-react';

const UNITS = ['unit', 'kg', 'g', 'liter', 'ml', 'portion'] as const;
const UNIT_LABELS: Record<typeof UNITS[number], string> = {
  unit: 'Unidade',
  kg: 'Quilograma',
  g: 'Grama',
  liter: 'Litro',
  ml: 'Mililitro',
  portion: 'Porção',
};

const MOVEMENT_TYPES = ['purchase', 'manual_out', 'adjustment'] as const;
const MOVEMENT_LABELS: Record<typeof MOVEMENT_TYPES[number], string> = {
  purchase: 'Compra',
  manual_out: 'Saída Manual',
  adjustment: 'Ajuste',
};

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props}
      className="w-full rounded-xl text-sm outline-none transition-all resize-none"
      style={{ padding: '0.6rem 0.875rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', minHeight: 70 }}
      onFocus={e => (e.currentTarget.style.borderColor = '#6366F1')}
      onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')} />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props}
      className="w-full rounded-xl text-sm outline-none transition-all"
      style={{ padding: '0.6rem 0.875rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
      onFocus={e => (e.currentTarget.style.borderColor = '#6366F1')}
      onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')} />
  );
}

// ─── Supply Modal ─────────────────────────────────────────────────────────────
function SupplyModal({ supply, storeId, onClose, onSuccess }: { supply?: any; storeId: string; onClose: () => void; onSuccess: () => void }) {
  const isEdit = !!supply;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: supply?.name ?? '',
    description: supply?.description ?? '',
    unit: supply?.unit ?? 'unit',
    unit_cost: supply?.unit_cost ?? '',
    current_quantity: supply?.current_quantity ?? '',
    minimum_quantity: supply?.minimum_quantity ?? '',
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        store_id: storeId,
        name: form.name,
        description: form.description || null,
        unit: form.unit,
        unit_cost: parseFloat(form.unit_cost as any) || 0,
        current_quantity: parseFloat(form.current_quantity as any) || 0,
        minimum_quantity: parseFloat(form.minimum_quantity as any) || 0,
        active: true,
      };
      if (isEdit) {
        const { error } = await supabase.schema('inventory').from('supplies').update(payload).eq('id', supply.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.schema('inventory').from('supplies').insert(payload);
        if (error) throw error;
      }
      onSuccess();
    } catch (err: any) { alert(err.message ?? 'Erro ao salvar insumo'); }
    finally { setSaving(false); }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell maxW="max-w-md">
        <ModalHeader title={isEdit ? 'Editar Insumo' : 'Novo Insumo'} subtitle="Configure o insumo de estoque" icon={Package} iconColor="#6366F1" onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <FormField label="Nome do Insumo" required>
              <Input icon={Package} value={form.name} onChange={set('name')} placeholder="Ex: Farinha de Trigo" required />
            </FormField>
            <FormField label="Descrição">
              <Textarea value={form.description} onChange={set('description')} placeholder="Detalhes adicionais..." rows={2} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Unidade" required>
                <Select value={form.unit} onChange={set('unit')} required>
                  {UNITS.map(u => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
                </Select>
              </FormField>
              <FormField label="Custo Unitário" required>
                <Input icon={DollarSign} type="number" step="0.01" min="0" value={form.unit_cost} onChange={set('unit_cost')} placeholder="0,00" required />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Quantidade Atual" required>
                <Input type="number" step="0.01" min="0" value={form.current_quantity} onChange={set('current_quantity')} placeholder="0" required />
              </FormField>
              <FormField label="Estoque Mínimo" required>
                <Input type="number" step="0.01" min="0" value={form.minimum_quantity} onChange={set('minimum_quantity')} placeholder="0" required />
              </FormField>
            </div>
          </div>
          <ModalFooter onCancel={onClose} saving={saving} saveLabel={isEdit ? 'Salvar' : 'Criar Insumo'} />
        </form>
      </ModalShell>
    </ModalBackdrop>
  );
}

// ─── Movement Modal ───────────────────────────────────────────────────────────
function MovementModal({ supply, storeId, onClose, onSuccess }: { supply: any; storeId: string; onClose: () => void; onSuccess: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: 'purchase' as typeof MOVEMENT_TYPES[number],
    quantity: '',
    unit_cost: supply.unit_cost.toString(),
    notes: '',
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const qty = parseFloat(form.quantity);
      const cost = parseFloat(form.unit_cost);
      const finalQty = form.type === 'manual_out' ? -Math.abs(qty) : Math.abs(qty);

      // Insert movement
      const { error: mvErr } = await supabase.schema('inventory').from('stock_movements').insert({
        store_id: storeId,
        supply_id: supply.id,
        type: form.type,
        quantity: finalQty,
        unit_cost: cost,
        notes: form.notes || null,
      });
      if (mvErr) throw mvErr;

      // Update supply quantity
      const { error: upErr } = await supabase.schema('inventory').from('supplies')
        .update({ current_quantity: supply.current_quantity + finalQty })
        .eq('id', supply.id);
      if (upErr) throw upErr;

      onSuccess();
    } catch (err: any) { alert(err.message ?? 'Erro ao registrar movimentação'); }
    finally { setSaving(false); }
  };

  const isOut = form.type === 'manual_out';
  const iconColor = isOut ? '#EF4444' : '#10B981';
  const Icon = isOut ? ArrowDownCircle : ArrowUpCircle;

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell maxW="max-w-md">
        <ModalHeader title="Registrar Movimentação" subtitle={`Insumo: ${supply.name}`} icon={Icon} iconColor={iconColor} onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <FormField label="Tipo de Movimentação" required>
              <Select value={form.type} onChange={set('type')} required>
                {MOVEMENT_TYPES.map(t => <option key={t} value={t}>{MOVEMENT_LABELS[t]}</option>)}
              </Select>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Quantidade" required>
                <Input type="number" step="0.01" min="0.01" value={form.quantity} onChange={set('quantity')} placeholder="0" required />
              </FormField>
              <FormField label="Custo Unitário" required>
                <Input icon={DollarSign} type="number" step="0.01" min="0" value={form.unit_cost} onChange={set('unit_cost')} placeholder="0,00" required />
              </FormField>
            </div>
            <FormField label="Observações">
              <Textarea value={form.notes} onChange={set('notes')} placeholder="Notas sobre a movimentação..." rows={2} />
            </FormField>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
              style={{ background: `${iconColor}10`, border: `1px solid ${iconColor}30` }}>
              <Icon size={13} style={{ color: iconColor }} />
              <span style={{ color: 'var(--text-secondary)' }}>
                {isOut ? 'Saída reduzirá o estoque' : 'Entrada aumentará o estoque'}
              </span>
            </div>
          </div>
          <ModalFooter onCancel={onClose} saving={saving} saveLabel="Registrar" />
        </form>
      </ModalShell>
    </ModalBackdrop>
  );
}

export function InventoryView() {
  const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const { store } = useStore();
  const { supplies, loading, refetch } = useInventory();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<null | 'supply-create' | 'supply-edit' | 'movement'>(null);
  const [selected, setSelected] = useState<any>(null);

  const filtered = (supplies ?? []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = (supplies ?? []).filter(s => (s as any).current_stock <= (s as any).min_stock || s.current_quantity <= s.minimum_quantity);
  const totalValue = (supplies ?? []).reduce((acc, s) => {
    const qty = (s as any).current_stock ?? s.current_quantity ?? 0;
    const cost = (s as any).cost_per_unit ?? s.unit_cost ?? 0;
    return acc + qty * cost;
  }, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Estoque</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Controle de insumos e inventário</p>
        </div>
        <button onClick={() => { setSelected(null); setModal('supply-create'); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
          <Plus size={15} /> Novo Insumo
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total de Itens', value: supplies?.length ?? 0, color: '#6366F1', icon: Package },
          { label: 'Estoque Baixo', value: lowStock.length, color: '#EF4444', icon: AlertTriangle },
          { label: 'Valor em Estoque', value: formatCurrency(totalValue), color: '#10B981', icon: DollarSign },
          { label: 'Itens OK', value: (supplies?.length ?? 0) - lowStock.length, color: '#F59E0B', icon: BarChart3 },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
              <Icon size={15} style={{ color }} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{value}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)',
            border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.15)'}`,
          }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)' }}>
            <AlertTriangle size={16} style={{ color: '#EF4444' }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: isDark ? '#FCA5A5' : '#991B1B' }}>
              {lowStock.length} {lowStock.length === 1 ? 'item abaixo' : 'itens abaixo'} do estoque mínimo
            </p>
            <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(252,165,165,0.7)' : '#B91C1C' }}>
              {lowStock.map(s => s.name).slice(0, 3).join(', ')}{lowStock.length > 3 ? ` e mais ${lowStock.length - 3}...` : ''}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar insumos..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', boxShadow: 'var(--surface-box)' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#6366F1')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')} />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Insumo', 'Unidade', 'Estoque Atual', 'Mínimo', 'Custo/Un.', 'Valor Total', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-label)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(supply => {
                const currentQty = (supply as any).current_stock ?? supply.current_quantity ?? 0;
                const minQty = (supply as any).min_stock ?? supply.minimum_quantity ?? 0;
                const cost = (supply as any).cost_per_unit ?? supply.unit_cost ?? 0;
                const total = currentQty * cost;
                const isLow = currentQty <= minQty;
                const pct = minQty > 0 ? Math.min((currentQty / (minQty * 2)) * 100, 100) : 100;

                return (
                  <tr key={supply.id} className="transition-colors"
                    style={{ borderBottom: '1px solid var(--border-soft)', background: isLow ? (isDark ? 'rgba(239,68,68,0.04)' : 'rgba(239,68,68,0.025)') : 'transparent' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isLow ? (isDark ? 'rgba(239,68,68,0.04)' : 'rgba(239,68,68,0.025)') : 'transparent'}>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {isLow && <AlertTriangle size={13} style={{ color: '#EF4444', flexShrink: 0 }} />}
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{supply.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4" style={{ color: 'var(--text-secondary)' }}>{supply.unit}</td>
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-bold text-sm" style={{ color: isLow ? '#EF4444' : 'var(--text-primary)' }}>
                          {currentQty}
                        </span>
                        {/* Mini progress bar */}
                        <div className="mt-1 h-1 w-16 rounded-full overflow-hidden" style={{ background: 'var(--bar-track)' }}>
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: isLow ? '#EF4444' : '#10B981' }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4" style={{ color: 'var(--text-secondary)' }}>{minQty}</td>
                    <td className="px-5 py-4 font-medium" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(cost)}</td>
                    <td className="px-5 py-4 font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(total)}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{
                          background: isLow ? (isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)') : (isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)'),
                          color: isLow ? (isDark ? '#FCA5A5' : '#991B1B') : (isDark ? '#6EE7B7' : '#065F46'),
                        }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: isLow ? '#EF4444' : '#10B981' }} />
                        {isLow ? 'Baixo' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setSelected(supply); setModal('movement'); }}
                          className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(16,185,129,0.12)', color: '#10B981' })}
                          onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}>
                          <TrendingUp size={14} />
                        </button>
                        <button onClick={() => { setSelected(supply); setModal('supply-edit'); }}
                          className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(99,102,241,0.12)', color: '#818CF8' })}
                          onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}>
                          <Edit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Package size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum insumo encontrado</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'supply-create' && store && (
        <SupplyModal storeId={store.id} onClose={() => setModal(null)} onSuccess={async () => { await refetch?.(); setModal(null); }} />
      )}
      {modal === 'supply-edit' && selected && store && (
        <SupplyModal supply={selected} storeId={store.id} onClose={() => setModal(null)} onSuccess={async () => { await refetch?.(); setModal(null); }} />
      )}
      {modal === 'movement' && selected && store && (
        <MovementModal supply={selected} storeId={store.id} onClose={() => setModal(null)} onSuccess={async () => { await refetch?.(); setModal(null); }} />
      )}
    </div>
  );
}