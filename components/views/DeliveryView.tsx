import { useOrders } from '@/hooks/useOrders';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Truck, MapPin, Clock, CheckCircle, Package, Navigation } from 'lucide-react';

export function DeliveryView() {
  const { orders: deliveringOrders, loading: deliveringLoading } = useOrders('delivering');
  const { orders: readyOrders, loading: readyLoading } = useOrders('ready');
  const { orders: deliveredOrders, loading: deliveredLoading } = useOrders('delivered');

  if (deliveringLoading || readyLoading || deliveredLoading) return <LoadingSpinner />;

  const activeDeliveries = deliveringOrders.filter(o => o.order_type === 'delivery');
  const pendingDeliveries = readyOrders.filter(o => o.order_type === 'delivery');
  const completedDeliveries = deliveredOrders.filter(o => o.order_type === 'delivery');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entregas</h1>
          <p className="text-sm text-gray-600 mt-1">Acompanhe as entregas em tempo real</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Em Trânsito</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{activeDeliveries.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Truck className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingDeliveries.length}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Entregues Hoje</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{completedDeliveries.length}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tempo Médio</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">35min</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Navigation className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Active Deliveries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Entregas em Andamento</h2>
        {activeDeliveries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma entrega em andamento</p>
        ) : (
          <div className="space-y-4">
            {activeDeliveries.map((delivery) => (
              <div key={delivery.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Truck className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Pedido #{delivery.order_number}</p>
                      <p className="text-sm text-gray-600">{delivery.customer?.name || 'Cliente'}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Em trânsito
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="line-clamp-1">{delivery.notes || 'Endereço não informado'}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} className="text-gray-400" />
                    Saiu há 15 minutos
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Rastrear
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Deliveries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aguardando Entrega</h2>
        {pendingDeliveries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma entrega pendente</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingDeliveries.map((delivery) => (
              <div key={delivery.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Package className="text-yellow-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Pedido #{delivery.order_number}</p>
                      <p className="text-sm text-gray-600">{delivery.customer?.name || 'Cliente'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="line-clamp-1">{delivery.notes || 'Endereço não informado'}</span>
                </div>
                <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                  Iniciar Entrega
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
