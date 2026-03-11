import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { Layout } from '@/components/Layout';
import { DashboardStats } from '@/components/DashboardStats';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useOrders } from '@/hooks/useOrders';
import { useRouter } from 'next/router';
import { TrendingUp, Users, Package, ShoppingBag } from 'lucide-react';
import { ProductsView } from '@/components/views/ProductsView';
import { OrdersView } from '@/components/views/OrdersView';
import { CustomersView } from '@/components/views/CustomersView';
import { DeliveryView } from '@/components/views/DeliveryView';
import { InventoryView } from '@/components/views/InventoryView';
import { FinanceView } from '@/components/views/FinanceView';

// Placeholder components for other tabs
const ProductsViewWrapper = () => <ProductsView />;
const OrdersViewWrapper = () => <OrdersView />;
const CustomersViewWrapper = () => <CustomersView />;
const DeliveryViewWrapper = () => <DeliveryView />;
const InventoryViewWrapper = () => <InventoryView />;
const FinanceViewWrapper = () => <FinanceView />;

function DashboardView() {
  const { orders, loading: ordersLoading } = useOrders('pending');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Visão geral do seu negócio</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pedidos Pendentes</h2>
            <ShoppingBag className="text-gray-400" size={20} />
          </div>
          {ordersLoading ? (
            <LoadingSpinner />
          ) : orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum pedido pendente</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">Pedido #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">{order?.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">R$ {order?.total_amount}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                      Pendente
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Estatísticas Rápidas</h2>
            <TrendingUp className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                  <Users className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Novos Clientes</p>
                  <p className="text-xl font-bold text-gray-900">24</p>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600">+12%</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                  <Package className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Produtos Vendidos</p>
                  <p className="text-xl font-bold text-gray-900">156</p>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600">+8%</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500">
                  <TrendingUp className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Taxa de Conversão</p>
                  <p className="text-xl font-bold text-gray-900">68%</p>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600">+5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { store, loading: storeLoading } = useStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (authLoading || storeLoading) return <LoadingSpinner />;
  if (!user) {
    router.push('/auth');
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'products':
        return <ProductsViewWrapper />;
      case 'orders':
        return <OrdersViewWrapper />;
      case 'customers':
        return <CustomersViewWrapper />;
      case 'delivery':
        return <DeliveryViewWrapper />;
      case 'inventory':
        return <InventoryViewWrapper />;
      case 'finance':
        return <FinanceViewWrapper />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
