import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: React.FC<any>;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Icon size={36} className="text-[var(--text-muted)] opacity-30" />
      <p className="text-sm font-medium text-[var(--text-muted)]">{message}</p>
      {action}
    </div>
  );
}
