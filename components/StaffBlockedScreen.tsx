'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useStaff } from '@/contexts/StaffContext';
import { ALPHA, COLORS } from '@/lib/constants';
import { Clock, LogOut, RefreshCw, ShieldAlert, UserCog, UserX } from 'lucide-react';
import { useRouter } from 'next/router';

// ─── Config por estado ────────────────────────────────────────────────────────

const CONFIG = {
  pending: {
    icon: Clock,
    color: COLORS.warning,
    bg: ALPHA.warningBgSubtle,
    border: ALPHA.warningBorder,
    title: 'Aguardando aprovação',
    description: 'Sua solicitação foi enviada ao administrador da loja. Você será notificado assim que for aprovado.',
    steps: [
      'O administrador recebeu sua solicitação',
      'Ele irá revisar e aprovar seu acesso',
      'Você poderá fazer login após a aprovação',
    ],
  },
  suspended: {
    icon: ShieldAlert,
    color: COLORS.danger,
    bg: ALPHA.dangerBgSubtle,
    border: ALPHA.dangerBorder,
    title: 'Acesso suspenso',
    description: 'Seu acesso a esta loja foi suspenso pelo administrador.',
    steps: [],
  },
  rejected: {
    icon: UserX,
    color: COLORS.neutral,
    bg: ALPHA.neutralBg,
    border: ALPHA.neutralBorder,
    title: 'Solicitação rejeitada',
    description: 'Sua solicitação de acesso foi rejeitada. Entre em contato com o administrador da loja.',
    steps: [],
  },
  // Membro ativo mas sem cargo atribuído
  'active-no-role': {
    icon: UserCog,
    color: COLORS.accent,
    bg: ALPHA.accentBgSubtleD,
    border: ALPHA.accentBorder,
    title: 'Aguardando cargo',
    description: 'Você foi aprovado, mas ainda não recebeu um cargo. O administrador precisa atribuir um cargo para você ter acesso.',
    steps: [
      'O administrador foi notificado',
      'Ele irá atribuir um cargo com as permissões corretas',
      'Recarregue a página após a atribuição',
    ],
  },
} as const;

type BlockedState = keyof typeof CONFIG;

// ─── Componente ───────────────────────────────────────────────────────────────

export function StaffBlockedScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { staffInfo } = useStaff();

  // Determina o estado correto
  const resolveState = (): BlockedState => {
    if (!staffInfo) return 'pending';
    if (staffInfo.status === 'active' && !staffInfo.role) return 'active-no-role';
    return (staffInfo.status as BlockedState) ?? 'pending';
  };

  const state = resolveState();
  const cfg = CONFIG[state];
  const Icon = cfg.icon;

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl p-8 flex flex-col items-center text-center gap-6"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--surface-box)',
          }}
        >
          {/* Ícone */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
          >
            <Icon size={36} style={{ color: cfg.color }} />
          </div>

          {/* Título + descrição */}
          <div>
            <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {cfg.title}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {cfg.description}
            </p>
          </div>

          {/* Motivo de suspensão — se disponível */}
          {state === 'suspended' && (
            <div
              className="w-full rounded-xl px-4 py-3 text-left text-xs"
              style={{
                background: ALPHA.dangerBgSubtle,
                border: `1px solid ${ALPHA.dangerBorder}`,
                color: COLORS.dangerLight,
              }}
            >
              Entre em contato com o administrador para entender o motivo e reativar seu acesso.
            </div>
          )}

          {/* Motivo de rejeição */}
          {state === 'rejected' && (
            <div
              className="w-full rounded-xl px-4 py-3 text-left text-xs"
              style={{
                background: ALPHA.neutralBg,
                border: `1px solid ${ALPHA.neutralBorder}`,
                color: 'var(--text-muted)',
              }}
            >
              Você pode tentar solicitar acesso novamente ou entrar em contato com o administrador.
            </div>
          )}

          {/* Info de cargo para active-no-role */}
          {state === 'active-no-role' && staffInfo?.display_name && (
            <div
              className="w-full rounded-xl px-4 py-3 text-left"
              style={{
                background: ALPHA.accentBgSubtleD,
                border: `1px solid ${ALPHA.accentBorder}`,
              }}
            >
              <p className="text-xs font-bold mb-1" style={{ color: COLORS.accentLight }}>
                Conta reconhecida
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Logado como <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{staffInfo.display_name}</span>.
                Seu cadastro está ativo, mas sem cargo definido.
              </p>
            </div>
          )}

          {/* Steps */}
          {cfg.steps.length > 0 && (
            <div
              className="w-full rounded-xl p-4 text-left space-y-3"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
                O que acontece agora?
              </p>
              {cfg.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold"
                    style={{ background: `${cfg.color}25`, color: cfg.color }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: `${cfg.color}CC` }}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-col gap-2 w-full">
            {/* Recarregar — útil para active-no-role e pending */}
            {(state === 'active-no-role' || state === 'pending') && (
              <button
                onClick={handleRefresh}
                className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{
                  background: state === 'active-no-role' ? COLORS.accentGradient : 'linear-gradient(135deg,#F59E0B,#D97706)',
                  boxShadow: state === 'active-no-role' ? COLORS.accentShadow : COLORS.warningShadow,
                }}
              >
                <RefreshCw size={14} />
                Verificar novamente
              </button>
            )}

            {/* Sair */}
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <LogOut size={15} />
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}