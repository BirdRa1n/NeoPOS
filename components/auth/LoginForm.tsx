import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/supabase/client';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { IconInput } from './IconInput';

export function LoginForm({ onSwitchToRegister, onForgotPassword }: { onSwitchToRegister: () => void; onForgotPassword: () => void }) {
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
