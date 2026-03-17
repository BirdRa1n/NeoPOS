'use client';
import { useState } from 'react';
import { supabase } from '@/supabase/client';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/forms/FormField';
import { ModalBackdrop, ModalShell, ModalHeader, ModalFooter } from '@/components/ui/Modal';
import { Toggle } from '@/components/ui/Toggle';
import { User, Phone, Bike, Users, Link2 } from 'lucide-react';
import { useIsDark } from '@/hooks/useIsDark';
import { useActiveStaffMembers, memberName } from '@/hooks/useActiveStaffMembers';
import { SectionLabel } from './SectionLabel';
import type { StaffMember } from '@/types';

const db = () => supabase.schema('core');

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

interface Props {
  driver?: any;
  storeId: string;
  staffMembers: StaffMember[];
  onClose: () => void;
  onSuccess: () => void;
}

export function DriverModal({ driver, storeId, staffMembers, onClose, onSuccess }: Props) {
  const isDark = useIsDark();
  const isEdit = !!driver;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: driver?.name ?? '',
    phone: driver?.phone ?? '',
    vehicle: driver?.vehicle ?? 'Moto',
    plate: driver?.plate ?? '',
    active: driver?.active ?? true,
    staff_member_id: driver?.staff_member_id ?? '',
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleStaffChange = (memberId: string) => {
    const m = staffMembers.find(s => s.id === memberId);
    const autoName = m ? memberName(m) : '';
    setForm(f => ({
      ...f,
      staff_member_id: memberId,
      ...(!isEdit && !f.name && autoName ? { name: autoName } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { alert('Nome obrigatório'); return; }
    setSaving(true);
    try {
      const payload = {
        store_id: storeId,
        name: form.name,
        phone: form.phone || null,
        vehicle: form.vehicle,
        plate: form.plate || null,
        active: form.active,
        staff_member_id: form.staff_member_id || null,
      };
      if (isEdit) {
        const { error } = await db().from('delivery_drivers').update(payload).eq('id', driver.id);
        if (error) throw error;
      } else {
        const { error } = await db().from('delivery_drivers').insert(payload);
        if (error) throw error;
      }
      onSuccess();
    } catch (err: any) {
      alert(err.message ?? 'Erro ao salvar entregador');
    } finally {
      setSaving(false);
    }
  };

  const linked = staffMembers.find(m => m.id === form.staff_member_id);

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell maxW="max-w-md">
        <ModalHeader
          title={isEdit ? 'Editar Entregador' : 'Novo Entregador'}
          subtitle="Cadastre um entregador na equipe"
          icon={User}
          iconColor="#8B5CF6"
          onClose={onClose}
        />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
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
            <FormField label="Placa">
              <Input icon={Bike} value={form.plate} onChange={set('plate')} placeholder="ABC-1234" />
            </FormField>
            <FormField label="Disponibilidade">
              <Toggle label="Entregador disponível para serviço" checked={form.active} onChange={v => setForm(f => ({ ...f, active: v }))} />
            </FormField>
          </div>
          <ModalFooter onCancel={onClose} saving={saving} saveLabel={isEdit ? 'Salvar' : 'Cadastrar'} />
        </form>
      </ModalShell>
    </ModalBackdrop>
  );
}
