import { useState } from 'react';
import { Edit, DollarSign } from 'lucide-react';
import { supabase } from '@/supabase/client';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/forms/FormField';
import { ModalBackdrop, ModalShell, ModalHeader, ModalFooter } from '@/components/ui/Modal';
import { ProductStockItem } from '@/types/database';

interface ProductStockEditModalProps {
  productStock: ProductStockItem;
  storeId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductStockEditModal({ productStock, storeId, onClose, onSuccess }: ProductStockEditModalProps) {
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
