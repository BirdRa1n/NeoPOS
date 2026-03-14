// ─── Theme Types & Constants ──────────────────────────────────────────────────
export type Theme = 'dark' | 'light';

// ─── Semantic Color Tokens (theme-independent) ────────────────────────────────
export const COLORS = {
  // Primary / Accent
  accent:           '#6366F1',
  accentHover:      '#4F46E5',
  accentLight:      '#818CF8',
  accentSoft:       '#A5B4FC',
  accentGradient:   'linear-gradient(135deg,#6366F1,#8B5CF6)',
  accentShadow:     '0 4px 14px rgba(99,102,241,0.3)',
  accentShadowLg:   '0 4px 20px rgba(99,102,241,0.35)',

  // Secondary / Purple
  purple:           '#8B5CF6',
  purpleLight:      '#C4B5FD',

  // Success / Green
  success:          '#10B981',
  successDark:      '#059669',
  successLight:     '#34D399',
  successSoft:      '#6EE7B7',
  successGradient:  'linear-gradient(135deg,#10B981,#059669)',
  successShadow:    '0 4px 20px rgba(16,185,129,0.35)',

  // Warning / Amber
  warning:          '#F59E0B',
  warningDark:      '#D97706',
  warningLight:     '#FCD34D',
  warningGradient:  'linear-gradient(135deg,#F59E0B,#D97706)',
  warningShadow:    '0 8px 32px rgba(245,158,11,0.4)',

  // Danger / Red
  danger:           '#EF4444',
  dangerDark:       '#DC2626',
  dangerLight:      '#F87171',
  dangerSoft:       '#FCA5A5',
  dangerGradient:   'linear-gradient(135deg,#EF4444,#DC2626)',

  // Info / Blue
  info:             '#3B82F6',
  infoLight:        '#93C5FD',

  // Neutral / Gray
  neutral:          '#6B7280',
  neutralLight:     '#9CA3AF',
  neutralSoft:      '#D1D5DB',

  // Pink
  pink:             '#EC4899',

  // Teal
  teal:             '#14B8A6',

  // Cyan
  cyan:             '#06B6D4',

  // Lime
  lime:             '#84CC16',

  // White (static)
  white:            '#FFFFFF',
} as const;

// ─── Semantic alpha helpers (dark / light variants) ───────────────────────────
export const ALPHA = {
  // Accent
  accentBgD:        'rgba(99,102,241,0.15)',
  accentBgL:        'rgba(99,102,241,0.1)',
  accentBgSubtleD:  'rgba(99,102,241,0.08)',
  accentBgSubtleL:  'rgba(99,102,241,0.06)',
  accentBorder:     'rgba(99,102,241,0.2)',
  accentBorderMd:   'rgba(99,102,241,0.25)',
  accentBorderStr:  'rgba(99,102,241,0.35)',
  accentGlow:       '0 0 0 3px rgba(99,102,241,0.15)',

  // Success
  successBgD:       'rgba(16,185,129,0.15)',
  successBgL:       'rgba(16,185,129,0.1)',
  successBgSubtle:  'rgba(16,185,129,0.08)',
  successBorder:    'rgba(16,185,129,0.2)',

  // Warning
  warningBgD:       'rgba(245,158,11,0.15)',
  warningBgL:       'rgba(245,158,11,0.1)',
  warningBgSubtle:  'rgba(245,158,11,0.08)',
  warningBorder:    'rgba(245,158,11,0.2)',

  // Danger
  dangerBgD:        'rgba(239,68,68,0.15)',
  dangerBgL:        'rgba(239,68,68,0.1)',
  dangerBgSubtle:   'rgba(239,68,68,0.1)',
  dangerBorder:     'rgba(239,68,68,0.2)',

  // Info
  infoBgD:          'rgba(59,130,246,0.15)',
  infoBgL:          'rgba(59,130,246,0.1)',

  // Purple
  purpleBgD:        'rgba(139,92,246,0.15)',
  purpleBgL:        'rgba(139,92,246,0.1)',

  // Neutral
  neutralBg:        'rgba(107,114,128,0.1)',
  neutralBorder:    'rgba(107,114,128,0.2)',

  // Overlay
  overlayLight:     'rgba(0,0,0,0.55)',
  overlayMd:        'rgba(0,0,0,0.6)',
  overlayDark:      'rgba(0,0,0,0.7)',
  backdropBlur:     'blur(6px)',
} as const;

export const THEMES: Record<Theme, Record<string, string>> = {
  dark: {
    '--bg': '#080B12',
    '--surface': 'rgba(255,255,255,0.025)',
    '--surface-hover': 'rgba(255,255,255,0.04)',
    '--border': 'rgba(255,255,255,0.06)',
    '--border-soft': 'rgba(255,255,255,0.04)',
    '--text-primary': '#FFFFFF',
    '--text-secondary': 'rgba(255,255,255,0.55)',
    '--text-muted': 'rgba(255,255,255,0.28)',
    '--text-label': 'rgba(255,255,255,0.18)',
    '--input-bg': 'rgba(255,255,255,0.03)',
    '--input-border': 'rgba(255,255,255,0.07)',
    '--bar-track': 'rgba(255,255,255,0.06)',
    '--header-bg': 'rgba(8,11,18,0.85)',
    '--scrollbar': 'rgba(255,255,255,0.08)',
    '--surface-box': '0 1px 3px rgba(0,0,0,0.3)',
    // Sidebar
    '--sidebar-bg': 'linear-gradient(180deg,#0F1117 0%,#0A0D14 100%)',
    '--sidebar-border': 'rgba(255,255,255,0.05)',
    '--sidebar-text': 'rgba(255,255,255,0.42)',
    '--sidebar-text-active': '#A5B4FC',
    '--sidebar-icon': 'rgba(255,255,255,0.38)',
    '--sidebar-icon-active': '#818CF8',
    '--sidebar-item-active-bg': 'rgba(99,102,241,0.15)',
    '--sidebar-item-hover-bg': 'rgba(255,255,255,0.03)',
    '--sidebar-accent': '#6366F1',
    '--sidebar-store-bg': 'rgba(99,102,241,0.08)',
    '--sidebar-store-border': 'rgba(99,102,241,0.15)',
    '--sidebar-store-text': '#A5B4FC',
  },
  light: {
    '--bg': '#F1F4FA',
    '--surface': '#FFFFFF',
    '--surface-hover': 'rgba(0,0,0,0.025)',
    '--border': 'rgba(0,0,0,0.07)',
    '--border-soft': 'rgba(0,0,0,0.04)',
    '--text-primary': '#0F1117',
    '--text-secondary': '#4B5563',
    '--text-muted': '#9CA3AF',
    '--text-label': '#D1D5DB',
    '--input-bg': 'rgba(0,0,0,0.03)',
    '--input-border': 'rgba(0,0,0,0.1)',
    '--bar-track': 'rgba(0,0,0,0.07)',
    '--header-bg': 'rgba(241,244,250,0.9)',
    '--scrollbar': 'rgba(0,0,0,0.1)',
    '--surface-box': '0 1px 4px rgba(0,0,0,0.06)',
    // Sidebar
    '--sidebar-bg': 'linear-gradient(180deg,#FFFFFF 0%,#F9FAFB 100%)',
    '--sidebar-border': 'rgba(0,0,0,0.08)',
    '--sidebar-text': '#6B7280',
    '--sidebar-text-active': '#4F46E5',
    '--sidebar-icon': '#9CA3AF',
    '--sidebar-icon-active': '#6366F1',
    '--sidebar-item-active-bg': 'rgba(99,102,241,0.1)',
    '--sidebar-item-hover-bg': 'rgba(0,0,0,0.03)',
    '--sidebar-accent': '#6366F1',
    '--sidebar-store-bg': 'rgba(99,102,241,0.06)',
    '--sidebar-store-border': 'rgba(99,102,241,0.12)',
    '--sidebar-store-text': '#4F46E5',
  },
};
