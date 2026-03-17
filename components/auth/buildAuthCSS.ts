import { Tok } from '@/types/auth';

export function buildAuthCSS(tk: Tok, isDark: boolean) {
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

.type-card{
  padding:18px 16px;border-radius:16px;border:1.5px solid ${tk.typeCardBorder};
  background:${tk.typeCardBg};cursor:pointer;
  transition:all .2s;text-align:left;position:relative;width:100%;
  display:flex;align-items:center;gap:14px;
}
.type-card:hover{border-color:rgba(99,102,241,0.35);background:${tk.typeCardHover};}
.type-card.selected{border-color:var(--accent);background:rgba(99,102,241,0.08);box-shadow:0 0 0 3px rgba(99,102,241,0.10);}

.theme-toggle{
  position:fixed;top:20px;right:20px;z-index:100;
  width:48px;height:48px;background:${tk.toggleBg};border:1px solid ${tk.toggleBorder};
  border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
  cursor:pointer;transition:all .2s;color:${tk.toggleColor};
}
.theme-toggle:hover{transform:scale(1.08);}

@media(max-width:768px){
  .desktop-left{display:none!important;}
  .mobile-logo{display:flex!important;}
  .theme-toggle{top:16px;right:16px;}
}
`;
}
