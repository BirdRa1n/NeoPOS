import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface IconInputProps {
  icon: React.FC<any>;
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
}

export function IconInput({ icon: Icon, label, type = 'text', placeholder, value, onChange, required, error, hint, disabled }: IconInputProps) {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          {label}{required && <span style={{ color: '#EF4444' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
          <Icon size={15} color="var(--text-muted)" />
        </div>
        <input
          className="input-field input-with-icon"
          type={isPass && show ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          style={{ paddingRight: isPass ? 44 : 14, ...(error ? { borderColor: 'rgba(239,68,68,0.5)', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}) }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex' }}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      {error && <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#FCA5A5', fontSize: 12 }}><AlertCircle size={12} />{error}</div>}
      {hint && !error && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  );
}
