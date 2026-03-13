"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { useTheme, ThemeProvider } from '@/contexts/ThemeContext';
import { useOrders } from '@/hooks/useOrders';
import { useTodaySummary } from '@/hooks/useFinance';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useRouter } from 'next/router';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ProductsView } from '@/components/views/ProductsView';
import { OrdersView } from '@/components/views/OrdersView';
import { CustomersView } from '@/components/views/CustomersView';
import { DeliveryView } from '@/components/views/DeliveryView';
import { InventoryView } from '@/components/views/InventoryView';
import { FinanceView } from '@/components/views/FinanceView';
import { StoreSettingsView } from '@/components/views/StoreSettingsView';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SectionCard } from '@/components/dashboard/SectionCard';
import { formatCurrency } from '@/lib/utils/format';
import { THEMES } from '@/lib/constants/theme';
import { Settings } from 'lucide-react';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Truck,
  Warehouse, DollarSign, LogOut, Bell, ChevronRight,
  Clock, CheckCircle2, BarChart3, Activity, Menu, Search, Moon, Sun,
} from 'lucide-react';
import { Box } from '@gravity-ui/icons';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = 'dashboard' | 'products' | 'orders' | 'customers' | 'delivery' | 'inventory' | 'finance' | 'settings';

// ─── Sidebar — always dark ────────────────────────────────────────────────────
const NAV: { id: TabId; label: string; icon: React.FC<any> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
  { id: 'products', label: 'Produtos', icon: Package },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'delivery', label: 'Entregas', icon: Truck },
  { id: 'inventory', label: 'Estoque', icon: Warehouse },
  { id: 'finance', label: 'Financeiro', icon: DollarSign },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

function Sidebar({ activeTab, onTabChange, pendingCount, collapsed, storeName, userEmail, onSignOut, isMobile }: {
  activeTab: TabId; onTabChange: (id: TabId) => void; pendingCount: number;
  collapsed: boolean; storeName: string; userEmail: string; onSignOut: () => void; isMobile: boolean;
}) {
  return (
    <aside className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] shrink-0 ${
      isMobile 
        ? (collapsed ? '-translate-x-full w-64' : 'translate-x-0 w-64')
        : 'translate-x-0'
    }`}
      style={{ 
        width: isMobile ? 240 : (collapsed ? 72 : 240), 
        background: 'var(--sidebar-bg)', 
        borderRight: '1px solid var(--sidebar-border)' 
      }}>

      {/* Logo */}
      <div className="h-16 flex items-center px-4 shrink-0" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
        {(collapsed && !isMobile) ? (
          <div className="mx-auto w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
            <Box width={16} height={16} color="#fff" />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
              <Box width={16} height={16} color="#fff" />
            </div>
            <span className="font-bold text-sm tracking-wide truncate" style={{ color: 'var(--sidebar-store-text)' }}>NeoDelivery</span>
          </div>
        )}
      </div>

      {/* Store pill */}
      {(!collapsed || isMobile) && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl shrink-0"
          style={{ background: 'var(--sidebar-store-bg)', border: '1px solid var(--sidebar-store-border)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--sidebar-accent)' }}>Loja</p>
          <p className="text-xs font-bold truncate" style={{ color: 'var(--sidebar-store-text)' }}>{storeName}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          const badge = id === 'orders' && pendingCount > 0 ? pendingCount : 0;
          return (
            <button key={id} onClick={() => onTabChange(id)} title={collapsed ? label : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 relative"
              style={{ background: active ? 'var(--sidebar-item-active-bg)' : 'transparent' }}
              onMouseEnter={e => !active && ((e.currentTarget as HTMLElement).style.background = 'var(--sidebar-item-hover-bg)')}
              onMouseLeave={e => !active && ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ background: 'var(--sidebar-icon-active)' }} />}
              <Icon size={17} className="shrink-0" style={{ color: active ? 'var(--sidebar-icon-active)' : 'var(--sidebar-icon)' }} />
              {(!collapsed || isMobile) && <span className="text-sm font-medium flex-1 truncate" style={{ color: active ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)' }}>{label}</span>}
              {(!collapsed || isMobile) && badge > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
              {(collapsed && !isMobile) && badge > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="shrink-0 p-3" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        {(collapsed && !isMobile) ? (
          <button onClick={onSignOut}
            className="w-full flex justify-center p-2 rounded-xl transition-all"
            style={{ color: 'var(--sidebar-icon)' }}
            onMouseEnter={e => { Object.assign((e.currentTarget as HTMLElement).style, { color: '#F87171', background: 'rgba(239,68,68,0.1)' }); }}
            onMouseLeave={e => { Object.assign((e.currentTarget as HTMLElement).style, { color: 'var(--sidebar-icon)', background: 'transparent' }); }}>
            <LogOut size={16} />
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
              {userEmail?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--sidebar-store-text)' }}>{userEmail?.split('@')[0]}</p>
              <p className="text-[10px] truncate" style={{ color: 'var(--sidebar-icon)' }}>Administrador</p>
            </div>
            <button onClick={onSignOut}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: 'var(--sidebar-icon)' }}
              onMouseEnter={e => { Object.assign((e.currentTarget as HTMLElement).style, { color: '#F87171', background: 'rgba(239,68,68,0.1)' }); }}
              onMouseLeave={e => { Object.assign((e.currentTarget as HTMLElement).style, { color: 'var(--sidebar-icon)', background: 'transparent' }); }}>
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
function Topbar({ onToggle, title, subtitle }: { onToggle: () => void; title: string; subtitle: string }) {
  const { theme, mode, setMode } = useTheme();
  const isDark = theme === 'dark';
  
  const cycleTheme = () => {
    if (mode === 'auto') setMode('light');
    else if (mode === 'light') setMode('dark');
    else setMode('auto');
  };

  const getThemeIcon = () => {
    if (mode === 'auto') return '🌓';
    if (mode === 'light') return <Sun size={15} />;
    return <Moon size={15} />;
  };

  const getThemeLabel = () => {
    if (mode === 'auto') return 'Auto';
    if (mode === 'light') return 'Claro';
    return 'Escuro';
  };

  return (
    <header className="h-16 flex items-center gap-4 px-6 shrink-0 sticky top-0 z-30 backdrop-blur-xl"
      style={{ background: 'var(--header-bg)', borderBottom: '1px solid var(--border)' }}>
      <button onClick={onToggle}
        className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'var(--surface-hover)', color: 'var(--text-primary)' })}
        onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}>
        <Menu size={17} />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="font-bold text-sm leading-none" style={{ color: 'var(--text-primary)' }}>{title}</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden sm:flex items-center">
          <Search size={13} className="absolute left-3 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input placeholder="Buscar..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl outline-none transition-all"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-secondary)', width: 160 }}
            onFocus={e => (e.currentTarget.style.borderColor = '#6366F1')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')} />
        </div>

        {/* Theme toggle */}
        <button onClick={cycleTheme} title={`Tema: ${getThemeLabel()}`}
          className="h-9 px-3 flex items-center justify-center gap-2 rounded-xl transition-all"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: isDark ? 'rgba(255,255,255,0.4)' : '#6B7280', boxShadow: 'var(--surface-box)' }}
          onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { color: isDark ? '#FCD34D' : '#6366F1', borderColor: isDark ? 'rgba(252,211,77,0.3)' : 'rgba(99,102,241,0.3)' })}
          onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { color: isDark ? 'rgba(255,255,255,0.4)' : '#6B7280', borderColor: 'var(--border)' })}>
          <span className="text-sm">{getThemeIcon()}</span>
          <span className="text-xs font-medium hidden sm:inline">{getThemeLabel()}</span>
        </button>

        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', boxShadow: 'var(--surface-box)' }}>
          <Bell size={15} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
// Moved to components/dashboard/MetricCard.tsx

// ─── Section Card wrapper ─────────────────────────────────────────────────────
// Moved to components/dashboard/SectionCard.tsx

// ─── Dashboard Home view ──────────────────────────────────────────────────────
function DashboardHome() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { orders: pending, loading: l1 } = useOrders('pending');
  const { orders: allOrders, loading: l2 } = useOrders();
  const { summary, loading: l3 } = useTodaySummary();
  const { products, loading: l4 } = useProducts();
  const { customers, loading: l5 } = useCustomers();
  const { store } = useStore();

  const loading = l1 || l2 || l3 || l4 || l5;

  const todayOrders = allOrders.filter(o =>
    new Date(o.created_at).toDateString() === new Date().toDateString()
  );

  const grossRevenue = summary?.gross_revenue ?? 0;
  const netRevenue = summary?.net_revenue ?? 0;
  const avgTicket = todayOrders.length > 0 ? grossRevenue / todayOrders.length : 0;
  const delivery = todayOrders.filter(o => o.order_type === 'delivery').length;
  const pickup = todayOrders.filter(o => o.order_type === 'pickup').length;
  const table = todayOrders.filter(o => o.order_type === 'table').length;
  const total = todayOrders.length || 1;

  const dateStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#6366F1' }}>{dateStr}</p>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Visão geral de hoje</h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{
            background: isDark ? store?.is_open ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' : store?.is_open ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            color: isDark ? store?.is_open ? '#34D399' : '#F87171' : store?.is_open ? '#10B981' : '#EF4444',
            border: '1px solid rgba(16,185,129,0.2)',
          }}>
          {
            store?.is_open ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ) :
              (<span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />)
          }
          {store?.is_open ? 'Loja Aberta' : 'Loja Fechada'}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Pedidos Hoje" value={todayOrders.length} icon={ShoppingCart} accent="#6366F1" sub={`${pending.length} pend.`} trend="up" />
        <MetricCard label="Receita Líquida" value={formatCurrency(netRevenue)} icon={DollarSign} accent="#10B981" sub="hoje" trend="up" />
        <MetricCard label="Ticket Médio" value={formatCurrency(avgTicket)} icon={BarChart3} accent="#F59E0B" sub="por pedido" trend="neutral" />
        <MetricCard label="Clientes" value={customers.length} icon={Users} accent="#EC4899" sub="cadastrados" trend="up" />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Pending orders */}
        <div className="xl:col-span-2">
          <SectionCard title="Pedidos Pendentes" icon={Clock} iconColor="#6366F1"
            action={
              pending.length > 0 && (
                <button className="text-xs font-semibold flex items-center gap-1 transition-colors hover:opacity-75"
                  style={{ color: '#6366F1' }}>
                  Ver todos <ChevronRight size={12} />
                </button>
              )
            }>
            <div className="px-3 pb-4 space-y-0.5">
              {pending.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <CheckCircle2 size={28} style={{ color: isDark ? 'rgba(16,185,129,0.4)' : 'rgba(5,150,105,0.3)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum pedido pendente</p>
                </div>
              ) : (
                pending.slice(0, 5).map((order: any) => (
                  <div key={order.id}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all"
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)', color: '#818CF8' }}>
                      #{(order.order_number ?? order.id?.slice(0, 3) ?? '??').toString().slice(-2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {order.customer?.name ?? order.customer_name ?? 'Cliente'}
                      </p>
                      <p className="text-[11px] capitalize" style={{ color: 'var(--text-muted)' }}>
                        {order.order_type?.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(order.total)}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right col */}
        <div className="space-y-4">
          {/* Order types */}
          <div className="rounded-2xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Tipo de Pedido</p>
            <div className="space-y-3.5">
              {[
                { label: 'Delivery', count: delivery, color: '#6366F1', icon: Truck },
                { label: 'Retirada', count: pickup, color: '#F59E0B', icon: Package },
                { label: 'Mesa', count: table, color: '#10B981', icon: Users },
              ].map(({ label, count, color, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}12` }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bar-track)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(count / total) * 100}%`, background: color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Finance summary */}
          <div className="rounded-2xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Resumo Financeiro</p>
            <div className="space-y-3">
              {[
                { label: 'Receita Bruta', value: summary?.gross_revenue ?? 0, color: '#6366F1' },
                { label: 'Descontos', value: summary?.total_discounts ?? 0, color: '#EF4444' },
                { label: 'Taxa Entrega', value: summary?.total_delivery_fees ?? 0, color: '#F59E0B' },
                { label: 'Receita Líquida', value: summary?.net_revenue ?? 0, color: '#10B981' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color }}>{formatCurrency(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent orders table */}
        <SectionCard title="Últimos Pedidos" icon={Activity} iconColor="#6366F1">
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  {['#', 'Cliente', 'Total', 'Status'].map(h => (
                    <th key={h} className="px-5 py-2 text-left font-bold uppercase tracking-wider"
                      style={{ color: 'var(--text-label)', fontSize: 10 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allOrders.slice(0, 6).map((o: any) => (
                  <tr key={o.id} className="transition-colors"
                    style={{ borderBottom: '1px solid var(--border-soft)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <td className="px-5 py-3 font-mono font-medium" style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      #{o.order_number ?? o.id?.slice(0, 6)}
                    </td>
                    <td className="px-5 py-3 truncate max-w-[110px]" style={{ color: 'var(--text-secondary)' }}>
                      {o.customer?.name ?? o.customer_name ?? '—'}
                    </td>
                    <td className="px-5 py-3 font-bold" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(o.total)}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
                {allOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center" style={{ color: 'var(--text-muted)' }}>Sem pedidos hoje</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Products */}
        <SectionCard title="Produtos" icon={Package} iconColor="#8B5CF6"
          action={<span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{products.length} cadastrados</span>}>
          <div className="px-3 pb-4 space-y-0.5">
            {products.slice(0, 5).map((p: any) => (
              <div key={p.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer"
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                  style={{ background: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.07)' }}>
                  {p.product_images?.[0]?.url
                    ? <img src={p.product_images[0].url} alt={p.name} className="w-full h-full object-cover" />
                    : <Package size={14} style={{ color: '#8B5CF6', opacity: 0.5 }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                  {p.promotional_price && (
                    <p className="text-[11px] line-through" style={{ color: 'var(--text-muted)' }}>{formatCurrency(p.price)}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(p.promotional_price ?? p.price)}
                  </span>
                  <span className="w-2 h-2 rounded-full" style={{ background: p.available ? '#10B981' : '#6B7280' }} />
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-center py-8 text-xs" style={{ color: 'var(--text-muted)' }}>Nenhum produto cadastrado</p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Page meta ────────────────────────────────────────────────────────────────
const PAGE_META: Record<TabId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Visão geral do negócio' },
  orders: { title: 'Pedidos', subtitle: 'Gerencie todos os pedidos' },
  products: { title: 'Produtos', subtitle: 'Catálogo e preços' },
  customers: { title: 'Clientes', subtitle: 'Base de clientes' },
  delivery: { title: 'Entregas', subtitle: 'Monitoramento em tempo real' },
  inventory: { title: 'Estoque', subtitle: 'Controle de insumos' },
  finance: { title: 'Financeiro', subtitle: 'Relatórios e receitas' },
  settings: { title: 'Configurações', subtitle: 'Personalize sua loja' }
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { store, loading: storeLoading } = useStore();
  const { orders: pending } = useOrders('pending');
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detecta mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile: sidebar fechado por padrão
  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  if (authLoading || storeLoading) return <LoadingSpinner />;
  if (!user) return null;

  return (
    <ThemeProvider>
      <DashboardContent 
        user={user}
        store={store}
        pending={pending}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
        signOut={signOut}
      />
    </ThemeProvider>
  );
}

function DashboardContent({ user, store, pending, activeTab, setActiveTab, collapsed, setCollapsed, isMobile, signOut }: {
  user: any;
  store: any;
  pending: any[];
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobile: boolean;
  signOut: () => void;
}) {
  const { theme } = useTheme();
  const vars = THEMES[theme];
  const { title, subtitle } = PAGE_META[activeTab];

  // Atualiza theme-color para iOS
  useEffect(() => {
    const bgColor = theme === 'dark' ? '#080B12' : '#F1F4FA';
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.setAttribute('content', bgColor);
  }, [theme]);

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardHome />;
      case 'orders': return <OrdersView />;
      case 'products': return <ProductsView />;
      case 'customers': return <CustomersView />;
      case 'delivery': return <DeliveryView />;
      case 'inventory': return <InventoryView />;
      case 'finance': return <FinanceView />;
      case 'settings': return <StoreSettingsView />;
    }
  };

  const cssVars = Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
        .neopos { ${cssVars}; font-family:'DM Sans',system-ui,sans-serif; }
        .neopos * { box-sizing:border-box; }
        .neopos ::-webkit-scrollbar { width:4px; height:4px; }
        .neopos ::-webkit-scrollbar-track { background:transparent; }
        .neopos ::-webkit-scrollbar-thumb { background:var(--scrollbar); border-radius:99px; }
        .neopos input::placeholder { color:var(--text-muted) !important; opacity:1; }
      `}</style>

      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setCollapsed(true)}
        />
      )}

      <div className="neopos flex min-h-screen transition-colors duration-300"
        style={{ background: 'var(--bg)' }}>

        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingCount={pending.length}
          collapsed={collapsed}
          storeName={store?.name ?? 'Minha Loja'}
          userEmail={user.email ?? ''}
          onSignOut={signOut}
          isMobile={isMobile}
        />

        <div className="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
          style={{ marginLeft: isMobile ? 0 : (collapsed ? 72 : 240) }}>
          <Topbar
            onToggle={() => setCollapsed(c => !c)}
            title={title}
            subtitle={subtitle}
          />
          <main className="flex-1 overflow-y-auto p-6">
            {renderView()}
          </main>
        </div>
      </div>
    </>
  );
}