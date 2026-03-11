import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { OrderCard } from '@/components/OrderCard';
import { useOrders } from '@/hooks/useOrders';
import { OrderStatus } from '@/types/database';
import { useState } from 'react';
import { useRouter } from 'next/router';

const statusTabs: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'out_for_delivery', label: 'Em entrega' },
  { value: 'delivered', label: 'Entregues' }
];

export default function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const { orders, loading } = useOrders(status === 'all' ? undefined : status);
  const router = useRouter();

  if (loading) return <LoadingSpinner />;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Novo Pedido
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`px-4 py-2 rounded-lg ${
                status === tab.value ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          <p className="text-gray-500">Nenhum pedido encontrado</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order}
                onClick={() => router.push(`/orders/${order.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
