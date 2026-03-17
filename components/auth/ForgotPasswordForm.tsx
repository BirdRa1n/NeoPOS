import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/supabase/client';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2, AlertCircle, Shield, RefreshCw, ArrowLeft } from 'lucide-react';
import { IconInput } from './IconInput';
import { OTPInput } from './OTPInput';

export function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!email.includes('@')) { setError('E-mail inválido'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
      if (error) throw error;
      setCountdown(60); setSubStep('otp');
      toast.success('Código enviado! Verifique seu e-mail.');
    } catch (err: any) {
      setError(err.message?.includes('not found') || err.message?.includes('user') ? 'E-mail não cadastrado' : err.message || 'Erro ao enviar código');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) { setError('Digite o código completo'); return; }
    setLoading(true); setError('');
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'magiclink' });
      if (error) throw error;
      toast.success('Acesso confirmado! 🎉');
      router.push('/dashboard');
    } catch { setError('Código inválido ou expirado'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setLoading(true); setError(''); setOtp('');
    try {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
      if (error) throw error;
      setCountdown(60); toast.success('Novo código enviado!');
    } catch { toast.error('Erro ao reenviar'); }
    finally { setLoading(false); }
  };

  if (subStep === 'email') return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, padding: 0 }}>
          <ArrowLeft size={13} />Voltar
        </button>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.3px' }}>Redefinir senha</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>Informe seu e-mail. Enviaremos um código de 6 dígitos para confirmar seu acesso.</p>
      </div>
      {error && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', fontSize: 13 }}><AlertCircle size={14} style={{ flexShrink: 0 }} />{error}</div>}
      <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <IconInput icon={Mail} label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={setEmail} required />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <><Loader2 size={16} style={{ animation: 'spin-slow 1s linear infinite' }} />Enviando...</> : <><Mail size={15} />Enviar código</>}
        </button>
      </form>
    </div>
  );

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
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>Código de 6 dígitos enviado para<br /><span style={{ color: '#a5b4fc', fontWeight: 600 }}>{email}</span></p>
      </div>
      <div style={{ width: '100%' }}>
        <OTPInput value={otp} onChange={v => { setOtp(v); setError(''); }} length={6} />
        {error && <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#FCA5A5', fontSize: 13 }}><AlertCircle size={13} />{error}</div>}
      </div>
      <button className="btn-primary" onClick={handleVerifyOtp} disabled={loading || otp.length < 6} style={{ width: '100%' }}>
        {loading ? <><Loader2 size={16} style={{ animation: 'spin-slow 1s linear infinite' }} />Verificando...</> : <><Shield size={16} />Confirmar e entrar</>}
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
