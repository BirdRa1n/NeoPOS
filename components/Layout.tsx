import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { Home, Package, ShoppingCart, Users, Truck, DollarSign, LogOut, Menu, ChevronDown, Bell, User } from 'lucide-react';
import { SearchField } from '@heroui/react';
import { Box } from '@gravity-ui/icons';
import { useNewOrderNotification } from '@/hooks/useNewOrderNotification';
import { NewOrderToastContainer } from '@/components/NewOrderToast';
import { useOrders } from '@/hooks/useOrders';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'products', label: 'Produtos', icon: Package },
  { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'delivery', label: 'Entrega', icon: Truck },
  { id: 'inventory', label: 'Estoque', icon: Package },
  { id: 'finance', label: 'Financeiro', icon: DollarSign }
];

interface LayoutProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  /** Callback opcional para navegar para a aba de pedidos ao clicar em "Ver pedido" no toast */
  onViewOrder?: (orderId: string) => void;
}

export function Layout({ children, activeTab = 'dashboard', onTabChange, onViewOrder }: LayoutProps) {
  const { signOut, user } = useAuth();
  const { store } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detecta mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Desktop: sidebar aberto por padrão
  useEffect(() => {
    if (!isMobile) setSidebarOpen(true);
  }, [isMobile]);

  // ── Realtime: notificações de novo pedido ────────────────────────────────
  const {
    notifications,
    dismissNotification,
    clearAll,
    markAsRead,
  } = useNewOrderNotification({ playSound: true, toastDuration: 8000 });

  // Busca pedidos pendentes para o badge
  const { orders: pendingOrders } = useOrders('pending');
  const unreadCount = pendingOrders.length;

  const handleBellClick = () => {
    setBellOpen((v) => !v);
    markAsRead();
  };

  const handleViewOrder = (orderId: string) => {
    // Navega para a aba de pedidos
    onTabChange?.('orders');
    onViewOrder?.(orderId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Overlay mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 shadow-2xl transition-all duration-300 ${
          isMobile 
            ? (sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64')
            : (sidebarOpen ? 'w-64' : 'w-20')
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-center border-b border-gray-700/50 px-6">
            {sidebarOpen ? (
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                  <Box width={22} height={22} color="#ffffff" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">NeoPOS</span>
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                <Box width={22} height={22} color="#ffffff" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              // Badge de pedidos pendentes na aba de pedidos
              const showBadge = item.id === 'orders' && unreadCount > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange?.(item.id)}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <Icon size={20} className={isActive ? 'drop-shadow-sm' : ''} />
                  {sidebarOpen && <span>{item.label}</span>}

                  {/* Badge de novos pedidos */}
                  {showBadge && (
                    <span
                      className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: '#EF4444', boxShadow: '0 0 0 2px rgba(17,24,39,0.8)' }}
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
            <div className="border-t border-gray-700/50 bg-gray-800/30 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                  <Package size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-400">Loja Atual</div>
                  <div className="text-sm font-semibold text-white">{store.name}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        isMobile ? 'ml-0' : (sidebarOpen ? 'ml-64' : 'ml-20')
      }`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Left Side */}
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-xl transition-all"
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

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Bell com dropdown de histórico */}
              <div className="relative">
                <button
                  onClick={handleBellClick}
                  className="relative rounded-xl p-2.5 text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ background: '#EF4444', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown de notificações recentes */}
                {bellOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden"
                    style={{
                      background: '#0F1117',
                      border: '1px solid rgba(99,102,241,0.25)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                      zIndex: 50,
                    }}
                  >
                    {/* Header do dropdown */}
                    <div className="flex items-center justify-between px-4 py-3"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-sm font-bold text-white">Notificações</span>
                      {notifications.length > 0 && (
                        <button
                          onClick={() => { clearAll(); setBellOpen(false); }}
                          className="text-[11px] font-semibold"
                          style={{ color: '#818CF8' }}
                        >
                          Limpar tudo
                        </button>
                      )}
                    </div>

                    {/* Lista */}
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center py-10 gap-2">
                          <Bell size={24} style={{ color: 'rgba(255,255,255,0.15)' }} />
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Sem notificações</p>
                        </div>
                      ) : notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => { handleViewOrder(n.orderId); setBellOpen(false); }}
                          className="w-full flex items-start gap-3 px-4 py-3 text-left transition-all"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.08)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: 'rgba(99,102,241,0.2)' }}>
                            <ShoppingCart size={13} color="#818CF8" />
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

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setBellOpen(false); }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-gray-100 transition-all"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30">
                    <User size={18} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">{user?.email?.split('@')[0]}</div>
                    <div className="text-xs text-gray-500">Administrador</div>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => { signOut(); setProfileOpen(false); }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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

        {/* Page Content */}
        <main className="p-6" onClick={() => { setBellOpen(false); }}>
          {children}
        </main>
      </div>

      {/* Toast de novo pedido — renderiza fora do fluxo, fixo na tela */}
      <NewOrderToastContainer
        notifications={notifications}
        onDismiss={dismissNotification}
        onViewOrder={handleViewOrder}
      />
    </div>
  );
}
