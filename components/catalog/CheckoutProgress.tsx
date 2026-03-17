import { CheckCircle } from 'lucide-react';
import { CheckoutSub, STEP_LABELS, CatalogTheme } from '@/types/catalog';

interface CheckoutProgressProps {
  steps: CheckoutSub[];
  current: CheckoutSub;
  theme: CatalogTheme;
}

export function CheckoutProgress({ steps, current, theme }: CheckoutProgressProps) {
  const currentIdx = steps.indexOf(current);
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div className={`prog-dot ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : 'pending'}`}>
              {i < currentIdx ? <CheckCircle size={14} /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className="prog-line" style={{ flex: 1, margin: '0 6px' }}>
                <div className="prog-line-fill" style={{ width: i < currentIdx ? '100%' : '0%' }} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {steps.map((s, i) => (
          <span key={s} style={{ fontSize: 10, fontWeight: i === currentIdx ? 700 : 500, color: i === currentIdx ? theme.primary_color : 'rgba(0,0,0,.3)', textAlign: 'center', flex: 1 }}>
            {STEP_LABELS[s]}
          </span>
        ))}
      </div>
    </div>
  );
}
