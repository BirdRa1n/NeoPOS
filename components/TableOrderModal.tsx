'use client';
import { useState, useCallback } from 'react';
import {
    X, Send, CheckCircle2, Clock, ChefHat,
    Utensils, Receipt, CreditCard, Banknote, Smartphone,
    Wallet, CheckSquare, DollarSign, AlertTriangle, Loader2,
    Circle, ChevronDown, ChevronUp, MessageSquare, ArrowLeft,
} from 'lucide-react';
import { supabase } from '@/supabase/client';
import { formatCurrency } from '@/lib/utils/format';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid, CartLineItem } from '@/components/ProductGrid';
import { COLORS, ALPHA } from '@/lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

type RoundStatus = 'open' | 'sent' | 'preparing' | 'delivered';
type ItemStatus = 'pending' | 'sent' | 'preparing' | 'delivered' | 'cancelled';

interface RoundItem {
    id: string;
    product_id: string | null;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    notes: string | null;
    item_status: ItemStatus;
    created_at: string;
}

interface Round {
    id: string;
    round_number: number;
    status: RoundStatus;
    notes: string | null;
    sent_at: string | null;
    delivered_at: string | null;
    created_at: string;
    items: RoundItem[] | null;
}

interface TableOrderModalProps {
    order: any;
    onClose: () => void;
    onUpdated: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useIsDark() {
    if (typeof window === 'undefined') return true;
    return (getComputedStyle(document.documentElement).getPropertyValue('--bg') || '').trim().startsWith('#08');
}

const ROUND_CFG: Record<RoundStatus, { label: string; color: string; Icon: React.FC<any> }> = {
    open: { label: 'Montando', color: '#6366F1', Icon: Circle },
    sent: { label: 'Na cozinha', color: '#F59E0B', Icon: ChefHat },
    preparing: { label: 'Preparando', color: '#8B5CF6', Icon: Clock },
    delivered: { label: 'Entregue', color: '#10B981', Icon: CheckCircle2 },
};

const ITEM_CFG: Record<ItemStatus, { color: string }> = {
    pending: { color: '#6366F1' },
    sent: { color: '#F59E0B' },
    preparing: { color: '#8B5CF6' },
    delivered: { color: '#10B981' },
    cancelled: { color: '#EF4444' },
};

const PAYMENT_OPTS = [
    { value: 'cash', label: 'Dinheiro', Icon: Banknote },
    { value: 'pix', label: 'PIX', Icon: Smartphone },
    { value: 'credit_card', label: 'Crédito', Icon: CreditCard },
    { value: 'debit_card', label: 'Débito', Icon: Wallet },
    { value: 'meal_voucher', label: 'Vale', Icon: CheckSquare },
    { value: 'other', label: 'Outro', Icon: DollarSign },
] as const;

// ─── Main ─────────────────────────────────────────────────────────────────────

export function TableOrderModal({ order, onClose, onUpdated }: TableOrderModalProps) {
    const isDark = useIsDark();
    const { products } = useProducts();

    const [rounds, setRounds] = useState<Round[]>((order.rounds as Round[]) ?? []);
    const [loading, setLoading] = useState(false);

    // Navegação: 'rounds' | 'new-round' | 'checkout'
    const [view, setView] = useState<'rounds' | 'new-round' | 'checkout'>('rounds');

    // Draft da nova rodada
    const [draftCart, setDraftCart] = useState<CartLineItem[]>([]);
    const [draftNotes, setDraftNotes] = useState('');

    // Checkout
    const [checkoutPayment, setCheckoutPayment] = useState<string>(order.payment_method ?? 'cash');
    const [checkoutDiscount, setCheckoutDiscount] = useState(String(order.discount ?? 0));
    const [closingOrder, setClosingOrder] = useState(false);

    // ── Cart helpers ────────────────────────────────────────────────────────────

    const addToDraft = (p: any) => {
        const price = p.promotional_price ?? p.price;
        setDraftCart(prev => {
            const idx = prev.findIndex(i => i.product_id === p.id);
            if (idx >= 0) return prev.map((i, n) => n === idx ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { product_id: p.id, product_name: p.name, unit_price: price, qty: 1 }];
        });
    };

    const changeDraftQty = (productId: string, delta: number) => {
        setDraftCart(prev =>
            prev.map(i => i.product_id === productId ? { ...i, qty: i.qty + delta } : i)
                .filter(i => i.qty > 0)
        );
    };

    const draftTotal = draftCart.reduce((s, i) => s + i.unit_price * i.qty, 0);

    // ── Refresh ─────────────────────────────────────────────────────────────────

    const refreshRounds = useCallback(async () => {
        const { data } = await supabase
            .schema('orders')
            .from('orders_with_details')
            .select('rounds, subtotal, total, discount')
            .eq('id', order.id)
            .single();
        if (data?.rounds) setRounds(data.rounds as Round[]);
    }, [order.id]);

    // ── Enviar rodada para cozinha ──────────────────────────────────────────────

    const sendDraftToKitchen = async () => {
        if (!draftCart.length) return;
        setLoading(true);
        try {
            const { data: round, error: rErr } = await supabase
                .schema('orders')
                .from('order_rounds')
                .insert({ order_id: order.id, notes: draftNotes || null, status: 'open' })
                .select()
                .single();
            if (rErr) throw rErr;

            const { error: iErr } = await supabase.schema('orders').from('order_items').insert(
                draftCart.map(i => ({
                    order_id: order.id,
                    round_id: round.id,
                    product_id: i.product_id,
                    product_name: i.product_name,
                    unit_price: i.unit_price,
                    quantity: i.qty,
                    subtotal: i.unit_price * i.qty,
                    item_status: 'pending',
                }))
            );
            if (iErr) throw iErr;

            const { error: fnErr } = await supabase.rpc('send_round', { p_round_id: round.id });
            if (fnErr) throw fnErr;

            // Recalcula totais
            const { data: agg } = await supabase
                .schema('orders').from('order_items')
                .select('subtotal')
                .eq('order_id', order.id)
                .not('item_status', 'eq', 'cancelled');

            const newSub = (agg ?? []).reduce((s: number, r: any) => s + Number(r.subtotal), 0);
            await supabase.schema('orders').from('orders').update({
                subtotal: newSub,
                total: newSub + Number(order.delivery_fee ?? 0) - Number(order.discount ?? 0),
                updated_at: new Date().toISOString(),
            }).eq('id', order.id);

            setDraftCart([]);
            setDraftNotes('');
            setView('rounds');
            await refreshRounds();
            onUpdated();
        } catch (e: any) {
            alert(e.message ?? 'Erro ao enviar rodada');
        } finally {
            setLoading(false);
        }
    };

    // ── Marcar rodada entregue ──────────────────────────────────────────────────

    const markDelivered = async (roundId: string) => {
        setLoading(true);
        try {
            const { error } = await supabase.rpc('deliver_round', { p_round_id: roundId });
            if (error) throw error;
            await refreshRounds();
            onUpdated();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Fechar conta ────────────────────────────────────────────────────────────

    const closeAccount = async () => {
        setClosingOrder(true);
        try {
            const disc = parseFloat(checkoutDiscount) || 0;
            const { data: agg } = await supabase
                .schema('orders').from('order_items')
                .select('subtotal')
                .eq('order_id', order.id)
                .not('item_status', 'eq', 'cancelled');

            const subtotal = (agg ?? []).reduce((s: number, r: any) => s + Number(r.subtotal), 0);

            const { error } = await supabase.schema('orders').from('orders').update({
                status: 'delivered',
                payment_status: 'paid',
                payment_method: checkoutPayment,
                discount: disc,
                subtotal,
                total: subtotal - disc,
                updated_at: new Date().toISOString(),
            }).eq('id', order.id);
            if (error) throw error;

            onUpdated();
            onClose();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setClosingOrder(false);
        }
    };

    // ── Computed ────────────────────────────────────────────────────────────────

    const allItems = rounds.flatMap(r => r.items ?? []).filter(i => i.item_status !== 'cancelled');
    const grandSubtotal = allItems.reduce((s, i) => s + Number(i.subtotal), 0);
    const discountVal = parseFloat(checkoutDiscount) || 0;
    const finalTotal = grandSubtotal - discountVal;
    const pendingRounds = rounds.filter(r => r.status !== 'delivered');
    const deliveredRounds = rounds.filter(r => r.status === 'delivered');

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div
                className="relative flex flex-col w-full sm:max-w-2xl max-h-[96vh] sm:max-h-[90vh] overflow-hidden"
                style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px 20px 0 0',
                    boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-4 shrink-0"
                    style={{ borderBottom: '1px solid var(--border)' }}
                >
                    <div className="flex items-center gap-3">
                        {view !== 'rounds' && (
                            <button
                                onClick={() => setView('rounds')}
                                className="w-8 h-8 flex items-center justify-center rounded-xl mr-1"
                                style={{ color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)' }}
                            >
                                <ArrowLeft size={15} />
                            </button>
                        )}
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
                        >
                            <Utensils size={16} color="#F59E0B" />
                        </div>
                        <div>
                            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                Mesa {order.table_number ?? '—'}
                                {view === 'new-round' && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · Nova Rodada</span>}
                                {view === 'checkout' && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · Fechar Conta</span>}
                            </p>
                            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                Pedido #{order.order_number} · {rounds.length} rodada{rounds.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-xl"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto min-h-0">

                    {/* ══ VIEW: ROUNDS ══ */}
                    {view === 'rounds' && (
                        <div className="p-4 space-y-4">
                            <button
                                onClick={() => setView('new-round')}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all"
                                style={{
                                    background: isDark ? ALPHA.accentBgSubtleD : ALPHA.accentBgSubtleL,
                                    border: `1.5px dashed ${COLORS.accent}`,
                                    color: COLORS.accentLight,
                                }}
                            >
                                + Nova Rodada
                            </button>

                            {pendingRounds.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>
                                        Em andamento
                                    </p>
                                    {pendingRounds.map(r => (
                                        <RoundCard key={r.id} round={r} isDark={isDark} onDeliver={() => markDelivered(r.id)} loading={loading} />
                                    ))}
                                </div>
                            )}

                            {deliveredRounds.length > 0 && (
                                <DeliveredAccordion rounds={deliveredRounds} isDark={isDark} />
                            )}

                            {rounds.length === 0 && (
                                <div className="flex flex-col items-center py-12 gap-3">
                                    <Utensils size={28} style={{ color: 'var(--text-muted)', opacity: 0.25 }} />
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhuma rodada ainda.</p>
                                </div>
                            )}

                            <div
                                className="flex items-center justify-between px-4 py-3 rounded-2xl"
                                style={{ background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}
                            >
                                <div>
                                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Total acumulado</p>
                                    <p className="text-lg font-black" style={{ color: COLORS.success }}>{formatCurrency(grandSubtotal)}</p>
                                </div>
                                <button
                                    onClick={() => setView('checkout')}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                                    style={{ background: `linear-gradient(135deg,${COLORS.success},${COLORS.successDark})`, boxShadow: COLORS.successShadow }}
                                >
                                    <Receipt size={14} /> Fechar Conta
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ══ VIEW: NOVA RODADA ══ */}
                    {view === 'new-round' && (
                        <div className="flex flex-col" style={{ height: '100%' }}>
                            <div className="flex-1 overflow-y-auto p-4">
                                <ProductGrid
                                    products={products}
                                    cart={draftCart}
                                    onAdd={addToDraft}
                                    onChangeQty={changeDraftQty}
                                    maxHeight={99999}
                                />
                                {draftCart.length > 0 && (
                                    <div className="flex items-start gap-2 mt-3">
                                        <MessageSquare size={13} className="mt-2.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                                        <input
                                            value={draftNotes}
                                            onChange={e => setDraftNotes(e.target.value)}
                                            placeholder="Obs para a cozinha (opcional)..."
                                            className="flex-1 text-xs px-3 py-2 rounded-xl outline-none"
                                            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="shrink-0 p-4" style={{ borderTop: '1px solid var(--border)' }}>
                                {draftCart.length === 0 ? (
                                    <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                                        Selecione os itens para enviar à cozinha
                                    </p>
                                ) : (
                                    <button
                                        onClick={sendDraftToKitchen}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                                        style={{ background: `linear-gradient(135deg,${COLORS.accent},${COLORS.purple})`, boxShadow: COLORS.accentShadow }}
                                    >
                                        {loading
                                            ? <><Loader2 size={15} className="animate-spin" />Enviando...</>
                                            : <><Send size={15} />Enviar para Cozinha · {formatCurrency(draftTotal)}</>
                                        }
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ══ VIEW: CHECKOUT ══ */}
                    {view === 'checkout' && (
                        <div className="p-4 space-y-4">
                            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                                <div className="px-4 py-3" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                        Resumo da Conta
                                    </p>
                                </div>
                                {rounds.map(round => {
                                    const items = (round.items ?? []).filter(i => i.item_status !== 'cancelled');
                                    if (!items.length) return null;
                                    const rt = items.reduce((s, i) => s + Number(i.subtotal), 0);
                                    return (
                                        <div key={round.id} className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                                    Rodada {round.round_number}
                                                </span>
                                                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                                                    {formatCurrency(rt)}
                                                </span>
                                            </div>
                                            {items.map(item => (
                                                <div key={item.id} className="flex items-center justify-between py-0.5">
                                                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                        <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>{item.quantity}×</span> {item.product_name}
                                                    </span>
                                                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                        {formatCurrency(Number(item.subtotal))}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                                <div
                                    className="px-4 py-3 flex items-center justify-between"
                                    style={{ background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)' }}
                                >
                                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Subtotal</span>
                                    <span className="text-base font-bold" style={{ color: COLORS.success }}>{formatCurrency(grandSubtotal)}</span>
                                </div>
                            </div>

                            <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                                    Desconto (R$)
                                </p>
                                <input
                                    type="number" min="0" step="0.01"
                                    value={checkoutDiscount}
                                    onChange={e => setCheckoutDiscount(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full rounded-xl text-sm px-3 py-2.5 outline-none"
                                    style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                                />
                            </div>

                            <div
                                className="rounded-2xl px-5 py-4 flex items-center justify-between"
                                style={{ background: isDark ? ALPHA.accentBgSubtleD : ALPHA.accentBgSubtleL, border: `1.5px solid ${COLORS.accent}44` }}
                            >
                                <span className="text-base font-bold" style={{ color: COLORS.accentLight }}>Total a pagar</span>
                                <span className="text-2xl font-black" style={{ color: COLORS.accent }}>{formatCurrency(finalTotal)}</span>
                            </div>

                            <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                                    Forma de Pagamento
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    {PAYMENT_OPTS.map(({ value, label, Icon }) => {
                                        const active = checkoutPayment === value;
                                        return (
                                            <button
                                                key={value}
                                                onClick={() => setCheckoutPayment(value)}
                                                className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all"
                                                style={{
                                                    background: active ? (isDark ? ALPHA.accentBgD : ALPHA.accentBgL) : 'var(--input-bg)',
                                                    border: `1.5px solid ${active ? COLORS.accent : 'var(--input-border)'}`,
                                                    color: active ? COLORS.accentLight : 'var(--text-muted)',
                                                }}
                                            >
                                                <Icon size={15} />{label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {pendingRounds.length > 0 && (
                                <div
                                    className="flex items-start gap-3 px-4 py-3 rounded-2xl"
                                    style={{ background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}
                                >
                                    <AlertTriangle size={15} className="shrink-0 mt-0.5" color="#F59E0B" />
                                    <p className="text-xs leading-relaxed" style={{ color: isDark ? '#FCD34D' : '#92400E' }}>
                                        <strong>{pendingRounds.length} rodada{pendingRounds.length > 1 ? 's' : ''}</strong> ainda não entregue{pendingRounds.length > 1 ? 's' : ''}.
                                        Você pode fechar assim mesmo ou voltar e marcar como entregue antes.
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={closeAccount}
                                disabled={closingOrder || grandSubtotal === 0}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-white disabled:opacity-50"
                                style={{ background: `linear-gradient(135deg,${COLORS.success},${COLORS.successDark})`, boxShadow: COLORS.successShadow }}
                            >
                                {closingOrder
                                    ? <><Loader2 size={16} className="animate-spin" />Fechando...</>
                                    : <><Receipt size={16} />Fechar Conta · {formatCurrency(finalTotal)}</>
                                }
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── RoundCard ────────────────────────────────────────────────────────────────

function RoundCard({ round, isDark, onDeliver, loading }: {
    round: Round; isDark: boolean; onDeliver: () => void; loading: boolean;
}) {
    const cfg = ROUND_CFG[round.status];
    const Icon = cfg.Icon;
    const items = round.items ?? [];
    const rt = items.filter(i => i.item_status !== 'cancelled').reduce((s, i) => s + Number(i.subtotal), 0);

    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{ border: `1.5px solid ${cfg.color}44`, background: isDark ? `${cfg.color}08` : `${cfg.color}04` }}
        >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${cfg.color}22` }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${cfg.color}20` }}>
                        <Icon size={14} color={cfg.color} />
                    </div>
                    <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Rodada {round.round_number}</p>
                        <p className="text-[10px]" style={{ color: cfg.color }}>
                            {cfg.label}
                            {round.sent_at && ` · ${new Date(round.sent_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(rt)}</span>
                    {round.status !== 'delivered' && (
                        <button
                            onClick={onDeliver}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg,${COLORS.success},${COLORS.successDark})` }}
                        >
                            {loading ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                            Entregue
                        </button>
                    )}
                </div>
            </div>
            <div className="px-4 py-2 space-y-1.5">
                {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ITEM_CFG[item.item_status].color }} />
                        <span className="text-xs flex-1" style={{ color: 'var(--text-secondary)' }}>
                            <span className="font-semibold">{item.quantity}×</span> {item.product_name}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                            {formatCurrency(Number(item.subtotal))}
                        </span>
                    </div>
                ))}
                {round.notes && (
                    <p className="text-[11px] px-1 pt-1 italic" style={{ color: 'var(--text-muted)' }}>"{round.notes}"</p>
                )}
            </div>
        </div>
    );
}

// ─── DeliveredAccordion ───────────────────────────────────────────────────────

function DeliveredAccordion({ rounds, isDark }: { rounds: Round[]; isDark: boolean }) {
    const [open, setOpen] = useState(false);
    const total = rounds.flatMap(r => r.items ?? [])
        .filter(i => i.item_status !== 'cancelled')
        .reduce((s, i) => s + Number(i.subtotal), 0);

    return (
        <div>
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between px-1 py-2 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
            >
                <span className="flex items-center gap-2">
                    <CheckCircle2 size={12} color={COLORS.success} />
                    Já entregue ({rounds.length} rodada{rounds.length !== 1 ? 's' : ''})
                </span>
                <span className="flex items-center gap-2">
                    <span style={{ color: COLORS.success }}>{formatCurrency(total)}</span>
                    {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </span>
            </button>
            {open && (
                <div className="space-y-2 mt-1">
                    {rounds.map(r => (
                        <RoundCard key={r.id} round={r} isDark={isDark} onDeliver={() => { }} loading={false} />
                    ))}
                </div>
            )}
        </div>
    );
}