import { Check } from 'lucide-react';
import { Tok } from '@/types/auth';

export function StepIndicator({ steps, current, tk }: { steps: string[]; current: number; tk: Tok }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {steps.map((label, i) => {
        const done = i < current, active = i === current;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div className={done ? 'step-pop' : ''} style={{
                width: 28, height: 28, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                background: done ? 'linear-gradient(135deg,#10B981,#059669)' : active ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : tk.stepInactive,
                border: done || active ? 'none' : `1px solid ${tk.stepInactiveBorder}`,
                color: done || active ? 'white' : tk.stepInactiveText,
                boxShadow: active ? '0 0 0 4px rgba(99,102,241,0.2)' : 'none',
                transition: 'all .3s',
              }}>
                {done ? <Check size={13} /> : i + 1}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', color: active ? '#a5b4fc' : done ? '#6EE7B7' : tk.stepInactiveText }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1, margin: '0 6px', marginBottom: 18, background: done ? 'rgba(16,185,129,0.4)' : tk.border, transition: 'background .4s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
