import { Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { OrderStatus } from '@/types';
import type { OrderType as StaffOrderType } from '@/contexts/StaffContext';
import { STATUS_TABS, ORDER_TYPE_ICON, ORDER_TYPE_LABELS } from '@/types/orders';

interface OrderFiltersProps {
  search: string;
  onSearch: (v: string) => void;
  selectedStatus: OrderStatus | 'all';
  onStatus: (v: OrderStatus | 'all') => void;
  typeFilter: StaffOrderType | 'all';
  onTypeFilter: (v: StaffOrderType | 'all') => void;
  availableTypes: StaffOrderType[];
}

export function OrderFilters({
  search, onSearch,
  selectedStatus, onStatus,
  typeFilter, onTypeFilter,
  availableTypes,
}: OrderFiltersProps) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Buscar por pedido, cliente..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none transition-all"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#6366F1')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')}
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {STATUS_TABS.map(({ value, label }) => {
            const active = selectedStatus === value;
            return (
              <button
                key={value}
                onClick={() => onStatus(value)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
                style={{
                  background: active ? 'rgba(99,102,241,0.2)' : 'var(--input-bg)',
                  color: active ? '#818CF8' : 'var(--text-muted)',
                  border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'var(--input-border)'}`,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {availableTypes.length > 0 && (
        <div className="flex items-center gap-2">
          <Filter size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <div className="flex gap-1.5 overflow-x-auto">
            <button
              onClick={() => onTypeFilter('all')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
              style={{
                background: typeFilter === 'all' ? 'rgba(99,102,241,0.15)' : 'var(--input-bg)',
                color: typeFilter === 'all' ? '#818CF8' : 'var(--text-muted)',
                border: `1px solid ${typeFilter === 'all' ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
              }}
            >
              Todos os tipos
            </button>
            {availableTypes.map(type => {
              const Icon = ORDER_TYPE_ICON[type];
              const active = typeFilter === type;
              return (
                <button
                  key={type}
                  onClick={() => onTypeFilter(type)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
                  style={{
                    background: active ? 'rgba(99,102,241,0.15)' : 'var(--input-bg)',
                    color: active ? '#818CF8' : 'var(--text-muted)',
                    border: `1px solid ${active ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                  }}
                >
                  <Icon size={11} /> {ORDER_TYPE_LABELS[type]}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
