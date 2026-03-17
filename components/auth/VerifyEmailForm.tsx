import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';
import toast from 'react-hot-toast';
import { Mail, Check, Loader2, AlertCircle, Shield, RefreshCw } from 'lucide-react';
import { Tok } from '@/types/auth';
import { OTPInput } from './OTPInput';

export function VerifyEmailForm({ email, onVerified, tk }: { email: string; onVerified: () => void; tk: Tok }) {
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
