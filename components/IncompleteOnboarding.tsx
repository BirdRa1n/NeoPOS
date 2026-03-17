'use client';
import { useAuth } from '@/contexts/AuthContext';
import { ALPHA, COLORS } from '@/lib/constants';
import { supabase } from '@/supabase/client';
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    ChevronRight,
    Circle,
    LogOut,
    RefreshCw,
    UserCheck,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type AccountIntent = 'owner' | 'staff' | 'unknown';

interface OnboardingState {
  emailVerified: boolean;
  accountIntent: AccountIntent;
  hasStore: boolean;
  hasStaffRequest: boolean;
  staffStatus: 'pending' | 'active' | 'suspended' | 'rejected' | null;
}

interface IncompleteOnboardingProps {
  onResumeOwner: () => void;
  onResumeStaff: () => void;
}

export function IncompleteOnboarding({ onResumeOwner, onResumeStaff }: IncompleteOnboardingProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    diagnose();
  }, [user]);

  const diagnose = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const accountType = user.user_metadata?.account_type as AccountIntent | undefined;

      const { data: store } = await supabase
        .schema('core')
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: staffMember } = await supabase
        .schema('core')
        .from('staff_members')
        .select('id, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setState({
        emailVerified: !!user.email_confirmed_at,
        accountIntent: accountType ?? 'unknown',
        hasStore: !!store,
        hasStaffRequest: !!staffMember,
        staffStatus: (staffMember?.status as any) ?? null,
      });
    } catch (err) {
      console.error('Diagnose error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: COLORS.accent, borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Verificando sua conta...
          </p>
        </div>
      </div>
    );
  }

  if (!state) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>

      {/* Orbs decorativos */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '60vw', height: '60vw', maxWidth: 600, maxHeight: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${ALPHA.accentBgSubtleD} 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-10%',
          width: '50vw', height: '50vw', maxWidth: 500, maxHeight: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-5"
            style={{
              background: ALPHA.warningBgSubtle,
              border: `1px solid ${ALPHA.warningBorder}`,
            }}
          >
            <AlertCircle size={28} style={{ color: COLORS.warning }} />
          </div>

          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Cadastro incompleto
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Olá,{' '}
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              {user?.email?.split('@')[0]}
            </span>
            ! Identificamos que seu cadastro não foi finalizado.
          </p>
        </div>

        {/* Checklist */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--surface-box)',
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-label)' }}>
            Status do cadastro
          </p>
          <div className="space-y-3">
            <StatusItem
              done={!!user?.email_confirmed_at}
              label="E-mail verificado"
              sublabel={!user?.email_confirmed_at ? 'Verifique seu e-mail antes de continuar' : undefined}
            />

            {(state.accountIntent === 'owner' || state.accountIntent === 'unknown') && (
              <StatusItem
                done={state.hasStore}
                label="Restaurante criado"
                sublabel={!state.hasStore ? 'Você ainda não criou seu restaurante' : undefined}
              />
            )}

            {state.accountIntent === 'staff' && (
              <StatusItem
                done={state.hasStaffRequest}
                label="Solicitação de equipe enviada"
                sublabel={
                  !state.hasStaffRequest
                    ? 'Você ainda não solicitou entrada em nenhuma equipe'
                    : state.staffStatus === 'pending'
                    ? 'Aguardando aprovação do administrador'
                    : undefined
                }
                status={state.staffStatus ?? undefined}
              />
            )}

            {state.accountIntent === 'unknown' && (
              <StatusItem
                done={false}
                label="Tipo de conta não definido"
                sublabel="Escolha abaixo se você é dono ou funcionário"
              />
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="space-y-3 mb-6">

          {(state.accountIntent === 'owner' || state.accountIntent === 'unknown') && !state.hasStore && (
            <ActionCard
              icon={Building2}
              color={COLORS.accent}
              title="Criar meu restaurante"
              description="Configure sua loja para começar a receber pedidos"
              cta="Continuar"
              onClick={onResumeOwner}
            />
          )}

          {(state.accountIntent === 'staff' || state.accountIntent === 'unknown') && !state.hasStaffRequest && (
            <ActionCard
              icon={UserCheck}
              color={COLORS.success}
              title="Entrar em uma equipe"
              description="Use o código de convite do administrador da loja"
              cta="Solicitar"
              onClick={onResumeStaff}
            />
          )}

          {state.staffStatus === 'pending' && (
            <div
              className="rounded-2xl p-4"
              style={{
                background: ALPHA.warningBgSubtle,
                border: `1px solid ${ALPHA.warningBorder}`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: ALPHA.warningBgD }}
                >
                  <RefreshCw size={15} style={{ color: COLORS.warning }} />
                </div>
                <div>
                  <p className="text-sm font-bold mb-0.5" style={{ color: COLORS.warningLight }}>
                    Solicitação em análise
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Sua solicitação foi enviada. O administrador precisa aprová-la antes de você ter acesso.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sair */}
        <div className="text-center">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-muted)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
            }}
          >
            <LogOut size={14} />
            Sair e usar outra conta
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── StatusItem ───────────────────────────────────────────────────────────────

function StatusItem({
  done,
  label,
  sublabel,
  status,
}: {
  done: boolean;
  label: string;
  sublabel?: string;
  status?: 'pending' | 'active' | 'suspended' | 'rejected';
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">
        {done ? (
          <CheckCircle2 size={16} style={{ color: COLORS.success }} />
        ) : status === 'pending' ? (
          <RefreshCw size={16} style={{ color: COLORS.warning }} />
        ) : (
          <Circle size={16} style={{ color: 'var(--text-label)' }} />
        )}
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {label}
        </p>
        {sublabel && (
          <p
            className="text-[11px] mt-0.5"
            style={{
              color: done
                ? COLORS.success
                : status === 'pending'
                ? COLORS.warning
                : 'var(--text-muted)',
            }}
          >
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── ActionCard ───────────────────────────────────────────────────────────────

function ActionCard({
  icon: Icon,
  color,
  title,
  description,
  cta,
  onClick,
}: {
  icon: React.FC<any>;
  color: string;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl p-5 text-left transition-all"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--surface-box)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = `${color}0D`;
        (e.currentTarget as HTMLElement).style.borderColor = `${color}40`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `${color}18`,
            border: `1px solid ${color}30`,
          }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>
            {title}
          </p>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        </div>
        <div
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0"
          style={{ background: `${color}18`, color }}
        >
          {cta} <ChevronRight size={12} />
        </div>
      </div>
    </button>
  );
}