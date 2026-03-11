import { ReactNode, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { Home, Package, ShoppingCart, Users, Truck, DollarSign, LogOut, Menu, ChevronDown, Bell, User } from 'lucide-react';
import { SearchField } from '@heroui/react';
import { Box } from '@gravity-ui/icons';

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
}

export function Layout({ children, activeTab = 'dashboard', onTabChange }: LayoutProps) {
  const { signOut, user } = useAuth();
  const { store } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 shadow-2xl transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
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
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Left Side - Toggle and Search */}
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
              {/* Notifications */}
              <button className="relative rounded-xl p-2.5 text-gray-600 hover:bg-gray-100 transition-all">
                <Bell size={20} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
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
                      onClick={() => {
                        signOut();
                        setProfileOpen(false);
                      }}
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
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
