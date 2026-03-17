import { useState, useEffect } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useStore } from '@/contexts/StoreContext';
import { useStaff } from '@/contexts/StaffContext';
import { useDeliveryDrivers } from '@/hooks/useDelivery';
import type { OrderType as StaffOrderType } from '@/contexts/StaffContext';
import { supabase } from '@/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatCurrency } from '@/lib/utils/format';
import {
  Search, Eye, ShoppingCart, Clock, CheckCircle2, XCircle,
  Truck, Package, UtensilsCrossed, Filter,
  X, Loader2, AlertTriangle, Utensils,
  Banknote, CreditCard, Smartphone, Wallet, CheckSquare, DollarSign,
  User, Send,
} from 'lucide-react';
import type { OrderStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { ModalBackdrop, ModalShell, ModalHeader } from '@/components/ui/Modal';
import { OrderModal } from '@/components/OrderModal';
import { TableOrderModal } from '@/components/TableOrderModal';
import { DispatchModal } from '@/components/orders/DispatchModal';
import { COLORS, ALPHA } from '@/lib/constants';
import { useIsDark } from '@/hooks/useIsDark';

// ─── Order type config ────────────────────────────────────────────────────────

const ORDER_TYPE_ICON: Record<string, React.FC<any>> = {
  delivery: Truck,
  pickup: Package,
  table: UtensilsCrossed,
};

const ORDER_TYPE_LABELS: Record<string, string> = {
  delivery: 'Delivery',
  pickup: 'Retirada',
  table: 'No local',
};

const STATUS_CFG: Record<string, { label: string; dot: string; bgD: string; bgL: string; txD: string; txL: string }> = {
  pending: { label: 'Pendente', dot: '#F59E0B', bgD: 'rgba(245,158,11,0.15)', bgL: 'rgba(245,158,11,0.1)', txD: '#FCD34D', txL: '#92400E' },
  confirmed: { label: 'Confirmado', dot: '#3B82F6', bgD: 'rgba(59,130,246,0.15)', bgL: 'rgba(59,130,246,0.1)', txD: '#93C5FD', txL: '#1E40AF' },
  preparing: { label: 'Preparando', dot: '#8B5CF6', bgD: 'rgba(139,92,246,0.15)', bgL: 'rgba(139,92,246,0.1)', txD: '#C4B5FD', txL: '#5B21B6' },
  out_for_delivery: { label: 'Saiu p/ entrega', dot: '#6366F1', bgD: 'rgba(99,102,241,0.15)', bgL: 'rgba(99,102,241,0.1)', txD: '#A5B4FC', txL: '#3730A3' },
  delivered: { label: 'Entregue', dot: '#10B981', bgD: 'rgba(16,185,129,0.15)', bgL: 'rgba(16,185,129,0.1)', txD: '#6EE7B7', txL: '#065F46' },
  finished: { label: 'Finalizado', dot: '#10B981', bgD: 'rgba(16,185,129,0.15)', bgL: 'rgba(16,185,129,0.1)', txD: '#6EE7B7', txL: '#065F46' },
  cancelled: { label: 'Cancelado', dot: '#EF4444', bgD: 'rgba(239,68,68,0.15)', bgL: 'rgba(239,68,68,0.1)', txD: '#FCA5A5', txL: '#991B1B' },
};

const STATUS_TABS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'out_for_delivery', label: 'Em entrega' },
  { value: 'delivered', label: 'Entregues' },
  { value: 'cancelled', label: 'Cancelados' },
];

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Dinheiro',
  credit_card: 'Cartão Crédito',
  debit_card: 'Cartão Débito',
  pix: 'PIX',
  meal_voucher: 'Vale Refeição',
  other: 'Outro',
};

const PAYMENT_ICONS: Record<string, React.FC<any>> = {
  cash: Banknote,
  credit_card: CreditCard,
  debit_card: Wallet,
  pix: Smartphone,
  meal_voucher: CreditCard,
  other: DollarSign,
};

function StatusBadge({ status }: { status: string }) {
  const isDark = useIsDark();
  const cfg = STATUS_CFG[status] ?? { label: status, dot: '#9CA3AF', bgD: 'rgba(156,163,175,0.15)', bgL: 'rgba(156,163,175,0.1)', txD: '#D1D5DB', txL: '#374151' };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ background: isDark ? cfg.bgD : cfg.bgL, color: isDark ? cfg.txD : cfg.txL }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

// ─── OrderDetailsModal ────────────────────────────────────────────────────────

function OrderDetailsModal({ order: initialOrder, onClose, onStatusChange, canEdit, canChangeStatus, drivers }: {
  order: any;
  onClose: () => void;
  onStatusChange: () => void;
  canEdit: boolean;
  canChangeStatus: boolean;
  drivers: any[];
}) {
  const isDark = useIsDark();
  const [order, setOrder] = useState<any>(initialOrder);
  const [updating, setUpdating] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editItems, setEditItems] = useState<any[]>([]);
  const [editPayment, setEditPayment] = useState(order.payment_method);
  const [editNotes, setEditNotes] = useState(order.notes ?? '');
  const [editDriverId, setEditDriverId] = useState(order.driver_id ?? '');
  const [savingEdit, setSavingEdit] = useState(false);

  // Modal de despacho inline
  const [showDispatch, setShowDispatch] = useState(false);

  useEffect(() => {
    supabase.schema('orders').from('order_items').select('*').eq('order_id', order.id)
      .then(({ data }) => {
        if (data) { setItems(data); setEditItems(data.map((i: any) => ({ ...i }))); }
        setLoadingItems(false);
      });
  }, [order.id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!canChangeStatus) return;
    // Se vai sair para entrega, abre modal de despacho
    if (newStatus === 'out_for_delivery') {
      setShowDispatch(true);
      return;
    }
    setUpdating(true);
    try {
      const { error } = await supabase.schema('orders').from('orders').update({ status: newStatus }).eq('id', order.id);
      if (error) throw error;
      setOrder((o: any) => ({ ...o, status: newStatus }));
      onStatusChange();
    } catch (err: any) { alert(err.message); }
    finally { setUpdating(false); }
  };

  const handleMarkPaid = async () => {
    setMarkingPaid(true);
    try {
      const { error } = await supabase.schema('orders').from('orders').update({ payment_status: 'paid' }).eq('id', order.id);
      if (error) throw error;
      setOrder((o: any) => ({ ...o, payment_status: 'paid' }));
      onStatusChange();
    } catch (err: any) { alert(err.message); }
    finally { setMarkingPaid(false); }
  };

  const updateEditQty = (id: string, delta: number) =>
    setEditItems(prev => prev.map(i => i.id === id
      ? { ...i, quantity: Math.max(1, i.quantity + delta), subtotal: i.unit_price * Math.max(1, i.quantity + delta) }
      : i));

  const removeEditItem = (id: string) => setEditItems(prev => prev.filter(i => i.id !== id));

  const handleSaveEdit = async () => {
    if (!canEdit) return;
    setSavingEdit(true);
    try {
      if (editItems.length === 0) { alert('O pedido precisa ter pelo menos 1 item.'); return; }
      for (const item of editItems) {
        const original = items.find(i => i.id === item.id);
        if (original && original.quantity !== item.quantity) {
          const { error } = await supabase.schema('orders').from('order_items')
            .update({ quantity: item.quantity, subtotal: item.unit_price * item.quantity }).eq('id', item.id);
          if (error) throw error;
        }
      }
      const removedIds = items.filter(i => !editItems.find((e: any) => e.id === i.id)).map(i => i.id);
      if (removedIds.length > 0) {
        const { error } = await supabase.schema('orders').from('order_items').delete().in('id', removedIds);
        if (error) throw error;
      }
      const newSubtotal = editItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
      const newTotal = newSubtotal + (order.delivery_fee ?? 0) - (order.discount ?? 0);
      const updatePayload: any = {
        payment_method: editPayment,
        notes: editNotes || null,
        subtotal: newSubtotal,
        total: newTotal,
      };
      // Atualiza entregador se for delivery
      const orderType = order.order_type ?? order.type;
      if (orderType === 'delivery') {
        updatePayload.driver_id = editDriverId || null;
      }
      const { error: orderErr } = await supabase.schema('orders').from('orders')
        .update(updatePayload)
        .eq('id', order.id);
      if (orderErr) throw orderErr;

      // Atualiza o driver name no estado local
      const driverRecord = drivers.find(d => d.id === editDriverId);
      setOrder((o: any) => ({
        ...o,
        payment_method: editPayment,
        notes: editNotes,
        subtotal: newSubtotal,
        total: newTotal,
        driver_id: editDriverId || null,
        driver: driverRecord ?? null,
      }));
      setItems(editItems);
      setEditing(false);
      onStatusChange();
    } catch (err: any) { alert(err.message ?? 'Erro ao salvar'); }
    finally { setSavingEdit(false); }
  };

  const statusFlow = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
  const currentIndex = statusFlow.indexOf(order.status);
  const nextStatus = statusFlow[currentIndex + 1];
  const prevStatus = statusFlow[currentIndex - 1];
  const isTable = order.type === 'table' || order.order_type === 'table';
  const isDelivery = order.type === 'delivery' || order.order_type === 'delivery';
  const isPaid = order.payment_status === 'paid';
  const PayIcon = PAYMENT_ICONS[order.payment_method] ?? DollarSign;
  const displayItems = editing ? editItems : items;
  const displaySubtotal = editing ? editItems.reduce((s, i) => s + i.unit_price * i.quantity, 0) : order.subtotal;
  const displayTotal = displaySubtotal + (order.delivery_fee ?? 0) - (order.discount ?? 0);

  const activeDrivers = drivers.filter(d => d.active);
  const currentDriver = order.driver ?? drivers.find(d => d.id === order.driver_id);

  const selStyle: React.CSSProperties = {
    padding: '0.6rem 0.875rem 0.6rem 2.25rem',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--text-primary)',
    borderRadius: 12,
    fontSize: 13,
    width: '100%',
    outline: 'none',
  };

  return (
    <>
      <ModalBackdrop onClose={onClose}>
        <ModalShell maxW="max-w-2xl">
          <ModalHeader
            title={`Pedido #${order.order_number || order.id.slice(0, 6)}`}
            subtitle={`Criado em ${new Date(order.created_at).toLocaleString('pt-BR')}`}
            icon={ShoppingCart}
            onClose={onClose}
          />
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {isTable && !isPaid && (
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)', border: `1px solid ${isDark ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.2)'}` }}>
                <AlertTriangle size={16} style={{ color: '#F59E0B', flexShrink: 0 }} />
                <div className="flex-1">
                  <p className="text-xs font-bold" style={{ color: isDark ? '#FCD34D' : '#92400E' }}>Pagamento pendente</p>
                </div>
                {canChangeStatus && (
                  <button onClick={handleMarkPaid} disabled={markingPaid}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}>
                    {markingPaid ? <Loader2 size={12} className="animate-spin" /> : <CheckSquare size={12} />}
                    Marcar como pago
                  </button>
                )}
              </div>
            )}

            {/* Status */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6366F1' }}>Status</p>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={order.status} />
                {canChangeStatus && prevStatus && (
                  <button onClick={() => handleStatusChange(prevStatus)} disabled={updating}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    ← Voltar
                  </button>
                )}
                {canChangeStatus && nextStatus && (
                  <button onClick={() => handleStatusChange(nextStatus)} disabled={updating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                    style={{ background: nextStatus === 'out_for_delivery' ? `linear-gradient(135deg,${COLORS.accent},${COLORS.purple})` : 'linear-gradient(135deg,#10B981,#059669)' }}>
                    {updating ? <Loader2 size={12} className="animate-spin" /> : nextStatus === 'out_for_delivery' ? <Send size={12} /> : <CheckCircle2 size={12} />}
                    {nextStatus === 'out_for_delivery' ? 'Despachar →' : 'Avançar →'}
                  </button>
                )}
              </div>
            </div>

            {/* Entregador (delivery) */}
            {isDelivery && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COLORS.accent }}>Entregador</p>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>
                {!editing ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: currentDriver ? 'rgba(99,102,241,0.15)' : 'var(--surface)' }}>
                      <User size={14} style={{ color: currentDriver ? '#818CF8' : 'var(--text-muted)' }} />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {currentDriver?.name ?? 'Sem entregador atribuído'}
                    </p>
                    {currentDriver?.vehicle && (
                      <span className="text-xs px-2 py-0.5 rounded-full ml-auto"
                        style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8' }}>
                        {currentDriver.vehicle}
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <User size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <select value={editDriverId} onChange={e => setEditDriverId(e.target.value)} style={selStyle}>
                      <option value="">Sem entregador</option>
                      {activeDrivers.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name}{d.vehicle ? ` · ${d.vehicle}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Cliente */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8B5CF6' }}>Cliente</p>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {order.customer?.name || (isTable && order.table_number ? `Mesa ${order.table_number}` : 'Cliente não informado')}
                </p>
              </div>
            </div>

            {/* Itens */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#F59E0B' }}>Itens</p>
                  <div className="flex-1 h-px w-20" style={{ background: 'var(--border)' }} />
                </div>
                {canEdit && !editing && (
                  <button onClick={() => setEditing(true)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all"
                    style={{ background: isDark ? ALPHA.accentBgSubtleD : ALPHA.accentBgSubtleL, color: COLORS.accentLight }}>
                    Editar pedido
                  </button>
                )}
                {editing && (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(false); setEditItems(items.map((i: any) => ({ ...i }))); setEditDriverId(order.driver_id ?? ''); }}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all"
                      style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      Cancelar
                    </button>
                    <button onClick={handleSaveEdit} disabled={savingEdit}
                      className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg text-white disabled:opacity-60"
                      style={{ background: COLORS.accentGradient }}>
                      {savingEdit ? <Loader2 size={11} className="animate-spin" /> : null}
                      Salvar
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {loadingItems ? (
                  <div className="text-center py-4"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: 'var(--text-muted)' }} /></div>
                ) : displayItems.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.product_name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatCurrency(item.unit_price)} × {editing ? (
                          <span className="inline-flex items-center gap-1 ml-1">
                            <button onClick={() => updateEditQty(item.id, -1)}
                              className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
                              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>−</button>
                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{item.quantity}</span>
                            <button onClick={() => updateEditQty(item.id, 1)}
                              className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
                              style={{ background: COLORS.accent, color: '#fff', border: 'none' }}>+</button>
                          </span>
                        ) : item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#10B981' }}>{formatCurrency(item.unit_price * item.quantity)}</span>
                    {editing && (
                      <button onClick={() => removeEditItem(item.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg ml-1"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: 'none', cursor: 'pointer' }}>
                        <X size={11} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="rounded-xl p-4" style={{ background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div className="flex justify-between mb-2"><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Subtotal</span><span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(displaySubtotal)}</span></div>
              {(order.delivery_fee ?? 0) > 0 && (
                <div className="flex justify-between mb-2"><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Taxa Entrega</span><span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(order.delivery_fee)}</span></div>
              )}
              <div className="flex justify-between pt-3" style={{ borderTop: '1px solid rgba(99,102,241,0.2)' }}>
                <span className="text-base font-bold" style={{ color: '#6366F1' }}>Total</span>
                <span className="text-lg font-bold" style={{ color: '#6366F1' }}>{formatCurrency(displayTotal)}</span>
              </div>
            </div>

            {/* Pagamento */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#10B981' }}>Pagamento</p>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              {!editing ? (
                <div className="p-3 rounded-xl inline-flex items-center gap-2" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                  <PayIcon size={14} style={{ color: '#10B981' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{PAYMENT_LABELS[order.payment_method] ?? order.payment_method}</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'cash', label: 'Dinheiro', Icon: Banknote },
                    { value: 'pix', label: 'PIX', Icon: Smartphone },
                    { value: 'credit_card', label: 'Crédito', Icon: CreditCard },
                    { value: 'debit_card', label: 'Débito', Icon: Wallet },
                    { value: 'meal_voucher', label: 'Vale', Icon: CheckSquare },
                    { value: 'other', label: 'Outro', Icon: DollarSign },
                  ].map(({ value, label, Icon }) => {
                    const active = editPayment === value;
                    return (
                      <button key={value} onClick={() => setEditPayment(value)}
                        className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: active ? (isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)') : 'var(--input-bg)',
                          border: `1.5px solid ${active ? '#10B981' : 'var(--input-border)'}`,
                          color: active ? '#10B981' : 'var(--text-muted)',
                        }}>
                        <Icon size={14} />{label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ModalShell>
      </ModalBackdrop>

      {/* Dispatch modal (opened from status flow) */}
      {showDispatch && (
        <DispatchModal
          orderId={order.id}
          drivers={drivers}
          onClose={() => setShowDispatch(false)}
          onSuccess={() => {
            const driverRecord = editDriverId ? drivers.find(d => d.id === editDriverId) : null;
            setOrder((o: any) => ({ ...o, status: 'out_for_delivery', driver: driverRecord }));
            onStatusChange();
          }}
        />
      )}
    </>
  );
}

// ─── Main OrdersView ──────────────────────────────────────────────────────────

export function OrdersView() {
  const isDark = useIsDark();
  const { store } = useStore();
  const { can, canOrderType, allowedOrderTypes, userRole } = useStaff();
  const { drivers = [] } = useDeliveryDrivers() as any;

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dispatchOrderId, setDispatchOrderId] = useState<string | null>(null);
  const [tableModal, setTableModal] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<StaffOrderType | 'all'>('all');
  const itemsPerPage = 20;

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

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [selectedStatus, search, typeFilter]);

  const stats = {
    total: filtered.length,
    pending: filtered.filter(o => (o.status as string) === 'pending').length,
    delivering: filtered.filter(o => (o.status as string) === 'out_for_delivery').length,
    done: filtered.filter(o => (o.status as string) === 'delivered').length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  );

  const canCreate = can('perm_orders_create' as any);
  const canEdit = can('perm_orders_edit' as any) || can('perm_orders_change_status' as any);
  const canDelete = can('perm_orders_delete' as any);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pedidos"
        subtitle={
          hasTypeRestriction && viewableTypes!.length > 0
            ? `Visualizando: ${viewableTypes!.map(t => ORDER_TYPE_LABELS[t]).join(', ')}`
            : 'Gerencie todos os pedidos da loja'
        }
        action={
          canCreate ? (
            <Button onClick={() => setShowModal(true)} icon={<ShoppingCart size={15} />}>
              Novo Pedido
            </Button>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Visíveis', value: stats.total, color: '#6366F1', icon: ShoppingCart },
          { label: 'Pendentes', value: stats.pending, color: '#F59E0B', icon: Clock },
          { label: 'Em entrega', value: stats.delivering, color: '#6366F1', icon: Truck },
          { label: 'Entregues', value: stats.done, color: '#10B981', icon: CheckCircle2 },
        ].map(({ label, value, color, icon: Icon }) => (
          <Card key={label} className="px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
              <Icon size={15} style={{ color }} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{value}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por pedido, cliente..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none transition-all"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#6366F1')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')}
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {STATUS_TABS.map(({ value, label }) => {
              const active = selectedStatus === value;
              return (
                <button key={value} onClick={() => setSelectedStatus(value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
                  style={{
                    background: active ? 'rgba(99,102,241,0.2)' : 'var(--input-bg)',
                    color: active ? '#818CF8' : 'var(--text-muted)',
                    border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'var(--input-border)'}`,
                  }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {availableTypes.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <div className="flex gap-1.5 overflow-x-auto">
              <button
                onClick={() => setTypeFilter('all')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
                style={{
                  background: typeFilter === 'all' ? 'rgba(99,102,241,0.15)' : 'var(--input-bg)',
                  color: typeFilter === 'all' ? '#818CF8' : 'var(--text-muted)',
                  border: `1px solid ${typeFilter === 'all' ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                }}>
                Todos os tipos
              </button>
              {availableTypes.map(type => {
                const Icon = ORDER_TYPE_ICON[type];
                const active = typeFilter === type;
                return (
                  <button key={type} onClick={() => setTypeFilter(type)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
                    style={{
                      background: active ? 'rgba(99,102,241,0.15)' : 'var(--input-bg)',
                      color: active ? '#818CF8' : 'var(--text-muted)',
                      border: `1px solid ${active ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                    }}>
                    <Icon size={11} /> {ORDER_TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Pedido', 'Cliente', 'Tipo', 'Entregador', 'Status', 'Total', 'Data', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-label)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order: any) => {
                const orderType = ((order as any).order_type ?? (order as any).type) as StaffOrderType;
                const TypeIcon = ORDER_TYPE_ICON[orderType] ?? Package;
                const isTable = orderType === 'table';
                const isDelivery = orderType === 'delivery';
                const canChangeStatus = can('perm_orders_change_status' as any) || canEdit;
                const userCanEdit = canEdit && canOrderType('edit', orderType);
                const userCanDelete = canDelete && canOrderType('delete', orderType);

                // Driver info
                const driverRecord = (drivers as any[]).find((d: any) => d.id === order.driver_id);
                const driverName = order.driver?.name ?? driverRecord?.name ?? null;

                return (
                  <tr key={order.id} className="transition-colors"
                    style={{ borderBottom: '1px solid var(--border-soft)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>

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
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {ORDER_TYPE_LABELS[orderType] ?? orderType}
                        </span>
                      </div>
                    </td>

                    {/* Entregador */}
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
                          order.status === 'preparing' && canChangeStatus ? (
                            <button
                              onClick={() => { setDispatchOrderId(order.id); setShowDispatchModal(true); }}
                              className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg transition-all"
                              style={{ background: isDark ? ALPHA.accentBgSubtleD : ALPHA.accentBgSubtleL, color: COLORS.accentLight }}>
                              <Send size={10} /> Despachar
                            </button>
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                          )
                        )
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    <td className="px-5 py-4"><StatusBadge status={order.status} /></td>

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

                    {/* Ações */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {/* Gerenciar mesa */}
                        {isTable && order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => setTableModal(order)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                            title="Gerenciar mesa"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(245,158,11,0.12)', color: '#F59E0B' })}
                            onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}
                          >
                            <Utensils size={15} />
                          </button>
                        )}

                        {/* Botão despachar rápido (delivery em preparing) */}
                        {isDelivery && order.status === 'preparing' && canChangeStatus && (
                          <button
                            onClick={() => { setDispatchOrderId(order.id); setShowDispatchModal(true); }}
                            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                            title="Despachar para entrega"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: `${COLORS.accent}18`, color: COLORS.accentLight })}
                            onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}
                          >
                            <Send size={15} />
                          </button>
                        )}

                        {/* Ver detalhes */}
                        <button
                          onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }}
                          className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(99,102,241,0.12)', color: '#818CF8' })}
                          onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}
                        >
                          <Eye size={15} />
                        </button>

                        {/* Excluir */}
                        {userCanDelete && (
                          <button
                            onClick={() => { setSelectedOrder(order); setShowDeleteModal(true); }}
                            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(239,68,68,0.12)', color: '#F87171' })}
                            onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ShoppingCart size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {hasTypeRestriction && viewableTypes!.length === 0
                ? 'Seu cargo não tem permissão para visualizar nenhum tipo de pedido.'
                : 'Nenhum pedido encontrado'}
            </p>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filtered.length)} de {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 rounded-lg text-xs font-semibold"
                  style={{
                    background: currentPage === page ? '#6366F1' : 'var(--input-bg)',
                    color: currentPage === page ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${currentPage === page ? '#6366F1' : 'var(--border)'}`,
                  }}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                Próxima
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Modals ── */}

      {showModal && store && (
        <OrderModal
          storeId={store.id}
          onClose={() => setShowModal(false)}
          onSuccess={async () => { await refetch?.(); setShowModal(false); }}
          canCreateTypes={allowedOrderTypes('create')}
        />
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
        <TableOrderModal
          order={tableModal}
          onClose={() => setTableModal(null)}
          onUpdated={async () => { await refetch?.(); }}
        />
      )}

      {/* Dispatch modal independente (via botão da tabela) */}
      {showDispatchModal && dispatchOrderId && (
        <DispatchModal
          orderId={dispatchOrderId}
          drivers={drivers as any[]}
          onClose={() => { setShowDispatchModal(false); setDispatchOrderId(null); }}
          onSuccess={async () => { await refetch?.(); }}
        />
      )}

      {showDeleteModal && selectedOrder && (
        <ModalBackdrop onClose={() => { setShowDeleteModal(false); setSelectedOrder(null); }}>
          <ModalShell maxW="max-w-sm">
            <div className="p-7 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.07)' }}>
                <AlertTriangle size={26} style={{ color: '#EF4444' }} />
              </div>
              <div>
                <p className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Remover Pedido</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Remover pedido <strong>#{selectedOrder.order_number || selectedOrder.id.slice(0, 6)}</strong>? Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => { setShowDeleteModal(false); setSelectedOrder(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    setDeleting(true);
                    try {
                      const { error } = await supabase.schema('orders').from('orders').delete().eq('id', selectedOrder.id);
                      if (error) throw error;
                      await refetch?.();
                      setShowDeleteModal(false);
                      setSelectedOrder(null);
                    } catch (err: any) { alert(err.message); }
                    finally { setDeleting(false); }
                  }}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)' }}>
                  {deleting ? <><Loader2 size={14} className="animate-spin" /> Removendo...</> : <><X size={14} /> Remover</>}
                </button>
              </div>
            </div>
          </ModalShell>
        </ModalBackdrop>
      )}
    </div>
  );
}