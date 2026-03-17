import { Box } from 'lucide-react';

export function AuthLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'lg' ? 44 : size === 'md' ? 36 : 28;
  const fs = size === 'lg' ? 22 : size === 'md' ? 18 : 14;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: s, height: s, borderRadius: s * 0.28, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.4)', flexShrink: 0 }}>
        <Box width={s * 0.5} height={s * 0.5} color="#fff" />
      </div>
      <span style={{ fontSize: fs, fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>
        Neo<span style={{ color: '#818CF8' }}>Delivery</span>
      </span>
    </div>
  );
}
