'use client';
/**
 * ProductGrid — grade de produtos reutilizável com busca e filtro por categoria.
 * Usada tanto no OrderModal (criação de pedido) quanto no TableOrderModal (nova rodada).
 */
import { useState } from 'react';
import { Search, Package, Plus, Minus, Tag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { COLORS } from '@/lib/constants';

export interface CartLineItem {
    product_id: string;
    product_name: string;
    unit_price: number;
    qty: number;
}

interface ProductGridProps {
    products: any[];                         // lista completa de produtos do hook useProducts
    cart: CartLineItem[];
    onAdd: (product: any) => void;
    onChangeQty: (productId: string, delta: number) => void;
    /** altura máxima do scroll da grade */
    maxHeight?: number;
}

export function ProductGrid({ products, cart, onAdd, onChangeQty, maxHeight = 340 }: ProductGridProps) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Extrai categorias únicas
    const categoryMap = new Map<string, string>();
    products.forEach((p: any) => {
        if (p.categories?.id && p.categories?.name) {
            categoryMap.set(p.categories.id, p.categories.name);
        }
    });
    const categories = Array.from(categoryMap.entries()).map(([id, name]) => ({ id, name }));

    const visible = products.filter((p: any) => {
        if (p.available === false) return false;
        if (activeCategory && p.categories?.id !== activeCategory) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
                <Search
                    size={13}
                    style={{
                        position: 'absolute', left: 12, top: '50%',
                        transform: 'translateY(-50%)', pointerEvents: 'none',
                        color: 'var(--text-muted)',
                    }}
                />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar produto..."
                    style={{
                        width: '100%', paddingLeft: 36, paddingRight: 14,
                        paddingTop: 9, paddingBottom: 9,
                        background: 'var(--input-bg)',
                        border: '1px solid var(--input-border)',
                        borderRadius: 12, fontSize: 13,
                        color: 'var(--text-primary)', outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color .2s',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = COLORS.accent)}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')}
                />
            </div>

            {/* Category chips */}
            {categories.length > 0 && (
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
                    <CategoryChip
                        label="Todos"
                        active={!activeCategory}
                        onClick={() => setActiveCategory(null)}
                    />
                    {categories.map(cat => (
                        <CategoryChip
                            key={cat.id}
                            label={cat.name}
                            active={activeCategory === cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                        />
                    ))}
                </div>
            )}

            {/* Product grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: 10,
                    overflowY: 'auto',
                    maxHeight,
                    paddingRight: 2,
                }}
            >
                {visible.length === 0 ? (
                    <div
                        style={{
                            gridColumn: '1 / -1',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            padding: '32px 0', gap: 8,
                        }}
                    >
                        <Package size={28} style={{ opacity: 0.2, color: 'var(--text-muted)' }} />
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nenhum produto encontrado</p>
                    </div>
                ) : visible.map((p: any) => {
                    const img = p.product_images?.find((i: any) => i.is_primary)?.url ?? p.product_images?.[0]?.url;
                    const price = p.promotional_price ?? p.price;
                    const hasPromo = !!p.promotional_price;
                    const cartItem = cart.find(i => i.product_id === p.id);

                    return (
                        <ProductCard
                            key={p.id}
                            name={p.name}
                            price={price}
                            originalPrice={hasPromo ? p.price : undefined}
                            imageUrl={img}
                            qty={cartItem?.qty ?? 0}
                            onAdd={() => onAdd(p)}
                            onInc={() => onChangeQty(p.id, 1)}
                            onDec={() => onChangeQty(p.id, -1)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                flexShrink: 0,
                padding: '5px 12px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                transition: 'all .15s',
                background: active ? COLORS.accent : 'var(--input-bg)',
                color: active ? '#fff' : 'var(--text-muted)',
                outline: active ? `2px solid ${COLORS.accent}` : 'none',
                outlineOffset: 1,
            }}
        >
            {label}
        </button>
    );
}

function ProductCard({
    name, price, originalPrice, imageUrl, qty, onAdd, onInc, onDec,
}: {
    name: string;
    price: number;
    originalPrice?: number;
    imageUrl?: string;
    qty: number;
    onAdd: () => void;
    onInc: () => void;
    onDec: () => void;
}) {
    return (
        <div
            style={{
                background: 'var(--input-bg)',
                border: `1.5px solid ${qty > 0 ? COLORS.accent : 'var(--border)'}`,
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: qty > 0 ? `0 0 0 3px rgba(99,102,241,0.12)` : 'none',
                transition: 'all .15s',
                cursor: qty > 0 ? 'default' : 'pointer',
            }}
            onClick={qty === 0 ? onAdd : undefined}
        >
            {/* Image */}
            <div
                style={{
                    height: 100,
                    background: 'var(--surface)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {imageUrl
                    ? <img src={imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={22} style={{ opacity: .15, color: 'var(--text-muted)' }} />
                        </div>
                    )
                }
                {originalPrice && (
                    <span
                        style={{
                            position: 'absolute', top: 6, left: 6,
                            background: '#EF4444', color: '#fff',
                            fontSize: 9, fontWeight: 700,
                            padding: '2px 6px', borderRadius: 6,
                        }}
                    >
                        PROMO
                    </span>
                )}
            </div>

            {/* Body */}
            <div style={{ padding: '8px 10px' }}>
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, lineHeight: 1.3, color: 'var(--text-primary)' }}>
                    {name}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                    {/* Price */}
                    <div>
                        {originalPrice && (
                            <p style={{ fontSize: 9, textDecoration: 'line-through', color: 'var(--text-muted)', lineHeight: 1 }}>
                                {formatCurrency(originalPrice)}
                            </p>
                        )}
                        <p style={{ fontSize: 13, fontWeight: 800, color: COLORS.accent }}>
                            {formatCurrency(price)}
                        </p>
                    </div>

                    {/* Qty controls */}
                    {qty > 0 ? (
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <QtyBtn onClick={onDec}><Minus size={9} /></QtyBtn>
                            <span style={{ fontSize: 12, fontWeight: 700, minWidth: 16, textAlign: 'center', color: 'var(--text-primary)' }}>
                                {qty}
                            </span>
                            <QtyBtn primary onClick={onInc}><Plus size={9} /></QtyBtn>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); onAdd(); }}
                            style={{
                                width: 26, height: 26, borderRadius: 8, border: 'none',
                                background: COLORS.accent, color: '#fff', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Plus size={13} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function QtyBtn({ children, onClick, primary }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                width: 24, height: 24, borderRadius: 7,
                border: primary ? 'none' : '1.5px solid var(--border)',
                background: primary ? COLORS.accent : 'var(--surface)',
                color: primary ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
            }}
        >
            {children}
        </button>
    );
}