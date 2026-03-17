import { useState } from 'react';
import { supabase } from '@/supabase/client';
import toast from 'react-hot-toast';
import { Store, Phone, MapPin, ArrowLeft, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Tok } from '@/types/auth';
import { IconInput } from './IconInput';
import { StepIndicator } from './StepIndicator';

const STEPS = ['Dados', 'Endereço'];

export function CreateStoreForm({ onSuccess, tk }: { onSuccess: () => void; tk: Tok }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', state: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const next = () => {
    const e: Record<string, string> = {};
    if (step === 0 && !form.name.trim()) e.name = 'Nome obrigatório';
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setStep(s => s + 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { error } = await supabase.schema('core').from('stores').insert({
        user_id: user.id, name: form.name,
        phone: form.phone || null, address: form.address || null,
        city: form.city || null, state: form.state || null,
      });
      if (error) throw error;
      toast.success('Restaurante criado com sucesso! 🎉');
      onSuccess();
    } catch (err: any) { toast.error(err.message || 'Erro ao criar restaurante'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.3px' }}>Criar seu restaurante</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Configure seu negócio em 2 passos</p>
      </div>
      <StepIndicator steps={STEPS} current={step} tk={tk} />
      <div style={{ minHeight: 200 }}>
        {step === 0 && (
          <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <IconInput icon={Store} label="Nome do restaurante" placeholder="Ex: Pizzaria do João" value={form.name} onChange={set('name')} required error={errors.name} />
            <IconInput icon={Phone} label="Telefone / WhatsApp" placeholder="(00) 00000-0000" value={form.phone} onChange={set('phone')} />
          </div>
        )}
        {step === 1 && (
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
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🍽️</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{form.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Restaurante{form.city && ` · ${form.city}${form.state ? `/${form.state}` : ''}`}
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
        {step < STEPS.length - 1
          ? <button className="btn-primary" style={{ flex: 2 }} onClick={next}>Próximo <ArrowRight size={15} /></button>
          : <button className="btn-primary" style={{ flex: step > 0 ? 2 : 1 }} onClick={handleFinish} disabled={loading}>
            {loading ? <><Loader2 size={16} style={{ animation: 'spin-slow 1s linear infinite' }} />Criando...</> : <><Sparkles size={16} />Criar restaurante!</>}
          </button>}
      </div>
    </div>
  );
}
