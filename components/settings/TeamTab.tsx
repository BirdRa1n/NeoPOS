'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';
import { Card } from '@/components/ui/Card';
import { RoleEditorModal } from '@/components/RoleEditorModal';
import {
  Users, Key, Crown, Clock, CheckCircle2, ShieldAlert, UserX,
  UserCheck, ChevronDown, ChevronUp, Plus, Trash2, Loader2,
  AlertTriangle, X, Check, Copy, Sparkles,
} from 'lucide-react';
import { COLORS, ALPHA } from '@/lib/constants';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STAFF_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/staff-manage`;

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

// ─── Types ────────────────────────────────────────────────────────────────────
interface StaffMember {
  id: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  display_name: string | null;
  created_at: string;
  approved_at: string | null;
  rejected_reason: string | null;
  user: { id: string; email: string; raw_user_meta_data: { name?: string } } | null;
  role: { id: string; name: string; color: string } | null;
}

interface StaffRole {
  id: string;
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
  allowed_order_types: string[] | null;
}

interface InviteCode {
  id: string;
  code: string;
  label: string | null;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

const PERM_GROUPS = [
  {
    label: 'Pedidos',
    perms: [
      { key: 'perm_orders_view', label: 'Visualizar' },
      { key: 'perm_orders_create', label: 'Criar' },
      { key: 'perm_orders_edit', label: 'Editar' },
      { key: 'perm_orders_change_status', label: 'Mudar status' },
      { key: 'perm_orders_delete', label: 'Excluir' },
    ],
  },
  {
    label: 'Catálogo',
    perms: [
      { key: 'perm_catalog_view', label: 'Visualizar' },
      { key: 'perm_catalog_edit', label: 'Editar' },
    ],
  },
  {
    label: 'Estoque',
    perms: [
      { key: 'perm_inventory_view', label: 'Visualizar' },
      { key: 'perm_inventory_edit', label: 'Editar' },
    ],
  },
  {
    label: 'Financeiro & Relatórios',
    perms: [
      { key: 'perm_finance_view', label: 'Financeiro' },
      { key: 'perm_reports_view', label: 'Relatórios' },
      { key: 'perm_customers_view', label: 'Clientes' },
    ],
  },
  {
    label: 'Administração',
    perms: [
      { key: 'perm_store_settings', label: 'Configurações da loja' },
      { key: 'perm_staff_manage', label: 'Gerenciar equipe' },
    ],
  },
];

const STATUS_CONFIG = {
  pending: {
    label: 'Pendente',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
    Icon: Clock,
  },
  active: {
    label: 'Ativo',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
    Icon: CheckCircle2,
  },
  suspended: {
    label: 'Suspenso',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.25)',
    Icon: ShieldAlert,
  },
  rejected: {
    label: 'Rejeitado',
    color: '#6B7280',
    bg: 'rgba(107,114,128,0.1)',
    border: 'rgba(107,114,128,0.2)',
    Icon: UserX,
  },
};

// ─── InviteCodeModal ──────────────────────────────────────────────────────────
function InviteCodeModal({
  storeId,
  isDark,
  onClose,
  onCreated,
}: {
  storeId: string;
  isDark: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ label: '', max_uses: '', expires_at: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setSaving(true);
    setError('');
    try {
      const token = await getToken();
      await staffCall(token, {
        action: 'create_invite_code',
        store_id: storeId,
        label: form.label.trim() || null,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        expires_at: form.expires_at
          ? new Date(form.expires_at).toISOString()
          : null,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: isDark ? '#0D1019' : '#fff',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}
      >
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.12)' }}
            >
              <Key size={16} style={{ color: '#10B981' }} />
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Novo código de convite
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <X size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-xs"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#FCA5A5',
              }}
            >
              <AlertTriangle size={13} />
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Rótulo{' '}
              <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span>
            </label>
            <input
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="Ex: Convite para garçons"
              className="w-full rounded-xl text-sm outline-none px-3 py-2.5"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Máx. de usos
              </label>
              <input
                type="number"
                min={1}
                value={form.max_uses}
                onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                placeholder="Ilimitado"
                className="w-full rounded-xl text-sm outline-none px-3 py-2.5"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Expira em
              </label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                className="w-full rounded-xl text-sm outline-none px-3 py-2.5"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            O código será gerado automaticamente no formato{' '}
            <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>
              INV-XXXXXXXX
            </span>
          </p>
        </div>
        <div
          className="flex gap-3 p-5"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg,#10B981,#059669)',
              boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
            }}
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            {saving ? 'Criando...' : 'Gerar código'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TeamTab ──────────────────────────────────────────────────────────────────
interface TeamTabProps {
  storeId: string;
  isDark: boolean;
}

export function TeamTab({ storeId, isDark }: TeamTabProps) {
  const [subTab, setSubTab] = useState<'members' | 'roles' | 'invites'>('members');
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [roleModal, setRoleModal] = useState<{
    open: boolean;
    role: Partial<StaffRole> | null;
  }>({ open: false, role: null });
  const [inviteModal, setInviteModal] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const [membersRes, rolesRes, invitesRes] = await Promise.all([
        staffCall(token, { action: 'list_members', store_id: storeId }),
        staffCall(token, { action: 'list_roles', store_id: storeId }),
        staffCall(token, { action: 'list_invite_codes', store_id: storeId }),
      ]);
      setMembers(membersRes.members ?? []);
      setRoles(rolesRes.roles ?? []);
      setInvites(invitesRes.invite_codes ?? []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [storeId]);

  const doAction = async (action: string, extra: Record<string, unknown>) => {
    const key = `${action}-${extra.member_id || extra.role_id || extra.invite_code_id}`;
    setActionLoading(key);
    try {
      const token = await getToken();
      await staffCall(token, { action, store_id: storeId, ...extra });
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const membersByStatus = {
    pending: members.filter((m) => m.status === 'pending'),
    active: members.filter((m) => m.status === 'active'),
    suspended: members.filter((m) => m.status === 'suspended'),
    rejected: members.filter((m) => m.status === 'rejected'),
  };

  const SUB_TABS = [
    {
      id: 'members',
      label: 'Membros',
      count: members.filter((m) => m.status === 'pending').length,
    },
    { id: 'roles', label: 'Cargos', count: 0 },
    { id: 'invites', label: 'Convites', count: 0 },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Carregando equipe...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Sub-tabs + actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {SUB_TABS.map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setSubTab(id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background:
                  subTab === id
                    ? isDark
                      ? 'rgba(99,102,241,0.2)'
                      : 'rgba(99,102,241,0.12)'
                    : 'transparent',
                color: subTab === id ? '#818CF8' : 'var(--text-muted)',
              }}
            >
              {label}
              {count > 0 && (
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: '#EF4444' }}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {subTab === 'roles' && (
          <button
            onClick={() => setRoleModal({ open: true, role: null })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
            }}
          >
            <Plus size={13} />
            Novo cargo
          </button>
        )}
        {subTab === 'invites' && (
          <button
            onClick={() => setInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg,#10B981,#059669)',
              boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
            }}
          >
            <Plus size={13} />
            Novo convite
          </button>
        )}
      </div>

      {/* ── Membros ── */}
      {subTab === 'members' && (
        <div className="space-y-4">
          {(['pending', 'active', 'suspended', 'rejected'] as const).map((status) => {
            const group = membersByStatus[status];
            if (group.length === 0) return null;
            const cfg = STATUS_CONFIG[status];
            return (
              <Card key={status} className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <cfg.Icon size={14} style={{ color: cfg.color }} />
                  <p className="text-xs font-bold" style={{ color: cfg.color }}>
                    {cfg.label}s
                  </p>
                  <span
                    className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: cfg.bg,
                      color: cfg.color,
                      border: `1px solid ${cfg.border}`,
                    }}
                  >
                    {group.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.map((member) => {
                    const name =
                      member.display_name ||
                      member.user?.raw_user_meta_data?.name ||
                      member.user?.email?.split('@')[0] ||
                      'Usuário';
                    const email = member.user?.email || '—';
                    const isExpanded = expandedMember === member.id;
                    const actionKey = (a: string) => `${a}-${member.id}`;

                    return (
                      <div
                        key={member.id}
                        className="rounded-xl overflow-hidden transition-all"
                        style={{
                          border: `1px solid ${isExpanded ? cfg.color + '44' : 'var(--border)'}`,
                          background: isExpanded ? cfg.bg : 'var(--input-bg)',
                        }}
                      >
                        {/* Row principal */}
                        <div className="flex items-center gap-3 px-4 py-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{
                              background: member.role?.color
                                ? `${member.role.color}99`
                                : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                            }}
                          >
                            {name[0].toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-semibold truncate"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {name}
                            </p>
                            <p
                              className="text-[11px] truncate"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {email}
                            </p>
                          </div>

                          {member.role && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                              style={{
                                background: `${member.role.color}22`,
                                color: member.role.color,
                                border: `1px solid ${member.role.color}44`,
                              }}
                            >
                              {member.role.name}
                            </span>
                          )}

                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                            style={{
                              background: cfg.bg,
                              color: cfg.color,
                              border: `1px solid ${cfg.border}`,
                            }}
                          >
                            {cfg.label}
                          </span>

                          <button
                            onClick={() =>
                              setExpandedMember(isExpanded ? null : member.id)
                            }
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all hover:opacity-70"
                            style={{
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                            }}
                          >
                            {isExpanded ? (
                              <ChevronUp size={12} style={{ color: 'var(--text-muted)' }} />
                            ) : (
                              <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
                            )}
                          </button>
                        </div>

                        {/* Expandido */}
                        {isExpanded && (
                          <div
                            className="px-4 pb-4 space-y-3"
                            style={{ borderTop: '1px solid var(--border)' }}
                          >
                            <div className="pt-3 grid grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Solicitação: </span>
                                <span style={{ color: 'var(--text-primary)' }}>
                                  {new Date(member.created_at).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              {member.approved_at && (
                                <div>
                                  <span style={{ color: 'var(--text-muted)' }}>Aprovado em: </span>
                                  <span style={{ color: 'var(--text-primary)' }}>
                                    {new Date(member.approved_at).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                              )}
                              {member.rejected_reason && (
                                <div className="col-span-2">
                                  <span style={{ color: 'var(--text-muted)' }}>Motivo: </span>
                                  <span style={{ color: '#FCA5A5' }}>
                                    {member.rejected_reason}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Atribuir cargo (só ativos) */}
                            {status === 'active' && (
                              <div className="space-y-1.5">
                                <p
                                  className="text-[11px] font-bold uppercase tracking-wider"
                                  style={{ color: 'var(--text-muted)' }}
                                >
                                  Cargo
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                  <button
                                    onClick={() =>
                                      doAction('assign_role', {
                                        member_id: member.id,
                                        role_id: null,
                                      })
                                    }
                                    disabled={!!actionLoading}
                                    className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                                    style={{
                                      background: !member.role
                                        ? 'rgba(99,102,241,0.15)'
                                        : 'var(--input-bg)',
                                      border: `1px solid ${
                                        !member.role ? '#6366F1' : 'var(--border)'
                                      }`,
                                      color: !member.role ? '#818CF8' : 'var(--text-muted)',
                                    }}
                                  >
                                    Sem cargo
                                  </button>
                                  {roles.map((r) => (
                                    <button
                                      key={r.id}
                                      onClick={() =>
                                        doAction('assign_role', {
                                          member_id: member.id,
                                          role_id: r.id,
                                        })
                                      }
                                      disabled={!!actionLoading}
                                      className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                                      style={{
                                        background:
                                          member.role?.id === r.id
                                            ? `${r.color}22`
                                            : 'var(--input-bg)',
                                        border: `1px solid ${
                                          member.role?.id === r.id ? r.color : 'var(--border)'
                                        }`,
                                        color:
                                          member.role?.id === r.id ? r.color : 'var(--text-muted)',
                                      }}
                                    >
                                      <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ background: r.color }}
                                      />
                                      {r.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Ações */}
                            <div className="flex gap-2 flex-wrap">
                              {status === 'pending' && (
                                <>
                                  <button
                                    onClick={() =>
                                      doAction('approve_member', { member_id: member.id })
                                    }
                                    disabled={!!actionLoading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50"
                                    style={{
                                      background: 'linear-gradient(135deg,#10B981,#059669)',
                                    }}
                                  >
                                    {actionLoading === actionKey('approve_member') ? (
                                      <Loader2 size={11} className="animate-spin" />
                                    ) : (
                                      <CheckCircle2 size={11} />
                                    )}
                                    Aprovar
                                  </button>
                                  <button
                                    onClick={() => {
                                      const reason = prompt('Motivo da rejeição (opcional):');
                                      doAction('reject_member', {
                                        member_id: member.id,
                                        reason: reason ?? undefined,
                                      });
                                    }}
                                    disabled={!!actionLoading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                                    style={{
                                      background: 'rgba(239,68,68,0.1)',
                                      border: '1px solid rgba(239,68,68,0.25)',
                                      color: '#EF4444',
                                    }}
                                  >
                                    <UserX size={11} />
                                    Rejeitar
                                  </button>
                                </>
                              )}
                              {status === 'active' && (
                                <button
                                  onClick={() => {
                                    const reason = prompt('Motivo da suspensão (opcional):');
                                    doAction('suspend_member', {
                                      member_id: member.id,
                                      reason: reason ?? undefined,
                                    });
                                  }}
                                  disabled={!!actionLoading}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                                  style={{
                                    background: 'rgba(245,158,11,0.1)',
                                    border: '1px solid rgba(245,158,11,0.25)',
                                    color: '#F59E0B',
                                  }}
                                >
                                  {actionLoading === actionKey('suspend_member') ? (
                                    <Loader2 size={11} className="animate-spin" />
                                  ) : (
                                    <ShieldAlert size={11} />
                                  )}
                                  Suspender
                                </button>
                              )}
                              {(status === 'suspended' || status === 'rejected') && (
                                <button
                                  onClick={() =>
                                    doAction('approve_member', { member_id: member.id })
                                  }
                                  disabled={!!actionLoading}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50"
                                  style={{
                                    background: 'linear-gradient(135deg,#10B981,#059669)',
                                  }}
                                >
                                  {actionLoading === actionKey('approve_member') ? (
                                    <Loader2 size={11} className="animate-spin" />
                                  ) : (
                                    <UserCheck size={11} />
                                  )}
                                  Reativar
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}

          {members.length === 0 && (
            <Card className="p-10">
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.15)',
                  }}
                >
                  <Users size={24} style={{ color: '#6366F1', opacity: 0.6 }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Nenhum membro ainda
                </p>
                <p className="text-xs max-w-xs" style={{ color: 'var(--text-muted)' }}>
                  Crie um código de convite e compartilhe com sua equipe.
                </p>
                <button
                  onClick={() => setSubTab('invites')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white mt-1"
                  style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}
                >
                  <Key size={13} />
                  Criar convite
                </button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Cargos ── */}
      {subTab === 'roles' && (
        <div className="space-y-3">
          {roles.length === 0 && (
            <Card className="p-10">
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(139,92,246,0.08)',
                    border: '1px solid rgba(139,92,246,0.15)',
                  }}
                >
                  <Crown size={24} style={{ color: '#8B5CF6', opacity: 0.6 }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Nenhum cargo criado
                </p>
              </div>
            </Card>
          )}
          {roles.map((role) => (
            <Card key={role.id} className="p-5">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: `${role.color}22`,
                    border: `1px solid ${role.color}44`,
                  }}
                >
                  <Crown size={16} style={{ color: role.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {role.name}
                    </p>
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: role.color }}
                    />
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full ml-auto shrink-0"
                      style={{ background: `${role.color}18`, color: role.color }}
                    >
                      {members.filter((m) => m.role?.id === role.id && m.status === 'active')
                        .length}{' '}
                      membros
                    </span>
                  </div>
                  {role.description && (
                    <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                      {role.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {PERM_GROUPS.flatMap((g) => g.perms)
                      .filter((p) => (role as any)[p.key])
                      .map((p) => (
                        <span
                          key={p.key}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: isDark
                              ? 'rgba(99,102,241,0.1)'
                              : 'rgba(99,102,241,0.07)',
                            color: '#818CF8',
                            border: '1px solid rgba(99,102,241,0.2)',
                          }}
                        >
                          {p.label}
                        </span>
                      ))}
                    {PERM_GROUPS.flatMap((g) => g.perms).filter((p) => (role as any)[p.key])
                      .length === 0 && (
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        Sem permissões
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setRoleModal({ open: true, role })}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}
                  >
                    <Sparkles size={13} style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Deletar cargo "${role.name}"?`))
                        doAction('delete_role', { role_id: role.id });
                    }}
                    disabled={!!actionLoading}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70 disabled:opacity-40"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.2)',
                    }}
                  >
                    {actionLoading === `delete_role-${role.id}` ? (
                      <Loader2 size={13} className="animate-spin" style={{ color: '#EF4444' }} />
                    ) : (
                      <Trash2 size={13} style={{ color: '#EF4444' }} />
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Convites ── */}
      {subTab === 'invites' && (
        <div className="space-y-3">
          {invites.length === 0 && (
            <Card className="p-10">
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.15)',
                  }}
                >
                  <Key size={24} style={{ color: '#10B981', opacity: 0.6 }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Nenhum código criado
                </p>
              </div>
            </Card>
          )}
          {invites.map((inv) => {
            const expired = inv.expires_at && new Date(inv.expires_at) < new Date();
            const exhausted = inv.max_uses !== null && inv.uses_count >= inv.max_uses;
            const inactive = !inv.active || expired || exhausted;
            return (
              <Card key={inv.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: inactive
                        ? 'rgba(107,114,128,0.1)'
                        : 'rgba(16,185,129,0.1)',
                      border: `1px solid ${
                        inactive ? 'rgba(107,114,128,0.2)' : 'rgba(16,185,129,0.25)'
                      }`,
                    }}
                  >
                    <Key size={15} style={{ color: inactive ? '#6B7280' : '#10B981' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-sm font-bold tracking-wider"
                        style={{
                          color: inactive ? 'var(--text-muted)' : 'var(--text-primary)',
                        }}
                      >
                        {inv.code}
                      </span>
                      {inactive && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(107,114,128,0.1)',
                            color: '#6B7280',
                          }}
                        >
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {inv.label && (
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {inv.label}
                        </span>
                      )}
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {inv.uses_count}
                        {inv.max_uses !== null ? `/${inv.max_uses}` : ''} uso
                        {inv.uses_count !== 1 ? 's' : ''}
                      </span>
                      {inv.expires_at && (
                        <span
                          className="text-[11px]"
                          style={{ color: expired ? '#EF4444' : 'var(--text-muted)' }}
                        >
                          Expira {new Date(inv.expires_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {inv.active && !expired && !exhausted && (
                      <button
                        onClick={() => copyInviteCode(inv.code)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                        style={{
                          background: 'rgba(16,185,129,0.1)',
                          border: '1px solid rgba(16,185,129,0.2)',
                        }}
                      >
                        {copiedCode === inv.code ? (
                          <Check size={13} style={{ color: '#10B981' }} />
                        ) : (
                          <Copy size={13} style={{ color: '#10B981' }} />
                        )}
                      </button>
                    )}
                    {inv.active && (
                      <button
                        onClick={() => {
                          if (confirm('Desativar este código?'))
                            doAction('deactivate_invite_code', { invite_code_id: inv.id });
                        }}
                        disabled={!!actionLoading}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70 disabled:opacity-40"
                        style={{
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.2)',
                        }}
                      >
                        {actionLoading === `deactivate_invite_code-${inv.id}` ? (
                          <Loader2 size={13} className="animate-spin" style={{ color: '#EF4444' }} />
                        ) : (
                          <X size={13} style={{ color: '#EF4444' }} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modais */}
      {roleModal.open && (
        <RoleEditorModal
          role={roleModal.role}
          storeId={storeId}
          isDark={isDark}
          onClose={() => setRoleModal({ open: false, role: null })}
          onSaved={load}
        />
      )}
      {inviteModal && (
        <InviteCodeModal
          storeId={storeId}
          isDark={isDark}
          onClose={() => setInviteModal(false)}
          onCreated={load}
        />
      )}
    </div>
  );
}
