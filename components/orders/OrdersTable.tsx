import { Eye, Package, ShoppingCart, Send, Utensils, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { Card } from '@/components/ui/Card';
import { useIsDark } from '@/hooks/useIsDark';
import { COLORS, ALPHA } from '@/lib/constants';
import { ORDER_TYPE_ICON, ORDER_TYPE_LABELS } from '@/types/orders';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { OrderType as StaffOrderType } from '@/contexts/StaffContext';

const ITEMS_PER_PAGE = 20;

interface OrdersTableProps {
  orders: any[];
  drivers: any[];
  currentPage: number;
  onPageChange: (p: number) => void;
  canEdit: boolean;
  canChangeStatus: (orderType: StaffOrderType) => boolean;
  canDelete: (orderType: StaffOrderType) => boolean;
  onView: (order: any) => void;
  onDelete: (order: any) => void;
  onDispatch: (orderId: string) => void;
  onTableManage: (order: any) => void;
  hasTypeRestriction: boolean;
  viewableTypes: StaffOrderType[] | null;
}

export function OrdersTable({
  orders, drivers, currentPage, onPageChange,
  canEdit, canChangeStatus, canDelete,
  onView, onDelete, onDispatch, onTableManage,
  hasTypeRestriction, viewableTypes,
}: OrdersTableProps) {
  const isDark = useIsDark();
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Pedido', 'Cliente', 'Tipo', 'Entregador', 'Status', 'Total', 'Data', ''].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-label)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((order: any) => {
              const orderType = ((order.order_type ?? order.type) as StaffOrderType);
              const TypeIcon = ORDER_TYPE_ICON[orderType] ?? Package;
              const isTable = orderType === 'table';
              const isDelivery = orderType === 'delivery';
              const driverRecord = (drivers as any[]).find((d: any) => d.id === order.driver_id);
              const driverName = order.driver?.name ?? driverRecord?.name ?? null;
              const userCanDelete = canDelete(orderType);
              const userCanChangeStatus = canChangeStatus(orderType);

              return (
                <tr
                  key={order.id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--border-soft)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-semibold px-2 py-1 rounded-lg"
                      style={{ background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)', color: '#818CF8' }}>
                      #{order.order_number ?? order.id.slice(0, 6)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {order.customer?.name ?? order.customer_name ?? (order.table_number ? `Mesa ${order.table_number}` : '—')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <TypeIcon size={14} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{ORDER_TYPE_LABELS[orderType] ?? orderType}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {isDelivery ? (
                      driverName ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                            style={{ background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' }}>
                            {driverName[0].toUpperCase()}
                          </div>
                          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{driverName}</span>
                        </div>
                      ) : (
                        order.status === 'preparing' && userCanChangeStatus ? (
                          <button
                            onClick={() => onDispatch(order.id)}
                            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg transition-all"
                            style={{ background: isDark ? ALPHA.accentBgSubtleD : ALPHA.accentBgSubtleL, color: COLORS.accentLight }}>
                            <Send size={10} /> Despachar
                          </button>
                        ) : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                      )
                    ) : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td className="px-5 py-4"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(order.total)}</span>
                      {isTable && order.payment_status === 'unpaid' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold w-max"
                          style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                          <span className="w-1 h-1 rounded-full bg-amber-400" /> A pagar
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div style={{ color: 'var(--text-secondary)' }}>
                      <p className="text-xs">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      {isTable && order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <ActionBtn onClick={() => onTableManage(order)} title="Gerenciar mesa" hoverBg="rgba(245,158,11,0.12)" hoverColor="#F59E0B">
                          <Utensils size={15} />
                        </ActionBtn>
                      )}
                      {isDelivery && order.status === 'preparing' && userCanChangeStatus && (
                        <ActionBtn onClick={() => onDispatch(order.id)} title="Despachar para entrega" hoverBg={`${COLORS.accent}18`} hoverColor={COLORS.accentLight}>
                          <Send size={15} />
                        </ActionBtn>
                      )}
                      <ActionBtn onClick={() => onView(order)} title="Ver detalhes" hoverBg="rgba(99,102,241,0.12)" hoverColor="#818CF8">
                        <Eye size={15} />
                      </ActionBtn>
                      {userCanDelete && (
                        <ActionBtn onClick={() => onDelete(order)} title="Excluir" hoverBg="rgba(239,68,68,0.12)" hoverColor="#F87171">
                          <X size={15} />
                        </ActionBtn>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <ShoppingCart size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {hasTypeRestriction && viewableTypes?.length === 0
              ? 'Seu cargo não tem permissão para visualizar nenhum tipo de pedido.'
              : 'Nenhum pedido encontrado'}
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, orders.length)} de {orders.length}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => onPageChange(page)}
                className="w-8 h-8 rounded-lg text-xs font-semibold"
                style={{
                  background: currentPage === page ? '#6366F1' : 'var(--input-bg)',
                  color: currentPage === page ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${currentPage === page ? '#6366F1' : 'var(--border)'}`,
                }}>
                {page}
              </button>
            ))}
            <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              Próxima
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function ActionBtn({ onClick, title, hoverBg, hoverColor, children }: {
  onClick: () => void; title: string; hoverBg: string; hoverColor: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: hoverBg, color: hoverColor })}
      onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}
    >
      {children}
    </button>
  );
}
