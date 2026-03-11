"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/supabase/client';
import toast from 'react-hot-toast';
import {
    Box, ShoppingBag, Truck, Users, BarChart3,
    Eye, EyeOff, ArrowRight, ArrowLeft, Check,
    Store, Mail, Lock, User, Phone, MapPin,
    Loader2, Sparkles, Shield,
    CheckCircle2, AlertCircle, RefreshCw, Sun, Moon,
} from 'lucide-react';

// ─── Theme hook — detects OS preference, allows manual override ───────────────
function useTheme() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('neo-auth-theme') as 'dark' | 'light' | null;
        const mq = window.matchMedia('(prefers-color-scheme: light)');
        setTheme(saved ?? (mq.matches ? 'light' : 'dark'));
        setReady(true);

        const handler = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('neo-auth-theme')) setTheme(e.matches ? 'light' : 'dark');
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const toggle = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('neo-auth-theme', next);
    };

    return { theme, toggle, ready };
}

// ─── Design tokens per theme ─────────────────────────────────────────────────
const T = {
    dark: {
        bg: '#080B12',
        panelBg: '#0D1019',
        surface: 'rgba(255,255,255,0.025)',
        surfaceHover: 'rgba(255,255,255,0.04)',
        border: 'rgba(255,255,255,0.07)',
        borderSoft: 'rgba(255,255,255,0.04)',
        text: '#FFFFFF',
        textSec: 'rgba(255,255,255,0.55)',
        textMuted: 'rgba(255,255,255,0.30)',
        inputBg: 'rgba(255,255,255,0.04)',
        inputBorder: 'rgba(255,255,255,0.08)',
        autofillBg: '#0D1019',
        autofillText: '#ffffff',
        scrollThumb: 'rgba(255,255,255,0.08)',
        orb1: 'rgba(99,102,241,0.12)',
        orb2: 'rgba(139,92,246,0.10)',
        orb3: 'rgba(16,185,129,0.04)',
        gridOpacity: 0.025,
        noiseOpacity: 0.5,
        toggleBg: 'rgba(255,255,255,0.06)',
        toggleBorder: 'rgba(255,255,255,0.09)',
        toggleColor: 'rgba(255,255,255,0.45)',
        tabBarBg: 'rgba(255,255,255,0.04)',
        tabBarBorder: 'rgba(255,255,255,0.06)',
        storeCardBg: 'rgba(255,255,255,0.04)',
        ghostBg: 'rgba(255,255,255,0.04)',
        ghostBorder: 'rgba(255,255,255,0.08)',
        rightBg: 'transparent',
        cardShadow: 'none',
        stepInactive: 'rgba(255,255,255,0.06)',
        stepInactiveBorder: 'rgba(255,255,255,0.10)',
        stepInactiveText: 'rgba(255,255,255,0.30)',
        progressTrack: 'rgba(255,255,255,0.07)',
    },
    light: {
        bg: '#F1F4FA',
        panelBg: '#FFFFFF',
        surface: '#FFFFFF',
        surfaceHover: 'rgba(0,0,0,0.025)',
        border: 'rgba(0,0,0,0.08)',
        borderSoft: 'rgba(0,0,0,0.04)',
        text: '#0F1117',
        textSec: '#4B5563',
        textMuted: '#9CA3AF',
        inputBg: 'rgba(0,0,0,0.03)',
        inputBorder: 'rgba(0,0,0,0.10)',
        autofillBg: '#ffffff',
        autofillText: '#0F1117',
        scrollThumb: 'rgba(0,0,0,0.12)',
        orb1: 'rgba(99,102,241,0.07)',
        orb2: 'rgba(139,92,246,0.06)',
        orb3: 'rgba(16,185,129,0.04)',
        gridOpacity: 0.04,
        noiseOpacity: 0.2,
        toggleBg: 'rgba(0,0,0,0.05)',
        toggleBorder: 'rgba(0,0,0,0.09)',
        toggleColor: '#6B7280',
        tabBarBg: 'rgba(0,0,0,0.04)',
        tabBarBorder: 'rgba(0,0,0,0.07)',
        storeCardBg: 'rgba(0,0,0,0.03)',
        ghostBg: 'rgba(0,0,0,0.04)',
        ghostBorder: 'rgba(0,0,0,0.10)',
        rightBg: 'rgba(241,244,250,0.6)',
        cardShadow: '0 4px 32px rgba(0,0,0,0.08)',
        stepInactive: 'rgba(0,0,0,0.05)',
        stepInactiveBorder: 'rgba(0,0,0,0.10)',
        stepInactiveText: '#9CA3AF',
        progressTrack: 'rgba(0,0,0,0.08)',
    },
} as const;

type Tok = typeof T['dark'] | typeof T['light'];
type AuthStep = 'auth' | 'verify-email' | 'create-store' | 'done' | 'forgot-password';
type StoreCategory = 'food' | 'retail' | 'services' | 'other';

// ─── CSS builder — regenerated on theme change ─────────────────────────────
function buildCSS(tk: Tok, isDark: boolean) {
    return `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=DM+Mono:wght@400;500&display=swap');

.auth-root {
  --bg:${tk.bg};--surface:${tk.surface};--surface-hov:${tk.surfaceHover};
  --border:${tk.border};--border-soft:${tk.borderSoft};
  --text:${tk.text};--text-sec:${tk.textSec};--text-muted:${tk.textMuted};
  --input-bg:${tk.inputBg};--input-border:${tk.inputBorder};
  --accent:#6366F1;--purple:#8B5CF6;--green:#10B981;
  font-family:'DM Sans',system-ui,sans-serif;
  background:var(--bg);min-height:100vh;
  transition:background .3s,color .3s;
}
.auth-root *{box-sizing:border-box;}
.auth-root input:-webkit-autofill,
.auth-root input:-webkit-autofill:hover,
.auth-root input:-webkit-autofill:focus{
  -webkit-box-shadow:0 0 0 40px ${tk.autofillBg} inset!important;
  -webkit-text-fill-color:${tk.autofillText}!important;
  caret-color:${tk.text};
  transition:background-color 5000s ease-in-out 0s;
}
.auth-root ::-webkit-scrollbar{width:3px;}
.auth-root ::-webkit-scrollbar-track{background:transparent;}
.auth-root ::-webkit-scrollbar-thumb{background:${tk.scrollThumb};border-radius:99px;}

@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse-ring{0%{transform:scale(.9);opacity:.7}70%{transform:scale(1.5);opacity:0}100%{transform:scale(1.5);opacity:0}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes spin-slow{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes step-pop{0%{transform:scale(.7)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
@keyframes theme-in{from{opacity:.7}to{opacity:1}}

.fade-up{animation:fadeUp .45s ease both;}
.fade-up-1{animation:fadeUp .45s .05s ease both;}
.fade-up-2{animation:fadeUp .45s .10s ease both;}
.fade-up-3{animation:fadeUp .45s .15s ease both;}
.theme-in{animation:theme-in .25s ease both;}
.float-icon{animation:float 4s ease-in-out infinite;}
.step-pop{animation:step-pop .4s cubic-bezier(.36,.07,.19,.97) both;}

.shimmer-text{
  background:linear-gradient(90deg,#fff 0%,#a5b4fc 40%,#8b5cf6 60%,#fff 100%);
  background-size:200% auto;-webkit-background-clip:text;
  -webkit-text-fill-color:transparent;background-clip:text;
  animation:shimmer 3s linear infinite;
}

.noise-bg::before{
  content:'';position:fixed;inset:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  background-size:200px;pointer-events:none;z-index:0;opacity:${tk.noiseOpacity};
}

.input-field{
  width:100%;background:var(--input-bg);border:1px solid var(--input-border);
  border-radius:14px;color:var(--text);font-size:14px;
  font-family:'DM Sans',sans-serif;outline:none;
  transition:border-color .2s,box-shadow .2s,background .2s;padding:12px 14px;
}
.input-field:focus{border-color:var(--accent);background:rgba(99,102,241,0.05);box-shadow:0 0 0 3px rgba(99,102,241,0.12);}
.input-field::placeholder{color:var(--text-muted);}
.input-with-icon{padding-left:44px;}

.btn-primary{
  width:100%;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:white;
  font-size:14px;font-weight:600;font-family:'DM Sans',sans-serif;
  border:none;border-radius:14px;padding:13px 20px;cursor:pointer;
  transition:opacity .2s,transform .15s,box-shadow .2s;
  display:flex;align-items:center;justify-content:center;gap:8px;
  box-shadow:0 4px 20px rgba(99,102,241,0.35);position:relative;overflow:hidden;
}
.btn-primary::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.12),transparent);border-radius:14px;pointer-events:none;}
.btn-primary:hover:not(:disabled){opacity:.9;transform:translateY(-1px);box-shadow:0 8px 28px rgba(99,102,241,.4);}
.btn-primary:active:not(:disabled){transform:translateY(0);}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none;}

.btn-ghost{
  background:${tk.ghostBg};border:1px solid ${tk.ghostBorder};color:var(--text-sec);
  font-size:14px;font-weight:500;font-family:'DM Sans',sans-serif;
  border-radius:14px;padding:12px 20px;cursor:pointer;
  transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;
}
.btn-ghost:hover{background:var(--surface-hov);color:var(--text);}

.glass-card{
  background:${tk.surface};
  border:1px solid ${tk.border};
  border-radius:24px;
  ${isDark ? 'backdrop-filter:blur(20px);' : `box-shadow:${tk.cardShadow};`}
  transition:background .3s,border-color .3s,box-shadow .3s;
}

.otp-input{
  width:52px;height:60px;background:var(--input-bg);border:2px solid var(--input-border);
  border-radius:14px;color:var(--text);font-size:22px;font-weight:700;
  font-family:'DM Mono',monospace;text-align:center;outline:none;transition:all .2s;
}
.otp-input:focus{border-color:var(--accent);background:rgba(99,102,241,0.06);box-shadow:0 0 0 3px rgba(99,102,241,0.15);}
.otp-input.filled{border-color:rgba(99,102,241,0.5);background:rgba(99,102,241,0.08);color:#a5b4fc;}

.progress-bar{height:3px;background:${tk.progressTrack};border-radius:99px;overflow:hidden;}
.progress-fill{height:100%;background:linear-gradient(90deg,var(--accent),var(--purple));border-radius:99px;transition:width .5s cubic-bezier(.4,0,.2,1);}

.tab-bar{display:flex;gap:4px;padding:4px;border-radius:14px;background:${tk.tabBarBg};border:1px solid ${tk.tabBarBorder};}
.tab-btn{flex:1;padding:10px;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;border:none;border-radius:10px;cursor:pointer;transition:all .2s;}
.tab-btn.active{background:linear-gradient(135deg,#6366F1,#8B5CF6);color:white;box-shadow:0 4px 12px rgba(99,102,241,0.3);}
.tab-btn.inactive{background:transparent;color:var(--text-muted);}
.tab-btn.inactive:hover{color:var(--text-sec);background:var(--surface-hov);}

.store-type-card{
  padding:16px;border-radius:16px;border:2px solid var(--border);background:${tk.storeCardBg};
  cursor:pointer;transition:all .2s;text-align:center;position:relative;
}
.store-type-card:hover{border-color:rgba(99,102,241,0.4);background:rgba(99,102,241,0.06);}
.store-type-card.selected{border-color:var(--accent);background:rgba(99,102,241,0.10);box-shadow:0 0 0 3px rgba(99,102,241,0.10);}

.theme-toggle{
  position:fixed;top:20px;right:20px;z-index:100;
  width:40px;height:40px;background:${tk.toggleBg};border:1px solid ${tk.toggleBorder};
  border-radius:12px;display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:all .2s;color:${tk.toggleColor};
}
.theme-toggle:hover{transform:rotate(12deg) scale(1.08);}

@media(max-width:768px){
  .desktop-left{display:none!important;}
  .mobile-logo{display:flex!important;}
  .theme-toggle{top:16px;right:16px;}
}
`;
}

// ─── Animated grid + orbs ─────────────────────────────────────────────────────
function GridBackground({ tk }: { tk: Tok }) {
    return (
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: tk.gridOpacity }}>
                <defs>
                    <pattern id="auth-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 60 0 L 0 0 0 60" fill="none" stroke={tk.text} strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#auth-grid)" />
            </svg>
            <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vw', maxWidth: 700, maxHeight: 700, borderRadius: '50%', background: `radial-gradient(circle,${tk.orb1} 0%,transparent 70%)`, filter: 'blur(40px)' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-15%', width: '50vw', height: '50vw', maxWidth: 600, maxHeight: 600, borderRadius: '50%', background: `radial-gradient(circle,${tk.orb2} 0%,transparent 70%)`, filter: 'blur(40px)' }} />
            <div style={{ position: 'absolute', top: '40%', left: '40%', width: '30vw', height: '30vw', maxWidth: 400, borderRadius: '50%', background: `radial-gradient(circle,${tk.orb3} 0%,transparent 70%)`, filter: 'blur(60px)' }} />
        </div>
    );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const s = size === 'lg' ? 44 : size === 'md' ? 36 : 28;
    const fs = size === 'lg' ? 22 : size === 'md' ? 18 : 14;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: s, height: s, borderRadius: s * 0.28, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.4)', flexShrink: 0 }}>
                <Box width={s * 0.5} height={s * 0.5} color="#fff" />
            </div>
            <span style={{ fontSize: fs, fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>
                Neo<span style={{ color: '#818CF8' }}>Delivery</span>
            </span>
        </div>
    );
}

// ─── Icon Input ───────────────────────────────────────────────────────────────
function IconInput({ icon: Icon, label, type = 'text', placeholder, value, onChange, required, error, hint, disabled }: {
    icon: React.FC<any>; label?: string; type?: string; placeholder?: string;
    value: string; onChange: (v: string) => void;
    required?: boolean; error?: string; hint?: string; disabled?: boolean;
}) {
    const [show, setShow] = useState(false);
    const isPass = type === 'password';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {label && (
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {label}{required && <span style={{ color: '#EF4444' }}>*</span>}
                </label>
            )}
            <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                    <Icon size={15} color="var(--text-muted)" />
                </div>
                <input
                    className="input-field input-with-icon"
                    type={isPass && show ? 'text' : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    disabled={disabled}
                    style={{ paddingRight: isPass ? 44 : 14, ...(error ? { borderColor: 'rgba(239,68,68,0.5)', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}) }}
                />
                {isPass && (
                    <button type="button" onClick={() => setShow(s => !s)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex' }}>
                        {show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                )}
            </div>
            {error && <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#FCA5A5', fontSize: 12 }}><AlertCircle size={12} />{error}</div>}
            {hint && !error && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hint}</p>}
        </div>
    );
}

// ─── Password strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: '8+ chars', ok: password.length >= 8 },
        { label: 'A-Z', ok: /[A-Z]/.test(password) },
        { label: '0-9', ok: /[0-9]/.test(password) },
        { label: '#!@', ok: /[^A-Za-z0-9]/.test(password) },
    ];
    const score = checks.filter(c => c.ok).length;
    const cols = ['#EF4444', '#EF4444', '#F59E0B', '#10B981', '#10B981'];
    if (!password) return null;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= score ? cols[score] : 'var(--border)', transition: 'background .3s' }} />
                ))}
                <span style={{ fontSize: 10, fontWeight: 700, color: cols[score], marginLeft: 6, minWidth: 36 }}>
                    {['', 'Fraca', 'Regular', 'Boa', 'Forte'][score]}
                </span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {checks.map(c => (
                    <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                        <div style={{ width: 14, height: 14, borderRadius: 99, background: c.ok ? 'rgba(16,185,129,0.15)' : 'transparent', border: `1px solid ${c.ok ? '#10B981' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                            {c.ok && <Check size={8} color="#10B981" />}
                        </div>
                        <span style={{ color: c.ok ? 'var(--text-sec)' : 'var(--text-muted)' }}>{c.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OTPInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
    const refs = useRef<(HTMLInputElement | null)[]>([]);
    const digits = value.split('');

    const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const next = [...Array(length)].map((_, idx) => digits[idx] || '');
            if (next[i]) { next[i] = ''; onChange(next.join('')); }
            else if (i > 0) { next[i - 1] = ''; onChange(next.join('')); refs.current[i - 1]?.focus(); }
        }
    };

    const handleChange = (i: number, v: string) => {
        const char = v.replace(/\D/g, '').slice(-1);
        const next = [...Array(length)].map((_, idx) => digits[idx] || '');
        next[i] = char;
        onChange(next.join(''));
        if (char && i < length - 1) refs.current[i + 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        onChange(pasted.padEnd(length, '').slice(0, length));
        refs.current[Math.min(pasted.length, length - 1)]?.focus();
    };

    return (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {Array.from({ length }).map((_, i) => (
                <input key={i} ref={el => { refs.current[i] = el; }}
                    className={`otp-input${digits[i] ? ' filled' : ''}`}
                    type="text" inputMode="numeric" maxLength={1}
                    value={digits[i] || ''} onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKey(i, e)} onPaste={handlePaste} onFocus={e => e.target.select()} />
            ))}
        </div>
    );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ steps, current, tk }: { steps: string[]; current: number; tk: Tok }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {steps.map((label, i) => {
                const done = i < current, active = i === current;
                return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div className={done ? 'step-pop' : ''} style={{
                                width: 28, height: 28, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 700,
                                background: done ? 'linear-gradient(135deg,#10B981,#059669)' : active ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : tk.stepInactive,
                                border: done || active ? 'none' : `1px solid ${tk.stepInactiveBorder}`,
                                color: done || active ? 'white' : tk.stepInactiveText,
                                boxShadow: active ? '0 0 0 4px rgba(99,102,241,0.2)' : 'none',
                                transition: 'all .3s',
                            }}>
                                {done ? <Check size={13} /> : i + 1}
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', color: active ? '#a5b4fc' : done ? '#6EE7B7' : tk.stepInactiveText }}>
                                {label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div style={{ flex: 1, height: 1, margin: '0 6px', marginBottom: 18, background: done ? 'rgba(16,185,129,0.4)' : tk.border, transition: 'background .4s' }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Left panel — always dark ─────────────────────────────────────────────────
function LeftPanel() {
    const features = [
        { icon: ShoppingBag, label: 'Gestão de pedidos em tempo real', color: '#6366F1' },
        { icon: Truck, label: 'Controle completo de entregas', color: '#8B5CF6' },
        { icon: Users, label: 'CRM e histórico de clientes', color: '#10B981' },
        { icon: BarChart3, label: 'Relatórios financeiros detalhados', color: '#F59E0B' },
    ];
    return (
        <div style={{ flex: 1, alignSelf: 'stretch', minHeight: '100vh', padding: '48px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(160deg,#0A0D14 0%,#131729 100%)', position: 'relative' }}>
            <Logo size="md" />
            <div style={{ marginTop: 40 }}>
                <div className="float-icon" style={{ display: 'inline-flex', marginBottom: 20 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={28} color="#818CF8" />
                    </div>
                </div>
                <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: 14, color: 'white' }}>
                    <span className="shimmer-text">Gerencie seu negócio</span><br />
                    <span style={{ color: 'rgba(255,255,255,0.9)' }}>com inteligência</span>
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, maxWidth: 340 }}>
                    Plataforma completa para pequenos e médios negócios. Pedidos, entregas, estoque e muito mais num só lugar.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>
                    {features.map(({ icon: Icon, label, color }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon size={15} color={color} />
                            </div>
                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.52)', fontWeight: 500 }}>{label}</span>
                            <Check size={12} color={color} style={{ marginLeft: 'auto', flexShrink: 0 }} />
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ padding: '16px 20px', borderRadius: 16, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', position: 'relative', zIndex: 1 }} />
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10B981', opacity: 0.3, animation: 'pulse-ring 2s infinite' }} />
                </div>
                <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#34D399' }}>Gratuito para começar</p>
                    <p style={{ fontSize: 11, color: 'rgba(16,185,129,0.55)', marginTop: 1 }}>Crie sua loja em menos de 2 minutos</p>
                </div>
            </div>
        </div>
    );
}

// ─── Forgot password ──────────────────────────────────────────────────────────
function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
    // sub-step: 'email' → 'otp' → done (redirect to dashboard)
    const router = useRouter();
    const [subStep, setSubStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown <= 0) return;
        const t = setInterval(() => setCountdown(c => c - 1), 1000);
        return () => clearInterval(t);
    }, [countdown]);

    // Step 1 — request OTP via email
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault(); setError('');
        if (!email.includes('@')) { setError('E-mail inválido'); return; }
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { shouldCreateUser: false },
            });
            if (error) throw error;
            setCountdown(60);
            setSubStep('otp');
            toast.success('Código enviado! Verifique seu e-mail.');
        } catch (err: any) {
            setError(err.message?.includes('not found') || err.message?.includes('user')
                ? 'E-mail não cadastrado'
                : err.message || 'Erro ao enviar código');
        } finally { setLoading(false); }
    };

    // Step 2 — verify 6-digit OTP then go to dashboard
    const handleVerifyOtp = async () => {
        if (otp.length < 6) { setError('Digite o código completo'); return; }
        setLoading(true); setError('');
        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'magiclink',
            });
            if (error) throw error;
            toast.success('Acesso confirmado! 🎉');
            router.push('/dashboard');
        } catch (err: any) {
            setError('Código inválido ou expirado');
        } finally { setLoading(false); }
    };

    const handleResend = async () => {
        setLoading(true); setError(''); setOtp('');
        try {
            const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
            if (error) throw error;
            setCountdown(60);
            toast.success('Novo código enviado!');
        } catch { toast.error('Erro ao reenviar'); }
        finally { setLoading(false); }
    };

    // ── Step 1: email ──
    if (subStep === 'email') {
        return (
            <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div>
                    <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, padding: 0 }}>
                        <ArrowLeft size={13} />Voltar
                    </button>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.3px' }}>Redefinir senha</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        Informe seu e-mail. Enviaremos um código de 6 dígitos para confirmar seu acesso.
                    </p>
                </div>
                {error && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', fontSize: 13 }}>
                        <AlertCircle size={14} style={{ flexShrink: 0 }} />{error}
                    </div>
                )}
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <IconInput icon={Mail} label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={setEmail} required />
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading
                            ? <><Loader2 size={16} style={{ animation: 'spin-slow 1s linear infinite' }} />Enviando...</>
                            : <><Mail size={15} />Enviar código</>}
                    </button>
                </form>
            </div>
        );
    }

    // ── Step 2: OTP ──
    return (
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Lock size={26} color="#818CF8" />
                <div style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={10} color="white" />
                </div>
            </div>
            <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.3px' }}>Digite o código</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Código de 6 dígitos enviado para<br />
                    <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{email}</span>
                </p>
            </div>
            <div style={{ width: '100%' }}>
                <OTPInput value={otp} onChange={v => { setOtp(v); setError(''); }} length={6} />
                {error && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#FCA5A5', fontSize: 13 }}>
                        <AlertCircle size={13} />{error}
                    </div>
                )}
            </div>
            <button className="btn-primary" onClick={handleVerifyOtp} disabled={loading || otp.length < 6} style={{ width: '100%' }}>
                {loading
                    ? <><Loader2 size={16} style={{ animation: 'spin-slow 1s linear infinite' }} />Verificando...</>
                    : <><Shield size={16} />Confirmar e entrar</>}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Não recebeu?</span>
                {countdown > 0
                    ? <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Reenviar em {countdown}s</span>
                    : <button onClick={handleResend} disabled={loading} style={{ background: 'none', border: 'none', color: '#818CF8', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {loading ? <Loader2 size={12} style={{ animation: 'spin-slow 1s linear infinite' }} /> : <RefreshCw size={12} />}Reenviar
                    </button>}
            </div>
            <button onClick={() => { setSubStep('email'); setOtp(''); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ArrowLeft size={12} />Trocar e-mail
            </button>
        </div>
    );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginForm({ onSwitchToRegister, onForgotPassword }: { onSwitchToRegister: () => void; onForgotPassword: () => void }) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError('');
        if (!email || !password) { setError('Preencha todos os campos'); return; }
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            toast.success('Bem-vindo de volta! 👋');
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message?.includes('Invalid login credentials') ? 'E-mail ou senha incorretos' : err.message || 'Erro ao entrar');
        } finally { setLoading(false); }
    };

    return (
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.3px' }}>Entrar na sua conta</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Não tem conta?{' '}
                    <button onClick={onSwitchToRegister} style={{ background: 'none', border: 'none', color: '#818CF8', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Criar agora →</button>
                </p>
            </div>
            {error && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', fontSize: 13 }}><AlertCircle size={14} style={{ flexShrink: 0 }} />{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <IconInput icon={Mail} label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={setEmail} required />
                <IconInput icon={Lock} label="Senha" type="password" placeholder="Sua senha" value={password} onChange={setPassword} required />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={onForgotPassword} style={{ background: 'none', border: 'none', color: '#818CF8', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Esqueci minha senha</button>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? <><Loader2 size={16} style={{ animation: 'spin-slow 1s linear infinite' }} />Entrando...</> : <><ArrowRight size={16} />Entrar</>}
                </button>
            </form>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>OU</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[{ label: 'Google', logo: 'G' }, { label: 'Apple', logo: '🍎' }].map(({ label, logo }) => (
                    <button key={label} className="btn-ghost" style={{ fontSize: 13 }}><span style={{ fontSize: 14 }}>{logo}</span>{label}</button>
                ))}
            </div>
        </div>
    );
}

// ─── Register ─────────────────────────────────────────────────────────────────
function RegisterForm({ onSwitchToLogin, onSuccess }: { onSwitchToLogin: () => void; onSuccess: (email: string) => void }) {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Nome obrigatório';
        if (!form.email.includes('@')) e.email = 'E-mail inválido';
        if (form.password.length < 8) e.password = 'Mínimo 8 caracteres';
        else if (!/[A-Z]/.test(form.password)) e.password = 'Precisa de maiúscula';
        else if (!/[0-9]/.test(form.password)) e.password = 'Precisa de número';
        if (form.password !== form.confirm) e.confirm = 'Senhas não conferem';
        return e;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: form.email, password: form.password,
                options: { data: { name: form.name }, emailRedirectTo: `${window.location.origin}/auth/callback` },
            });
            if (error) throw error;
            onSuccess(form.email);
        } catch (err: any) {
            setErrors({ submit: err.message?.includes('already registered') ? 'E-mail já cadastrado' : err.message || 'Erro ao cadastrar' });
        } finally { setLoading(false); }
    };

    return (
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.3px' }}>Criar sua conta</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Já tem conta?{' '}
                    <button onClick={onSwitchToLogin} style={{ background: 'none', border: 'none', color: '#818CF8', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Entrar →</button>
                </p>
            </div>
            {errors.submit && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', fontSize: 13 }}><AlertCircle size={14} style={{ flexShrink: 0 }} />{errors.submit}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <IconInput icon={User} label="Nome completo" placeholder="João Silva" value={form.name} onChange={set('name')} required error={errors.name} />
                <IconInput icon={Mail} label="E-mail" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} required error={errors.email} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <IconInput icon={Lock} label="Senha" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={set('password')} required error={errors.password} />
                    <PasswordStrength password={form.password} />
                </div>
                <IconInput icon={Lock} label="Confirmar senha" type="password" placeholder="Repita a senha" value={form.confirm} onChange={set('confirm')} required error={errors.confirm} />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 2 }}>
                    Ao criar sua conta você concorda com nossos{' '}
                    <span style={{ color: '#818CF8', cursor: 'pointer' }}>Termos</span> e{' '}
                    <span style={{ color: '#818CF8', cursor: 'pointer' }}>Privacidade</span>.
                </p>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? <><Loader2 size={16} style={{ animation: 'spin-slow 1s linear infinite' }} />Criando...</> : <><Sparkles size={16} />Criar conta grátis</>}
                </button>
            </form>
        </div>
    );
}

// ─── Verify email ─────────────────────────────────────────────────────────────
function VerifyEmailForm({ email, onVerified, tk }: { email: string; onVerified: () => void; tk: Tok }) {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        const timer = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleVerify = async () => {
        if (otp.length < 6) { setError('Digite o código completo'); return; }
        setLoading(true); setError('');
        try {
            const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'signup' });
            if (error) throw error;
            toast.success('E-mail verificado! ✅');
            onVerified();
        } catch { setError('Código inválido ou expirado'); }
        finally { setLoading(false); }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await supabase.auth.resend({ type: 'signup', email });
            toast.success('Novo código enviado!');
            setCountdown(60); setOtp('');
        } catch { toast.error('Erro ao reenviar'); }
        finally { setResending(false); }
    };

    return (
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Mail size={28} color="#818CF8" />
                <div style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${tk.bg}` }}>
                    <Check size={10} color="white" />
                </div>
            </div>
            <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.3px' }}>Verificar e-mail</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Enviamos um código de 6 dígitos para<br />
                    <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{email}</span>
                </p>
            </div>
            <div style={{ width: '100%' }}>
                <OTPInput value={otp} onChange={setOtp} length={6} />
                {error && <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#FCA5A5', fontSize: 13 }}><AlertCircle size={13} />{error}</div>}
            </div>
            <button className="btn-primary" onClick={handleVerify} disabled={loading || otp.length < 6} style={{ width: '100%' }}>
                {loading ? <><Loader2 size={16} style={{ animation: 'spin-slow 1s linear infinite' }} />Verificando...</> : <><Shield size={16} />Verificar código</>}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Não recebeu?</span>
                {countdown > 0
                    ? <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Reenviar em {countdown}s</span>
                    : <button onClick={handleResend} disabled={resending} style={{ background: 'none', border: 'none', color: '#818CF8', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {resending ? <Loader2 size={12} style={{ animation: 'spin-slow 1s linear infinite' }} /> : <RefreshCw size={12} />}Reenviar
                    </button>}
            </div>
        </div>
    );
}

// ─── Create store ─────────────────────────────────────────────────────────────
const STORE_CATS = [
    { id: 'food', label: 'Alimentação', icon: '🍕', desc: 'Restaurante, lanche, delivery' },
    { id: 'retail', label: 'Varejo', icon: '🛍️', desc: 'Loja, produtos físicos' },
    { id: 'services', label: 'Serviços', icon: '✂️', desc: 'Salão, oficina, estética' },
    { id: 'other', label: 'Outro', icon: '📦', desc: 'Outro tipo de negócio' },
];

function CreateStoreForm({ onSuccess, tk }: { onSuccess: () => void; tk: Tok }) {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({ name: '', phone: '', category: '' as StoreCategory | '', address: '', city: '', state: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));
    const stepsLabels = ['Categoria', 'Dados', 'Endereço'];

    const next = () => {
        const e: Record<string, string> = {};
        if (step === 0 && !form.category) e.category = 'Selecione uma categoria';
        if (step === 1 && !form.name.trim()) e.name = 'Nome obrigatório';
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({}); setStep(s => s + 1);
    };

    const handleFinish = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Não autenticado');
            const { error } = await supabase.schema('core').from('stores').insert({
                user_id: user.id,
                name: form.name,
                phone: form.phone || null,
                address: form.address || null,
                city: form.city || null,
                state: form.state || null,
            });
            if (error) throw error;
            toast.success('Loja criada com sucesso! 🎉');
            onSuccess();
        } catch (err: any) { toast.error(err.message || 'Erro ao criar loja'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.3px' }}>Criar sua loja</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Configure seu negócio em 3 passos simples</p>
            </div>
            <StepIndicator steps={stepsLabels} current={step} tk={tk} />
            <div style={{ minHeight: 220 }}>
                {step === 0 && (
                    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-sec)' }}>Qual é o tipo do seu negócio?</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {STORE_CATS.map(cat => (
                                <div key={cat.id} className={`store-type-card${form.category === cat.id ? ' selected' : ''}`}
                                    onClick={() => setForm(f => ({ ...f, category: cat.id as StoreCategory }))}>
                                    <div style={{ fontSize: 26, marginBottom: 6 }}>{cat.icon}</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: form.category === cat.id ? '#a5b4fc' : 'var(--text-sec)' }}>{cat.label}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{cat.desc}</div>
                                    {form.category === cat.id && (
                                        <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Check size={10} color="white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.category && <p style={{ fontSize: 12, color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={12} />{errors.category}</p>}
                    </div>
                )}
                {step === 1 && (
                    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <IconInput icon={Store} label="Nome da loja" placeholder="Ex: Pizzaria do João" value={form.name} onChange={set('name')} required error={errors.name} />
                        <IconInput icon={Phone} label="Telefone / WhatsApp" placeholder="(00) 00000-0000" value={form.phone} onChange={set('phone')} />
                    </div>
                )}
                {step === 2 && (
                    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <IconInput icon={MapPin} label="Endereço" placeholder="Rua das Flores, 123" value={form.address} onChange={set('address')} hint="Opcional — pode preencher depois" />
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                            <IconInput icon={MapPin} label="Cidade" placeholder="Fortaleza" value={form.city} onChange={set('city')} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>UF</label>
                                <input className="input-field" placeholder="CE" maxLength={2} value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))} />
                            </div>
                        </div>
                        {form.name && (
                            <div style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                                    {STORE_CATS.find(c => c.id === form.category)?.icon}
                                </div>
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{form.name}</p>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {STORE_CATS.find(c => c.id === form.category)?.label}{form.city && ` · ${form.city}${form.state ? `/${form.state}` : ''}`}
                                    </p>
                                </div>
                                <CheckCircle2 size={18} color="#10B981" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
                {step > 0 && <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)}><ArrowLeft size={15} />Voltar</button>}
                {step < stepsLabels.length - 1
                    ? <button className="btn-primary" style={{ flex: 2 }} onClick={next}>Próximo <ArrowRight size={15} /></button>
                    : <button className="btn-primary" style={{ flex: step > 0 ? 2 : 1 }} onClick={handleFinish} disabled={loading}>
                        {loading ? <><Loader2 size={16} style={{ animation: 'spin-slow 1s linear infinite' }} />Criando...</> : <><Sparkles size={16} />Criar loja!</>}
                    </button>}
            </div>
        </div>
    );
}

// ─── Success screen ───────────────────────────────────────────────────────────
function SuccessScreen() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);
    const r = 28;
    const circ = 2 * Math.PI * r;

    useEffect(() => {
        const interval = setInterval(() => setCountdown(c => c - 1), 1000);
        const timeout = setTimeout(() => router.push('/dashboard'), 5000);
        return () => { clearInterval(interval); clearTimeout(timeout); };
    }, []);

    const filled = ((5 - countdown) / 5) * circ;

    return (
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 24, padding: '20px 0' }}>
            <div style={{ position: 'relative' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'step-pop .5s ease both', boxShadow: '0 8px 32px rgba(16,185,129,0.4)' }}>
                    <Check size={36} color="white" strokeWidth={3} />
                </div>
                <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '2px solid rgba(16,185,129,0.15)' }} />
            </div>
            <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Tudo pronto! 🎉</h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>Sua loja foi criada com sucesso.<br />Você será redirecionado em instantes.</p>
            </div>
            {/* Countdown ring */}
            <div style={{ position: 'relative', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="72" height="72" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                    <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="4" />
                    <circle cx="36" cy="36" r={r} fill="none" stroke="url(#cg)" strokeWidth="4"
                        strokeDasharray={circ} strokeDashoffset={circ - filled}
                        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
                    <defs>
                        <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366F1" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                    </defs>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{countdown}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 1 }}>seg</span>
                </div>
            </div>
            <button onClick={() => router.push('/dashboard')} className="btn-primary" style={{ width: 'auto', padding: '10px 28px' }}>
                <ArrowRight size={15} />Ir agora
            </button>
        </div>
    );
}

// ─── Progress header ──────────────────────────────────────────────────────────
function ProgressHeader({ step, tk }: { step: AuthStep; tk: Tok }) {
    const pct: Record<AuthStep, number> = { auth: 25, 'verify-email': 60, 'create-store': 88, done: 100, 'forgot-password': 25 };
    const labels = ['Conta', 'Verificação', 'Loja', 'Pronto!'];
    return (
        <div style={{ width: '100%', maxWidth: 420, marginBottom: 20 }}>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct[step]}%` }} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, fontWeight: 600, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {labels.map(l => <span key={l}>{l}</span>)}
            </div>
        </div>
    );
}

// ─── Root page ────────────────────────────────────────────────────────────────
export default function AuthPage() {
    const router = useRouter();
    const { theme, toggle, ready } = useTheme();
    const isDark = theme === 'dark';
    const tk = T[theme];

    const [step, setStep] = useState<AuthStep>('auth');
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [regEmail, setRegEmail] = useState('');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) router.push('/dashboard');
        });
    }, []);

    // Prevent flash of wrong theme before hydration
    if (!ready) return null;

    const css = buildCSS(tk, isDark);

    const rightContent = () => {
        if (step === 'done') return <SuccessScreen />;
        if (step === 'forgot-password') return <ForgotPasswordForm onBack={() => setStep('auth')} />;
        if (step === 'verify-email') return <VerifyEmailForm email={regEmail} onVerified={() => setStep('create-store')} tk={tk} />;
        if (step === 'create-store') return <CreateStoreForm onSuccess={() => setStep('done')} tk={tk} />;
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div className="tab-bar">
                    <button className={`tab-btn ${activeTab === 'login' ? 'active' : 'inactive'}`} onClick={() => setActiveTab('login')}>Entrar</button>
                    <button className={`tab-btn ${activeTab === 'register' ? 'active' : 'inactive'}`} onClick={() => setActiveTab('register')}>Criar conta</button>
                </div>
                {activeTab === 'login'
                    ? <LoginForm onSwitchToRegister={() => setActiveTab('register')} onForgotPassword={() => setStep('forgot-password')} />
                    : <RegisterForm onSwitchToLogin={() => setActiveTab('login')} onSuccess={email => { setRegEmail(email); setStep('verify-email'); }} />}
            </div>
        );
    };

    return (
        <>
            <style>{css}</style>
            <div className="auth-root noise-bg theme-in" style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
                <GridBackground tk={tk} />

                {/* ── Theme toggle ── */}
                <button className="theme-toggle" onClick={toggle} title={isDark ? 'Mudar para claro' : 'Mudar para escuro'}>
                    {isDark
                        ? <Sun size={16} />
                        : <Moon size={16} />}
                </button>

                <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', position: 'relative', zIndex: 1, minHeight: '100vh' }}>

                    {/* ── Left panel — always dark, desktop only ── */}
                    <div className="desktop-left" style={{ width: '45%', maxWidth: 480, flexShrink: 0, display: 'flex', alignItems: 'stretch', borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'}` }}>
                        <LeftPanel />
                    </div>

                    {/* ── Right panel ── */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', background: tk.rightBg, transition: 'background .3s' }}>

                        {/* Mobile logo — hidden on desktop via CSS */}
                        <div style={{ marginBottom: 24, display: 'none' }} className="mobile-logo">
                            <Logo size="md" />
                        </div>

                        {/* Progress bar (after register) */}
                        {regEmail && <ProgressHeader step={step} tk={tk} />}

                        {/* Main card */}
                        <div className="glass-card" style={{ width: '100%', maxWidth: 420, padding: '32px' }}>
                            {rightContent()}
                        </div>

                        {/* Footer links */}
                        {step === 'auth' && (
                            <div style={{ marginTop: 18, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                                {['Termos de Uso', 'Privacidade', 'Suporte'].map(link => (
                                    <button key={link}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: tk.textMuted, fontWeight: 500, transition: 'color .15s' }}
                                        onMouseEnter={e => (e.currentTarget.style.color = tk.textSec)}
                                        onMouseLeave={e => (e.currentTarget.style.color = tk.textMuted)}>
                                        {link}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}