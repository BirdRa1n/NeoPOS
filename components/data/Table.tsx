import { ReactNode } from 'react';
import { Card } from '../ui/Card';

interface TableProps {
  headers: string[];
  children: ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export function Table({ headers, children, emptyMessage = 'Nenhum dado encontrado', isEmpty }: TableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--text-label)]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-[var(--text-muted)]">{emptyMessage}</p>
        </div>
      )}
    </Card>
  );
}

interface TableRowProps {
  children: ReactNode;
  onClick?: () => void;
}

export function TableRow({ children, onClick }: TableRowProps) {
  return (
    <tr
      className="transition-colors border-b border-[var(--border-soft)] hover:bg-[var(--surface-hover)] cursor-pointer"
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return <td className={`px-5 py-4 ${className}`}>{children}</td>;
}
