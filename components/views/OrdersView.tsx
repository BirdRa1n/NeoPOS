import { PageHeader } from '@/components/layout/PageHeader';
import { OrderModal } from '@/components/OrderModal';
import {
  DeleteOrderModal, DispatchModal,
  OrderDetailsModal,
  OrderFilters, OrdersTable,
  OrderStatsStrip,
} from '@/components/orders';
import { TableOrderModal } from '@/components/TableOrderModal';
import { Button } from '@/components/ui/Button';
import type { OrderType as StaffOrderType } from '@/contexts/StaffContext';
import { useStaff } from '@/contexts/StaffContext';
import { useStore } from '@/contexts/StoreContext';
import { useDeliveryDrivers } from '@/hooks/useDelivery';
import { useIsDark } from '@/hooks/useIsDark';
import { useOrders } from '@/hooks/useOrders';
import { COLORS } from '@/lib/constants';
import type { OrderStatus } from '@/types';
import { ORDER_TYPE_LABELS } from '@/types/orders';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OrdersView() {
  const isDark = useIsDark();
  const { store } = useStore();
  const { can, canOrderType, allowedOrderTypes } = useStaff();
  const { drivers = [] } = useDeliveryDrivers() as any;

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<StaffOrderType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dispatchOrderId, setDispatchOrderId] = useState<string | null>(null);
  const [tableModal, setTableModal] = useState<any>(null);

  const { orders, loading, refetch } = useOrders(selectedStatus === 'all' ? undefined : (selectedStatus as any));

  const viewableTypes = allowedOrderTypes('view');
  const hasTypeRestriction = viewableTypes !== null;

  const availableTypes: StaffOrderType[] = (['delivery', 'pickup', 'table'] as StaffOrderType[]).filter(t =>
    canOrderType('view', t)
  );

  const filtered = orders.filter(o => {
    const orderType = ((o as any).order_type ?? (o as any).type) as StaffOrderType;
    if (!canOrderType('view', orderType)) return false;
    if (typeFilter !== 'all' && orderType !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        (o as any).customer?.name?.toLowerCase().includes(q) ||
        (o as any).customer_name?.toLowerCase().includes(q) ||
        String((o as any).order_number ?? '').includes(q)
      );
    }
    return true;
  });

  useEffect(() => { setCurrentPage(1); }, [selectedStatus, search, typeFilter]);

  const stats = {
    total: filtered.length,
    pending: filtered.filter(o => (o.status as string) === 'pending').length,
    delivering: filtered.filter(o => (o.status as string) === 'out_for_delivery').length,
    done: filtered.filter(o => (o.status as string) === 'delivered').length,
  };

  const canCreate = can('perm_orders_create' as any);
  const canEdit = can('perm_orders_edit' as any) || can('perm_orders_change_status' as any);
  const canDelete = can('perm_orders_delete' as any);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: COLORS.accent, borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pedidos"
        subtitle={
          hasTypeRestriction && viewableTypes!.length > 0
            ? `Visualizando: ${viewableTypes!.map(t => ORDER_TYPE_LABELS[t]).join(', ')}`
            : 'Gerencie todos os pedidos da loja'
        }
        action={canCreate ? <Button onClick={() => setShowModal(true)} icon={<ShoppingCart size={15} />}>Novo Pedido</Button> : undefined}
      />

      <OrderStatsStrip {...stats} />

      <OrderFilters
        search={search} onSearch={setSearch}
        selectedStatus={selectedStatus} onStatus={setSelectedStatus}
        typeFilter={typeFilter} onTypeFilter={setTypeFilter}
        availableTypes={availableTypes}
      />

      <OrdersTable
        orders={filtered}
        drivers={drivers as any[]}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        canEdit={canEdit}
        canChangeStatus={type => can('perm_orders_change_status' as any) || (canEdit && canOrderType('edit', type))}
        canDelete={type => canDelete && canOrderType('delete', type)}
        onView={order => { setSelectedOrder(order); setShowDetailsModal(true); }}
        onDelete={order => { setSelectedOrder(order); setShowDeleteModal(true); }}
        onDispatch={id => { setDispatchOrderId(id); setShowDispatchModal(true); }}
        onTableManage={order => setTableModal(order)}
        hasTypeRestriction={hasTypeRestriction}
        viewableTypes={viewableTypes}
      />

      {showModal && store && (
        <OrderModal storeId={store.id} onClose={() => setShowModal(false)} onSuccess={async () => { await refetch?.(); setShowModal(false); }} canCreateTypes={allowedOrderTypes('create')} />
      )}

      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          drivers={drivers as any[]}
          onClose={() => { setShowDetailsModal(false); setSelectedOrder(null); }}
          onStatusChange={async () => { await refetch?.(); }}
          canEdit={canEdit && canOrderType('edit', ((selectedOrder.order_type ?? selectedOrder.type) ?? 'delivery') as StaffOrderType)}
          canChangeStatus={can('perm_orders_change_status' as any) || canEdit}
        />
      )}

      {tableModal && (
        <TableOrderModal order={tableModal} onClose={() => setTableModal(null)} onUpdated={async () => { await refetch?.(); }} />
      )}

      {showDispatchModal && dispatchOrderId && (
        <DispatchModal
          orderId={dispatchOrderId}
          drivers={drivers as any[]}
          onClose={() => { setShowDispatchModal(false); setDispatchOrderId(null); }}
          onSuccess={async () => { await refetch?.(); }}
        />
      )}

      {showDeleteModal && selectedOrder && (
        <DeleteOrderModal
          order={selectedOrder}
          onClose={() => { setShowDeleteModal(false); setSelectedOrder(null); }}
          onSuccess={async () => { await refetch?.(); setShowDeleteModal(false); setSelectedOrder(null); }}
        />
      )}
    </div>
  );
}
