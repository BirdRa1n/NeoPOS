'use client';
import { useRouter } from 'next/router';
import { Clock, ShieldAlert, UserX, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStaff } from '@/contexts/StaffContext';

const CONFIG = {
  pending: {
    icon: Clock,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.2)',
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
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.2)',
    title: 'Acesso suspenso',
    description: 'Seu acesso a esta loja foi suspenso. Entre em contato com o administrador para mais informações.',
    steps: [],
  },
  rejected: {
    icon: UserX,
    color: '#6B7280',
    bg: 'rgba(107,114,128,0.1)',
    border: 'rgba(107,114,128,0.2)',
    title: 'Solicitação rejeitada',
    description: 'Sua solicitação de acesso foi rejeitada. Entre em contato com o administrador da loja.',
    steps: [],
  },
};

export function StaffBlockedScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { staffInfo } = useStaff();

  const status = (staffInfo?.status ?? 'pending') as 'pending' | 'suspended' | 'rejected';
  const cfg = CONFIG[status] ?? CONFIG.pending;
  const Icon = cfg.icon;

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--bg, #080B12)' }}
    >
      <div className="w-full max-w-md">
        {/* Card */}
        <div
          className="rounded-2xl p-8 flex flex-col items-center text-center gap-6"
          style={{
            background: 'var(--surface, rgba(255,255,255,0.025))',
            border: '1px solid var(--border, rgba(255,255,255,0.07))',
          }}
        >
          {/* Ícone */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
          >
            <Icon size={36} style={{ color: cfg.color }} />
          </div>

          {/* Título */}
          <div>
            <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary, #fff)' }}>
              {cfg.title}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted, rgba(255,255,255,0.4))' }}>
              {cfg.description}
            </p>
          </div>

          {/* Motivo (se tiver) */}
          {staffInfo?.role === null && status !== 'pending' && (
            <div
              className="w-full rounded-xl px-4 py-3 text-left text-xs"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
            >
              Entre em contato com o administrador para reativar o acesso.
            </div>
          )}

          {/* Steps para pendente */}
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

          {/* Sair */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{
              background: 'var(--input-bg, rgba(255,255,255,0.04))',
              border: '1px solid var(--border, rgba(255,255,255,0.07))',
              color: 'var(--text-muted, rgba(255,255,255,0.4))',
            }}
          >
            <LogOut size={15} />
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
