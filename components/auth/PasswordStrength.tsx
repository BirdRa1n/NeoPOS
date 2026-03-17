import { Check } from 'lucide-react';

export function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ chars', ok: password.length >= 8 },
    { label: 'A-Z', ok: /[A-Z]/.test(password) },
    { label: '0-9', ok: /[0-9]/.test(password) },
    { label: '#!@', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const cols = ['#EF4444', '#EF4444', '#F59E0B', '#10B981', '#10B981'];
  if (!password) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= score ? cols[score] : 'var(--border)', transition: 'background .3s' }} />
        ))}
        <span style={{ fontSize: 10, fontWeight: 700, color: cols[score], marginLeft: 6, minWidth: 36 }}>
          {['', 'Fraca', 'Regular', 'Boa', 'Forte'][score]}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {checks.map(c => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <div style={{ width: 14, height: 14, borderRadius: 99, background: c.ok ? 'rgba(16,185,129,0.15)' : 'transparent', border: `1px solid ${c.ok ? '#10B981' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
              {c.ok && <Check size={8} color="#10B981" />}
            </div>
            <span style={{ color: c.ok ? 'var(--text-sec)' : 'var(--text-muted)' }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
