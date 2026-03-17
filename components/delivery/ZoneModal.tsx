'use client';
import { useState } from 'react';
import { supabase } from '@/supabase/client';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/forms/FormField';
import { ModalBackdrop, ModalShell, ModalHeader, ModalFooter } from '@/components/ui/Modal';
import { Toggle } from '@/components/ui/Toggle';
import { MapPin, Building2, DollarSign, Clock } from 'lucide-react';
import { SectionLabel } from './SectionLabel';
import type { DeliveryZone } from '@/types/delivery';

const db = () => supabase.schema('core');

interface Props {
  zone?: DeliveryZone;
  storeId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ZoneModal({ zone, storeId, onClose, onSuccess }: Props) {
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
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

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
    } catch (err: any) {
      alert(err.message ?? 'Erro ao salvar zona');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell maxW="max-w-md">
        <ModalHeader
          title={isEdit ? 'Editar Zona' : 'Nova Zona de Entrega'}
          subtitle="Configure bairro, taxa e tempo estimado"
          icon={MapPin}
          iconColor="#10B981"
          onClose={onClose}
        />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <SectionLabel label="Localização" color="#10B981" />
            <FormField label="Bairro" required>
              <Input icon={MapPin} value={form.neighborhood} onChange={set('neighborhood')} placeholder="Centro" required />
            </FormField>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <FormField label="Cidade" required>
                  <Input icon={Building2} value={form.city} onChange={set('city')} placeholder="Fortaleza" required />
                </FormField>
              </div>
              <FormField label="UF">
                <Input value={form.state} onChange={set('state')} placeholder="CE" maxLength={2} />
              </FormField>
            </div>
            <div style={{ height: 1, background: 'var(--border)' }} />
            <SectionLabel label="Configurações" color="#6366F1" />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Taxa de Entrega (R$)" required>
                <Input icon={DollarSign} type="number" step="0.01" min="0" value={form.delivery_fee} onChange={set('delivery_fee')} placeholder="5,00" required />
              </FormField>
              <FormField label="Tempo Est. (min)">
                <Input icon={Clock} type="number" min="1" value={form.estimated_time_min} onChange={set('estimated_time_min')} placeholder="30" />
              </FormField>
            </div>
            <FormField label="Status">
              <Toggle label="Zona disponível para entregas" checked={form.active} onChange={v => setForm(f => ({ ...f, active: v }))} />
            </FormField>
          </div>
          <ModalFooter onCancel={onClose} saving={saving} saveLabel={isEdit ? 'Salvar Zona' : 'Criar Zona'} />
        </form>
      </ModalShell>
    </ModalBackdrop>
  );
}
