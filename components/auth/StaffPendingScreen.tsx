import { useRouter } from 'next/router';
import { UserCheck, ArrowLeft } from 'lucide-react';

export function StaffPendingScreen() {
  const router = useRouter();
  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 24, padding: '20px 0' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#F59E0B,#D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'step-pop .5s ease both', boxShadow: '0 8px 32px rgba(245,158,11,0.4)' }}>
          <UserCheck size={36} color="white" strokeWidth={2.5} />
        </div>
        <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '2px solid rgba(245,158,11,0.15)' }} />
      </div>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Solicitação enviada! 🎉</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 300 }}>
          Sua solicitação foi enviada ao administrador.<br />Você receberá acesso assim que ele aprovar.
        </p>
      </div>
      <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', width: '100%', textAlign: 'left' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#FCD34D', marginBottom: 4 }}>O que acontece agora?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['O admin recebe uma notificação', 'Ele aprova sua solicitação na dashboard', 'Você recebe acesso e pode fazer login'].map((txt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#FCD34D' }}>{i + 1}</span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(245,158,11,0.7)', lineHeight: 1.5 }}>{txt}</p>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => router.push('/')} className="btn-ghost" style={{ width: '100%' }}>
        <ArrowLeft size={15} />Voltar para o login
      </button>
    </div>
  );
}
