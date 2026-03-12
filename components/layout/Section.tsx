import { ReactNode } from 'react';
import { Card } from '../ui/Card';

interface SectionProps {
  title: string;
  icon: React.FC<any>;
  iconColor: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Section({ title, icon: Icon, iconColor, action, children }: SectionProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${iconColor}15` }}
          >
            <Icon size={14} style={{ color: iconColor }} />
          </div>
          <span className="text-sm font-bold text-[var(--text-primary)]">{title}</span>
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}
