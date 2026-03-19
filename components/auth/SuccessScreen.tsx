import { useState, useEffect } from 'react';
import { Check, ArrowRight } from 'lucide-react';

export function SuccessScreen() {
  const [countdown, setCountdown] = useState(5);
  const r = 28;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    const interval = setInterval(() => setCountdown(c => c - 1), 1000);
    const timeout = setTimeout(() => { window.location.href = '/'; }, 5000);
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
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>Seu restaurante foi criado com sucesso.<br />Você será redirecionado em instantes.</p>
      </div>
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
      <button onClick={() => { window.location.href = '/'; }} className="btn-primary" style={{ width: 'auto', padding: '10px 28px' }}>
        <ArrowRight size={15} />Ir agora
      </button>
    </div>
  );
}
