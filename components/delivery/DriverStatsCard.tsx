'use client';
import { useState } from 'react';
import { formatCurrency } from '@/lib/utils/format';
import { COLORS } from '@/lib/constants';
import { memberName } from '@/hooks/useActiveStaffMembers';
import {
  Truck, Bike, Edit, DollarSign, Trash2, Link2,
  Activity, ChevronDown, ChevronUp, Clock, Calendar, BarChart3, Award,
} from 'lucide-react';
import type { DriverStats } from '@/types/delivery';
import type { StaffMember } from '@/types';

interface Props {
  stats: DriverStats;
  isDark: boolean;
  staffMembers: StaffMember[];
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

type Period = 'today' | 'week' | 'month' | 'year';

export function DriverStatsCard({ stats, isDark, staffMembers, isAdmin, onEdit, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [period, setPeriod] = useState<Period>('week');

  const linked = staffMembers.find(m => m.id === stats.staff_member_id);
  const periods = {
    today: { deliveries: stats.deliveries_today, fee: stats.fee_today, label: 'Hoje' },
    week: { deliveries: stats.deliveries_week, fee: stats.fee_week, label: 'Semana' },
    month: { deliveries: stats.deliveries_month, fee: stats.fee_month, label: 'Mês' },
    year: { deliveries: stats.deliveries_year, fee: stats.fee_year, label: 'Ano' },
  };
  const cur = periods[period];

  return (
    <div className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>

      <div className="flex items-start gap-3 p-5">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0"
          style={{ background: stats.active ? 'linear-gradient(135deg,#8B5CF6,#7C3AED)' : (isDark ? 'rgba(107,114,128,0.2)' : 'rgba(107,114,128,0.15)') }}>
          {stats.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{stats.name}</p>
              {stats.phone && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{stats.phone}</p>}
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
              style={{
                background: stats.active ? (isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)') : (isDark ? 'rgba(107,114,128,0.12)' : 'rgba(107,114,128,0.08)'),
                color: stats.active ? '#10B981' : (isDark ? '#9CA3AF' : '#6B7280'),
              }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: stats.active ? '#10B981' : '#6B7280' }} />
              {stats.active ? 'Disponível' : 'Inativo'}
            </span>
          </div>
          {(stats.vehicle || stats.plate) && (
            <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-lg w-fit"
              style={{ background: isDark ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.05)', border: '1px solid var(--border-soft)' }}>
              <Bike size={11} style={{ color: '#818CF8' }} />
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                {stats.vehicle}{stats.plate ? ` · ${stats.plate}` : ''}
              </span>
            </div>
          )}
          {linked && (
            <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-lg w-fit"
              style={{ background: isDark ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <Link2 size={10} style={{ color: '#10B981' }} />
              <span className="text-[11px] font-medium" style={{ color: '#10B981' }}>{memberName(linked)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-1 mx-5 mb-3 p-1 rounded-xl"
        style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: '1px solid var(--border-soft)' }}>
        {(['today', 'week', 'month', 'year'] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all"
            style={{
              background: period === p ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)') : 'transparent',
              color: period === p ? '#818CF8' : 'var(--text-muted)',
            }}>
            {periods[p].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 px-5 pb-4">
        <div className="rounded-xl p-3" style={{ background: isDark ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.05)', border: '1px solid var(--border-soft)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Truck size={11} style={{ color: COLORS.accent }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Entregas</span>
          </div>
          <p className="text-xl font-black" style={{ color: COLORS.accent }}>{cur.deliveries}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: isDark ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.05)', border: '1px solid var(--border-soft)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign size={11} style={{ color: COLORS.success }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Taxas</span>
          </div>
          <p className="text-base font-black" style={{ color: COLORS.success }}>{formatCurrency(Number(cur.fee))}</p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-soft)' }}>
        <button onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
          <span className="flex items-center gap-2"><Activity size={12} />Histórico completo</span>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {expanded && (
          <div className="px-5 pb-4 space-y-2">
            {[
              { label: 'Hoje', deliveries: stats.deliveries_today, fee: stats.fee_today, icon: Clock },
              { label: 'Esta semana', deliveries: stats.deliveries_week, fee: stats.fee_week, icon: Calendar },
              { label: 'Este mês', deliveries: stats.deliveries_month, fee: stats.fee_month, icon: BarChart3 },
              { label: 'Este ano', deliveries: stats.deliveries_year, fee: stats.fee_year, icon: Award },
            ].map(({ label, deliveries, fee, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-soft)' }}>
                <Icon size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <span className="flex-1 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{deliveries} entregas</span>
                <span className="text-xs font-semibold" style={{ color: COLORS.success }}>{formatCurrency(Number(fee))}</span>
              </div>
            ))}
            {stats.last_delivery_at && (
              <p className="text-[11px] text-center mt-1" style={{ color: 'var(--text-muted)' }}>
                Última entrega: {new Date(stats.last_delivery_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="flex gap-2 px-5 pb-5 pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
          <button onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)', color: '#818CF8' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.14)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)'}>
            <Edit size={13} /> Editar
          </button>
          <button onClick={onDelete}
            className="w-9 h-[34px] flex items-center justify-center rounded-xl transition-all"
            style={{ background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)', color: '#F87171' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.12)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)'}>
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
