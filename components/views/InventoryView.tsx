'use client';
import { useState, useEffect } from 'react';
import { useInventory, useProductStock } from '@/hooks/useInventory';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/supabase/client';
import { formatCurrency } from '@/lib/utils/format';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/forms/FormField';
import { ModalBackdrop, ModalShell, ModalHeader, ModalFooter } from '@/components/ui/Modal';
import {
  Search, Plus, Edit, AlertTriangle, Package,
  TrendingUp, DollarSign, BarChart3, ArrowUpCircle, ArrowDownCircle,
  Eye, EyeOff, RefreshCw, ChevronUp, ChevronDown,
} from 'lucide-react';
import type { ProductStockItem, ProductMovementType } from '@/types/database';

/* ─── constants ─────────────────────────────────────────────────────────────── */

const UNITS = ['unit', 'kg', 'g', 'liter', 'ml', 'portion'] as const;
const UNIT_LABELS: Record<typeof UNITS[number], string> = {
  unit: 'Unidade', kg: 'Quilograma', g: 'Grama',
  liter: 'Litro', ml: 'Mililitro', portion: 'Porção',
};

const MOVEMENT_TYPES = ['purchase', 'manual_out', 'adjustment'] as const;
const MOVEMENT_LABELS: Record<typeof MOVEMENT_TYPES[number], string> = {
  purchase: 'Compra', manual_out: 'Saída Manual', adjustment: 'Ajuste',
};

const PRODUCT_MOVEMENT_TYPES = ['entrada', 'saida_manual', 'ajuste'] as const;
const PRODUCT_MOVEMENT_LABELS: Record<typeof PRODUCT_MOVEMENT_TYPES[number], string> = {
  entrada: 'Entrada (compra/reposição)',
  saida_manual: 'Saída Manual (perda/uso)',
  ajuste: 'Ajuste de Inventário',
};

/* ─── primitives ─────────────────────────────────────────────────────────────── */

function useIsDark() {
  if (typeof window === 'undefined') return true;
  return (getComputedStyle(document.documentElement).getPropertyValue('--bg') || '').trim().startsWith('#08');
}

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

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className="relative rounded-full transition-all shrink-0"
      style={{ width: 36, height: 20, background: value ? '#6366F1' : 'rgba(107,114,128,0.3)' }}>
      <div className="absolute top-1 w-3.5 h-3.5 rounded-full bg-white shadow transition-all"
        style={{ left: value ? 18 : 2 }} />
    </button>
  );
}

/* ─── Supply Modal ─────────────────────────────────────────────────────────── */

function SupplyModal({ supply, storeId, onClose, onSuccess }: {
  supply?: any; storeId: string; onClose: () => void; onSuccess: () => void;
}) {
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
  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

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

/* ─── Movement Modal (insumos) ────────────────────────────────────────────── */

function MovementModal({ supply, storeId, onClose, onSuccess }: {
  supply: any; storeId: string; onClose: () => void; onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: 'purchase' as typeof MOVEMENT_TYPES[number],
    quantity: '',
    unit_cost: supply.unit_cost > 0 ? supply.unit_cost.toString() : '',
    notes: '',
  });
  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const qty = parseFloat(form.quantity);
      const cost = parseFloat(form.unit_cost) || 0;
      const finalQty = form.type === 'manual_out' ? -Math.abs(qty) : Math.abs(qty);

      const { error: mvErr } = await supabase.schema('inventory').from('stock_movements').insert({
        store_id: storeId,
        supply_id: supply.id,
        type: form.type,
        quantity: finalQty,
        unit_cost: cost,
        notes: form.notes || null,
      });
      if (mvErr) throw mvErr;

      // insumos: atualiza manualmente (sem trigger)
      const { error: upErr } = await supabase.schema('inventory').from('supplies')
        .update({
          current_quantity: supply.current_quantity + finalQty,
          ...(form.type === 'purchase' && cost > 0 ? { unit_cost: cost } : {}),
        })
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
              <FormField
                label="Custo Unitário"
                hint={supply.unit_cost > 0 ? `anterior: ${formatCurrency(supply.unit_cost)}` : undefined}
              >
                <Input icon={DollarSign} type="number" step="0.01" min="0" value={form.unit_cost} onChange={set('unit_cost')} placeholder="0,00" />
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

/* ─── Product Stock Edit Modal ───────────────────────────────────────────── */

function ProductStockEditModal({ productStock, storeId, onClose, onSuccess }: {
  productStock: ProductStockItem; storeId: string; onClose: () => void; onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    minimum_quantity: productStock.minimum_quantity.toString(),
    unit_cost: productStock.unit_cost.toString(),
  });
  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.schema('inventory').from('product_stock')
        .update({
          minimum_quantity: parseFloat(form.minimum_quantity) || 0,
          unit_cost: parseFloat(form.unit_cost) || 0,
        })
        .eq('id', productStock.id);
      if (error) throw error;
      onSuccess();
    } catch (err: any) { alert(err.message ?? 'Erro ao atualizar produto'); }
    finally { setSaving(false); }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell maxW="max-w-md">
        <ModalHeader title="Editar Estoque do Produto" subtitle={productStock.name} icon={Edit} iconColor="#6366F1" onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Estoque Mínimo" required>
                <Input type="number" step="0.01" min="0" value={form.minimum_quantity} onChange={set('minimum_quantity')} required />
              </FormField>
              <FormField label="Custo Unitário" required>
                <Input icon={DollarSign} type="number" step="0.01" min="0" value={form.unit_cost} onChange={set('unit_cost')} required />
              </FormField>
            </div>
            <p className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>
              O estoque atual é atualizado automaticamente pelas movimentações.
            </p>
          </div>
          <ModalFooter onCancel={onClose} saving={saving} saveLabel="Salvar" />
        </form>
      </ModalShell>
    </ModalBackdrop>
  );
}

/* ─── Product Movement Modal ─────────────────────────────────────────────── */

function ProductMovementModal({ productStock, storeId, onClose, onSuccess }: {
  productStock: ProductStockItem; storeId: string; onClose: () => void; onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: 'entrada' as ProductMovementType,
    quantity: '',
    unit_cost: productStock.unit_cost > 0 ? productStock.unit_cost.toString() : '',
    notes: '',
  });
  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const qty = parseFloat(form.quantity);
      const cost = parseFloat(form.unit_cost) || 0;

      // trigger cuida de atualizar current_quantity
      const { error } = await supabase.schema('inventory').from('product_stock_movements').insert({
        store_id: storeId,
        product_stock_id: productStock.id,
        type: form.type,
        quantity: Math.abs(qty),
        unit_cost: cost,
        notes: form.notes || null,
      });
      if (error) throw error;

      // ao registrar uma entrada, atualiza o custo unitário
      if (form.type === 'entrada' && cost > 0) {
        const { error: costErr } = await supabase.schema('inventory').from('product_stock')
          .update({ unit_cost: cost })
          .eq('id', productStock.id);
        if (costErr) throw costErr;
      }

      onSuccess();
    } catch (err: any) { alert(err.message ?? 'Erro ao registrar movimentação'); }
    finally { setSaving(false); }
  };

  const isOut = form.type === 'saida_manual';
  const isAdj = form.type === 'ajuste';
  const iconColor = isOut ? '#EF4444' : isAdj ? '#F59E0B' : '#10B981';
  const Icon = isOut ? ArrowDownCircle : isAdj ? TrendingUp : ArrowUpCircle;
  const showCost = form.type === 'entrada';

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell maxW="max-w-md">
        <ModalHeader title="Movimentação de Produto" subtitle={productStock.name} icon={Icon} iconColor={iconColor} onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">

            {/* Info estoque atual */}
            <div className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)' }}>
              <Package size={14} style={{ color: 'var(--text-muted)' }} />
              <div>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Estoque atual</p>
                <p className="text-sm font-bold" style={{ color: productStock.below_minimum ? '#EF4444' : 'var(--text-primary)' }}>
                  {productStock.current_quantity} un.
                  {productStock.below_minimum && (
                    <span className="ml-2 text-[10px] font-semibold" style={{ color: '#F87171' }}>⚠ abaixo do mínimo</span>
                  )}
                </p>
              </div>
            </div>

            <FormField label="Tipo de Movimentação" required>
              <Select value={form.type} onChange={set('type')} required>
                {PRODUCT_MOVEMENT_TYPES.map(t => (
                  <option key={t} value={t}>{PRODUCT_MOVEMENT_LABELS[t]}</option>
                ))}
              </Select>
            </FormField>

            <div className={showCost ? 'grid grid-cols-2 gap-4' : ''}>
              <FormField label="Quantidade" required>
                <Input type="number" step="0.01" min="0.01" value={form.quantity} onChange={set('quantity')} placeholder="0" required />
              </FormField>
              {showCost && (
                <FormField
                  label="Custo Unitário"
                  hint={productStock.unit_cost > 0 ? `anterior: ${formatCurrency(productStock.unit_cost)}` : undefined}
                >
                  <Input icon={DollarSign} type="number" step="0.01" min="0" value={form.unit_cost} onChange={set('unit_cost')} placeholder="0,00" />
                </FormField>
              )}
            </div>

            <FormField label="Observações">
              <Textarea value={form.notes} onChange={set('notes')} placeholder="Notas..." rows={2} />
            </FormField>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
              style={{ background: `${iconColor}10`, border: `1px solid ${iconColor}30` }}>
              <Icon size={13} style={{ color: iconColor }} />
              <span style={{ color: 'var(--text-secondary)' }}>
                {isOut ? 'Saída reduzirá o estoque atual' : isAdj ? 'Ajuste recalculará o estoque' : 'Entrada aumentará o estoque atual'}
              </span>
            </div>
          </div>
          <ModalFooter onCancel={onClose} saving={saving} saveLabel="Registrar" />
        </form>
      </ModalShell>
    </ModalBackdrop>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */

type SortKey = 'name' | 'current_quantity' | 'stock_value';

export function InventoryView() {
  const isDark = useIsDark();
  const { store } = useStore();
  const { supplies, loading: suppliesLoading, refetch: refetchSupplies } = useInventory();
  const { productStocks, loading: productsLoading, refetch: refetchProducts } = useProductStock();

  const [activeTab, setActiveTab] = useState<'supplies' | 'products'>('supplies');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [modal, setModal] = useState<null | 'supply-create' | 'supply-edit' | 'movement' | 'product-movement' | 'product-edit'>(null);
  const [selected, setSelected] = useState<any>(null);

  const loading = suppliesLoading || productsLoading;
  const isProducts = activeTab === 'products';

  const filteredSupplies = (supplies ?? []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProducts = (productStocks ?? []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let va: any = a[sortKey as keyof typeof a];
    let vb: any = b[sortKey as keyof typeof b];
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => sortKey === k
    ? (sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />)
    : <ChevronDown size={11} style={{ opacity: 0.3 }} />;

  const lowStock = isProducts
    ? (productStocks ?? []).filter(p => p.below_minimum)
    : (supplies ?? []).filter(s => s.current_quantity <= s.minimum_quantity);

  const totalValue = isProducts
    ? (productStocks ?? []).reduce((acc, p) => acc + (p.stock_value || 0), 0)
    : (supplies ?? []).reduce((acc, s) => acc + (s.current_quantity ?? 0) * (s.unit_cost ?? 0), 0);

  const totalItemsCount = isProducts ? (productStocks?.length ?? 0) : (supplies?.length ?? 0);

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
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Controle de insumos e inventário de produtos</p>
        </div>
        {!isProducts && (
          <button onClick={() => { setSelected(null); setModal('supply-create'); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
            <Plus size={15} /> Novo Insumo
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl w-max"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
        {(['supplies', 'products'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: activeTab === tab ? 'var(--bg-primary)' : 'transparent',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
            }}>
            {tab === 'supplies' ? 'Insumos' : 'Produtos'}
          </button>
        ))}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total de Itens', value: totalItemsCount, color: '#6366F1', icon: Package },
          { label: 'Estoque Baixo', value: lowStock.length, color: '#EF4444', icon: AlertTriangle },
          { label: 'Valor em Estoque', value: formatCurrency(totalValue), color: '#10B981', icon: DollarSign },
          { label: 'Itens OK', value: totalItemsCount - lowStock.length, color: '#F59E0B', icon: BarChart3 },
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
              {lowStock.map((s: any) => s.name).slice(0, 4).join(', ')}
              {lowStock.length > 4 ? ` e mais ${lowStock.length - 4}...` : ''}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={`Buscar ${isProducts ? 'produto ou categoria' : 'insumos'}...`}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', boxShadow: 'var(--surface-box)' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#6366F1')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')} />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
        <div className="overflow-x-auto">

          {/* ── Insumos table ── */}
          {!isProducts ? (
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
                {filteredSupplies.map(supply => {
                  const currentQty = supply.current_quantity ?? 0;
                  const minQty = supply.minimum_quantity ?? 0;
                  const cost = supply.unit_cost ?? 0;
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
                      <td className="px-5 py-4" style={{ color: 'var(--text-secondary)' }}>
                        {UNIT_LABELS[supply.unit as typeof UNITS[number]] ?? supply.unit}
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <span className="font-bold text-sm" style={{ color: isLow ? '#EF4444' : 'var(--text-primary)' }}>
                            {currentQty}
                          </span>
                          <div className="mt-1 h-1 w-16 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
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
                            title="Registrar movimentação"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(16,185,129,0.12)', color: '#10B981' })}
                            onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}>
                            <TrendingUp size={14} />
                          </button>
                          <button onClick={() => { setSelected(supply); setModal('supply-edit'); }}
                            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                            title="Editar insumo"
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

          ) : (
            /* ── Products table ── */
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {[
                    { label: 'Produto', key: 'name' as SortKey },
                    { label: 'Categoria', key: null },
                    { label: 'Estoque Atual', key: 'current_quantity' as SortKey },
                    { label: 'Mínimo', key: null },
                    { label: 'Custo/Un.', key: null },
                    { label: 'Valor Total', key: 'stock_value' as SortKey },
                    { label: 'Status', key: null },
                    { label: '', key: null },
                  ].map(({ label, key }) => (
                    <th key={label}
                      className={`px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider select-none ${key ? 'cursor-pointer' : ''}`}
                      style={{ color: key && sortKey === key ? '#818CF8' : 'var(--text-label)' }}
                      onClick={() => key && handleSort(key)}>
                      <span className="inline-flex items-center gap-1">
                        {label}{key && <SortIcon k={key} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map(p => {
                  const isLow = p.below_minimum;
                  const pct = p.minimum_quantity > 0
                    ? Math.min((p.current_quantity / (p.minimum_quantity * 2)) * 100, 100)
                    : 100;

                  return (
                    <tr key={p.id} className="transition-colors"
                      style={{ borderBottom: '1px solid var(--border-soft)', background: isLow ? (isDark ? 'rgba(239,68,68,0.04)' : 'rgba(239,68,68,0.025)') : 'transparent' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isLow ? (isDark ? 'rgba(239,68,68,0.04)' : 'rgba(239,68,68,0.025)') : 'transparent'}>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {isLow && <AlertTriangle size={13} style={{ color: '#EF4444', flexShrink: 0 }} />}
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {p.category ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                            style={{ background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)', color: '#818CF8' }}>
                            {p.category}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <span className="font-bold text-sm" style={{ color: isLow ? '#EF4444' : 'var(--text-primary)' }}>
                            {p.current_quantity}
                          </span>
                          <div className="mt-1 h-1 w-16 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                            <div className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, background: isLow ? '#EF4444' : '#10B981' }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4" style={{ color: 'var(--text-secondary)' }}>{p.minimum_quantity}</td>
                      <td className="px-5 py-4 font-medium" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(p.unit_cost)}</td>
                      <td className="px-5 py-4 font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(p.stock_value)}</td>
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
                          <button onClick={() => { setSelected(p); setModal('product-movement'); }}
                            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                            title="Registrar movimentação"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(16,185,129,0.12)', color: '#10B981' })}
                            onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}>
                            <TrendingUp size={14} />
                          </button>
                          <button onClick={() => { setSelected(p); setModal('product-edit'); }}
                            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                            title="Editar configurações"
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
          )}
        </div>

        {/* Empty state */}
        {((!isProducts && filteredSupplies.length === 0) || (isProducts && filteredProducts.length === 0)) && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Package size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {search ? 'Nenhum resultado para a busca' : `Nenhum ${isProducts ? 'produto' : 'insumo'} cadastrado`}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'supply-create' && store && (
        <SupplyModal storeId={store.id} onClose={() => setModal(null)} onSuccess={async () => { await refetchSupplies?.(); setModal(null); }} />
      )}
      {modal === 'supply-edit' && selected && store && (
        <SupplyModal supply={selected} storeId={store.id} onClose={() => setModal(null)} onSuccess={async () => { await refetchSupplies?.(); setModal(null); }} />
      )}
      {modal === 'movement' && selected && store && (
        <MovementModal supply={selected} storeId={store.id} onClose={() => setModal(null)} onSuccess={async () => { await refetchSupplies?.(); setModal(null); }} />
      )}
      {modal === 'product-movement' && selected && store && (
        <ProductMovementModal productStock={selected} storeId={store.id} onClose={() => setModal(null)} onSuccess={async () => { await refetchProducts?.(); setModal(null); }} />
      )}
      {modal === 'product-edit' && selected && store && (
        <ProductStockEditModal productStock={selected} storeId={store.id} onClose={() => setModal(null)} onSuccess={async () => { await refetchProducts?.(); setModal(null); }} />
      )}
    </div>
  );
}