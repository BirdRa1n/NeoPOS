import { OrderStatus } from '@/types/database';

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  preparing: { label: 'Preparando', color: 'bg-purple-100 text-purple-800' },
  out_for_delivery: { label: 'Saiu para entrega', color: 'bg-indigo-100 text-indigo-800' },
  delivered: { label: 'Entregue', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
