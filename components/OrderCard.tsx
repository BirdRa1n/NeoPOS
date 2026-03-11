import { Order } from '@/types/database';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  return (
    <div 
      onClick={onClick}
      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold">Pedido #{order.id.slice(0, 8)}</p>
          <p className="text-sm text-gray-500">{formatDateTime(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      
      <div className="space-y-1 text-sm">
        <p className="capitalize">{order.order_type}</p>
        {order.payment_method && (
          <p className="text-gray-600">Pagamento: {order.payment_method}</p>
        )}
        <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
      </div>
    </div>
  );
}
