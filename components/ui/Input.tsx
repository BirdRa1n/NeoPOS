import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.FC<any>;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon: Icon, className = '', ...props }, ref) => {
    return (
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon size={13} style={{ color: 'var(--text-muted)' }} />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full rounded-xl text-sm outline-none transition-all ${Icon ? 'pl-9' : 'pl-3.5'} pr-3.5 py-2.5 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] focus:border-indigo-500 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
