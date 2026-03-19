import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  icon: React.FC<any>;
  iconColor: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, icon: Icon, iconColor, action, children, className }: SectionCardProps) {
  return (
    <div className={`rounded-2xl overflow-hidden flex flex-col ${className ?? ''}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${iconColor}15` }}>
            <Icon size={14} style={{ color: iconColor }} />
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</span>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
