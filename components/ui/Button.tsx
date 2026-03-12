import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:opacity-90',
      secondary: 'bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]',
      danger: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:opacity-90',
      ghost: 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
