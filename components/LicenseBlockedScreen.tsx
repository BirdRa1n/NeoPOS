'use client';
import { useAuth } from '@/contexts/AuthContext';
import { LicenseStatus, useLicense } from '@/hooks/useLicense';
import { ALPHA, COLORS } from '@/lib/constants';
import { supabase } from '@/supabase/client';
import {
  AlertTriangle, CheckCircle2, ExternalLink, Instagram,
  Key, Loader2, LogOut, Mail, MessageCircle,
  Phone, ShieldAlert, XCircle,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = 'whatsapp' | 'telegram' | 'instagram' | 'email' | 'phone' | 'other';

interface ContactMethod {
  id: string;
  platform: Platform;
  label: string;
  value: string;
  url: string | null;
  sort_order: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  inactive: {
    icon:        Key,
    color:       COLORS.accent,
    bg:          ALPHA.accentBgSubtleD,
    border:      ALPHA.accentBorder,
    title:       'Sem licença ativa',
    description: 'Sua loja não possui um plano ativo. Resgate um código de acesso para continuar usando a plataforma.',
  },
  grace: {
    icon:        AlertTriangle,
    color:       COLORS.warning,
    bg:          ALPHA.warningBgSubtle,
    border:      ALPHA.warningBorder,
    title:       'Plano expirado',
    description: 'Seu plano expirou. Você está no período de graça — resgate um novo código para não perder o acesso.',
  },
  suspended: {
    icon:        ShieldAlert,
    color:       COLORS.danger,
    bg:          ALPHA.dangerBgSubtle,
    border:      ALPHA.dangerBorder,
    title:       'Loja suspensa',
    description: 'Esta loja foi suspensa pelo sistema. Entre em contato para mais informações.',
  },
} as const;

const PLATFORM_CFG: Record<Platform, { label: string; icon: React.FC<any>; color: string; bg: string }> = {
  whatsapp:  { label: 'WhatsApp',  icon: MessageCircle, color: '#25D366', bg: 'rgba(37,211,102,0.12)'   },
  telegram:  { label: 'Telegram',  icon: MessageCircle, color: '#2AABEE', bg: 'rgba(42,171,238,0.12)'   },
  instagram: { label: 'Instagram', icon: Instagram,     color: '#E1306C', bg: 'rgba(225,48,108,0.12)'   },
  email:     { label: 'E-mail',    icon: Mail,          color: COLORS.accent, bg: ALPHA.accentBgSubtleD  },
  phone:     { label: 'Telefone',  icon: Phone,         color: COLORS.success, bg: ALPHA.successBgSubtle },
  other:     { label: 'Contato',   icon: ExternalLink,  color: COLORS.neutral, bg: ALPHA.neutralBg       },
};

// ─── Hook de contatos ─────────────────────────────────────────────────────────

function useContactMethods() {
  const [contacts, setContacts] = useState<ContactMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .schema('billing' as any)
      .from('contact_methods')
      .select('id, platform, label, value, url, sort_order')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        setContacts((data as ContactMethod[]) ?? []);
        setLoading(false);
      });
  }, []);

  return { contacts, loading };
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props {
  license: LicenseStatus;
}

export function LicenseBlockedScreen({ license }: Props) {
  const router = useRouter();
  const { signOut } = useAuth();
  const { redeemKey, redeeming } = useLicense();
  const { contacts, loading: contactsLoading } = useContactMethods();

  const [code, setCode]       = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const cfg  = STATUS_CFG[license.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.inactive;
  const Icon = cfg.icon;

  const graceDaysLeft = license.grace_until
    ? Math.max(0, Math.ceil((new Date(license.grace_until).getTime() - Date.now()) / 86400000))
    : 0;

  const handleRedeem = async () => {
    if (!code.trim()) { setError('Digite o código de acesso.'); return; }
    setError(''); setSuccess('');
    const result = await redeemKey(code);
    if (result.success) {
      setSuccess(result.message);
      setCode('');
      setTimeout(() => window.location.reload(), 2000);
    } else {
      setError(result.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      {/* Orb decorativo */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '60vw', height: '60vw', maxWidth: 600, maxHeight: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${ALPHA.accentBgSubtleD} 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }} />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-4">

        {/* Card principal */}
        <div className="rounded-2xl p-8" style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--surface-box)',
        }}>
          {/* Ícone */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <Icon size={36} style={{ color: cfg.color }} />
            </div>
          </div>

          {/* Título e descrição */}
          <h1 className="text-xl font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>
            {cfg.title}
          </h1>
          <p className="text-sm text-center leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
            {cfg.description}
          </p>

          {/* Aviso de graça */}
          {license.status === 'grace' && graceDaysLeft > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
              style={{ background: ALPHA.warningBgSubtle, border: `1px solid ${ALPHA.warningBorder}` }}>
              <AlertTriangle size={15} style={{ color: COLORS.warning, flexShrink: 0 }} />
              <p className="text-xs font-semibold" style={{ color: COLORS.warningLight }}>
                <strong>{graceDaysLeft} dia{graceDaysLeft !== 1 ? 's' : ''}</strong> de graça restante{graceDaysLeft !== 1 ? 's' : ''}.
              </p>
            </div>
          )}

          {/* Campo de resgate */}
          {license.status !== 'suspended' && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-label)' }}>
                Resgatar código de acesso
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key size={13} style={{
                    position: 'absolute', left: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', pointerEvents: 'none',
                  }} />
                  <input
                    value={code}
                    onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); setSuccess(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleRedeem()}
                    placeholder="NEO-XXXX-XXXX-XXXX"
                    className="w-full rounded-xl text-sm outline-none transition-all"
                    style={{
                      paddingLeft: '2.25rem', paddingRight: '0.875rem',
                      paddingTop: '0.625rem', paddingBottom: '0.625rem',
                      background: 'var(--input-bg)',
                      border: `1px solid ${error ? COLORS.danger : 'var(--input-border)'}`,
                      color: 'var(--text-primary)',
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = COLORS.accent)}
                    onBlur={e => (e.currentTarget.style.borderColor = error ? COLORS.danger : 'var(--input-border)')}
                  />
                </div>
                <button
                  onClick={handleRedeem}
                  disabled={redeeming || !code.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 shrink-0"
                  style={{ background: COLORS.accentGradient, boxShadow: COLORS.accentShadow }}
                >
                  {redeeming ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                  Ativar
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                  style={{ background: ALPHA.dangerBgSubtle, border: `1px solid ${ALPHA.dangerBorder}`, color: COLORS.dangerLight }}>
                  <XCircle size={13} /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                  style={{ background: ALPHA.successBgSubtle, border: `1px solid ${ALPHA.successBorder}`, color: COLORS.successLight }}>
                  <CheckCircle2 size={13} /> {success} Recarregando...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Canais de contato */}
        <div className="rounded-2xl p-5" style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--surface-box)',
        }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-label)' }}>
            Obter um código de acesso
          </p>
          <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
            Entre em contato para adquirir um plano e receber seu código.
          </p>

          {contactsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={18} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
            </div>
          ) : contacts.length === 0 ? (
            <p className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>
              Nenhum canal disponível no momento.
            </p>
          ) : (
            <div className="space-y-2">
              {contacts.map(contact => {
                const pcfg = PLATFORM_CFG[contact.platform] ?? PLATFORM_CFG.other;
                const PIcon = pcfg.icon;
                const href = contact.url ?? (
                  contact.platform === 'email' ? `mailto:${contact.value}` :
                  contact.platform === 'phone' ? `tel:${contact.value}` :
                  undefined
                );

                const inner = (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                    style={{ background: pcfg.bg, border: `1px solid ${pcfg.color}30` }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${pcfg.color}20`, border: `1px solid ${pcfg.color}40` }}>
                      <PIcon size={16} style={{ color: pcfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{contact.label}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{contact.value}</p>
                    </div>
                    {href && (
                      <ExternalLink size={14} style={{ color: pcfg.color, flexShrink: 0 }} />
                    )}
                  </div>
                );

                return href ? (
                  <a key={contact.id} href={href} target="_blank" rel="noreferrer"
                    style={{ textDecoration: 'none', display: 'block' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}>
                    {inner}
                  </a>
                ) : (
                  <div key={contact.id}>{inner}</div>
                );
              })}
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