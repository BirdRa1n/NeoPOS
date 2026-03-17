import { useState } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, TrendingUp, Package } from 'lucide-react';
import { supabase } from '@/supabase/client';
import { formatCurrency } from '@/lib/utils/format';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/forms/FormField';
import { ModalBackdrop, ModalShell, ModalHeader, ModalFooter } from '@/components/ui/Modal';
import { ProductStockItem, ProductMovementType } from '@/types/database';
import { PRODUCT_MOVEMENT_TYPES, PRODUCT_MOVEMENT_LABELS } from '@/types/inventory';

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

interface ProductMovementModalProps {
  productStock: ProductStockItem;
  storeId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductMovementModal({ productStock, storeId, onClose, onSuccess }: ProductMovementModalProps) {
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

      const { error } = await supabase.schema('inventory').from('product_stock_movements').insert({
        store_id: storeId, product_stock_id: productStock.id,
        type: form.type, quantity: Math.abs(qty), unit_cost: cost, notes: form.notes || null,
      });
      if (error) throw error;

      if (form.type === 'entrada' && cost > 0) {
        const { error: costErr } = await supabase.schema('inventory').from('product_stock')
          .update({ unit_cost: cost }).eq('id', productStock.id);
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
                <FormField label="Custo Unitário" hint={productStock.unit_cost > 0 ? `anterior: ${formatCurrency(productStock.unit_cost)}` : undefined}>
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
