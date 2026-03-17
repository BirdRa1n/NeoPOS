"use client";
import {
  CreateStoreForm,
  ForgotPasswordForm,
  GridBackground,
  JoinAsStaffForm,
  LeftPanel,
  LoginForm,
  ProgressHeader,
  RegisterForm,
  StaffPendingScreen, SuccessScreen,
  VerifyEmailForm,
  buildAuthCSS,
} from '@/components/auth';
import { useAuthTheme } from '@/hooks/useAuthTheme';
import { supabase } from '@/supabase/client';
import { AUTH_TOKENS, AccountType, AuthStep } from '@/types/auth';
import { Moon, Sun } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function AuthPage() {
  const router = useRouter();
  const { theme, mode, cycleMode, ready } = useAuthTheme();
  const isDark = theme === 'dark';
  const tk = AUTH_TOKENS[theme];

  const [step, setStep] = useState<AuthStep>('auth');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [regEmail, setRegEmail] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('');

  useEffect(() => {
    // Aguarda o router estar pronto para ler query params
    if (!router.isReady) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // ── Retomada de onboarding incompleto ──────────────────────────────
        // Se o usuário voltou da tela de onboarding incompleto com ?resume=
        const resume = router.query.resume as string | undefined;
        if (resume === 'owner') {
          // Usuário já logado, pula direto para criar loja
          setRegEmail(session.user.email ?? '');
          setAccountType('owner');
          setStep('create-store');
          return;
        }
        if (resume === 'staff') {
          // Usuário já logado, pula direto para entrar na equipe
          setRegEmail(session.user.email ?? '');
          setAccountType('staff');
          setStep('join-staff');
          return;
        }
        // ── Sem resume: redireciona normalmente ────────────────────────────
        router.push('/dashboard');
      }
      // Sem sessão: permanece na tela de auth normalmente
    });
  }, [router.isReady, router.query.resume]);

  useEffect(() => {
    const bgColor = isDark ? '#080B12' : '#F1F4FA';
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', bgColor);
  }, [theme]);

  if (!ready) return null;

  const getThemeIcon = () => mode === 'auto' ? '🌓' : mode === 'light' ? <Sun size={16} /> : <Moon size={16} />;
  const getThemeLabel = () => mode === 'auto' ? 'Auto' : mode === 'light' ? 'Claro' : 'Escuro';

  const handleRegisterSuccess = (email: string, type: AccountType) => {
    setRegEmail(email);
    setAccountType(type);
    setStep('verify-email');
  };

  const handleEmailVerified = () => {
    setStep(accountType === 'staff' ? 'join-staff' : 'create-store');
  };

  const renderContent = () => {
    if (step === 'done') return <SuccessScreen />;
    if (step === 'staff-pending') return <StaffPendingScreen />;
    if (step === 'forgot-password') return <ForgotPasswordForm onBack={() => setStep('auth')} />;
    if (step === 'verify-email') return <VerifyEmailForm email={regEmail} onVerified={handleEmailVerified} tk={tk} />;
    if (step === 'create-store') return <CreateStoreForm onSuccess={() => setStep('done')} tk={tk} />;
    if (step === 'join-staff') return <JoinAsStaffForm onSuccess={() => setStep('staff-pending')} />;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div className="tab-bar">
          <button className={`tab-btn ${activeTab === 'login' ? 'active' : 'inactive'}`} onClick={() => setActiveTab('login')}>Entrar</button>
          <button className={`tab-btn ${activeTab === 'register' ? 'active' : 'inactive'}`} onClick={() => setActiveTab('register')}>Criar conta</button>
        </div>
        {activeTab === 'login'
          ? <LoginForm onSwitchToRegister={() => setActiveTab('register')} onForgotPassword={() => setStep('forgot-password')} />
          : <RegisterForm onSwitchToLogin={() => setActiveTab('login')} onSuccess={handleRegisterSuccess} />}
      </div>
    );
  };

  // Mostra o ProgressHeader apenas quando há um email de cadastro em andamento
  // OU quando está em passo de retomada de onboarding
  const showProgress = !!regEmail && step !== 'auth';

  return (
    <>
      <style>{buildAuthCSS(tk, isDark)}</style>
      <div className="auth-root noise-bg theme-in" style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
        <GridBackground tk={tk} />

        <button className="theme-toggle" onClick={cycleMode} title={`Tema: ${getThemeLabel()}`}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, width: 48, height: 48 }}>
          <span style={{ fontSize: 16 }}>{getThemeIcon()}</span>
          <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>{getThemeLabel()}</span>
        </button>

        <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', position: 'relative', zIndex: 1, minHeight: '100vh' }}>
          <div className="desktop-left" style={{ width: '45%', maxWidth: 480, flexShrink: 0, display: 'flex', alignItems: 'stretch', borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'}` }}>
            <LeftPanel />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', background: tk.rightBg, transition: 'background .3s' }}>
            <div style={{ marginBottom: 24, display: 'none' }} className="mobile-logo" />

            {showProgress && (
              <ProgressHeader step={step} accountType={accountType} tk={tk} />
            )}

            <div className="glass-card" style={{ width: '100%', maxWidth: 420, padding: '32px' }}>
              {renderContent()}
            </div>

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