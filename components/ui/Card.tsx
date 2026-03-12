import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--surface-box)] ${hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
