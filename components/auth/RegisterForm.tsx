import { useState } from 'react';
import { supabase } from '@/supabase/client';
import { User, Mail, Lock, Sparkles, Loader2, AlertCircle, Building2, UserCheck, ChevronRight } from 'lucide-react';
import { AccountType } from '@/types/auth';
import { IconInput } from './IconInput';
import { PasswordStrength } from './PasswordStrength';

export function RegisterForm({ onSwitchToLogin, onSuccess }: {
  onSwitchToLogin: () => void;
  onSuccess: (email: string, accountType: AccountType) => void;
}) {
  const [accountType, setAccountType] = useState<AccountType>('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!accountType) e.accountType = 'Selecione um tipo de conta';
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
        options: {
          data: { name: form.name, account_type: accountType },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      onSuccess(form.email, accountType);
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
          Tipo de conta{errors.accountType && <span style={{ color: '#FCA5A5', marginLeft: 8, textTransform: 'none', fontSize: 11 }}>— {errors.accountType}</span>}
        </label>
        <button type="button" className={`type-card${accountType === 'owner' ? ' selected' : ''}`}
          onClick={() => { setAccountType('owner'); setErrors(p => ({ ...p, accountType: '' })); }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: accountType === 'owner' ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.08)', border: `1px solid ${accountType === 'owner' ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
            <Building2 size={18} color={accountType === 'owner' ? '#818CF8' : 'var(--text-muted)'} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: accountType === 'owner' ? '#a5b4fc' : 'var(--text)', marginBottom: 2 }}>Sou dono de restaurante</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Criar e gerenciar meu negócio</p>
          </div>
          <ChevronRight size={16} color={accountType === 'owner' ? '#818CF8' : 'var(--text-muted)'} style={{ flexShrink: 0, transition: 'transform .2s', transform: accountType === 'owner' ? 'translateX(2px)' : 'none' }} />
        </button>
        <button type="button" className={`type-card${accountType === 'staff' ? ' selected' : ''}`}
          onClick={() => { setAccountType('staff'); setErrors(p => ({ ...p, accountType: '' })); }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: accountType === 'staff' ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.08)', border: `1px solid ${accountType === 'staff' ? 'rgba(16,185,129,0.5)' : 'rgba(16,185,129,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
            <UserCheck size={18} color={accountType === 'staff' ? '#34D399' : 'var(--text-muted)'} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: accountType === 'staff' ? '#6EE7B7' : 'var(--text)', marginBottom: 2 }}>Sou funcionário</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Entrar em uma equipe com código de convite</p>
          </div>
          <ChevronRight size={16} color={accountType === 'staff' ? '#34D399' : 'var(--text-muted)'} style={{ flexShrink: 0, transition: 'transform .2s', transform: accountType === 'staff' ? 'translateX(2px)' : 'none' }} />
        </button>
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
