import { ShoppingBag, Truck, Users, BarChart3, Check, Sparkles } from 'lucide-react';
import { AuthLogo } from './AuthLogo';

const FEATURES = [
  { icon: ShoppingBag, label: 'Gestão de pedidos em tempo real', color: '#6366F1' },
  { icon: Truck, label: 'Controle completo de entregas', color: '#8B5CF6' },
  { icon: Users, label: 'CRM e histórico de clientes', color: '#10B981' },
  { icon: BarChart3, label: 'Relatórios financeiros detalhados', color: '#F59E0B' },
];

export function LeftPanel() {
  return (
    <div style={{ flex: 1, alignSelf: 'stretch', minHeight: '100vh', padding: '48px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(160deg,#0A0D14 0%,#131729 100%)', position: 'relative' }}>
      <AuthLogo size="md" />
      <div style={{ marginTop: 40 }}>
        <div className="float-icon" style={{ display: 'inline-flex', marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={28} color="#818CF8" />
          </div>
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: 14, color: 'white' }}>
          <span className="shimmer-text">Gerencie seu negócio</span><br />
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>com inteligência</span>
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, maxWidth: 340 }}>
          Plataforma completa para restaurantes. Pedidos, entregas, estoque e muito mais num só lugar.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>
          {FEATURES.map(({ icon: Icon, label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={15} color={color} />
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.52)', fontWeight: 500 }}>{label}</span>
              <Check size={12} color={color} style={{ marginLeft: 'auto', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '16px 20px', borderRadius: 16, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', position: 'relative', zIndex: 1 }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10B981', opacity: 0.3, animation: 'pulse-ring 2s infinite' }} />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#34D399' }}>Gratuito para começar</p>
          <p style={{ fontSize: 11, color: 'rgba(16,185,129,0.55)', marginTop: 1 }}>Crie sua loja em menos de 2 minutos</p>
        </div>
      </div>
    </div>
  );
}
