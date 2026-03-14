'use client';
/**
 * RoleEditorModal — Modal de criação/edição de cargos de staff.
 * Inclui a seção "Restrições por Tipo de Pedido" com configuração
 * granular de view/create/edit/delete por tipo (delivery/pickup/table).
 *
 * Uso:
 *   import { RoleEditorModal } from '@/components/RoleEditorModal';
 *   <RoleEditorModal role={role} storeId={storeId} isDark={isDark} onClose={...} onSaved={...} />
 */
import { useState } from 'react';
import {
  Crown, X, AlertTriangle, Save, Check, Loader2,
  Truck, Package, UtensilsCrossed, Eye, Plus, Edit, Trash2, ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────
export type OrderType = 'delivery' | 'pickup' | 'table';

export interface StaffRole {
  id?: string;
  name: string;
  description: string | null;
  color: string;
  perm_orders_view: boolean;
  perm_orders_create: boolean;
  perm_orders_edit: boolean;
  perm_orders_delete: boolean;
  perm_orders_change_status: boolean;
  perm_inventory_view: boolean;
  perm_inventory_edit: boolean;
  perm_catalog_view: boolean;
  perm_catalog_edit: boolean;
  perm_finance_view: boolean;
  perm_customers_view: boolean;
  perm_reports_view: boolean;
  perm_store_settings: boolean;
  perm_staff_manage: boolean;
  allowed_view_order_types: OrderType[] | null;
  allowed_create_order_types: OrderType[] | null;
  allowed_edit_order_types: OrderType[] | null;
  allowed_delete_order_types: OrderType[] | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STAFF_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/staff-manage`;

const ORDER_TYPES: { value: OrderType; label: string; icon: React.FC<any> }[] = [
  { value: 'delivery', label: 'Delivery', icon: Truck },
  { value: 'pickup',   label: 'Retirada', icon: Package },
  { value: 'table',    label: 'No local', icon: UtensilsCrossed },
];

const ORDER_OPS: { key: 'allowed_view_order_types' | 'allowed_create_order_types' | 'allowed_edit_order_types' | 'allowed_delete_order_types'; label: string; icon: React.FC<any>; perm: keyof StaffRole }[] = [
  { key: 'allowed_view_order_types',   label: 'Visualizar',       icon: Eye,     perm: 'perm_orders_view' },
  { key: 'allowed_create_order_types', label: 'Criar',            icon: Plus,    perm: 'perm_orders_create' },
  { key: 'allowed_edit_order_types',   label: 'Editar / Status',  icon: Edit,    perm: 'perm_orders_edit' },
  { key: 'allowed_delete_order_types', label: 'Excluir',          icon: Trash2,  perm: 'perm_orders_delete' },
];

const PERM_GROUPS = [
  { label: 'Pedidos', color: '#6366F1', perms: [
    { key: 'perm_orders_view',          label: 'Visualizar' },
    { key: 'perm_orders_create',        label: 'Criar' },
    { key: 'perm_orders_edit',          label: 'Editar' },
    { key: 'perm_orders_change_status', label: 'Mudar status' },
    { key: 'perm_orders_delete',        label: 'Excluir' },
  ]},
  { label: 'Catálogo', color: '#8B5CF6', perms: [
    { key: 'perm_catalog_view', label: 'Visualizar' },
    { key: 'perm_catalog_edit', label: 'Editar' },
  ]},
  { label: 'Estoque', color: '#10B981', perms: [
    { key: 'perm_inventory_view', label: 'Visualizar' },
    { key: 'perm_inventory_edit', label: 'Editar' },
  ]},
  { label: 'Financeiro & Relatórios', color: '#F59E0B', perms: [
    { key: 'perm_finance_view',   label: 'Financeiro' },
    { key: 'perm_reports_view',   label: 'Relatórios' },
    { key: 'perm_customers_view', label: 'Clientes' },
  ]},
  { label: 'Administração', color: '#EF4444', perms: [
    { key: 'perm_store_settings', label: 'Configurações da loja' },
    { key: 'perm_staff_manage',   label: 'Gerenciar equipe' },
  ]},
];

const COLOR_OPTIONS = ['#6366F1','#8B5CF6','#EC4899','#EF4444','#F59E0B','#10B981','#3B82F6','#06B6D4','#84CC16','#6B7280'];

const EMPTY_ROLE: StaffRole = {
  name: '', description: '', color: '#6366F1',
  perm_orders_view: false, perm_orders_create: false, perm_orders_edit: false,
  perm_orders_delete: false, perm_orders_change_status: false,
  perm_inventory_view: false, perm_inventory_edit: false,
  perm_catalog_view: false, perm_catalog_edit: false,
  perm_finance_view: false, perm_customers_view: false,
  perm_reports_view: false, perm_store_settings: false, perm_staff_manage: false,
  allowed_view_order_types: null, allowed_create_order_types: null,
  allowed_edit_order_types: null, allowed_delete_order_types: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function getToken() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('Não autenticado');
  return data.session.access_token;
}

async function staffCall(token: string, body: Record<string, unknown>) {
  const res = await fetch(STAFF_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Erro desconhecido');
  return data;
}

// ─── OrderTypeSelector ────────────────────────────────────────────────────────
function OrderTypeSelector({
  label, opKey, value, onChange, disabled, isDark,
}: {
  label: string;
  opKey: string;
  value: OrderType[] | null;
  onChange: (v: OrderType[] | null) => void;
  disabled?: boolean;
  isDark: boolean;
}) {
  const isUnrestricted = value === null;

  const toggleAll = () => onChange(isUnrestricted ? [] : null);

  const toggleType = (type: OrderType) => {
    if (value === null) {
      // Estava "todos" — começa selecionando só os outros
      onChange(ORDER_TYPES.map(t => t.value).filter(t => t !== type));
    } else {
      const has = value.includes(type);
      const next = has ? value.filter(t => t !== type) : [...value, type];
      onChange(next.length === ORDER_TYPES.length ? null : next);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        <button
          type="button"
          onClick={toggleAll}
          disabled={disabled}
          className="text-[10px] font-bold px-2 py-0.5 rounded-full transition-all disabled:opacity-40"
          style={{
            background: isUnrestricted ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.1)',
            color: isUnrestricted ? '#10B981' : 'var(--text-muted)',
            border: `1px solid ${isUnrestricted ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`,
          }}
        >
          {isUnrestricted ? '✓ Todos' : 'Restrito'}
        </button>
      </div>

      <div className="flex gap-2">
        {ORDER_TYPES.map(({ value: type, label: typeLabel, icon: Icon }) => {
          const isSelected = isUnrestricted || (value?.includes(type) ?? false);
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              disabled={disabled}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all disabled:opacity-40"
              style={{
                background: isSelected
                  ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)')
                  : 'var(--input-bg)',
                border: `1.5px solid ${isSelected ? '#6366F1' : 'var(--border)'}`,
              }}
            >
              <Icon size={14} style={{ color: isSelected ? '#818CF8' : 'var(--text-muted)' }} />
              <span className="text-[10px] font-semibold" style={{ color: isSelected ? '#818CF8' : 'var(--text-muted)' }}>
                {typeLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface RoleEditorModalProps {
  role: Partial<StaffRole> | null;
  storeId: string;
  isDark: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function RoleEditorModal({ role, storeId, isDark, onClose, onSaved }: RoleEditorModalProps) {
  const isNew = !role?.id;

  const [form, setForm] = useState<StaffRole>({
    ...EMPTY_ROLE,
    ...(role ? {
      name: role.name ?? '',
      description: role.description ?? '',
      color: role.color ?? '#6366F1',
      ...Object.fromEntries(
        Object.entries(role).filter(([k]) => k.startsWith('perm_') || k.startsWith('allowed_'))
      ),
    } : {}),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setF = (k: keyof StaffRole, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Nome do cargo é obrigatório'); return; }
    setSaving(true); setError('');
    try {
      const token = await getToken();
      const normalizeTypes = (v: OrderType[] | null) =>
        v === null || v.length === 0 ? null : v;
      const payload = {
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() || null,
        allowed_view_order_types:   normalizeTypes(form.allowed_view_order_types),
        allowed_create_order_types: normalizeTypes(form.allowed_create_order_types),
        allowed_edit_order_types:   normalizeTypes(form.allowed_edit_order_types),
        allowed_delete_order_types: normalizeTypes(form.allowed_delete_order_types),
      };
      if (isNew) {
        await staffCall(token, { action: 'create_role', store_id: storeId, role: payload });
      } else {
        await staffCall(token, { action: 'update_role', store_id: storeId, role_id: role!.id, role: payload });
      }
      onSaved(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  // Verifica se as permissões de pedido estão ativas para habilitar os seletores
  const hasOrderPerms = form.perm_orders_view || form.perm_orders_create || form.perm_orders_edit || form.perm_orders_delete;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{ background: isDark ? '#0D1019' : '#fff', border: '1px solid var(--border)', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${form.color}22`, border: `1px solid ${form.color}44` }}>
              <Crown size={16} style={{ color: form.color }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {isNew ? 'Novo cargo' : 'Editar cargo'}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Configure permissões e restrições</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <X size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-6 flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-xs"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
              <AlertTriangle size={13} />{error}
            </div>
          )}

          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Nome do cargo <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input value={form.name} onChange={e => setF('name', e.target.value)}
              placeholder="Ex: Atendente, Caixa, Garçom..."
              className="w-full rounded-xl text-sm outline-none transition-all px-3 py-2.5"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }} />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Descrição</label>
            <input value={form.description ?? ''} onChange={e => setF('description', e.target.value)}
              placeholder="Responsabilidades do cargo..."
              className="w-full rounded-xl text-sm outline-none transition-all px-3 py-2.5"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }} />
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Cor do cargo</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(c => (
                <button key={c} type="button" onClick={() => setF('color', c)}
                  className="w-7 h-7 rounded-lg transition-all"
                  style={{ background: c, border: form.color === c ? '3px solid var(--text-primary)' : '3px solid transparent', transform: form.color === c ? 'scale(1.15)' : 'scale(1)' }} />
              ))}
            </div>
          </div>

          {/* Divisor */}
          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* ── Permissões gerais ── */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Permissões</p>
            {PERM_GROUPS.map(group => (
              <div key={group.label} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <div className="px-4 py-2.5 flex items-center gap-2"
                  style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: group.color }} />
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{group.label}</p>
                </div>
                <div className="p-3 grid grid-cols-2 gap-2">
                  {group.perms.map(({ key, label }) => (
                    <button key={key} type="button" onClick={() => setF(key as keyof StaffRole, !(form as any)[key])}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left"
                      style={{
                        background: (form as any)[key] ? (isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)') : 'var(--input-bg)',
                        border: `1px solid ${(form as any)[key] ? '#6366F1' : 'var(--border)'}`,
                      }}>
                      <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
                        style={{ background: (form as any)[key] ? '#6366F1' : 'var(--border)' }}>
                        {(form as any)[key] && <Check size={10} color="#fff" />}
                      </div>
                      <span className="text-xs font-medium"
                        style={{ color: (form as any)[key] ? '#818CF8' : 'var(--text-muted)' }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Restrições por Tipo de Pedido ── */}
          {hasOrderPerms && (
            <>
              <div style={{ height: 1, background: 'var(--border)' }} />
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} style={{ color: '#6366F1' }} />
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Restrição por tipo de pedido
                  </p>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Defina quais tipos de pedido (Delivery, Retirada, No local) este cargo pode operar em cada ação.
                  <strong style={{ color: 'var(--text-secondary)' }}> "Todos"</strong> significa sem restrição.
                </p>

                <div className="space-y-5">
                  {ORDER_OPS.map(({ key, label, icon: Icon, perm }) => {
                    const hasPerm = (form as any)[perm];
                    return (
                      <div key={key} className="rounded-xl p-4 space-y-3"
                        style={{
                          background: hasPerm ? (isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)') : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
                          border: `1px solid ${hasPerm ? 'rgba(99,102,241,0.2)' : 'var(--border)'}`,
                          opacity: hasPerm ? 1 : 0.5,
                        }}>
                        <div className="flex items-center gap-2">
                          <Icon size={13} style={{ color: hasPerm ? '#818CF8' : 'var(--text-muted)' }} />
                          <p className="text-xs font-bold" style={{ color: hasPerm ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {label}
                          </p>
                          {!hasPerm && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto"
                              style={{ background: 'rgba(107,114,128,0.1)', color: 'var(--text-muted)' }}>
                              Permissão desativada
                            </span>
                          )}
                        </div>
                        <OrderTypeSelector
                          label=""
                          opKey={key}
                          value={(form as any)[key]}
                          onChange={v => setF(key as keyof StaffRole, v)}
                          disabled={!hasPerm}
                          isDark={isDark}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Legenda */}
                <div className="rounded-xl p-3 text-[11px] space-y-1.5"
                  style={{ background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <p className="font-bold" style={{ color: '#818CF8' }}>Como funciona?</p>
                  <p style={{ color: 'var(--text-muted)' }}>
                    • <strong style={{ color: 'var(--text-secondary)' }}>Todos</strong> — sem restrição, o cargo opera qualquer tipo de pedido.
                  </p>
                  <p style={{ color: 'var(--text-muted)' }}>
                    • <strong style={{ color: 'var(--text-secondary)' }}>Restrito</strong> — apenas os tipos selecionados ficam visíveis/operáveis.
                  </p>
                  <p style={{ color: 'var(--text-muted)' }}>
                    • Um garçom, por exemplo, pode ver e criar apenas pedidos "No local".
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
            {saving ? <><Loader2 size={14} className="animate-spin" />Salvando...</> : <><Save size={14} />{isNew ? 'Criar cargo' : 'Salvar alterações'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
