import { useState } from 'react';
import { supabase } from '@/supabase/client';
import toast from 'react-hot-toast';
import { Key, User, UserCheck, Loader2, AlertCircle } from 'lucide-react';
import { IconInput } from './IconInput';

export function JoinAsStaffForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({ invite_code: '', display_name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!form.invite_code.trim()) { setError('Informe o código de convite'); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) throw new Error('Configuração inválida');
      const url = new URL('/functions/v1/staff-request-join', supabaseUrl);
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ invite_code: form.invite_code.trim().toUpperCase(), display_name: form.display_name.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao enviar solicitação');
      toast.success('Solicitação enviada com sucesso!');
      onSuccess();
    } catch (err: any) { setError(err.message || 'Erro ao enviar solicitação'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.3px' }}>Entrar na equipe</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>Use o código de convite fornecido pelo administrador do restaurante.</p>
      </div>
      <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Key size={15} color="#34D399" style={{ marginTop: 1, flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: 'rgba(16,185,129,0.8)', lineHeight: 1.6 }}>
          Peça ao administrador o <strong style={{ color: '#34D399' }}>código de convite</strong>. Ele fica disponível na dashboard do restaurante.
        </p>
      </div>
      {error && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', fontSize: 13 }}><AlertCircle size={14} style={{ flexShrink: 0 }} />{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            Código de convite <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
              <Key size={15} color="var(--text-muted)" />
            </div>
            <input className="input-field input-with-icon" placeholder="Ex: INV-K8XM2QP1"
              value={form.invite_code}
              onChange={e => setForm(f => ({ ...f, invite_code: e.target.value.toUpperCase() }))}
              style={{ fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' }} />
          </div>
        </div>
        <IconInput icon={User} label="Como quer ser chamado? (opcional)" placeholder="Ex: João (Garçom)"
          value={form.display_name} onChange={v => setForm(f => ({ ...f, display_name: v }))} hint="Nome que aparecerá nos pedidos" />
        <button type="submit" className="btn-primary" disabled={loading} style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 4px 20px rgba(16,185,129,0.35)' }}>
          {loading ? <><Loader2 size={16} style={{ animation: 'spin-slow 1s linear infinite' }} />Enviando...</> : <><UserCheck size={16} />Enviar solicitação</>}
        </button>
      </form>
    </div>
  );
}
