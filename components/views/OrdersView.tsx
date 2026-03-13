import { useState, useEffect } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { useDeliveryZones, useDeliveryDrivers } from '@/hooks/useDelivery';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatCurrency } from '@/lib/utils/format';
import {
  Search, Eye, ShoppingCart, Clock, CheckCircle2, XCircle,
  Truck, Package, UtensilsCrossed, Filter, ChevronDown,
  ArrowUpRight, RotateCcw, Plus, X, Loader2, User, Phone,
  MapPin, Minus, DollarSign, AlertTriangle, Edit2, Banknote,
  CreditCard, Smartphone, Wallet, CheckSquare
} from 'lucide-react';
import type { OrderStatus } from '@/types';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/forms/FormField';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { ModalBackdrop, ModalShell, ModalHeader, ModalFooter } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';


// ─── theme hook (mirrors dashboard) ──────────────────────────────────────────
type Theme = 'dark' | 'light';
declare module 'react' { interface Context<T> { } }
// We read CSS vars directly — no extra context needed
function useIsDark(): boolean {
  if (typeof window === 'undefined') return true;
  return (getComputedStyle(document.documentElement).getPropertyValue('--bg') || '').trim().startsWith('#08');
}

// ─── Modal primitives ────────────────────────────────────────────────────────







// ─── Order modal ──────────────────────────────────────────────────────────────
function OrderModal({ storeId, onClose, onSuccess }: { storeId: string; onClose: () => void; onSuccess: () => void }) {
  const isDark = useIsDark();
  const [saving, setSaving] = useState(false);
  const { customers = [] } = useCustomers() as any;
  const { products = [] } = useProducts() as any;
  const { zones = [] } = useDeliveryZones() as any;
  const { drivers = [] } = useDeliveryDrivers() as any;

  // Alerta de estoque baixo
  const [lowStockItems, setLowStockItems] = useState<string[]>([]);
  useEffect(() => {
    supabase.schema('inventory').from('product_stock_summary')
      .select('name, below_minimum')
      .eq('store_id', storeId)
      .eq('below_minimum', true)
      .then(({ data }) => {
        if (data) setLowStockItems(data.map((d: any) => d.name));
      });
  }, [storeId]);

  const [form, setForm] = useState({
    order_type: 'delivery',
    customer_id: '',
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    delivery_zone_id: '',
    driver_id: '',
    table_number: '',
    payment_method: 'cash',
    notes: '',
  });
  const [items, setItems] = useState<{ product_id: string; quantity: number; price: number }[]>([]);
  const [searchProduct, setSearchProduct] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const addItem = (product: any) => {
    const exists = items.find(i => i.product_id === product.id);
    if (exists) {
      setItems(items.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { product_id: product.id, quantity: 1, price: product.price }]);
    }
    setSearchProduct('');
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.product_id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return removeItem(productId);
    setItems(items.map(i => i.product_id === productId ? { ...i, quantity } : i));
  };

  const selectedCustomer = customers.find((c: any) => c.id === form.customer_id);
  const selectedZone = zones.find((z: any) => z.id === form.delivery_zone_id);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = form.order_type === 'delivery' ? (selectedZone?.delivery_fee || 0) : 0;
  const total = subtotal + deliveryFee;

  const filteredProducts = products.filter((p: any) =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) &&
    !items.find(i => i.product_id === p.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert('Adicione pelo menos um produto');

    // Validação: delivery precisa de cliente
    if (form.order_type === 'delivery' && !form.customer_id && !form.customer_name) {
      return alert('Informe o cliente para pedidos de entrega');
    }

    setSaving(true);
    try {
      let customerId = form.customer_id;

      // Se não tem customer_id mas tem nome (novo cliente), criar o cliente
      if (!customerId && form.customer_name) {
        const { data: newCustomer, error: customerError } = await supabase
          .schema('core')
          .from('customers')
          .insert({
            store_id: storeId,
            name: form.customer_name,
            phone: form.customer_phone || null,
            address: form.order_type === 'delivery' ? form.customer_address : null,
          })
          .select()
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      const orderData: any = {
        store_id: storeId,
        type: form.order_type,
        customer_id: customerId || null,
        status: 'pending',
        payment_method: form.payment_method,
        subtotal,
        total,
        notes: form.notes || null,
      };

      if (form.order_type === 'delivery') {
        orderData.delivery_address = form.customer_address;
        orderData.delivery_zone_id = form.delivery_zone_id || null;
        orderData.driver_id = form.driver_id || null;
        orderData.delivery_fee = deliveryFee;
      } else if (form.order_type === 'table' && form.table_number) {
        orderData.table_number = form.table_number;
      }

      const { data: order, error: orderError } = await supabase
        .schema('orders')
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: products.find((p: any) => p.id === item.product_id)?.name || 'Produto',
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .schema('orders')
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      onSuccess();
    } catch (err: any) { alert(err.message ?? 'Erro ao criar pedido'); }
    finally { setSaving(false); }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell maxW="max-w-3xl">
        <ModalHeader title="Novo Pedido" subtitle="Registre um novo pedido" icon={ShoppingCart} onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Alerta de estoque baixo — não-bloqueante */}
            {lowStockItems.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl"
                style={{
                  background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)',
                  border: `1px solid ${isDark ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.2)'}`,
                }}>
                <AlertTriangle size={16} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p className="text-xs font-bold" style={{ color: isDark ? '#FCD34D' : '#92400E' }}>
                    Atenção: estoque baixo
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: isDark ? 'rgba(252,211,77,0.8)' : '#B45309' }}>
                    Verifique a disponibilidade antes de confirmar: {lowStockItems.slice(0, 4).join(', ')}{lowStockItems.length > 4 ? ` e mais ${lowStockItems.length - 4}...` : ''}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3"><p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: "#6366F1" }}>Tipo de Pedido</p><div className="flex-1 h-px" style={{ background: "var(--border)" }} /></div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'delivery', label: 'Entrega', icon: Truck },
                { value: 'pickup', label: 'Retirada', icon: Package },
                { value: 'table', label: 'No Local', icon: UtensilsCrossed },
              ].map(({ value, label, icon: Icon }) => (
                <button key={value} type="button" onClick={() => setForm(f => ({ ...f, order_type: value }))}
                  className="flex flex-col items-center gap-2 py-3 rounded-xl transition-all"
                  style={{
                    background: form.order_type === value ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)') : 'var(--input-bg)',
                    border: `1px solid ${form.order_type === value ? '#6366F1' : 'var(--input-border)'}`,
                    color: form.order_type === value ? '#818CF8' : 'var(--text-muted)',
                  }}>
                  <Icon size={20} />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              ))}
            </div>

            <div style={{ height: 1, background: 'var(--border)' }} />
            <div className="flex items-center gap-3"><p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: "#8B5CF6" }}>Cliente</p><div className="flex-1 h-px" style={{ background: "var(--border)" }} /></div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Cliente Cadastrado">
                <select value={form.customer_id} onChange={set('customer_id')}
                  className="w-full rounded-xl text-sm outline-none transition-all"
                  style={{ padding: '0.6rem 0.875rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#8B5CF6')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')}>
                  <option value="">Novo cliente</option>
                  {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FormField>
              <FormField label="Nome" required={form.order_type === 'delivery' && !form.customer_id}>
                <Input icon={User} value={form.customer_name} onChange={set('customer_name')} placeholder="Nome do cliente" disabled={!!form.customer_id} required={form.order_type === 'delivery' && !form.customer_id} />
              </FormField>
            </div>
            <FormField label="Telefone">
              <Input icon={Phone} value={form.customer_phone} onChange={set('customer_phone')} placeholder="(00) 00000-0000" disabled={!!form.customer_id} />
            </FormField>

            {form.order_type === 'delivery' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Zona de Entrega">
                    <select value={form.delivery_zone_id} onChange={set('delivery_zone_id')}
                      className="w-full rounded-xl text-sm outline-none transition-all"
                      style={{ padding: '0.6rem 0.875rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#8B5CF6')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')}>
                      <option value="">Selecione</option>
                      {zones.filter((z: any) => z.active).map((z: any) => (
                        <option key={z.id} value={z.id}>{z.neighborhood} - {formatCurrency(z.delivery_fee)}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Entregador">
                    <select value={form.driver_id} onChange={set('driver_id')}
                      className="w-full rounded-xl text-sm outline-none transition-all"
                      style={{ padding: '0.6rem 0.875rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#8B5CF6')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')}>
                      <option value="">Atribuir depois</option>
                      {drivers.filter((d: any) => d.active).map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </FormField>
                </div>
                <FormField label="Endereço de Entrega" required>
                  <Input icon={MapPin} value={form.customer_address} onChange={set('customer_address')} placeholder="Rua, número, complemento" required />
                </FormField>
              </>
            )}

            {form.order_type === 'table' && (
              <FormField label="Número da Mesa">
                <Input value={form.table_number} onChange={set('table_number')} placeholder="Ex: 5" />
              </FormField>
            )}

            <div style={{ height: 1, background: 'var(--border)' }} />
            <div className="flex items-center gap-3"><p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: "#10B981" }}>Produtos</p><div className="flex-1 h-px" style={{ background: "var(--border)" }} /></div>

            <FormField label="Buscar Produto">
              <div className="relative">
                <Input icon={Search} value={searchProduct} onChange={e => setSearchProduct(e.target.value)} placeholder="Digite para buscar..." />
                {searchProduct && filteredProducts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)', maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredProducts.slice(0, 5).map((p: any) => (
                      <button key={p.id} type="button" onClick={() => addItem(p)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-all"
                        style={{ borderBottom: '1px solid var(--border-soft)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                        <span className="text-sm font-bold" style={{ color: '#10B981' }}>{formatCurrency(p.price)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </FormField>

            {items.length > 0 && (
              <div className="space-y-2">
                {items.map(item => {
                  const product = products.find((p: any) => p.id === item.product_id);
                  return (
                    <div key={item.product_id} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)', border: '1px solid var(--border-soft)' }}>
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{product?.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatCurrency(item.price)} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-bold w-8 text-center" style={{ color: 'var(--text-primary)' }}>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-bold w-20 text-right" style={{ color: '#10B981' }}>
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                      <button type="button" onClick={() => removeItem(item.product_id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                        style={{ background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)', color: '#F87171' }}>
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ height: 1, background: 'var(--border)' }} />
            <div className="flex items-center gap-3"><p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: "#F59E0B" }}>Pagamento</p><div className="flex-1 h-px" style={{ background: "var(--border)" }} /></div>
            <FormField label="Forma de Pagamento" required>
              <select value={form.payment_method} onChange={set('payment_method')}
                className="w-full rounded-xl text-sm outline-none transition-all"
                style={{ padding: '0.6rem 0.875rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#F59E0B')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')}>
                <option value="cash">Dinheiro</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="pix">PIX</option>
              </select>
            </FormField>
            <FormField label="Observações">
              <textarea value={form.notes} onChange={set('notes')}
                className="w-full rounded-xl text-sm outline-none transition-all resize-none"
                style={{ padding: '0.6rem 0.875rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', minHeight: '80px' }}
                placeholder="Observações sobre o pedido..."
                onFocus={e => (e.currentTarget.style.borderColor = '#F59E0B')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')} />
            </FormField>

            <div className="rounded-xl p-4" style={{ background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div className="flex justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(subtotal)}</span>
              </div>
              {form.order_type === 'delivery' && (
                <div className="flex justify-between mb-3">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Taxa de Entrega</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3" style={{ borderTop: '1px solid rgba(99,102,241,0.2)' }}>
                <span className="text-base font-bold" style={{ color: '#6366F1' }}>Total</span>
                <span className="text-lg font-bold" style={{ color: '#6366F1' }}>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
          <ModalFooter onCancel={onClose} onSubmit={() => { }} saving={saving} saveLabel="Criar Pedido" />
        </form>
      </ModalShell>
    </ModalBackdrop>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Dinheiro', credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito', pix: 'PIX',
  meal_voucher: 'Vale Refeição', other: 'Outro',
};
const PAYMENT_ICONS: Record<string, React.FC<any>> = {
  cash: Banknote, credit_card: CreditCard,
  debit_card: Wallet, pix: Smartphone,
  meal_voucher: CreditCard, other: DollarSign,
};

// ─── Order Details Modal ──────────────────────────────────────────────────────
function OrderDetailsModal({ order: initialOrder, onClose, onStatusChange }: {
  order: any; onClose: () => void; onStatusChange: () => void;
}) {
  const isDark = useIsDark();
  const [order, setOrder] = useState<any>(initialOrder);
  const [updating, setUpdating] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // edit mode
  const [editing, setEditing] = useState(false);
  const [editItems, setEditItems] = useState<any[]>([]);
  const [editPayment, setEditPayment] = useState(order.payment_method);
  const [editNotes, setEditNotes] = useState(order.notes ?? '');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    supabase.schema('orders').from('order_items').select('*').eq('order_id', order.id)
      .then(({ data }) => { if (data) { setItems(data); setEditItems(data.map(i => ({ ...i }))); } setLoadingItems(false); });
  }, [order.id]);

  // ── status ──
  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase.schema('orders').from('orders').update({ status: newStatus }).eq('id', order.id);
      if (error) throw error;
      setOrder((o: any) => ({ ...o, status: newStatus }));
      onStatusChange();
    } catch (err: any) { alert(err.message); }
    finally { setUpdating(false); }
  };

  // ── marcar como pago ──
  const handleMarkPaid = async () => {
    setMarkingPaid(true);
    try {
      const { error } = await supabase.schema('orders').from('orders')
        .update({ payment_status: 'paid' }).eq('id', order.id);
      if (error) throw error;
      setOrder((o: any) => ({ ...o, payment_status: 'paid' }));
      onStatusChange();
    } catch (err: any) { alert(err.message); }
    finally { setMarkingPaid(false); }
  };

  // ── edição de itens ──
  const updateEditQty = (id: string, delta: number) => {
    setEditItems(prev => prev.map(i => i.id === id
      ? { ...i, quantity: Math.max(1, i.quantity + delta), subtotal: i.unit_price * Math.max(1, i.quantity + delta) }
      : i
    ));
  };
  const removeEditItem = (id: string) => setEditItems(prev => prev.filter(i => i.id !== id));

  // ── salvar edição ──
  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      if (editItems.length === 0) { alert('O pedido precisa ter pelo menos 1 item.'); return; }

      // atualizar quantities nos order_items
      for (const item of editItems) {
        const original = items.find(i => i.id === item.id);
        if (original && (original.quantity !== item.quantity)) {
          const { error } = await supabase.schema('orders').from('order_items')
            .update({ quantity: item.quantity, subtotal: item.unit_price * item.quantity })
            .eq('id', item.id);
          if (error) throw error;
        }
      }
      // remover itens deletados
      const removedIds = items.filter(i => !editItems.find(e => e.id === i.id)).map(i => i.id);
      if (removedIds.length > 0) {
        const { error } = await supabase.schema('orders').from('order_items').delete().in('id', removedIds);
        if (error) throw error;
      }

      // recalcular subtotal/total
      const newSubtotal = editItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
      const newTotal = newSubtotal + (order.delivery_fee ?? 0) - (order.discount ?? 0);

      const { error: orderErr } = await supabase.schema('orders').from('orders').update({
        payment_method: editPayment,
        notes: editNotes || null,
        subtotal: newSubtotal,
        total: newTotal,
      }).eq('id', order.id);
      if (orderErr) throw orderErr;

      setOrder((o: any) => ({ ...o, payment_method: editPayment, notes: editNotes, subtotal: newSubtotal, total: newTotal }));
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
  const isPaid = order.payment_status === 'paid';
  const PayIcon = PAYMENT_ICONS[order.payment_method] ?? DollarSign;

  const displayItems = editing ? editItems : items;
  const displaySubtotal = editing
    ? editItems.reduce((s, i) => s + i.unit_price * i.quantity, 0)
    : order.subtotal;
  const displayTotal = displaySubtotal + (order.delivery_fee ?? 0) - (order.discount ?? 0);

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell maxW="max-w-2xl">
        <ModalHeader
          title={`Pedido #${order.order_number || order.id.slice(0, 6)}`}
          subtitle={`Criado em ${new Date(order.created_at).toLocaleString('pt-BR')}`}
          icon={ShoppingCart}
          onClose={onClose}
        />
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Alerta de pagamento pendente para mesas */}
          {isTable && !isPaid && (
            <div className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)', border: `1px solid ${isDark ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.2)'}` }}>
              <AlertTriangle size={16} style={{ color: '#F59E0B', flexShrink: 0 }} />
              <div className="flex-1">
                <p className="text-xs font-bold" style={{ color: isDark ? '#FCD34D' : '#92400E' }}>Pagamento pendente</p>
                <p className="text-[11px]" style={{ color: isDark ? 'rgba(252,211,77,0.8)' : '#B45309' }}>
                  Este pedido de mesa ainda não foi cobrado.
                </p>
              </div>
              <button onClick={handleMarkPaid} disabled={markingPaid}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-60 transition-all whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}>
                {markingPaid ? <Loader2 size={12} className="animate-spin" /> : <CheckSquare size={12} />}
                Marcar como pago
              </button>
            </div>
          )}
          {isTable && isPaid && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckSquare size={14} style={{ color: '#10B981' }} />
              <span className="text-xs font-semibold" style={{ color: isDark ? '#6EE7B7' : '#065F46' }}>Pago</span>
            </div>
          )}

          {/* Status */}
          <div>
            <div className="flex items-center gap-3"><p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: "#6366F1" }}>Status do Pedido</p><div className="flex-1 h-px" style={{ background: "var(--border)" }} /></div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={order.status} />
              {prevStatus && (
                <button onClick={() => handleStatusChange(prevStatus)} disabled={updating}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  ← Voltar
                </button>
              )}
              {nextStatus && (
                <button onClick={() => handleStatusChange(nextStatus)} disabled={updating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}>
                  {updating ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                  Avançar →
                </button>
              )}
              {order.status !== 'delivered' && (
                <button onClick={() => handleStatusChange('delivered')} disabled={updating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                  style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <CheckCircle2 size={12} /> Marcar como entregue
                </button>
              )}
            </div>
          </div>

          {/* Cliente */}
          <div>
            <div className="flex items-center gap-3"><p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: "#8B5CF6" }}>Cliente</p><div className="flex-1 h-px" style={{ background: "var(--border)" }} /></div>
            <div className="mt-3 p-4 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {order.customer?.name || (isTable && order.table_number ? `Mesa ${order.table_number}` : 'Cliente não informado')}
              </p>
              {order.customer?.phone && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  <Phone size={10} className="inline mr-1" />{order.customer.phone}
                </p>
              )}
            </div>
          </div>

          {/* Entrega */}
          {(order.type === 'delivery' || order.order_type === 'delivery') && order.delivery_address && (
            <div>
              <div className="flex items-center gap-3"><p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: "#10B981" }}>Entrega</p><div className="flex-1 h-px" style={{ background: "var(--border)" }} /></div>
              <div className="mt-3 p-4 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <MapPin size={12} className="inline mr-1" />{order.delivery_address}
                  {order.delivery_neighborhood && ` — ${order.delivery_neighborhood}`}
                </p>
                {order.delivery_complement && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Complemento: {order.delivery_complement}</p>
                )}
                {order.delivery_fee > 0 && (
                  <p className="text-xs mt-2 font-semibold" style={{ color: '#10B981' }}>Taxa: {formatCurrency(order.delivery_fee)}</p>
                )}
              </div>
            </div>
          )}

          {/* Itens + modo edição */}
          <div>
            <div className="flex items-center gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: "#F59E0B" }}>Itens do Pedido</p>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              {!editing ? (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { color: '#818CF8', borderColor: '#6366F1' })}
                  onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { color: 'var(--text-muted)', borderColor: 'var(--border)' })}>
                  <Edit2 size={11} /> Editar
                </button>
              ) : (
                <div className="flex gap-1.5">
                  <button onClick={() => { setEditing(false); setEditItems(items.map(i => ({ ...i }))); setEditPayment(order.payment_method); setEditNotes(order.notes ?? ''); }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    Cancelar
                  </button>
                  <button onClick={handleSaveEdit} disabled={savingEdit}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                    {savingEdit ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                    Salvar
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 space-y-2">
              {loadingItems ? (
                <div className="text-center py-4"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: 'var(--text-muted)' }} /></div>
              ) : displayItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.product_name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatCurrency(item.unit_price)} × {item.quantity}</p>
                  </div>
                  {editing ? (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateEditQty(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        <Minus size={10} />
                      </button>
                      <span className="text-sm font-bold w-5 text-center" style={{ color: 'var(--text-primary)' }}>{item.quantity}</span>
                      <button onClick={() => updateEditQty(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        <Plus size={10} />
                      </button>
                      <button onClick={() => removeEditItem(item.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg ml-1"
                        style={{ background: 'rgba(239,68,68,0.08)', color: '#F87171' }}>
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm font-bold" style={{ color: '#10B981' }}>
                      {formatCurrency(item.unit_price * item.quantity)}
                    </span>
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
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Taxa de Entrega</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(order.delivery_fee)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3" style={{ borderTop: '1px solid rgba(99,102,241,0.2)' }}>
              <span className="text-base font-bold" style={{ color: '#6366F1' }}>Total</span>
              <span className="text-lg font-bold" style={{ color: '#6366F1' }}>{formatCurrency(displayTotal)}</span>
            </div>
          </div>

          {/* Pagamento */}
          <div>
            <div className="flex items-center gap-3"><p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: "#10B981" }}>Pagamento</p><div className="flex-1 h-px" style={{ background: "var(--border)" }} /></div>
            {editing ? (
              <div className="mt-3">
                <select value={editPayment} onChange={e => setEditPayment(e.target.value)}
                  className="w-full rounded-xl text-sm outline-none"
                  style={{ padding: '0.6rem 0.875rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#10B981')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')}>
                  {Object.entries(PAYMENT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ) : (
              <div className="mt-3 p-3 rounded-xl inline-flex items-center gap-2"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                <PayIcon size={14} style={{ color: '#10B981' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {PAYMENT_LABELS[order.payment_method] ?? order.payment_method}
                </span>
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <div className="flex items-center gap-3"><p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: "#6B7280" }}>Observações</p><div className="flex-1 h-px" style={{ background: "var(--border)" }} /></div>
            {editing ? (
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)}
                className="mt-3 w-full rounded-xl text-sm outline-none resize-none"
                style={{ padding: '0.6rem 0.875rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', minHeight: 70 }}
                placeholder="Observações do pedido..."
                onFocus={e => (e.currentTarget.style.borderColor = '#6B7280')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')} />
            ) : order.notes ? (
              <div className="mt-3 p-4 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{order.notes}</p>
              </div>
            ) : (
              <p className="mt-2 text-xs italic" style={{ color: 'var(--text-muted)' }}>Nenhuma observação</p>
            )}
          </div>

        </div>
      </ModalShell>
    </ModalBackdrop>
  );
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; dot: string; bgD: string; bgL: string; txD: string; txL: string }> = {
  pending: { label: 'Pendente', dot: '#F59E0B', bgD: 'rgba(245,158,11,0.15)', bgL: 'rgba(245,158,11,0.1)', txD: '#FCD34D', txL: '#92400E' },
  confirmed: { label: 'Confirmado', dot: '#3B82F6', bgD: 'rgba(59,130,246,0.15)', bgL: 'rgba(59,130,246,0.1)', txD: '#93C5FD', txL: '#1E40AF' },
  preparing: { label: 'Preparando', dot: '#8B5CF6', bgD: 'rgba(139,92,246,0.15)', bgL: 'rgba(139,92,246,0.1)', txD: '#C4B5FD', txL: '#5B21B6' },
  out_for_delivery: { label: 'Saiu para entrega', dot: '#6366F1', bgD: 'rgba(99,102,241,0.15)', bgL: 'rgba(99,102,241,0.1)', txD: '#A5B4FC', txL: '#3730A3' },
  delivered: { label: 'Entregue', dot: '#10B981', bgD: 'rgba(16,185,129,0.15)', bgL: 'rgba(16,185,129,0.1)', txD: '#6EE7B7', txL: '#065F46' },
  cancelled: { label: 'Cancelado', dot: '#EF4444', bgD: 'rgba(239,68,68,0.15)', bgL: 'rgba(239,68,68,0.1)', txD: '#FCA5A5', txL: '#991B1B' },
};

const STATUS_TABS: { value: OrderStatus | 'all'; label: string; icon: React.FC<any>; color: string }[] = [
  { value: 'all', label: 'Todos', icon: ShoppingCart, color: '#6366F1' },
  { value: 'pending', label: 'Pendentes', icon: Clock, color: '#F59E0B' },
  { value: 'confirmed', label: 'Confirmados', icon: CheckCircle2, color: '#3B82F6' },
  { value: 'preparing', label: 'Preparando', icon: RotateCcw, color: '#8B5CF6' },
  { value: 'out_for_delivery', label: 'Em entrega', icon: Truck, color: '#6366F1' },
  { value: 'delivered', label: 'Entregues', icon: CheckCircle2, color: '#10B981' },
  { value: 'cancelled', label: 'Cancelados', icon: XCircle, color: '#EF4444' },
];

const ORDER_TYPE_ICON: Record<string, React.FC<any>> = {
  delivery: Truck,
  pickup: Package,
  table: UtensilsCrossed,
};

function StatusBadge({ status }: { status: string }) {
  const isDark = useIsDark();
  const cfg = STATUS_CFG[status] ?? { label: status, dot: '#9CA3AF', bgD: 'rgba(156,163,175,0.15)', bgL: 'rgba(156,163,175,0.1)', txD: '#D1D5DB', txL: '#374151' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ background: isDark ? cfg.bgD : cfg.bgL, color: isDark ? cfg.txD : cfg.txL }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

export function OrdersView() {
  const isDark = useIsDark();
  const { store } = useStore();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const { orders, loading, refetch } = useOrders(selectedStatus === 'all' ? undefined : (selectedStatus as any));

  const filtered = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    (o as any).customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    (o as any).customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    String((o as any).order_number ?? '').includes(search)
  );

  const stats = {
    total: orders.length,
    pending: orders.filter(o => (o.status as string) === 'pending').length,
    delivering: orders.filter(o => (o.status as string) === 'out_for_delivery').length,
    done: orders.filter(o => (o.status as string) === 'delivered').length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Header */}
      <PageHeader
        title="Pedidos"
        subtitle="Gerencie todos os pedidos da loja"
        action={
          <Button onClick={() => setShowModal(true)} icon={<ShoppingCart size={15} />}>
            Novo Pedido
          </Button>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: '#6366F1', icon: ShoppingCart },
          { label: 'Pendentes', value: stats.pending, color: '#F59E0B', icon: Clock },
          { label: 'Em entrega', value: stats.delivering, color: '#6366F1', icon: Truck },
          { label: 'Entregues', value: stats.done, color: '#10B981', icon: CheckCircle2 },
        ].map(({ label, value, color, icon: Icon }) => (
          <Card key={label} className="px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}15` }}>
              <Icon size={15} style={{ color }} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{value}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters bar */}
      <Card className="p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por pedido, cliente..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none transition-all"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#6366F1')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')} />
        </div>

        {/* Status tabs (scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {STATUS_TABS.map(({ value, label, color }) => {
            const active = selectedStatus === value;
            return (
              <button key={value} onClick={() => setSelectedStatus(value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
                style={{
                  background: active ? `${color}20` : 'var(--input-bg)',
                  color: active ? color : 'var(--text-muted)',
                  border: `1px solid ${active ? `${color}40` : 'var(--input-border)'}`,
                }}>
                {label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Pedido', 'Cliente', 'Tipo', 'Status', 'Total', 'Data', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-label)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order: any) => {
                const TypeIcon = ORDER_TYPE_ICON[order.order_type] ?? Package;
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
                        <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
                          {order.order_type?.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                          {formatCurrency(order.total)}
                        </span>
                        {(order.type === 'table' || order.order_type === 'table') && order.payment_status === 'unpaid' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold w-max"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                            <span className="w-1 h-1 rounded-full bg-amber-400" />A pagar
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
                        <button onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }}
                          className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(99,102,241,0.12)', color: '#818CF8' })}
                          onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}>
                          <Eye size={15} />
                        </button>
                        <button onClick={() => { setSelectedOrder(order); setShowDeleteModal(true); }}
                          className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(239,68,68,0.12)', color: '#F87171' })}
                          onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}>
                          <X size={15} />
                        </button>
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
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum pedido encontrado</p>
          </div>
        )}
      </Card>

      {/* Modal Criar */}
      {showModal && store && (
        <OrderModal
          storeId={store.id}
          onClose={() => setShowModal(false)}
          onSuccess={async () => {
            await refetch?.();
            setShowModal(false);
          }}
        />
      )}

      {/* Modal Detalhes */}
      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => { setShowDetailsModal(false); setSelectedOrder(null); }}
          onStatusChange={async () => { await refetch?.(); }}
        />
      )}

      {/* Modal Deletar */}
      {showDeleteModal && selectedOrder && (
        <ModalBackdrop onClose={() => { setShowDeleteModal(false); setSelectedOrder(null); }}>
          <ModalShell maxW="max-w-sm">
            <div className="p-7 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.07)' }}>
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
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)'}>
                  Cancelar
                </button>
                <button onClick={async () => {
                  setDeleting(true);
                  try {
                    const { error } = await supabase.schema('orders').from('orders').delete().eq('id', selectedOrder.id);
                    if (error) throw error;
                    await refetch?.();
                    setShowDeleteModal(false);
                    setSelectedOrder(null);
                  } catch (err: any) { alert(err.message); }
                  finally { setDeleting(false); }
                }} disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
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