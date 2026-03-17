import { useState, useEffect } from 'react';
import {
  ShoppingCart, AlertTriangle, Loader2, CheckSquare,
  CheckCircle2, Send, User, X, DollarSign,
} from 'lucide-react';
import { supabase } from '@/supabase/client';
import { formatCurrency } from '@/lib/utils/format';
import { useIsDark } from '@/hooks/useIsDark';
import { ModalBackdrop, ModalShell, ModalHeader } from '@/components/ui/Modal';
import { DispatchModal } from '@/components/orders/DispatchModal';
import { COLORS, ALPHA } from '@/lib/constants';
import { PAYMENT_LABELS, PAYMENT_ICONS, PAYMENT_OPTIONS } from '@/types/orders';
import { OrderStatusBadge } from './OrderStatusBadge';

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

interface OrderDetailsModalProps {
  order: any;
  drivers: any[];
  onClose: () => void;
  onStatusChange: () => void;
  canEdit: boolean;
  canChangeStatus: boolean;
}

export function OrderDetailsModal({ order: initialOrder, drivers, onClose, onStatusChange, canEdit, canChangeStatus }: OrderDetailsModalProps) {
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
    if (newStatus === 'out_for_delivery') { setShowDispatch(true); return; }
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
      const updatePayload: any = { payment_method: editPayment, notes: editNotes || null, subtotal: newSubtotal, total: newTotal };
      if ((order.order_type ?? order.type) === 'delivery') updatePayload.driver_id = editDriverId || null;

      const { error: orderErr } = await supabase.schema('orders').from('orders').update(updatePayload).eq('id', order.id);
      if (orderErr) throw orderErr;

      const driverRecord = drivers.find(d => d.id === editDriverId);
      setOrder((o: any) => ({ ...o, payment_method: editPayment, notes: editNotes, subtotal: newSubtotal, total: newTotal, driver_id: editDriverId || null, driver: driverRecord ?? null }));
      setItems(editItems);
      setEditing(false);
      onStatusChange();
    } catch (err: any) { alert(err.message ?? 'Erro ao salvar'); }
    finally { setSavingEdit(false); }
  };

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = STATUS_FLOW[currentIndex + 1];
  const prevStatus = STATUS_FLOW[currentIndex - 1];
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
    background: 'var(--input-bg)', border: '1px solid var(--input-border)',
    color: 'var(--text-primary)', borderRadius: 12, fontSize: 13, width: '100%', outline: 'none',
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
            <Section label="Status" color="#6366F1">
              <div className="flex flex-wrap items-center gap-2">
                <OrderStatusBadge status={order.status} />
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
            </Section>

            {/* Entregador */}
            {isDelivery && (
              <Section label="Entregador" color={COLORS.accent}>
                {!editing ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: currentDriver ? 'rgba(99,102,241,0.15)' : 'var(--surface)' }}>
                      <User size={14} style={{ color: currentDriver ? '#818CF8' : 'var(--text-muted)' }} />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {currentDriver?.name ?? 'Sem entregador atribuído'}
                    </p>
                    {currentDriver?.vehicle && (
                      <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8' }}>
                        {currentDriver.vehicle}
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <User size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <select value={editDriverId} onChange={e => setEditDriverId(e.target.value)} style={selStyle}>
                      <option value="">Sem entregador</option>
                      {activeDrivers.map(d => <option key={d.id} value={d.id}>{d.name}{d.vehicle ? ` · ${d.vehicle}` : ''}</option>)}
                    </select>
                  </div>
                )}
              </Section>
            )}

            {/* Cliente */}
            <Section label="Cliente" color="#8B5CF6">
              <div className="p-4 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {order.customer?.name || (isTable && order.table_number ? `Mesa ${order.table_number}` : 'Cliente não informado')}
                </p>
              </div>
            </Section>

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
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.product_name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatCurrency(item.unit_price)} ×{' '}
                        {editing ? (
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
              <div className="flex justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(displaySubtotal)}</span>
              </div>
              {(order.delivery_fee ?? 0) > 0 && (
                <div className="flex justify-between mb-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Taxa Entrega</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(order.delivery_fee)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3" style={{ borderTop: '1px solid rgba(99,102,241,0.2)' }}>
                <span className="text-base font-bold" style={{ color: '#6366F1' }}>Total</span>
                <span className="text-lg font-bold" style={{ color: '#6366F1' }}>{formatCurrency(displayTotal)}</span>
              </div>
            </div>

            {/* Pagamento */}
            <Section label="Pagamento" color="#10B981">
              {!editing ? (
                <div className="p-3 rounded-xl inline-flex items-center gap-2" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                  <PayIcon size={14} style={{ color: '#10B981' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{PAYMENT_LABELS[order.payment_method] ?? order.payment_method}</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_OPTIONS.map(({ value, label, Icon }) => {
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
            </Section>
          </div>
        </ModalShell>
      </ModalBackdrop>

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

function Section({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{label}</p>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>
      {children}
    </div>
  );
}
