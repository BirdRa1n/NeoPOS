import { AlertTriangle, TrendingUp, Edit } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { UNIT_LABELS, UnitType } from '@/types/inventory';
import { StockStatusBadge } from './StockStatusBadge';
import { StockQuantityCell } from './StockQuantityCell';

const HEADERS = ['Insumo', 'Unidade', 'Estoque Atual', 'Mínimo', 'Custo/Un.', 'Valor Total', 'Status', ''];

interface SuppliesTableProps {
  supplies: any[];
  isDark: boolean;
  onMovement: (supply: any) => void;
  onEdit: (supply: any) => void;
}

export function SuppliesTable({ supplies, isDark, onMovement, onEdit }: SuppliesTableProps) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          {HEADERS.map(h => (
            <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-label)' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {supplies.map(supply => {
          const currentQty = supply.current_quantity ?? 0;
          const minQty = supply.minimum_quantity ?? 0;
          const cost = supply.unit_cost ?? 0;
          const isLow = currentQty <= minQty;
          const pct = minQty > 0 ? Math.min((currentQty / (minQty * 2)) * 100, 100) : 100;

          return (
            <tr
              key={supply.id}
              className="transition-colors"
              style={{ borderBottom: '1px solid var(--border-soft)', background: isLow ? (isDark ? 'rgba(239,68,68,0.04)' : 'rgba(239,68,68,0.025)') : 'transparent' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = isLow ? (isDark ? 'rgba(239,68,68,0.04)' : 'rgba(239,68,68,0.025)') : 'transparent')}
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  {isLow && <AlertTriangle size={13} style={{ color: '#EF4444', flexShrink: 0 }} />}
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{supply.name}</span>
                </div>
              </td>
              <td className="px-5 py-4" style={{ color: 'var(--text-secondary)' }}>
                {UNIT_LABELS[supply.unit as UnitType] ?? supply.unit}
              </td>
              <td className="px-5 py-4">
                <StockQuantityCell quantity={currentQty} isLow={isLow} pct={pct} />
              </td>
              <td className="px-5 py-4" style={{ color: 'var(--text-secondary)' }}>{minQty}</td>
              <td className="px-5 py-4 font-medium" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(cost)}</td>
              <td className="px-5 py-4 font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(currentQty * cost)}</td>
              <td className="px-5 py-4"><StockStatusBadge isLow={isLow} isDark={isDark} /></td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1">
                  <ActionButton onClick={() => onMovement(supply)} title="Registrar movimentação" hoverColor="#10B981" hoverBg="rgba(16,185,129,0.12)">
                    <TrendingUp size={14} />
                  </ActionButton>
                  <ActionButton onClick={() => onEdit(supply)} title="Editar insumo" hoverColor="#818CF8" hoverBg="rgba(99,102,241,0.12)">
                    <Edit size={14} />
                  </ActionButton>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ActionButton({ onClick, title, hoverColor, hoverBg, children }: {
  onClick: () => void; title: string; hoverColor: string; hoverBg: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: hoverBg, color: hoverColor })}
      onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}
    >
      {children}
    </button>
  );
}
