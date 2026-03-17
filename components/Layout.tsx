import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { Home, Package, ShoppingCart, Users, Truck, DollarSign, LogOut, Menu, ChevronDown, Bell, User } from 'lucide-react';
import { SearchField } from '@heroui/react';
import { Box } from '@gravity-ui/icons';
import { useNewOrderNotification } from '@/hooks/useNewOrderNotification';
import { NewOrderToastContainer } from '@/components/NewOrderToast';
import { useOrders } from '@/hooks/useOrders';
import { BRAND, COLORS, ALPHA } from '@/lib/constants';

const navItems = [
  { id: 'dashboard', label: 'Dashboard',  icon: Home },
  { id: 'products',  label: 'Produtos',   icon: Package },
  { id: 'orders',    label: 'Pedidos',    icon: ShoppingCart },
  { id: 'customers', label: 'Clientes',   icon: Users },
  { id: 'delivery',  label: 'Entrega',    icon: Truck },
  { id: 'inventory', label: 'Estoque',    icon: Package },
  { id: 'finance',   label: 'Financeiro', icon: DollarSign },
];

interface LayoutProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onViewOrder?: (orderId: string) => void;
}

export function Layout({ children, activeTab = 'dashboard', onTabChange, onViewOrder }: LayoutProps) {
  const { signOut, user } = useAuth();
  const { store } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isMobile) setSidebarOpen(true);
  }, [isMobile]);

  const { notifications, dismissNotification, clearAll, markAsRead } =
    useNewOrderNotification({ playSound: true, toastDuration: 8000 });

  const { orders: pendingOrders } = useOrders('pending');
  const unreadCount = pendingOrders.length;

  const handleBellClick = () => { setBellOpen(v => !v); markAsRead(); };
  const handleViewOrder = (orderId: string) => { onTabChange?.('orders'); onViewOrder?.(orderId); };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Overlay mobile */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen shadow-2xl transition-all duration-300 ${
          isMobile
            ? (sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64')
            : (sidebarOpen ? 'w-64' : 'w-20')
        }`}
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-center px-6" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
            {sidebarOpen ? (
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg" style={{ background: COLORS.accentGradient }}>
                  <Box width={22} height={22} color="#fff" />
                </div>
                <span className="text-xl font-bold" style={{ color: 'var(--sidebar-text-active)' }}>NeoPOS</span>
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg" style={{ background: COLORS.accentGradient }}>
                <Box width={22} height={22} color="#fff" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-6">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const showBadge = item.id === 'orders' && unreadCount > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange?.(item.id)}
                  className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200"
                  style={isActive
                    ? { background: COLORS.accentGradient, color: '#fff', boxShadow: COLORS.accentShadow }
                    : { color: 'var(--sidebar-text)', background: 'transparent' }
                  }
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-item-hover-bg)'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                  {showBadge && (
                    <span
                      className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: COLORS.danger, boxShadow: '0 0 0 2px rgba(17,24,39,0.8)' }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Store Info */}
          {sidebarOpen && store && (
            <div className="p-4" style={{ borderTop: '1px solid var(--sidebar-border)', background: 'var(--sidebar-store-bg)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-lg" style={{ background: COLORS.accentGradient }}>
                  <Package size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium" style={{ color: 'var(--sidebar-text)' }}>Loja Atual</div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--sidebar-store-text)' }}>{store.name}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isMobile ? 'ml-0' : (sidebarOpen ? 'ml-64' : 'ml-20')}`}>
        {/* Header */}
        <header
          className="sticky top-0 z-30 backdrop-blur-md"
          style={{ background: 'var(--header-bg)', borderBottom: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}
        >
          <div className="flex h-16 items-center justify-between px-6">
            {/* Left */}
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <Menu size={20} />
              </button>
              <SearchField name="search" className="flex-1">
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input placeholder="Buscar..." />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              {/* Bell */}
              <div className="relative">
                <button
                  onClick={handleBellClick}
                  className="relative rounded-xl p-2.5 transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span
                      className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ background: COLORS.danger, animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {bellOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden"
                    style={{
                      background: '#0F1117',
                      border: `1px solid ${ALPHA.accentBorderMd}`,
                      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                      zIndex: 50,
                    }}
                  >
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-sm font-bold text-white">Notificações</span>
                      {notifications.length > 0 && (
                        <button onClick={() => { clearAll(); setBellOpen(false); }} className="text-[11px] font-semibold" style={{ color: BRAND.light }}>
                          Limpar tudo
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center py-10 gap-2">
                          <Bell size={24} style={{ color: 'rgba(255,255,255,0.15)' }} />
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Sem notificações</p>
                        </div>
                      ) : notifications.map(n => (
                        <button
                          key={n.id}
                          onClick={() => { handleViewOrder(n.orderId); setBellOpen(false); }}
                          className="w-full flex items-start gap-3 px-4 py-3 text-left transition-all"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = ALPHA.accentBgSubtleD}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: ALPHA.accentBgD }}>
                            <ShoppingCart size={13} color={BRAND.light} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white">Pedido #{n.orderNumber}</p>
                            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                              {n.customerName} · {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n.total)}
                            </p>
                          </div>
                          <span className="text-[10px] shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {n.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setBellOpen(false); }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 transition-all"
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg" style={{ background: COLORS.accentGradient }}>
                    <User size={18} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.email?.split('@')[0]}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Administrador</div>
                  </div>
                  <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    <button
                      onClick={() => { signOut(); setProfileOpen(false); }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <LogOut size={16} />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6" onClick={() => { setBellOpen(false); }}>
          {children}
        </main>
      </div>

      <NewOrderToastContainer notifications={notifications} onDismiss={dismissNotification} onViewOrder={handleViewOrder} />
    </div>
  );
}
