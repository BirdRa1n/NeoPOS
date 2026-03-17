'use client';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import type { OrderStatus } from '@/types';
import type { OrderType as StaffOrderType } from '@/contexts/StaffContext';
import { STATUS_TABS, ORDER_TYPE_ICON, ORDER_TYPE_LABELS } from '@/types/orders';
import { COLORS, ALPHA } from '@/lib/constants';
import { useIsDark } from '@/hooks/useIsDark';

export type DateRange = 'today' | '7d' | '30d' | 'all';

const DATE_RANGE_LABELS: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: '7d',    label: 'Últimos 7 dias' },
  { value: '30d',   label: 'Últimos 30 dias' },
  { value: 'all',   label: 'Todo o histórico' },
];

export interface FilterState {
  selectedStatus: OrderStatus | 'all';
  typeFilter: StaffOrderType | 'all';
  dateRange: DateRange;
}

interface OrderFiltersProps {
  search: string;
  onSearch: (v: string) => void;
  filters: FilterState;
  onFilters: (f: FilterState) => void;
  availableTypes: StaffOrderType[];
}

export function OrderFilters({ search, onSearch, filters, onFilters, availableTypes }: OrderFiltersProps) {
  const isDark = useIsDark();
  const [open, setOpen] = useState(false);
  // draft state inside modal
  const [draft, setDraft] = useState<FilterState>(filters);

  const activeCount = (
    (filters.selectedStatus !== 'all' ? 1 : 0) +
    (filters.typeFilter !== 'all' ? 1 : 0) +
    (filters.dateRange !== 'today' ? 1 : 0)
  );

  function openModal() { setDraft(filters); setOpen(true); }
  function apply() { onFilters(draft); setOpen(false); }
  function clear() { const reset: FilterState = { selectedStatus: 'all', typeFilter: 'all', dateRange: 'today' }; setDraft(reset); onFilters(reset); setOpen(false); }

  return (
    <>
      <Card className="p-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => onSearch(e.target.value)}
              placeholder="Buscar por pedido, cliente..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none transition-all"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
              onFocus={e => (e.currentTarget.style.borderColor = COLORS.accent)}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')}
            />
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shrink-0"
            style={{
              background: activeCount > 0 ? (isDark ? ALPHA.accentBgD : ALPHA.accentBgL) : 'var(--input-bg)',
              border: `1px solid ${activeCount > 0 ? COLORS.accent : 'var(--input-border)'}`,
              color: activeCount > 0 ? COLORS.accentLight : 'var(--text-muted)',
            }}
          >
            <SlidersHorizontal size={14} />
            Filtros
            {activeCount > 0 && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white"
                style={{ background: COLORS.accent }}>
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </Card>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 24px 48px rgba(0,0,0,0.3)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: isDark ? ALPHA.accentBgD : ALPHA.accentBgL }}>
                  <SlidersHorizontal size={14} style={{ color: COLORS.accentLight }} />
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Filtros</span>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'var(--surface-hover)', color: 'var(--text-primary)' })}
                onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}>
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Período */}
              <Section label="Período">
                <div className="grid grid-cols-2 gap-2">
                  {DATE_RANGE_LABELS.map(({ value, label }) => (
                    <OptionBtn key={value} active={draft.dateRange === value} onClick={() => setDraft(d => ({ ...d, dateRange: value }))}>
                      {label}
                    </OptionBtn>
                  ))}
                </div>
              </Section>

              {/* Status */}
              <Section label="Status">
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_TABS.map(({ value, label }) => (
                    <OptionBtn key={value} active={draft.selectedStatus === value} onClick={() => setDraft(d => ({ ...d, selectedStatus: value }))}>
                      {label}
                    </OptionBtn>
                  ))}
                </div>
              </Section>

              {/* Tipo */}
              {availableTypes.length > 0 && (
                <Section label="Tipo de pedido">
                  <div className="grid grid-cols-2 gap-2">
                    <OptionBtn active={draft.typeFilter === 'all'} onClick={() => setDraft(d => ({ ...d, typeFilter: 'all' }))}>
                      Todos
                    </OptionBtn>
                    {availableTypes.map(type => {
                      const Icon = ORDER_TYPE_ICON[type];
                      return (
                        <OptionBtn key={type} active={draft.typeFilter === type} onClick={() => setDraft(d => ({ ...d, typeFilter: type }))}>
                          <Icon size={12} /> {ORDER_TYPE_LABELS[type]}
                        </OptionBtn>
                      );
                    })}
                  </div>
                </Section>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-2 px-5 pb-5">
              <button onClick={clear}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                Limpar
              </button>
              <button onClick={apply}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: COLORS.accentGradient }}>
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {children}
    </div>
  );
}

function OptionBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
      style={{
        background: active ? (COLORS.accent + '18') : 'var(--input-bg)',
        border: `1.5px solid ${active ? COLORS.accent : 'var(--border)'}`,
        color: active ? COLORS.accentLight : 'var(--text-muted)',
      }}>
      {children}
    </button>
  );
}
