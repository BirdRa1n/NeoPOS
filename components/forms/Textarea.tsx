import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full rounded-xl text-sm outline-none transition-all resize-none px-3.5 py-2.5 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] focus:border-indigo-500 min-h-[72px] ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
