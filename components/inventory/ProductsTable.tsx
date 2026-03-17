import { AlertTriangle, TrendingUp, Edit, ChevronUp, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { SortKey } from '@/types/inventory';
import { ProductStockItem } from '@/types/database';
import { StockStatusBadge } from './StockStatusBadge';
import { StockQuantityCell } from './StockQuantityCell';

const COLUMNS: { label: string; key: SortKey | null }[] = [
  { label: 'Produto', key: 'name' },
  { label: 'Categoria', key: null },
  { label: 'Estoque Atual', key: 'current_quantity' },
  { label: 'Mínimo', key: null },
  { label: 'Custo/Un.', key: null },
  { label: 'Valor Total', key: 'stock_value' },
  { label: 'Status', key: null },
  { label: '', key: null },
];

interface ProductsTableProps {
  products: ProductStockItem[];
  isDark: boolean;
  sortKey: SortKey;
  sortAsc: boolean;
  onSort: (key: SortKey) => void;
  onMovement: (p: ProductStockItem) => void;
  onEdit: (p: ProductStockItem) => void;
}

export function ProductsTable({ products, isDark, sortKey, sortAsc, onSort, onMovement, onEdit }: ProductsTableProps) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          {COLUMNS.map(({ label, key }) => (
            <th
              key={label}
              className={`px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider select-none ${key ? 'cursor-pointer' : ''}`}
              style={{ color: key && sortKey === key ? '#818CF8' : 'var(--text-label)' }}
              onClick={() => key && onSort(key)}
            >
              <span className="inline-flex items-center gap-1">
                {label}
                {key && (sortKey === key
                  ? (sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />)
                  : <ChevronDown size={11} style={{ opacity: 0.3 }} />
                )}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {products.map(p => {
          const isLow = p.below_minimum;
          const pct = p.minimum_quantity > 0 ? Math.min((p.current_quantity / (p.minimum_quantity * 2)) * 100, 100) : 100;

          return (
            <tr
              key={p.id}
              className="transition-colors"
              style={{ borderBottom: '1px solid var(--border-soft)', background: isLow ? (isDark ? 'rgba(239,68,68,0.04)' : 'rgba(239,68,68,0.025)') : 'transparent' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = isLow ? (isDark ? 'rgba(239,68,68,0.04)' : 'rgba(239,68,68,0.025)') : 'transparent')}
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  {isLow && <AlertTriangle size={13} style={{ color: '#EF4444', flexShrink: 0 }} />}
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                </div>
              </td>
              <td className="px-5 py-4">
                {p.category
                  ? <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)', color: '#818CF8' }}>{p.category}</span>
                  : <span style={{ color: 'var(--text-muted)' }}>—</span>
                }
              </td>
              <td className="px-5 py-4">
                <StockQuantityCell quantity={p.current_quantity} isLow={isLow} pct={pct} />
              </td>
              <td className="px-5 py-4" style={{ color: 'var(--text-secondary)' }}>{p.minimum_quantity}</td>
              <td className="px-5 py-4 font-medium" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(p.unit_cost)}</td>
              <td className="px-5 py-4 font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(p.stock_value)}</td>
              <td className="px-5 py-4"><StockStatusBadge isLow={isLow} isDark={isDark} /></td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1">
                  <ActionButton onClick={() => onMovement(p)} title="Registrar movimentação" hoverColor="#10B981" hoverBg="rgba(16,185,129,0.12)">
                    <TrendingUp size={14} />
                  </ActionButton>
                  <ActionButton onClick={() => onEdit(p)} title="Editar configurações" hoverColor="#818CF8" hoverBg="rgba(99,102,241,0.12)">
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
