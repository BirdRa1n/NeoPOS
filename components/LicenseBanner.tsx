'use client';
import type { LicenseStatus } from '@/hooks/useLicense';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { useState } from 'react';

interface LicenseBannerProps {
  license: LicenseStatus;
  isOwner: boolean;
  onGoToLicense?: () => void;
}

const BANNER_CFG = {
  trial_expiring: {
    bg:      '#F59E0B',
    icon:    Clock,
    message: (days: number) =>
      `Seu período de teste expira em ${days} dia${days !== 1 ? 's' : ''}. Adquira um plano para não perder o acesso.`,
    cta: 'Ver planos',
  },
  trial_grace: {
    bg:      '#EF4444',
    icon:    AlertTriangle,
    message: (days: number) =>
      `Período de teste encerrado. Você tem ${days} dia${days !== 1 ? 's' : ''} de graça restante${days !== 1 ? 's' : ''}. Ative um plano agora.`,
    cta: 'Ativar plano',
  },
  paid_expiring: {
    bg:      '#F59E0B',
    icon:    Clock,
    message: (days: number) =>
      `Seu plano expira em ${days} dia${days !== 1 ? 's' : ''}. Renove para manter o acesso.`,
    cta: 'Renovar',
  },
  paid_grace: {
    bg:      '#EF4444',
    icon:    AlertTriangle,
    message: (days: number) =>
      `Plano expirado. Você tem ${days} dia${days !== 1 ? 's' : ''} de graça restante${days !== 1 ? 's' : ''}. Renove agora.`,
    cta: 'Renovar agora',
  },
} as const;

export function LicenseBanner({ license, isOwner, onGoToLicense }: LicenseBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Só mostra para o dono da loja
  if (!isOwner) return null;

  // Só mostra se há um warning_type definido
  if (!license.warning_type) return null;

  // Grace nunca pode ser dispensado
  const isGrace = license.warning_type === 'trial_grace' || license.warning_type === 'paid_grace';

  if (dismissed && !isGrace) return null;

  const cfg = BANNER_CFG[license.warning_type];
  const Icon = cfg.icon;

  return (
    <div
      style={{
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
      }}
    >
      <Icon size={14} style={{ flexShrink: 0 }} />
      <span>{cfg.message(license.days_remaining)}</span>
      {onGoToLicense && (
        <button
          onClick={onGoToLicense}
          style={{
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