import { useTodaySummary } from '@/hooks/useFinance';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/lib/utils/format';
import { LoadingSpinner } from './LoadingSpinner';
import { ShoppingCart, DollarSign, TrendingUp, Package, ArrowUp, ArrowDown } from 'lucide-react';

export function DashboardStats() {
  const { summary, loading: summaryLoading } = useTodaySummary();
  const { orders, loading: ordersLoading } = useOrders('pending');

  if (summaryLoading || ordersLoading) return <LoadingSpinner />;

  const stats = [
    {
      label: 'Pedidos Pendentes',
      value: orders.length,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      change: '+12%',
      isPositive: true
    },
    {
      label: 'Pedidos Hoje',
      value: summary?.total_orders || 0,
      icon: Package,
      color: 'bg-green-500',
      change: '+8%',
      isPositive: true
    },
    {
      label: 'Receita Bruta',
      value: formatCurrency(summary?.gross_revenue || 0),
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+15%',
      isPositive: true
    },
    {
      label: 'Receita Líquida',
      value: formatCurrency(summary?.net_revenue || 0),
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '-3%',
      isPositive: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.color} bg-opacity-10`}>
                <Icon className={`${stat.color.replace('bg-', 'text-')}`} size={24} color='white' />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                {stat.isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
