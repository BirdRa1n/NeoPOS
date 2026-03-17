import { useRef } from 'react';

export function OTPInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('');

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...Array(length)].map((_, idx) => digits[idx] || '');
      if (next[i]) { next[i] = ''; onChange(next.join('')); }
      else if (i > 0) { next[i - 1] = ''; onChange(next.join('')); refs.current[i - 1]?.focus(); }
    }
  };

  const handleChange = (i: number, v: string) => {
    const char = v.replace(/\D/g, '').slice(-1);
    const next = [...Array(length)].map((_, idx) => digits[idx] || '');
    next[i] = char;
    onChange(next.join(''));
    if (char && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted.padEnd(length, '').slice(0, length));
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {Array.from({ length }).map((_, i) => (
        <input key={i} ref={el => { refs.current[i] = el; }}
          className={`otp-input${digits[i] ? ' filled' : ''}`}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i] || ''} onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)} onPaste={handlePaste} onFocus={e => e.target.select()} />
      ))}
    </div>
  );
}
