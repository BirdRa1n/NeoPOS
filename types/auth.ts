export type ThemeMode = 'auto' | 'dark' | 'light';
export type AuthStep = 'auth' | 'verify-email' | 'create-store' | 'join-staff' | 'staff-pending' | 'done' | 'forgot-password';
export type AccountType = 'owner' | 'staff' | '';

export const AUTH_TOKENS = {
  dark: {
    bg: '#080B12', panelBg: '#0D1019',
    surface: 'rgba(255,255,255,0.025)', surfaceHover: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.07)', borderSoft: 'rgba(255,255,255,0.04)',
    text: '#FFFFFF', textSec: 'rgba(255,255,255,0.55)', textMuted: 'rgba(255,255,255,0.30)',
    inputBg: 'rgba(255,255,255,0.04)', inputBorder: 'rgba(255,255,255,0.08)',
    autofillBg: '#0D1019', autofillText: '#ffffff',
    scrollThumb: 'rgba(255,255,255,0.08)',
    orb1: 'rgba(99,102,241,0.12)', orb2: 'rgba(139,92,246,0.10)', orb3: 'rgba(16,185,129,0.04)',
    gridOpacity: 0.025, noiseOpacity: 0.5,
    toggleBg: 'rgba(255,255,255,0.06)', toggleBorder: 'rgba(255,255,255,0.09)', toggleColor: 'rgba(255,255,255,0.45)',
    tabBarBg: 'rgba(255,255,255,0.04)', tabBarBorder: 'rgba(255,255,255,0.06)',
    storeCardBg: 'rgba(255,255,255,0.04)', ghostBg: 'rgba(255,255,255,0.04)', ghostBorder: 'rgba(255,255,255,0.08)',
    rightBg: 'transparent', cardShadow: 'none',
    stepInactive: 'rgba(255,255,255,0.06)', stepInactiveBorder: 'rgba(255,255,255,0.10)',
    stepInactiveText: 'rgba(255,255,255,0.30)', progressTrack: 'rgba(255,255,255,0.07)',
    typeCardBg: 'rgba(255,255,255,0.03)', typeCardBorder: 'rgba(255,255,255,0.07)',
    typeCardHover: 'rgba(255,255,255,0.06)',
  },
  light: {
    bg: '#F1F4FA', panelBg: '#FFFFFF',
    surface: '#FFFFFF', surfaceHover: 'rgba(0,0,0,0.025)',
    border: 'rgba(0,0,0,0.08)', borderSoft: 'rgba(0,0,0,0.04)',
    text: '#0F1117', textSec: '#4B5563', textMuted: '#9CA3AF',
    inputBg: 'rgba(0,0,0,0.03)', inputBorder: 'rgba(0,0,0,0.10)',
    autofillBg: '#ffffff', autofillText: '#0F1117',
    scrollThumb: 'rgba(0,0,0,0.12)',
    orb1: 'rgba(99,102,241,0.07)', orb2: 'rgba(139,92,246,0.06)', orb3: 'rgba(16,185,129,0.04)',
    gridOpacity: 0.04, noiseOpacity: 0.2,
    toggleBg: 'rgba(0,0,0,0.05)', toggleBorder: 'rgba(0,0,0,0.09)', toggleColor: '#6B7280',
    tabBarBg: 'rgba(0,0,0,0.04)', tabBarBorder: 'rgba(0,0,0,0.07)',
    storeCardBg: 'rgba(0,0,0,0.03)', ghostBg: 'rgba(0,0,0,0.04)', ghostBorder: 'rgba(0,0,0,0.10)',
    rightBg: 'rgba(241,244,250,0.6)', cardShadow: '0 4px 32px rgba(0,0,0,0.08)',
    stepInactive: 'rgba(0,0,0,0.05)', stepInactiveBorder: 'rgba(0,0,0,0.10)',
    stepInactiveText: '#9CA3AF', progressTrack: 'rgba(0,0,0,0.08)',
    typeCardBg: 'rgba(0,0,0,0.02)', typeCardBorder: 'rgba(0,0,0,0.07)',
    typeCardHover: 'rgba(0,0,0,0.04)',
  },
} as const;

export type Tok = typeof AUTH_TOKENS['dark'] | typeof AUTH_TOKENS['light'];
