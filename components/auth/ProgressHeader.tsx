import { AuthStep, AccountType, Tok } from '@/types/auth';

export function ProgressHeader({ step, accountType, tk }: { step: AuthStep; accountType: AccountType; tk: Tok }) {
  const isStaff = accountType === 'staff';
  const ownerPct: Record<AuthStep, number> = { auth: 25, 'verify-email': 55, 'create-store': 82, done: 100, 'forgot-password': 25, 'join-staff': 82, 'staff-pending': 100 };
  const staffPct: Record<AuthStep, number> = { auth: 25, 'verify-email': 55, 'join-staff': 82, 'staff-pending': 100, done: 100, 'forgot-password': 25, 'create-store': 82 };
  const pct = isStaff ? staffPct[step] : ownerPct[step];
  const labels = isStaff ? ['Conta', 'Verificação', 'Equipe', 'Aguardando'] : ['Conta', 'Verificação', 'Restaurante', 'Pronto!'];
  return (
    <div style={{ width: '100%', maxWidth: 420, marginBottom: 20 }}>
      <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, fontWeight: 600, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {labels.map(l => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}
