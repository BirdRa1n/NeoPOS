import { useState } from 'react';
import { Package, DollarSign } from 'lucide-react';
import { supabase } from '@/supabase/client';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/forms/FormField';
import { ModalBackdrop, ModalShell, ModalHeader, ModalFooter } from '@/components/ui/Modal';
import { UNITS, UNIT_LABELS } from '@/types/inventory';

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

interface SupplyModalProps {
  supply?: any;
  storeId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function SupplyModal({ supply, storeId, onClose, onSuccess }: SupplyModalProps) {
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
