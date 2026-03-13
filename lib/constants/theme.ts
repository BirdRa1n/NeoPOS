// ─── Theme Types & Constants ──────────────────────────────────────────────────
export type Theme = 'dark' | 'light';

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
  },
};
