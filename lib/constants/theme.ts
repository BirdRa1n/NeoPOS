// ─── Theme Types ──────────────────────────────────────────────────────────────
export type Theme = 'dark' | 'light';

// ─────────────────────────────────────────────────────────────────────────────
// 🎨 BRAND — único lugar para mudar a cor principal do app
//    Troque os valores abaixo para recolorir toda a aplicação.
//
//    Exemplos prontos:
//      Índigo (padrão): base '#6366F1'  dark '#4F46E5'  light '#818CF8'  soft '#A5B4FC'  secondary '#8B5CF6'
//      Vermelho:        base '#EF4444'  dark '#DC2626'  light '#F87171'  soft '#FCA5A5'  secondary '#F97316'
//      Azul:            base '#3B82F6'  dark '#2563EB'  light '#60A5FA'  soft '#93C5FD'  secondary '#6366F1'
//      Verde:           base '#10B981'  dark '#059669'  light '#34D399'  soft '#6EE7B7'  secondary '#06B6D4'
//      Rosa:            base '#EC4899'  dark '#DB2777'  light '#F472B6'  soft '#FBCFE8'  secondary '#8B5CF6'
// ─────────────────────────────────────────────────────────────────────────────
export const BRAND = {
  base:      '#6366F1',   // cor principal
  dark:      '#4F46E5',   // hover / pressed
  light:     '#818CF8',   // texto sobre fundo escuro / ícones ativos
  soft:      '#A5B4FC',   // texto suave / breadcrumbs
  secondary: '#8B5CF6',   // cor complementar (gradiente, badges)

  // RGB do base — usado para construir alphas (deve bater com `base`)
  // Ex: '#6366F1' → '99,102,241'
  rgb: '99,102,241',

  // RGB do secondary
  rgbSecondary: '139,92,246',
} as const;

// ─── Helpers derivados de BRAND ───────────────────────────────────────────────
const B  = BRAND.base;
const BD = BRAND.dark;
const BL = BRAND.light;
const BS = BRAND.soft;
const S  = BRAND.secondary;
const R  = BRAND.rgb;
const RS = BRAND.rgbSecondary;

// ─── Semantic Color Tokens ────────────────────────────────────────────────────
export const COLORS = {
  // Primary (brand)
  accent:          B,
  accentHover:     BD,
  accentLight:     BL,
  accentSoft:      BS,
  accentGradient:  `linear-gradient(135deg,${B},${S})`,
  accentShadow:    `0 4px 14px rgba(${R},0.3)`,
  accentShadowLg:  `0 4px 20px rgba(${R},0.35)`,

  // Secondary
  purple:          S,
  purpleLight:     `rgba(${RS},0.8)`,

  // Success / Green
  success:         '#10B981',
  successDark:     '#059669',
  successLight:    '#34D399',
  successSoft:     '#6EE7B7',
  successGradient: 'linear-gradient(135deg,#10B981,#059669)',
  successShadow:   '0 4px 20px rgba(16,185,129,0.35)',

  // Warning / Amber
  warning:         '#F59E0B',
  warningDark:     '#D97706',
  warningLight:    '#FCD34D',
  warningGradient: 'linear-gradient(135deg,#F59E0B,#D97706)',
  warningShadow:   '0 8px 32px rgba(245,158,11,0.4)',

  // Danger / Red
  danger:          '#EF4444',
  dangerDark:      '#DC2626',
  dangerLight:     '#F87171',
  dangerSoft:      '#FCA5A5',
  dangerGradient:  'linear-gradient(135deg,#EF4444,#DC2626)',

  // Info / Blue
  info:            '#3B82F6',
  infoLight:       '#93C5FD',

  // Neutral / Gray
  neutral:         '#6B7280',
  neutralLight:    '#9CA3AF',
  neutralSoft:     '#D1D5DB',

  // Misc
  pink:            '#EC4899',
  teal:            '#14B8A6',
  cyan:            '#06B6D4',
  lime:            '#84CC16',
  white:           '#FFFFFF',
} as const;

// ─── Alpha helpers derivados de BRAND ────────────────────────────────────────
export const ALPHA = {
  // Accent (brand)
  accentBgD:       `rgba(${R},0.15)`,
  accentBgL:       `rgba(${R},0.1)`,
  accentBgSubtleD: `rgba(${R},0.08)`,
  accentBgSubtleL: `rgba(${R},0.06)`,
  accentBorder:    `rgba(${R},0.2)`,
  accentBorderMd:  `rgba(${R},0.25)`,
  accentBorderStr: `rgba(${R},0.35)`,
  accentGlow:      `0 0 0 3px rgba(${R},0.15)`,

  // Success
  successBgD:      'rgba(16,185,129,0.15)',
  successBgL:      'rgba(16,185,129,0.1)',
  successBgSubtle: 'rgba(16,185,129,0.08)',
  successBorder:   'rgba(16,185,129,0.2)',

  // Warning
  warningBgD:      'rgba(245,158,11,0.15)',
  warningBgL:      'rgba(245,158,11,0.1)',
  warningBgSubtle: 'rgba(245,158,11,0.08)',
  warningBorder:   'rgba(245,158,11,0.2)',

  // Danger
  dangerBgD:       'rgba(239,68,68,0.15)',
  dangerBgL:       'rgba(239,68,68,0.1)',
  dangerBgSubtle:  'rgba(239,68,68,0.1)',
  dangerBorder:    'rgba(239,68,68,0.2)',

  // Info
  infoBgD:         'rgba(59,130,246,0.15)',
  infoBgL:         'rgba(59,130,246,0.1)',

  // Purple (secondary brand)
  purpleBgD:       `rgba(${RS},0.15)`,
  purpleBgL:       `rgba(${RS},0.1)`,

  // Neutral
  neutralBg:       'rgba(107,114,128,0.1)',
  neutralBorder:   'rgba(107,114,128,0.2)',

  // Overlay
  overlayLight:    'rgba(0,0,0,0.55)',
  overlayMd:       'rgba(0,0,0,0.6)',
  overlayDark:     'rgba(0,0,0,0.7)',
  backdropBlur:    'blur(6px)',
} as const;

// ─── CSS Variable themes (dark / light) ───────────────────────────────────────
// As variáveis de sidebar que dependem do brand são derivadas de BRAND.
export const THEMES: Record<Theme, Record<string, string>> = {
  dark: {
    '--bg':                    '#080B12',
    '--surface':               'rgba(255,255,255,0.025)',
    '--surface-hover':         'rgba(255,255,255,0.04)',
    '--border':                'rgba(255,255,255,0.06)',
    '--border-soft':           'rgba(255,255,255,0.04)',
    '--text-primary':          '#FFFFFF',
    '--text-secondary':        'rgba(255,255,255,0.55)',
    '--text-muted':            'rgba(255,255,255,0.28)',
    '--text-label':            'rgba(255,255,255,0.18)',
    '--input-bg':              'rgba(255,255,255,0.03)',
    '--input-border':          'rgba(255,255,255,0.07)',
    '--bar-track':             'rgba(255,255,255,0.06)',
    '--header-bg':             'rgba(8,11,18,0.85)',
    '--scrollbar':             'rgba(255,255,255,0.08)',
    '--surface-box':           '0 1px 3px rgba(0,0,0,0.3)',
    '--modal-bg':              '#0F1117',
    // Sidebar — derivado de BRAND
    '--sidebar-bg':            'linear-gradient(180deg,#0F1117 0%,#0A0D14 100%)',
    '--sidebar-border':        'rgba(255,255,255,0.05)',
    '--sidebar-text':          'rgba(255,255,255,0.42)',
    '--sidebar-text-active':   BS,
    '--sidebar-icon':          'rgba(255,255,255,0.38)',
    '--sidebar-icon-active':   BL,
    '--sidebar-item-active-bg': `rgba(${R},0.15)`,
    '--sidebar-item-hover-bg': 'rgba(255,255,255,0.03)',
    '--sidebar-accent':        B,
    '--sidebar-store-bg':      `rgba(${R},0.08)`,
    '--sidebar-store-border':  `rgba(${R},0.15)`,
    '--sidebar-store-text':    BS,
  },
  light: {
    '--bg':                    '#F1F4FA',
    '--surface':               '#FFFFFF',
    '--surface-hover':         'rgba(0,0,0,0.025)',
    '--border':                'rgba(0,0,0,0.07)',
    '--border-soft':           'rgba(0,0,0,0.04)',
    '--text-primary':          '#0F1117',
    '--text-secondary':        '#4B5563',
    '--text-muted':            '#9CA3AF',
    '--text-label':            '#D1D5DB',
    '--input-bg':              'rgba(0,0,0,0.03)',
    '--input-border':          'rgba(0,0,0,0.1)',
    '--bar-track':             'rgba(0,0,0,0.07)',
    '--header-bg':             'rgba(241,244,250,0.9)',
    '--scrollbar':             'rgba(0,0,0,0.1)',
    '--surface-box':           '0 1px 4px rgba(0,0,0,0.06)',
    '--modal-bg':              '#FFFFFF',
    // Sidebar — derivado de BRAND
    '--sidebar-bg':            'linear-gradient(180deg,#FFFFFF 0%,#F9FAFB 100%)',
    '--sidebar-border':        'rgba(0,0,0,0.08)',
    '--sidebar-text':          '#6B7280',
    '--sidebar-text-active':   BD,
    '--sidebar-icon':          '#9CA3AF',
    '--sidebar-icon-active':   B,
    '--sidebar-item-active-bg': `rgba(${R},0.1)`,
    '--sidebar-item-hover-bg': 'rgba(0,0,0,0.03)',
    '--sidebar-accent':        B,
    '--sidebar-store-bg':      `rgba(${R},0.06)`,
    '--sidebar-store-border':  `rgba(${R},0.12)`,
    '--sidebar-store-text':    BD,
  },
};
