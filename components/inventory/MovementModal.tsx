import { useState } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { supabase } from '@/supabase/client';
import { formatCurrency } from '@/lib/utils/format';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/forms/FormField';
import { ModalBackdrop, ModalShell, ModalHeader, ModalFooter } from '@/components/ui/Modal';
import { MOVEMENT_TYPES, MOVEMENT_LABELS, SupplyMovementType } from '@/types/inventory';

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

interface MovementModalProps {
  supply: any;
  storeId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function MovementModal({ supply, storeId, onClose, onSuccess }: MovementModalProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: 'purchase' as SupplyMovementType,
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
        store_id: storeId, supply_id: supply.id, type: form.type,
        quantity: finalQty, unit_cost: cost, notes: form.notes || null,
      });
      if (mvErr) throw mvErr;

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
              <FormField label="Custo Unitário" hint={supply.unit_cost > 0 ? `anterior: ${formatCurrency(supply.unit_cost)}` : undefined}>
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
