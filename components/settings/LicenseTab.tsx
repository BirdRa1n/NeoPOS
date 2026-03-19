'use client';
import { Card } from '@/components/ui/Card';
import { useStaff } from '@/contexts/StaffContext';
import { useLicense } from '@/hooks/useLicense';
import { ALPHA, COLORS } from '@/lib/constants';
import { supabase } from '@/supabase/client';
import {
  AlertTriangle, CheckCircle2, Clock, ExternalLink,
  Instagram, Key, Loader2, Mail, MessageCircle,
  Phone, RefreshCw, ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { SectionHeader } from './SectionHeader';

type Platform = 'whatsapp' | 'telegram' | 'instagram' | 'email' | 'phone' | 'other';
interface ContactMethod {
  id: string; platform: Platform; label: string; value: string; url: string | null; sort_order: number;
}

const PLATFORM_CFG: Record<Platform, { label: string; icon: React.FC<any>; color: string; bg: string }> = {
  whatsapp:  { label: 'WhatsApp',  icon: MessageCircle, color: '#25D366', bg: 'rgba(37,211,102,0.12)'   },
  telegram:  { label: 'Telegram',  icon: MessageCircle, color: '#2AABEE', bg: 'rgba(42,171,238,0.12)'   },
  instagram: { label: 'Instagram', icon: Instagram,     color: '#E1306C', bg: 'rgba(225,48,108,0.12)'   },
  email:     { label: 'E-mail',    icon: Mail,          color: COLORS.accent, bg: ALPHA.accentBgSubtleD  },
  phone:     { label: 'Telefone',  icon: Phone,         color: COLORS.success, bg: ALPHA.successBgSubtle },
  other:     { label: 'Contato',   icon: ExternalLink,  color: COLORS.neutral, bg: ALPHA.neutralBg       },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; color: string; bg: string; border: string }> = {
    active:    { label: 'Ativo',    color: COLORS.success, bg: ALPHA.successBgSubtle, border: ALPHA.successBorder },
    grace:     { label: 'Graça',    color: COLORS.warning, bg: ALPHA.warningBgSubtle, border: ALPHA.warningBorder },
    inactive:  { label: 'Inativo',  color: COLORS.neutral, bg: ALPHA.neutralBg,       border: ALPHA.neutralBorder },
    suspended: { label: 'Suspenso', color: COLORS.danger,  bg: ALPHA.dangerBgSubtle,  border: ALPHA.dangerBorder  },
  };
  const s = cfg[status] ?? cfg.inactive;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

function PlanBadge({ isTrial }: { isTrial: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{
        background: isTrial ? ALPHA.warningBgSubtle    : ALPHA.accentBgSubtleD,
        border:     isTrial ? `1px solid ${ALPHA.warningBorder}` : `1px solid ${ALPHA.accentBorder}`,
        color:      isTrial ? COLORS.warningLight      : COLORS.accentLight,
      }}>
      {isTrial ? '🧪 Período de teste' : '✦ Plano pago'}
    </span>
  );
}

function useContactMethods() {
  const [contacts, setContacts] = useState<ContactMethod[]>([]);
  const [loading, setLoading]   = useState(true);
  useEffect(() => {
    supabase.schema('billing' as any).from('contact_methods')
      .select('id, platform, label, value, url, sort_order')
      .eq('is_active', true).order('sort_order')
      .then(({ data }) => { setContacts((data as ContactMethod[]) ?? []); setLoading(false); });
  }, []);
  return { contacts, loading };
}

export function LicenseTab() {
  const { license, redemptions, loading, redeeming, redeemKey, refetch } = useLicense();
  const { userRole } = useStaff();
  const { contacts, loading: contactsLoading } = useContactMethods();
  const isOwner = userRole === 'owner';

  const [code, setCode]         = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  const handleRedeem = async () => {
    if (!code.trim()) { setFeedback({ type: 'error', msg: 'Digite o código.' }); return; }
    setFeedback(null);
    const result = await redeemKey(code);
    setFeedback({ type: result.success ? 'success' : 'error', msg: result.message });
    if (result.success) setCode('');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 size={24} className="animate-spin" style={{ color: COLORS.accent }} />
    </div>
  );

  const daysLeft  = license?.days_remaining ?? 0;
  const isActive  = license?.status === 'active';
  const isGrace   = license?.status === 'grace';
  const isTrial   = license?.is_trial ?? true;
  const warnType  = license?.warning_type;

  // Mensagem de aviso contextual
  const warningMsg = (() => {
    if (!warnType) return null;
    if (warnType === 'trial_expiring') return { color: COLORS.warning, border: ALPHA.warningBorder, bg: ALPHA.warningBgSubtle, text: `Seu período de teste expira em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''}. Adquira um plano para continuar.` };
    if (warnType === 'trial_grace')    return { color: COLORS.danger,  border: ALPHA.dangerBorder,  bg: ALPHA.dangerBgSubtle,  text: `Período de teste encerrado. Você tem ${daysLeft} dia${daysLeft !== 1 ? 's' : ''} de graça para ativar um plano.` };
    if (warnType === 'paid_expiring')  return { color: COLORS.warning, border: ALPHA.warningBorder, bg: ALPHA.warningBgSubtle, text: `Seu plano expira em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''}. Renove para não perder o acesso.` };
    if (warnType === 'paid_grace')     return { color: COLORS.danger,  border: ALPHA.dangerBorder,  bg: ALPHA.dangerBgSubtle,  text: `Plano expirado. Período de graça: ${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}.` };
    return null;
  })();

  return (
    <div className="space-y-5">

      {/* ── Status atual ── */}
      <Card className="p-6">
        <SectionHeader
          icon={ShieldCheck}
          label="Status da Licença"
          subtitle="Situação atual do plano"
          color={isActive ? COLORS.success : COLORS.warning}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl p-4" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-label)' }}>Status</p>
            <StatusBadge status={license?.status ?? 'inactive'} />
          </div>

          <div className="rounded-xl p-4" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-label)' }}>Tipo</p>
            <PlanBadge isTrial={isTrial} />
          </div>

          <div className="rounded-xl p-4" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-label)' }}>Dias restantes</p>
            <p className="text-2xl font-black" style={{ color: daysLeft <= 7 ? COLORS.warning : COLORS.success }}>
              {daysLeft === 9999 ? '∞' : daysLeft}
            </p>
          </div>

          <div className="rounded-xl p-4" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-label)' }}>
              {isGrace ? 'Graça até' : 'Expira em'}
            </p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {license?.expires_at
                ? formatDate(isGrace && license.grace_until ? license.grace_until : license.expires_at)
                : '—'}
            </p>
            {license?.paid_since && (
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Pago desde {formatDate(license.paid_since)}
              </p>
            )}
          </div>
        </div>

        {/* Aviso contextual — só para o dono */}
        {isOwner && warningMsg && (
          <div className="flex items-center gap-3 mt-4 px-4 py-3 rounded-xl"
            style={{ background: warningMsg.bg, border: `1px solid ${warningMsg.border}` }}>
            <AlertTriangle size={15} style={{ color: warningMsg.color, flexShrink: 0 }} />
            <p className="text-xs font-semibold" style={{ color: warningMsg.color }}>
              {warningMsg.text}
            </p>
          </div>
        )}

        {/* Staff vê mensagem neutra se o plano está OK */}
        {!isOwner && isActive && (
          <div className="flex items-center gap-3 mt-4 px-4 py-3 rounded-xl"
            style={{ background: ALPHA.successBgSubtle, border: `1px solid ${ALPHA.successBorder}` }}>
            <CheckCircle2 size={15} style={{ color: COLORS.success, flexShrink: 0 }} />
            <p className="text-xs font-semibold" style={{ color: COLORS.successLight }}>
              A loja está com acesso ativo.
            </p>
          </div>
        )}
      </Card>

      {/* ── Resgatar código — só dono ── */}
      {isOwner && (
        <Card className="p-6">
          <SectionHeader
            icon={isTrial ? Sparkles : Key}
            label={isTrial ? 'Ativar Plano' : 'Resgatar Código'}
            subtitle={isTrial ? 'Saia do período de teste com um plano completo' : 'Renove ou amplie seu plano'}
            color={isTrial ? COLORS.warning : COLORS.accent}
          />

          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Key size={13} style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none',
                }} />
                <input
                  value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setFeedback(null); }}
                  onKeyDown={e => e.key === 'Enter' && handleRedeem()}
                  placeholder="NEO-XXXX-XXXX-XXXX"
                  className="w-full rounded-xl text-sm outline-none transition-all"
                  style={{
                    paddingLeft: '2.25rem', paddingRight: '0.875rem',
                    paddingTop: '0.625rem', paddingBottom: '0.625rem',
                    background: 'var(--input-bg)',
                    border: `1px solid ${feedback?.type === 'error' ? COLORS.danger : 'var(--input-border)'}`,
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace', letterSpacing: '0.05em',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = COLORS.accent)}
                  onBlur={e => (e.currentTarget.style.borderColor = feedback?.type === 'error' ? COLORS.danger : 'var(--input-border)')}
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

            {feedback && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                style={{
                  background: feedback.type === 'error' ? ALPHA.dangerBgSubtle : ALPHA.successBgSubtle,
                  border: `1px solid ${feedback.type === 'error' ? ALPHA.dangerBorder : ALPHA.successBorder}`,
                  color: feedback.type === 'error' ? COLORS.dangerLight : COLORS.successLight,
                }}>
                {feedback.type === 'error' ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                {feedback.msg}
              </div>
            )}

            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {isTrial
                ? 'Ao ativar um plano pago, seu período de teste será encerrado e os dias do plano começam a contar agora.'
                : 'Os dias são acumulados ao saldo atual se seu plano ainda estiver ativo.'}
            </p>
          </div>
        </Card>
      )}

      {/* ── Canais de contato — só dono ── */}
      {isOwner && (
        <Card className="p-6">
          <SectionHeader
            icon={MessageCircle}
            label="Obter um Código"
            subtitle="Entre em contato para adquirir um plano"
            color="#25D366"
          />
          {contactsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={18} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
            </div>
          ) : contacts.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>Nenhum canal disponível.</p>
          ) : (
            <div className="space-y-2">
              {contacts.map(contact => {
                const cfg = PLATFORM_CFG[contact.platform] ?? PLATFORM_CFG.other;
                const Icon = cfg.icon;
                const href = contact.url ?? (
                  contact.platform === 'email' ? `mailto:${contact.value}` :
                  contact.platform === 'phone' ? `tel:${contact.value}` : undefined
                );
                const inner = (
                  <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}40` }}>
                      <Icon size={18} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{contact.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{contact.value}</p>
                    </div>
                    {href && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0"
                        style={{ background: `${cfg.color}20`, color: cfg.color }}>
                        {cfg.label} <ExternalLink size={11} />
                      </div>
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
                ) : <div key={contact.id}>{inner}</div>;
              })}
            </div>
          )}
        </Card>
      )}

      {/* ── Histórico de resgates — só dono ── */}
      {isOwner && redemptions.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${COLORS.purple}15` }}>
                <Clock size={14} style={{ color: COLORS.purple }} />
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Histórico de Resgates</span>
            </div>
            <button onClick={refetch} className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
              <RefreshCw size={13} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Data', 'Dias adicionados', 'Válido até'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: 'var(--text-label)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {redemptions.map(r => (
                  <tr key={r.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-soft)' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
                    <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>{formatDate(r.redeemed_at)}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-black text-base" style={{ color: COLORS.success }}>+{r.days_added}</span>
                      <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>dias</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--text-primary)' }}>{formatDate(r.new_expiry)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}