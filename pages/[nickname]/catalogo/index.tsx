// pages/[nickname]/catalogo.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ShoppingCart, Search, Clock, MapPin, Phone, ChevronRight, Star, Minus, Plus, X } from 'lucide-react';
import { supabase } from '@/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Store {
    id: string;
    name: string;
    nickname: string;
    description: string | null;
    logo_url: string | null;
    cover_url: string | null;
    phone: string | null;
    city: string | null;
    state: string | null;
    is_open: boolean;
}

interface Theme {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    surface_color: string;
    text_color: string;
    font_family: string;
    border_radius: string;
    card_style: string;
    header_style: string;
    show_cover: boolean;
}

interface Category {
    id: string;
    name: string;
    sort_order: number;
}

interface Product {
    id: string;
    category_id: string | null;
    name: string;
    description: string | null;
    price: number;
    promotional_price: number | null;
    available: boolean;
    featured: boolean;
    sort_order: number;
    product_images: { url: string; is_primary: boolean }[];
}

interface CartItem {
    product: Product;
    qty: number;
}

const DEFAULT_THEME: Theme = {
    primary_color: '#6366F1',
    secondary_color: '#8B5CF6',
    accent_color: '#10B981',
    background_color: '#FFFFFF',
    surface_color: '#F9FAFB',
    text_color: '#111827',
    font_family: 'Inter',
    border_radius: 'rounded',
    card_style: 'shadow',
    header_style: 'cover',
    show_cover: true,
};

function fmt(n: number) {
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── CSS vars injected from theme ─────────────────────────────────────────────
function buildCSS(t: Theme) {
    const r = t.border_radius === 'pill' ? '99px' : t.border_radius === 'rounded' ? '14px' : '4px';
    const cardR = t.border_radius === 'pill' ? '24px' : t.border_radius === 'rounded' ? '16px' : '6px';
    return `
@import url('https://fonts.googleapis.com/css2?family=${t.font_family.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap');
:root {
  --p:${t.primary_color};--s:${t.secondary_color};--a:${t.accent_color};
  --bg:${t.background_color};--sf:${t.surface_color};--tx:${t.text_color};
  --r:${r};--cr:${cardR};
  font-family:'${t.font_family}',system-ui,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:var(--tx);}
.cat-chip{
  padding:8px 18px;border-radius:99px;font-size:13px;font-weight:600;
  border:2px solid transparent;cursor:pointer;transition:all .2s;white-space:nowrap;
}
.cat-chip.active{background:var(--p);color:white;border-color:var(--p);}
.cat-chip.inactive{background:transparent;color:var(--tx);border-color:rgba(0,0,0,0.12);}
.cat-chip.inactive:hover{border-color:var(--p);color:var(--p);}
.prod-card{
  background:var(--sf);border-radius:var(--cr);overflow:hidden;cursor:pointer;
  transition:transform .2s,box-shadow .2s;position:relative;
  ${() => {
            const t2 = t;
            if (t2.card_style === 'shadow') return 'box-shadow:0 2px 12px rgba(0,0,0,0.08);';
            if (t2.card_style === 'bordered') return `border:1.5px solid ${t2.primary_color}30;`;
            return '';
        }}
}
.prod-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.12);}
.add-btn{
  width:32px;height:32px;border-radius:99px;border:none;cursor:pointer;
  background:var(--p);color:white;font-size:18px;line-height:1;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 3px 10px color-mix(in srgb,var(--p) 40%,transparent);
  transition:transform .15s,box-shadow .2s;
}
.add-btn:hover{transform:scale(1.1);}
.cart-btn{
  position:fixed;bottom:24px;right:24px;z-index:50;
  background:linear-gradient(135deg,var(--p),var(--s));color:white;
  border:none;border-radius:99px;padding:14px 24px;
  font-size:14px;font-weight:700;cursor:pointer;
  display:flex;align-items:center;gap:8px;
  box-shadow:0 8px 24px color-mix(in srgb,var(--p) 40%,transparent);
  transition:transform .2s,box-shadow .2s;
}
.cart-btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px color-mix(in srgb,var(--p) 50%,transparent);}
.search-input{
  width:100%;padding:12px 16px 12px 44px;border-radius:14px;
  border:1.5px solid rgba(0,0,0,0.1);background:var(--sf);
  font-size:14px;font-family:'${t.font_family}',sans-serif;color:var(--tx);outline:none;
  transition:border-color .2s,box-shadow .2s;
}
.search-input:focus{border-color:var(--p);box-shadow:0 0 0 3px color-mix(in srgb,var(--p) 15%,transparent);}
.search-input::placeholder{color:rgba(0,0,0,0.3);}
.drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:60;backdrop-filter:blur(4px);}
.drawer{
  position:fixed;right:0;top:0;bottom:0;width:min(400px,100vw);
  background:var(--bg);z-index:70;overflow-y:auto;
  box-shadow:-8px 0 32px rgba(0,0,0,0.15);
  display:flex;flex-direction:column;
}
@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
.drawer{animation:slideIn .3s cubic-bezier(.4,0,.2,1) both;}
.qty-btn{
  width:30px;height:30px;border-radius:8px;border:none;cursor:pointer;
  background:var(--sf);color:var(--tx);font-size:16px;font-weight:700;
  display:flex;align-items:center;justify-content:center;
  border:1px solid rgba(0,0,0,0.1);transition:all .15s;
}
.qty-btn:hover{background:var(--p);color:white;border-color:var(--p);}
@media(max-width:640px){
  .cart-btn{bottom:16px;right:16px;padding:12px 18px;font-size:13px;}
}
`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CatalogPage() {
    const router = useRouter();
    const { nickname } = router.query as { nickname: string };

    const [store, setStore] = useState<Store | null>(null);
    const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [cartOpen, setCartOpen] = useState(false);

    useEffect(() => {
        if (!nickname) return;
        (async () => {
            setLoading(true);

            // Load store by nickname
            const { data: storeData } = await supabase.schema('core').from('stores')
                .select('id,name,nickname,description,logo_url,cover_url,phone,city,state,is_open')
                .eq('nickname', nickname)
                .single();

            if (!storeData) { setNotFound(true); setLoading(false); return; }
            setStore(storeData);

            // Parallel: theme, categories, products
            const [themeRes, catsRes, prodsRes] = await Promise.all([
                supabase.schema('catalog').from('store_theme').select('*').eq('store_id', storeData.id).maybeSingle(),
                supabase.schema('catalog').from('categories').select('id,name,sort_order').eq('store_id', storeData.id).eq('active', true).order('sort_order'),
                supabase.schema('catalog').from('products')
                    .select('id,category_id,name,description,price,promotional_price,available,featured,sort_order,product_images(url,is_primary)')
                    .eq('store_id', storeData.id)
                    .eq('available', true)
                    .order('sort_order'),
            ]);

            if (themeRes.data) setTheme({ ...DEFAULT_THEME, ...themeRes.data });
            if (catsRes.data) setCategories(catsRes.data);
            if (prodsRes.data) setProducts(prodsRes.data as Product[]);
            setLoading(false);
        })();
    }, [nickname]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const idx = prev.findIndex(i => i.product.id === product.id);
            if (idx >= 0) return prev.map((i, n) => n === idx ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { product, qty: 1 }];
        });
        // mini bounce
    };

    const updateQty = (productId: string, delta: number) => {
        setCart(prev => prev.map(i => i.product.id === productId ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));
    };

    const cartTotal = cart.reduce((s, i) => s + (i.product.promotional_price ?? i.product.price) * i.qty, 0);
    const cartQty = cart.reduce((s, i) => s + i.qty, 0);

    const filteredProducts = products.filter(p => {
        const matchCat = !activeCategory || p.category_id === activeCategory;
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const css = buildCSS(theme);
    const rad = (extra = 0) => theme.border_radius === 'pill' ? 99 : theme.border_radius === 'rounded' ? 14 + extra : 4;

    if (notFound) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, fontFamily: 'system-ui' }}>
            <div style={{ fontSize: 48 }}>🍽️</div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>Catálogo não encontrado</h1>
            <p style={{ color: '#6B7280', fontSize: 14 }}>O endereço <b>/{nickname}/catalogo</b> não existe.</p>
        </div>
    );

    if (loading) return (
        <>
            <style>{css}</style>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${theme.primary_color}30`, borderTopColor: theme.primary_color, animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        </>
    );

    return (
        <>
            <Head>
                <title>{store?.name ?? 'Catálogo'}</title>
                <meta name="description" content={store?.description ?? `Cardápio de ${store?.name}`} />
                {store?.logo_url && <link rel="icon" href={store.logo_url} />}
            </Head>
            <style>{css}</style>

            {/* ── Header / Cover ── */}
            <div style={{ position: 'relative', background: theme.header_style === 'solid' ? theme.primary_color : theme.background_color }}>
                {/* Cover image */}
                {theme.show_cover && store?.cover_url && theme.header_style === 'cover' && (
                    <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                        <img src={store.cover_url} alt="capa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5))' }} />
                    </div>
                )}

                {/* Store info bar */}
                <div style={{ maxWidth: 900, margin: '0 auto', padding: theme.header_style === 'cover' && store?.cover_url ? '0 20px 20px' : '24px 20px 20px', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                        {/* Logo */}
                        {store?.logo_url ? (
                            <img src={store.logo_url} alt="logo"
                                style={{ width: 80, height: 80, borderRadius: rad(), objectFit: 'cover', border: '3px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', flexShrink: 0, marginTop: theme.header_style === 'cover' && store?.cover_url ? -40 : 0 }} />
                        ) : (
                            <div style={{ width: 80, height: 80, borderRadius: rad(), background: `linear-gradient(135deg,${theme.primary_color},${theme.secondary_color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', flexShrink: 0, marginTop: theme.header_style === 'cover' && store?.cover_url ? -40 : 0 }}>
                                <span style={{ fontSize: 28, fontWeight: 900, color: 'white' }}>{store?.name?.[0]?.toUpperCase()}</span>
                            </div>
                        )}

                        <div style={{ flex: 1, paddingBottom: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <h1 style={{ fontSize: 22, fontWeight: 800, color: theme.header_style !== 'minimal' && store?.cover_url && theme.show_cover ? 'white' : theme.text_color }}>{store?.name}</h1>
                                <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: store?.is_open ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)', color: store?.is_open ? '#059669' : '#DC2626' }}>
                                    {store?.is_open ? '● Aberto' : '● Fechado'}
                                </span>
                            </div>
                            {store?.description && (
                                <p style={{ fontSize: 13, color: theme.header_style !== 'minimal' && store?.cover_url && theme.show_cover ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)', marginTop: 4 }}>{store.description}</p>
                            )}
                            <div style={{ display: 'flex', gap: 14, marginTop: 6, flexWrap: 'wrap' }}>
                                {store?.city && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: theme.header_style !== 'minimal' && store?.cover_url && theme.show_cover ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)' }}>
                                        <MapPin size={11} />{store.city}{store.state ? `/${store.state}` : ''}
                                    </span>
                                )}
                                {store?.phone && (
                                    <a href={`https://wa.me/${store.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: theme.primary_color, textDecoration: 'none', fontWeight: 600 }}>
                                        <Phone size={11} />{store.phone}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Search + Category chips ── */}
            <div style={{ position: 'sticky', top: 0, zIndex: 40, background: theme.background_color, borderBottom: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ maxWidth: 900, margin: '0 auto', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <Search size={15} color="rgba(0,0,0,0.35)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input className="search-input" placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    {/* Categories */}
                    {categories.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                            <button className={`cat-chip ${!activeCategory ? 'active' : 'inactive'}`} onClick={() => setActiveCategory(null)}>
                                Todos
                            </button>
                            {categories.map(cat => (
                                <button key={cat.id} className={`cat-chip ${activeCategory === cat.id ? 'active' : 'inactive'}`} onClick={() => setActiveCategory(cat.id)}>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Products grid ── */}
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px 100px' }}>
                {filteredProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(0,0,0,0.35)' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                        <p style={{ fontSize: 15, fontWeight: 600 }}>Nenhum produto encontrado</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
                        {filteredProducts.map(product => {
                            const img = product.product_images?.find(i => i.is_primary)?.url ?? product.product_images?.[0]?.url;
                            const cartItem = cart.find(i => i.product.id === product.id);
                            const price = product.promotional_price ?? product.price;
                            return (
                                <div key={product.id} className="prod-card">
                                    {img && <div style={{ height: 140, overflow: 'hidden' }}><img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                                    <div style={{ padding: '12px 14px 14px' }}>
                                        {product.featured && (
                                            <span style={{ fontSize: 10, fontWeight: 700, color: theme.accent_color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>⭐ Destaque</span>
                                        )}
                                        <p style={{ fontSize: 14, fontWeight: 700, color: theme.text_color, margin: '4px 0 4px', lineHeight: 1.3 }}>{product.name}</p>
                                        {product.description && <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                            <div>
                                                {product.promotional_price && (
                                                    <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', textDecoration: 'line-through', lineHeight: 1 }}>{fmt(product.price)}</p>
                                                )}
                                                <p style={{ fontSize: 16, fontWeight: 800, color: theme.primary_color }}>{fmt(price)}</p>
                                            </div>
                                            {cartItem ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <button className="qty-btn" onClick={() => updateQty(product.id, -1)}><Minus size={12} /></button>
                                                    <span style={{ fontSize: 14, fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{cartItem.qty}</span>
                                                    <button className="qty-btn" onClick={() => updateQty(product.id, +1)}><Plus size={12} /></button>
                                                </div>
                                            ) : (
                                                <button className="add-btn" onClick={() => addToCart(product)}>
                                                    <Plus size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Cart button ── */}
            {cartQty > 0 && (
                <button className="cart-btn" onClick={() => setCartOpen(true)}>
                    <ShoppingCart size={16} />
                    Ver carrinho
                    <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 99, padding: '2px 8px', fontSize: 12, fontWeight: 800 }}>{cartQty}</span>
                    <span style={{ marginLeft: 4 }}>{fmt(cartTotal)}</span>
                </button>
            )}

            {/* ── Cart drawer ── */}
            {cartOpen && (
                <>
                    <div className="drawer-overlay" onClick={() => setCartOpen(false)} />
                    <div className="drawer">
                        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: theme.background_color, zIndex: 1 }}>
                            <div>
                                <h2 style={{ fontSize: 18, fontWeight: 800, color: theme.text_color }}>Carrinho</h2>
                                <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)', marginTop: 2 }}>{cartQty} {cartQty === 1 ? 'item' : 'itens'}</p>
                            </div>
                            <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.4)', display: 'flex', padding: 4 }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                            {cart.map(item => {
                                const img = item.product.product_images?.find(i => i.is_primary)?.url ?? item.product.product_images?.[0]?.url;
                                const unitPrice = item.product.promotional_price ?? item.product.price;
                                return (
                                    <div key={item.product.id} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                        {img && <img src={img} alt={item.product.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />}
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 14, fontWeight: 600, color: theme.text_color }}>{item.product.name}</p>
                                            <p style={{ fontSize: 13, color: theme.primary_color, fontWeight: 700, marginTop: 2 }}>{fmt(unitPrice)}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                            <button className="qty-btn" onClick={() => updateQty(item.product.id, -1)}><Minus size={12} /></button>
                                            <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                                            <button className="qty-btn" onClick={() => updateQty(item.product.id, +1)}><Plus size={12} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(0,0,0,0.08)', background: theme.background_color }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                <span style={{ fontSize: 15, color: 'rgba(0,0,0,0.5)' }}>Total</span>
                                <span style={{ fontSize: 20, fontWeight: 800, color: theme.text_color }}>{fmt(cartTotal)}</span>
                            </div>
                            {store?.phone ? (
                                <a href={`https://wa.me/${store.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Gostaria de fazer um pedido:\n\n${cart.map(i => `• ${i.qty}x ${i.product.name} — ${fmt((i.product.promotional_price ?? i.product.price) * i.qty)}`).join('\n')}\n\n*Total: ${fmt(cartTotal)}*`)}`}
                                    target="_blank" rel="noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px 20px', borderRadius: rad(), background: `linear-gradient(135deg,${theme.primary_color},${theme.secondary_color})`, color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: `0 4px 16px ${theme.primary_color}40` }}>
                                    <Phone size={16} />Pedir pelo WhatsApp
                                </a>
                            ) : (
                                <button disabled style={{ width: '100%', padding: '14px', borderRadius: rad(), background: 'rgba(0,0,0,0.1)', border: 'none', color: 'rgba(0,0,0,0.4)', fontSize: 14, cursor: 'not-allowed' }}>
                                    Loja sem contato configurado
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}