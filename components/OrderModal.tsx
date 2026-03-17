'use client';
/**
 * OrderModal — wizard de criação de pedido.
 *
 * Mudanças em relação à versão anterior:
 * - Usa o componente <ProductGrid> compartilhado (mesma UX do TableOrderModal)
 * - Para pedidos do tipo "table": ao criar o pedido, automaticamente cria a
 *   rodada 1 com os itens e já a envia para a cozinha (send_round).
 * - Para delivery / pickup: comportamento idêntico ao original.
 */
import { useState, useEffect } from 'react';
import { useIsDark } from '@/hooks/useIsDark';
import {
    X, ArrowUpRight, ShoppingCart, Loader2,
    User, Phone, MapPin, Banknote, CreditCard,
    Smartphone, Wallet, CheckSquare, DollarSign, Edit2,
    Truck, Package, UtensilsCrossed, Minus, Plus,
} from 'lucide-react';
import { supabase } from '@/supabase/client';
import { useStore } from '@/contexts/StoreContext';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useDeliveryZones, useDeliveryDrivers } from '@/hooks/useDelivery';
import { formatCurrency } from '@/lib/utils/format';
import { ProductGrid, CartLineItem } from '@/components/ProductGrid';
import type { OrderType as StaffOrderType } from '@/contexts/StaffContext';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/Input';
import { ModalBackdrop } from '@/components/ui/Modal';
import { COLORS, ALPHA } from '@/lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

const ORDER_TYPE_ICON: Record<string, React.FC<any>> = {
    delivery: Truck,
    pickup: Package,
    table: UtensilsCrossed,
};

const PAYMENT_OPTS = [
    { value: 'cash', label: 'Dinheiro', Icon: Banknote },
    { value: 'pix', label: 'PIX', Icon: Smartphone },
    { value: 'credit_card', label: 'Crédito', Icon: CreditCard },
    { value: 'debit_card', label: 'Débito', Icon: Wallet },
    { value: 'meal_voucher', label: 'Vale', Icon: CheckSquare },
    { value: 'other', label: 'Outro', Icon: DollarSign },
] as const;

interface OrderModalProps {
    storeId: string;
    onClose: () => void;
    onSuccess: () => void;
    canCreateTypes: StaffOrderType[] | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderModal({ storeId, onClose, onSuccess, canCreateTypes }: OrderModalProps) {
    const isDark = useIsDark();
    const { products } = useProducts();
    const { customers = [] } = useCustomers() as any;
    const { zones = [] } = useDeliveryZones() as any;
    const { drivers = [] } = useDeliveryDrivers() as any;

    const allTypes: StaffOrderType[] = ['delivery', 'pickup', 'table'];
    const availableTypes = canCreateTypes === null ? allTypes : allTypes.filter(t => canCreateTypes.includes(t));
    const defaultType = availableTypes[0] ?? 'delivery';

    const [step, setStep] = useState<1 | 2>(1);
    const [saving, setSaving] = useState(false);

    // Cart
    const [cart, setCart] = useState<CartLineItem[]>([]);

    const addToCart = (p: any) => {
        const price = p.promotional_price ?? p.price;
        setCart(prev => {
            const idx = prev.findIndex(i => i.product_id === p.id);
            if (idx >= 0) return prev.map((i, n) => n === idx ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { product_id: p.id, product_name: p.name, unit_price: price, qty: 1 }];
        });
    };

    const changeQty = (productId: string, delta: number) => {
        setCart(prev =>
            prev.map(i => i.product_id === productId ? { ...i, qty: i.qty + delta } : i)
                .filter(i => i.qty > 0)
        );
    };

    // Order form
    const [form, setForm] = useState({
        order_type: defaultType as StaffOrderType,
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

    const set = (k: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
            setForm(f => ({ ...f, [k]: e.target.value }));

    const subtotal = cart.reduce((s, i) => s + i.unit_price * i.qty, 0);
    const deliveryFee = form.order_type === 'delivery' && form.delivery_zone_id
        ? (zones.find((z: any) => z.id === form.delivery_zone_id)?.delivery_fee ?? 0)
        : 0;
    const total = subtotal + deliveryFee;
    const cartQty = cart.reduce((s, i) => s + i.qty, 0);

    const isTable = form.order_type === 'table';

    // ── Submit ──────────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cart.length) return alert('Adicione pelo menos um produto');
        if (form.order_type === 'delivery' && !form.customer_id && !form.customer_name)
            return alert('Informe o cliente para pedidos de entrega');
        setSaving(true);

        try {
            // 1. Resolve / cria cliente
            let cid = form.customer_id;
            if (!cid && form.customer_name) {
                const { data: nc, error: ce } = await supabase.schema('core').from('customers').insert({
                    store_id: storeId,
                    name: form.customer_name,
                    phone: form.customer_phone || null,
                    address: form.order_type === 'delivery' ? form.customer_address : null,
                }).select().single();
                if (ce) throw ce;
                cid = nc.id;
            }

            // 2. Para mesa: status começa em 'confirmed' (a conta fica aberta)
            //    Para delivery: 'pending'
            const initialStatus = isTable ? 'confirmed' : 'pending';

            // 3. Cria o pedido
            const orderPayload: any = {
                store_id: storeId,
                type: form.order_type,
                customer_id: cid || null,
                status: initialStatus,
                payment_method: form.payment_method,
                subtotal,
                total,
                notes: form.notes || null,
                payment_status: isTable ? 'unpaid' : 'paid',
            };

            if (form.order_type === 'delivery') {
                orderPayload.delivery_address = form.customer_address;
                orderPayload.delivery_zone_id = form.delivery_zone_id || null;
                orderPayload.driver_id = form.driver_id || null;
                orderPayload.delivery_fee = deliveryFee;
            }
            if (isTable && form.table_number) {
                orderPayload.table_number = form.table_number;
            }

            const { data: order, error: oe } = await supabase.schema('orders').from('orders')
                .insert(orderPayload).select().single();
            if (oe) throw oe;

            // 4a. Delivery / pickup: insere itens diretamente (item_status = 'delivered')
            if (!isTable) {
                const { error: ie } = await supabase.schema('orders').from('order_items').insert(
                    cart.map(i => ({
                        order_id: order.id,
                        product_id: i.product_id,
                        product_name: i.product_name,
                        quantity: i.qty,
                        unit_price: i.unit_price,
                        subtotal: i.unit_price * i.qty,
                        item_status: 'delivered',
                    }))
                );
                if (ie) throw ie;
            }

            // 4b. Mesa: cria rodada 1 e envia para cozinha
            if (isTable) {
                // Cria a rodada
                const { data: round, error: re } = await supabase.schema('orders')
                    .from('order_rounds')
                    .insert({ order_id: order.id, notes: form.notes || null, status: 'open' })
                    .select().single();
                if (re) throw re;

                // Insere itens com status 'pending' ligados à rodada
                const { error: ie } = await supabase.schema('orders').from('order_items').insert(
                    cart.map(i => ({
                        order_id: order.id,
                        round_id: round.id,
                        product_id: i.product_id,
                        product_name: i.product_name,
                        quantity: i.qty,
                        unit_price: i.unit_price,
                        subtotal: i.unit_price * i.qty,
                        item_status: 'pending',
                    }))
                );
                if (ie) throw ie;

                // Envia rodada para a cozinha
                const { error: fe } = await supabase.rpc('send_round', { p_round_id: round.id });
                if (fe) throw fe;
            }

            onSuccess();
        } catch (err: any) {
            alert(err.message ?? 'Erro ao criar pedido');
        } finally {
            setSaving(false);
        }
    };

    const selStyle: React.CSSProperties = {
        padding: '0.6rem 0.875rem',
        background: 'var(--input-bg)',
        border: '1px solid var(--input-border)',
        color: 'var(--text-primary)',
        borderRadius: 12,
        fontSize: 13,
        width: '100%',
        outline: 'none',
    };

    // ────────────────────────────────────────────────────────────────────────────
    // PASSO 1 — Seleção de produtos (usando ProductGrid)
    // ────────────────────────────────────────────────────────────────────────────

    if (step === 1) return (
        <ModalBackdrop onClose={onClose}>
            <div style={{
                position: 'relative', display: 'flex', flexDirection: 'column',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 20, boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
                width: '100%', maxWidth: 680, height: '90vh', maxHeight: 800, overflow: 'hidden',
            }}>
                {/* Header */}
                <div
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99,102,241,0.12)' }}>
                            <ShoppingCart size={15} style={{ color: COLORS.accent }} />
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Novo Pedido</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Passo 1 — Selecionar produtos</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={15} />
                    </button>
                </div>

                {/* ProductGrid */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
                    <ProductGrid
                        products={products}
                        cart={cart}
                        onAdd={addToCart}
                        onChangeQty={changeQty}
                        maxHeight={99999} /* scroll controlado pelo container pai */
                    />
                </div>

                {/* Footer */}
                <div style={{ flexShrink: 0, padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                    {cart.length === 0 ? (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                            Selecione pelo menos um produto para continuar
                        </p>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 1 }}>
                                    {cartQty} item{cartQty !== 1 ? 's' : ''}
                                </p>
                                <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.accent }}>
                                    {formatCurrency(subtotal)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '10px 20px', borderRadius: 12, fontSize: 13,
                                    fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer',
                                    background: `linear-gradient(135deg,${COLORS.accent},${COLORS.purple})`,
                                    boxShadow: COLORS.accentShadow,
                                }}
                            >
                                Continuar <ArrowUpRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </ModalBackdrop>
    );

    // ────────────────────────────────────────────────────────────────────────────
    // PASSO 2 — Dados do pedido
    // ────────────────────────────────────────────────────────────────────────────

    return (
        <ModalBackdrop onClose={onClose}>
            <div style={{
                position: 'relative', display: 'flex', flexDirection: 'column',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 20, boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
                width: '100%', maxWidth: 600, height: '90vh', maxHeight: 800, overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99,102,241,0.12)' }}>
                            <ShoppingCart size={15} style={{ color: COLORS.accent }} />
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Novo Pedido</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Passo 2 — Dados do pedido</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={15} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>

                        {/* Resumo do carrinho */}
                        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(99,102,241,0.25)', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1, color: '#818CF8' }}>
                                    {cartQty} item{cartQty !== 1 ? 's' : ''} · {formatCurrency(subtotal)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#818CF8', background: 'rgba(99,102,241,0.12)', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}
                                >
                                    <Edit2 size={10} /> Editar produtos
                                </button>
                            </div>
                            <div style={{ background: 'var(--input-bg)', padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {cart.map(item => (
                                    <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{item.qty}×</span> {item.product_name}
                                        </span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {formatCurrency(item.unit_price * item.qty)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tipo de pedido */}
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1, color: COLORS.accent, marginBottom: 10 }}>
                            Tipo de Pedido
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${availableTypes.length}, 1fr)`, gap: 8, marginBottom: 20 }}>
                            {availableTypes.map(type => {
                                const active = form.order_type === type;
                                const Icon = ORDER_TYPE_ICON[type];
                                const label = { delivery: 'Entrega', pickup: 'Retirada', table: 'No Local' }[type];
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, order_type: type }))}
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                            padding: '10px 0', borderRadius: 12, cursor: 'pointer',
                                            background: active ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)') : 'var(--input-bg)',
                                            border: `1px solid ${active ? COLORS.accent : 'var(--input-border)'}`,
                                            color: active ? '#818CF8' : 'var(--text-muted)',
                                        }}
                                    >
                                        <Icon size={18} />
                                        <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* ── Mesa: apenas número da mesa (cliente é opcional) ── */}
                        {isTable && (
                            <div style={{ marginBottom: 20 }}>
                                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1, color: '#8B5CF6', marginBottom: 10 }}>
                                    Número da Mesa
                                </p>
                                <input
                                    value={form.table_number}
                                    onChange={set('table_number')}
                                    placeholder="Ex: 5, A3, Varanda..."
                                    className="input-field"
                                    style={{ ...selStyle }}
                                />
                                <p style={{ fontSize: 11, marginTop: 6, color: 'var(--text-muted)' }}>
                                    Os itens serão enviados para a cozinha como <strong style={{ color: '#818CF8' }}>Rodada 1</strong>.
                                </p>
                            </div>
                        )}

                        {/* ── Delivery / Pickup: cliente ── */}
                        {!isTable && (
                            <div style={{ marginBottom: 20 }}>
                                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1, color: '#8B5CF6', marginBottom: 10 }}>
                                    Cliente
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <FormField label="Cliente Cadastrado">
                                        <select value={form.customer_id} onChange={set('customer_id')} style={selStyle}>
                                            <option value="">Novo cliente</option>
                                            {(customers as any[]).map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </FormField>
                                    {!form.customer_id && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            <FormField label="Nome" required={form.order_type === 'delivery'}>
                                                <Input
                                                    icon={User}
                                                    value={form.customer_name}
                                                    onChange={set('customer_name')}
                                                    placeholder="Nome"
                                                    required={form.order_type === 'delivery' && !form.customer_id}
                                                />
                                            </FormField>
                                            <FormField label="Telefone">
                                                <Input icon={Phone} value={form.customer_phone} onChange={set('customer_phone')} placeholder="(00) 00000-0000" />
                                            </FormField>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Delivery: endereço + zona ── */}
                        {form.order_type === 'delivery' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                                <FormField label="Endereço" required>
                                    <Input icon={MapPin} value={form.customer_address} onChange={set('customer_address')} placeholder="Rua, número, complemento" required />
                                </FormField>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <FormField label="Zona de Entrega">
                                        <select value={form.delivery_zone_id} onChange={set('delivery_zone_id')} style={selStyle}>
                                            <option value="">Selecione</option>
                                            {(zones as any[]).filter((z: any) => z.active).map((z: any) => (
                                                <option key={z.id} value={z.id}>
                                                    {z.neighborhood} — {formatCurrency(z.delivery_fee)}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>
                                    <FormField label="Entregador">
                                        <select value={form.driver_id} onChange={set('driver_id')} style={selStyle}>
                                            <option value="">Depois</option>
                                            {(drivers as any[]).filter((d: any) => d.active).map((d: any) => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </FormField>
                                </div>
                            </div>
                        )}

                        {/* Pagamento */}
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1, color: '#F59E0B', marginBottom: 10 }}>
                            {isTable ? 'Pagamento (cobrado ao fechar conta)' : 'Pagamento'}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
                            {PAYMENT_OPTS.map(({ value, label, Icon }) => {
                                const active = form.payment_method === value;
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, payment_method: value }))}
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                            padding: '8px 0', borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                            background: active ? (isDark ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.1)') : 'var(--input-bg)',
                                            border: `1px solid ${active ? '#F59E0B' : 'var(--input-border)'}`,
                                            color: active ? '#F59E0B' : 'var(--text-muted)',
                                        }}
                                    >
                                        <Icon size={14} />{label}
                                    </button>
                                );
                            })}
                        </div>

                        <FormField label="Observações">
                            <textarea
                                value={form.notes}
                                onChange={set('notes')}
                                style={{ ...selStyle, minHeight: 60, resize: 'none', display: 'block', boxSizing: 'border-box' as const }}
                                placeholder="Alguma observação..."
                            />
                        </FormField>

                        {/* Totais */}
                        <div style={{
                            borderRadius: 12, padding: 16, marginTop: 16, marginBottom: 4,
                            background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
                            border: '1px solid rgba(99,102,241,0.2)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Subtotal</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(subtotal)}</span>
                            </div>
                            {form.order_type === 'delivery' && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Entrega</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(deliveryFee)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(99,102,241,0.2)' }}>
                                <span style={{ fontWeight: 700, color: COLORS.accent }}>Total</span>
                                <span style={{ fontSize: 17, fontWeight: 700, color: COLORS.accent }}>{formatCurrency(total)}</span>
                            </div>
                        </div>

                        {/* Mesa: aviso visual que é rodada 1 */}
                        {isTable && (
                            <div style={{
                                marginTop: 10, padding: '10px 14px', borderRadius: 10,
                                background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.05)',
                                border: '1px solid rgba(245,158,11,0.2)',
                            }}>
                                <p style={{ fontSize: 11, color: isDark ? '#FCD34D' : '#92400E', lineHeight: 1.6 }}>
                                    🍽️ Pedido no local — os itens serão enviados para a cozinha como <strong>Rodada 1</strong>.
                                    Você poderá adicionar novas rodadas ao longo do atendimento.
                                </p>
                            </div>
                        )}

                        <div style={{ height: 80 }} />
                    </div>

                    {/* Footer fixo */}
                    <div style={{ flexShrink: 0, display: 'flex', gap: 10, padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)', flexShrink: 0 }}
                        >
                            <ArrowUpRight size={12} style={{ transform: 'rotate(180deg)' }} /> Produtos
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '10px 0', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff',
                                background: saving
                                    ? 'rgba(99,102,241,0.6)'
                                    : `linear-gradient(135deg,${COLORS.accent},${COLORS.purple})`,
                                boxShadow: saving ? 'none' : COLORS.accentShadow,
                                border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {saving
                                ? <><Loader2 size={14} className="animate-spin" /> Criando...</>
                                : <><ShoppingCart size={14} /> {isTable ? 'Abrir Mesa & Enviar para Cozinha' : 'Criar Pedido'}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </ModalBackdrop>
    );
}