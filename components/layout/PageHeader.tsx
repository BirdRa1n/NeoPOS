import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{title}</h1>
        {subtitle && <p className="text-xs mt-0.5 text-[var(--text-muted)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
