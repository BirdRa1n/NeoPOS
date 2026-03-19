'use client';
import type { LicenseStatus } from '@/hooks/useLicense';
import { AlertTriangle, Clock, Key, X } from 'lucide-react';
import { useState } from 'react';

interface LicenseBannerProps {
  license: LicenseStatus;
  isOwner: boolean;
  onAcquire?: () => void;
  onGoToLicense?: () => void;
}

// Formata o tempo restante de forma inteligente:
// > 1 dia  → "X dias"
// < 1 dia  → "Xh Ymin"
// < 1 hora → "Xmin"
function formatTimeRemaining(isoDate: string): string {
  const diff = new Date(isoDate).getTime() - Date.now();
  if (diff <= 0) return '0min';

  const totalMinutes = Math.floor(diff / 60000);
  const totalHours   = Math.floor(diff / 3600000);
  const days         = Math.floor(diff / 86400000);

  if (days >= 1) {
    return `${days} dia${days !== 1 ? 's' : ''}`;
  }
  if (totalHours >= 1) {
    const mins = totalMinutes % 60;
    return mins > 0 ? `${totalHours}h ${mins}min` : `${totalHours}h`;
  }
  return `${totalMinutes}min`;
}

const BANNER_CFG = {
  trial_expiring: {
    bg:   '#F59E0B',
    icon: Clock,
    message: (license: LicenseStatus) => {
      const t = formatTimeRemaining(license.expires_at!);
      return `Seu período de teste expira em ${t}.`;
    },
    cta: 'Adquirir licença',
  },
  trial_grace: {
    bg:   '#EF4444',
    icon: AlertTriangle,
    message: (license: LicenseStatus) => {
      const t = formatTimeRemaining(license.grace_until!);
      return `Período de teste encerrado. ${t} de graça restante${license.grace_until ? '' : 's'}.`;
    },
    cta: 'Adquirir licença',
  },
  paid_expiring: {
    bg:   '#F59E0B',
    icon: Clock,
    message: (license: LicenseStatus) => {
      const t = formatTimeRemaining(license.expires_at!);
      return `Seu plano expira em ${t}.`;
    },
    cta: 'Adquirir licença',
  },
  paid_grace: {
    bg:   '#EF4444',
    icon: AlertTriangle,
    message: (license: LicenseStatus) => {
      const t = formatTimeRemaining(license.grace_until!);
      return `Plano expirado. ${t} de graça restante.`;
    },
    cta: 'Adquirir licença',
  },
} as const;

export function LicenseBanner({ license, isOwner, onAcquire, onGoToLicense }: LicenseBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!isOwner)              return null;
  if (!license.warning_type) return null;

  const isGrace = license.warning_type === 'trial_grace' || license.warning_type === 'paid_grace';

  if (dismissed && !isGrace) return null;

  const cfg  = BANNER_CFG[license.warning_type];
  const Icon = cfg.icon;

  return (
    <div style={{
      background: cfg.bg,
      color: '#fff',
      fontSize: 12,
      fontWeight: 600,
      padding: '7px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      position: 'relative',
    }}>
      <Icon size={14} style={{ flexShrink: 0 }} />
      <span>{cfg.message(license)}</span>

      {(onAcquire ?? onGoToLicense) && (
        <button
          onClick={onAcquire ?? onGoToLicense}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(255,255,255,0.25)',
            border: '1px solid rgba(255,255,255,0.4)',
            color: '#fff',
            borderRadius: 6,
            padding: '2px 10px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Key size={11} />
          {cfg.cta}
        </button>
      )}

      {!isGrace && (
        <button
          onClick={() => setDismissed(true)}
          style={{
            position: 'absolute',
            right: 12,
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
          }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}