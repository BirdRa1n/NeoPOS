import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Search, MapPin, Phone, ArrowLeft,
  Minus, Plus, CheckCircle, ChevronRight, Clock,
  Bike, Store, CreditCard, Banknote, Smartphone, Wallet,
  Package
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────── */
interface StoreData {
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
  background_color: string;
  surface_color: string;
  text_color: string;
  font_family: string;
  border_radius: string;
  show_cover: boolean;
  show_stock_quantity: boolean;
}

interface Category { id: string; name: string; sort_order: number }
interface Product {
  id: string; category_id: string | null; name: string;
  description: string | null; price: number;
  promotional_price: number | null; available: boolean;
  current_quantity: number | null;
  product_images: { url: string; is_primary: boolean }[];
}
interface CartItem { product: Product; qty: number }
interface DeliveryZone { id: string; neighborhood: string; delivery_fee: number }

const DEFAULT_THEME: Theme = {
  primary_color: '#FF6B35',
  secondary_color: '#FF8C61',
  background_color: '#FFFFFF',
  surface_color: '#F8F7F4',
  text_color: '#1A1A1A',
  font_family: 'DM Sans',
  border_radius: 'rounded',
  show_cover: true,
  show_stock_quantity: false,
};

/* ─── Helpers ────────────────────────────────────────── */
const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function buildCSS(t: Theme) {
  const r = t.border_radius === 'pill' ? '999px' : t.border_radius === 'rounded' ? '16px' : '6px';
  const rSm = t.border_radius === 'pill' ? '999px' : t.border_radius === 'rounded' ? '10px' : '4px';
  return `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=${t.font_family.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap');
:root{
  --p:${t.primary_color};--s:${t.secondary_color};
  --bg:${t.background_color};--sf:${t.surface_color};--tx:${t.text_color};
  --r:${r};--rsm:${rSm};
  font-family:'${t.font_family}',system-ui,sans-serif
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--tx);-webkit-font-smoothing:antialiased}
/* Cover */
.cover-wrap{position:relative;width:100%;height:240px;background:#111;overflow:hidden}
@media(min-width:640px){.cover-wrap{height:320px}}
.cover-img{width:100%;height:100%;object-fit:cover;opacity:.85;transition:transform 8s ease}
.cover-img:hover{transform:scale(1.03)}
.cover-gradient{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.05) 0%,rgba(0,0,0,.55) 100%);pointer-events:none}
.status-pill{position:absolute;top:16px;right:16px;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:700;backdrop-filter:blur(8px)}
.status-open{background:rgba(34,197,94,.9);color:white}
.status-closed{background:rgba(239,68,68,.85);color:white}
/* Logo — renderizado FORA da cover, nunca dentro */
.logo-anchor{max-width:900px;margin:0 auto;padding:0 24px}
.logo-float{width:76px;height:76px;border-radius:20px;border:3px solid var(--bg);object-fit:cover;box-shadow:0 4px 20px rgba(0,0,0,.15);margin-top:-38px;display:block;position:relative;z-index:10;background:var(--sf)}
.logo-float-placeholder{width:76px;height:76px;border-radius:20px;border:3px solid var(--bg);background:var(--p);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.15);margin-top:-38px;position:relative;z-index:10;font-size:30px;font-weight:800;color:white}
/* Logo sem capa */
.logo-no-cover{width:64px;height:64px;border-radius:16px;object-fit:cover;border:2px solid rgba(0,0,0,.07);flex-shrink:0}
.logo-no-cover-placeholder{width:64px;height:64px;border-radius:16px;background:var(--p);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:white;flex-shrink:0}
/* Store info */
.store-info{padding:16px 20px 0;max-width:900px;margin:0 auto}
/* Search & Cats */
.search-wrap{position:relative;margin-bottom:16px}
.search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);pointer-events:none;color:rgba(0,0,0,.3)}
.input{width:100%;padding:12px 16px;border-radius:var(--r);border:1.5px solid rgba(0,0,0,.08);background:var(--sf);font-size:14px;font-family:inherit;color:var(--tx);outline:none;transition:all .2s}
.input:focus{border-color:var(--p);box-shadow:0 0 0 3px color-mix(in srgb,var(--p) 12%,transparent)}
.search-input{padding-left:44px}
/* Category chips */
.cats-scroll{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:24px;scrollbar-width:none}
.cats-scroll::-webkit-scrollbar{display:none}
.cat-chip{padding:8px 18px;border-radius:999px;font-size:13px;font-weight:600;border:2px solid transparent;cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0}
.cat-chip.active{background:var(--p);color:white}
.cat-chip.inactive{background:transparent;color:var(--tx);border-color:rgba(0,0,0,.1)}
.cat-chip.inactive:hover{border-color:var(--p);color:var(--p)}
/* Product grid */
.prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;padding-bottom:120px}
.prod-card{background:var(--sf);border-radius:var(--r);overflow:hidden;cursor:pointer;transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s;border:1.5px solid rgba(0,0,0,.04)}
.prod-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.1)}
.prod-img-wrap{height:140px;overflow:hidden;background:#e5e5e5;position:relative}
.prod-img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease}
.prod-card:hover .prod-img{transform:scale(1.06)}
.promo-badge{position:absolute;top:8px;left:8px;background:var(--p);color:white;font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px}
.prod-body{padding:12px}
.qty-btn{width:30px;height:30px;border-radius:8px;border:1.5px solid rgba(0,0,0,.1);cursor:pointer;background:white;color:var(--tx);font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
.qty-btn:hover{background:var(--p);color:white;border-color:var(--p)}
/* Floating cart btn */
.cart-fab{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);width:calc(100% - 48px);max-width:480px;background:linear-gradient(135deg,var(--p),var(--s));color:white;border:none;border-radius:var(--r);padding:16px 20px;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:space-between;box-shadow:0 8px 28px color-mix(in srgb,var(--p) 45%,transparent);transition:transform .2s,box-shadow .2s;font-family:inherit;z-index:50;animation:fabIn .4s cubic-bezier(.34,1.56,.64,1) both}
@keyframes fabIn{from{transform:translateX(-50%) translateY(80px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
.cart-fab:hover{transform:translateX(-50%) translateY(-2px);box-shadow:0 12px 36px color-mix(in srgb,var(--p) 55%,transparent)}
/* Progress bar */
.progress-bar{display:flex;align-items:center;gap:0;margin-bottom:32px}
.prog-step{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600}
.prog-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;transition:all .3s;flex-shrink:0}
.prog-dot.done{background:var(--p);color:white}
.prog-dot.active{background:var(--p);color:white;box-shadow:0 0 0 4px color-mix(in srgb,var(--p) 20%,transparent)}
.prog-dot.pending{background:rgba(0,0,0,.08);color:rgba(0,0,0,.3)}
.prog-line{flex:1;height:2px;background:rgba(0,0,0,.08);margin:0 8px;border-radius:999px;overflow:hidden}
.prog-line-fill{height:100%;background:var(--p);border-radius:999px;transition:width .4s ease}
/* Checkout sections */
.checkout-section{background:var(--sf);border-radius:var(--r);padding:20px;margin-bottom:16px;border:1.5px solid rgba(0,0,0,.05);animation:sectionIn .3s ease both}
@keyframes sectionIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.section-label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--p);margin-bottom:14px}
/* Type selector */
.type-btn{flex:1;padding:14px;border-radius:var(--rsm);border:2px solid rgba(0,0,0,.08);background:white;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:6px;font-family:inherit}
.type-btn.active{border-color:var(--p);background:color-mix(in srgb,var(--p) 6%,white)}
.type-btn-label{font-size:13px;font-weight:600;color:var(--tx)}
/* Payment icons */
.pay-btn{flex:1;min-width:0;padding:12px 8px;border-radius:var(--rsm);border:2px solid rgba(0,0,0,.08);background:white;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:4px;font-family:inherit}
.pay-btn.active{border-color:var(--p);background:color-mix(in srgb,var(--p) 6%,white)}
.pay-label{font-size:11px;font-weight:600;color:var(--tx)}
/* Order summary */
.summary-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;font-size:14px;border-bottom:1px solid rgba(0,0,0,.06)}
.summary-row:last-child{border-bottom:none}
.summary-total{font-size:18px;font-weight:800;color:var(--p)}
/* Confirm btn */
.btn-confirm{width:100%;padding:16px;border-radius:var(--r);border:none;background:linear-gradient(135deg,var(--p),var(--s));color:white;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;box-shadow:0 4px 16px color-mix(in srgb,var(--p) 35%,transparent)}
.btn-confirm:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px color-mix(in srgb,var(--p) 45%,transparent)}
.btn-confirm:disabled{opacity:.6;cursor:not-allowed}
.btn-back{display:flex;align-items:center;gap:6px;padding:10px 16px;border-radius:var(--rsm);border:1.5px solid rgba(0,0,0,.1);background:transparent;cursor:pointer;font-size:14px;font-weight:600;color:var(--tx);font-family:inherit;transition:all .2s;margin-bottom:24px}
.btn-back:hover{border-color:var(--p);color:var(--p)}
/* Zone card */
.zone-card{padding:12px 14px;border-radius:var(--rsm);border:2px solid rgba(0,0,0,.07);background:white;cursor:pointer;transition:all .2s;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.zone-card.selected{border-color:var(--p);background:color-mix(in srgb,var(--p) 5%,white)}
.zone-card:hover{border-color:var(--p)}
/* Cart item in checkout */
.cart-item-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(0,0,0,.06)}
.cart-item-row:last-child{border-bottom:none}
.cart-item-thumb{width:44px;height:44px;border-radius:10px;object-fit:cover;background:#eee;flex-shrink:0}
/* Success */
.success-wrap{max-width:480px;margin:0 auto;padding:40px 24px;text-align:center}
.success-icon{width:88px;height:88px;border-radius:50%;background:color-mix(in srgb,var(--p) 12%,white);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;animation:popIn .5s cubic-bezier(.34,1.56,.64,1) both}
@keyframes popIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
.success-number{font-size:48px;font-weight:800;color:var(--p);line-height:1;margin-bottom:4px;animation:countIn .6s ease both .2s}
@keyframes countIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
/* Spinner */
.spinner{width:36px;height:36px;border-radius:50%;border:3px solid color-mix(in srgb,var(--p) 20%,transparent);border-top-color:var(--p);animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
/* Loading skeleton */
.skeleton{background:linear-gradient(90deg,rgba(0,0,0,.06) 25%,rgba(0,0,0,.04) 50%,rgba(0,0,0,.06) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
/* Empty state */
.empty{text-align:center;padding:48px 24px;color:rgba(0,0,0,.35)}
/* Responsive */
@media(max-width:480px){.prod-grid{grid-template-columns:repeat(2,1fr)}}
`;
}

type Step = 'catalog' | 'checkout' | 'success';
type CheckoutSub = 'type' | 'info' | 'address' | 'payment' | 'confirm';

const CHECKOUT_STEPS: CheckoutSub[] = ['type', 'info', 'address', 'payment', 'confirm'];
const STEP_LABELS: Record<CheckoutSub, string> = {
  type: 'Tipo', info: 'Dados', address: 'Endereço', payment: 'Pagamento', confirm: 'Resumo'
};

/* ─── Component ──────────────────────────────────────── */
export default function CatalogPage() {
  const router = useRouter();
  const { nickname } = router.query as { nickname: string };
  const catalogRef = useRef<HTMLDivElement>(null);

  const [store, setStore] = useState<StoreData | null>(null);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<Step>('catalog');
  const [checkoutSub, setCheckoutSub] = useState<CheckoutSub>('type');

  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [address, setAddress] = useState('');
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'debit_card' | 'pix'>('pix');
  const [changeFor, setChangeFor] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!nickname) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-store-catalog?nickname=${encodeURIComponent(nickname)}`
        );

        if (!res.ok) { setLoading(false); return; }

        const data = await res.json();

        if (data.store) setStore(data.store);
        if (data.theme) setTheme({ ...DEFAULT_THEME, ...data.theme });
        if (data.categories) setCategories(data.categories);
        if (data.products) setProducts(data.products);
        if (data.zones) setZones(data.zones);
      } catch (err) {
        console.error('Erro ao carregar catálogo:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [nickname]);

  /* Cart helpers */
  const addToCart = (product: Product) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id);
      if (idx >= 0) return prev.map((i, n) => n === idx ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  };
  const updateQty = (productId: string, delta: number) =>
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));

  const cartTotal = cart.reduce((s, i) => s + (i.product.promotional_price ?? i.product.price) * i.qty, 0);
  const cartQty = cart.reduce((s, i) => s + i.qty, 0);
  const deliveryFee = orderType === 'delivery' && selectedZone ? zones.find(z => z.id === selectedZone)?.delivery_fee || 0 : 0;
  const finalTotal = cartTotal + deliveryFee;

  const filteredProducts = products.filter(p => {
    const matchCat = !activeCategory || p.category_id === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  /* Checkout navigation */
  const checkoutStepsFiltered: CheckoutSub[] = orderType === 'pickup'
    ? ['type', 'info', 'payment', 'confirm']
    : CHECKOUT_STEPS;

  const currentSubIdx = checkoutStepsFiltered.indexOf(checkoutSub);
  const progressPct = ((currentSubIdx) / (checkoutStepsFiltered.length - 1)) * 100;

  const canAdvance = () => {
    if (checkoutSub === 'info') return !!customerName && !!customerPhone;
    if (checkoutSub === 'address') return !!selectedZone && !!address;
    return true;
  };

  const goNext = () => {
    const next = checkoutStepsFiltered[currentSubIdx + 1];
    if (next) setCheckoutSub(next);
  };
  const goPrev = () => {
    const prev = checkoutStepsFiltered[currentSubIdx - 1];
    if (prev) setCheckoutSub(prev);
    else { setStep('catalog'); setCheckoutSub('type'); }
  };

  /* Submit */
  const handleSubmitOrder = async () => {
    if (!store) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY}`,
        },
        body: JSON.stringify({
          store_id: store.id, type: orderType, payment_method: paymentMethod,
          items: cart.map(i => ({
            product_id: i.product.id, product_name: i.product.name,
            unit_price: i.product.promotional_price ?? i.product.price, quantity: i.qty,
          })),
          customer: { name: customerName, phone: customerPhone },
          delivery: orderType === 'delivery' ? { zone_id: selectedZone, address, complement, reference } : undefined,
          change_for: paymentMethod === 'cash' && changeFor ? parseFloat(changeFor) : undefined,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderNumber(data.order.order_number);
        setStep('success');
        setCart([]);
      }
    } catch { alert('Erro ao criar pedido'); }
    finally { setSubmitting(false); }
  };

  /* ── Loading ── */
  if (loading) return (
    <>
      <style>{buildCSS(theme)}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
        <div className="spinner" />
        <p style={{ fontSize: 14, color: 'rgba(0,0,0,.4)', fontFamily: 'system-ui' }}>Carregando cardápio...</p>
      </div>
    </>
  );

  /* ── Render ── */
  return (
    <>
      <Head><title>{store?.name ?? 'Cardápio'}</title></Head>
      <style>{buildCSS(theme)}</style>

      {/* ══ CATALOG ══ */}
      {step === 'catalog' && (
        <>
          {/* ── Capa (respeitando show_cover do tema) ── */}
          {theme.show_cover && (
            <div className="cover-wrap">
              {store?.cover_url
                ? <img src={store.cover_url} alt="Capa" className="cover-img" />
                : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})` }} />
              }
              <div className="cover-gradient" />
              <div className={`status-pill ${store?.is_open ? 'status-open' : 'status-closed'}`}>
                {store?.is_open ? '● Aberto agora' : '● Fechado'}
              </div>
            </div>
          )}

          {/* ── Logo — FORA da cover, nunca sofre overflow:hidden ── */}
          {theme.show_cover && (
            <div className="logo-anchor">
              {store?.logo_url
                ? <img src={store.logo_url} alt="Logo" className="logo-float" />
                : <div className="logo-float-placeholder">{store?.name?.charAt(0)}</div>
              }
            </div>
          )}

          {/* ── Store info ── */}
          <div className="store-info">
            {/* Sem capa: logo + nome lado a lado */}
            {!theme.show_cover && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                {store?.logo_url
                  ? <img src={store.logo_url} alt="Logo" className="logo-no-cover" />
                  : <div className="logo-no-cover-placeholder">{store?.name?.charAt(0)}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: 20, fontWeight: 800 }}>{store?.name}</h1>
                    <span className={`status-pill ${store?.is_open ? 'status-open' : 'status-closed'}`} style={{ position: 'static', fontSize: 11 }}>
                      {store?.is_open ? '● Aberto' : '● Fechado'}
                    </span>
                  </div>
                  {store?.description && <p style={{ fontSize: 13, color: 'rgba(0,0,0,.45)', lineHeight: 1.4, marginTop: 2 }}>{store.description}</p>}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              {/* Com capa: nome abaixo do logo flutuante */}
              {theme.show_cover && (
                <>
                  <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, marginTop: 12 }}>{store?.name}</h1>
                  {store?.description && <p style={{ fontSize: 14, color: 'rgba(0,0,0,.5)', lineHeight: 1.5 }}>{store.description}</p>}
                </>
              )}
              {(store?.city || store?.phone) && (
                <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                  {store?.city && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(0,0,0,.4)' }}><MapPin size={12} />{store.city}, {store.state}</span>}
                  {store?.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(0,0,0,.4)' }}><Phone size={12} />{store.phone}</span>}
                </div>
              )}
            </div>

            {/* Search */}
            <div className="search-wrap">
              <Search size={15} className="search-icon" />
              <input className="input search-input" placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="cats-scroll">
                <button className={`cat-chip ${!activeCategory ? 'active' : 'inactive'}`} onClick={() => setActiveCategory(null)}>Todos</button>
                {categories.map(cat => (
                  <button key={cat.id} className={`cat-chip ${activeCategory === cat.id ? 'active' : 'inactive'}`} onClick={() => setActiveCategory(cat.id)}>{cat.name}</button>
                ))}
              </div>
            )}

            {/* Product grid */}
            {filteredProducts.length === 0
              ? <div className="empty"><Package size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: .3 }} /><p>Nenhum produto encontrado</p></div>
              : (
                <div className="prod-grid" ref={catalogRef}>
                  {filteredProducts.map(product => {
                    const img = product.product_images?.find(i => i.is_primary)?.url ?? product.product_images?.[0]?.url;
                    const cartItem = cart.find(i => i.product.id === product.id);
                    const price = product.promotional_price ?? product.price;
                    const hasPromo = !!product.promotional_price;
                    return (
                      <div key={product.id} className="prod-card" onClick={() => !cartItem && addToCart(product)}>
                        <div className="prod-img-wrap">
                          {img ? <img src={img} alt={product.name} className="prod-img" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={32} style={{ opacity: .15 }} /></div>}
                          {hasPromo && <span className="promo-badge">Promoção</span>}
                        </div>
                        <div className="prod-body">
                          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{product.name}</p>
                          {product.description && <p style={{ fontSize: 11, color: 'rgba(0,0,0,.4)', marginBottom: 10, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>}
                          {/* Badge de quantidade disponível — controlado pelo lojista */}
                          {theme.show_stock_quantity && product.current_quantity !== null && (
                            <p style={{ fontSize: 10, fontWeight: 600, marginBottom: 6, color: product.current_quantity <= 3 ? '#EF4444' : 'rgba(0,0,0,.35)' }}>
                              {product.current_quantity <= 0 ? '⚠ Indisponível' : `${product.current_quantity} disponíve${product.current_quantity === 1 ? 'l' : 'is'}`}
                            </p>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                            <div>
                              {hasPromo && <p style={{ fontSize: 10, color: 'rgba(0,0,0,.3)', textDecoration: 'line-through', lineHeight: 1 }}>{fmt(product.price)}</p>}
                              <p style={{ fontSize: 15, fontWeight: 800, color: theme.primary_color }}>{fmt(price)}</p>
                            </div>
                            {cartItem ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
                                <button className="qty-btn" onClick={() => updateQty(product.id, -1)}><Minus size={11} /></button>
                                <span style={{ fontSize: 14, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{cartItem.qty}</span>
                                <button className="qty-btn" onClick={() => updateQty(product.id, +1)}><Plus size={11} /></button>
                              </div>
                            ) : (
                              <button style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: theme.primary_color, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Plus size={14} />
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

          {/* Floating cart button */}
          {cartQty > 0 && (
            <button className="cart-fab" onClick={() => { setStep('checkout'); setCheckoutSub('type'); }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: 'rgba(255,255,255,.25)', borderRadius: 6, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{cartQty}</span>
                Ver carrinho
              </span>
              <span style={{ fontWeight: 800 }}>{fmt(cartTotal)}</span>
            </button>
          )}
        </>
      )}

      {/* ══ CHECKOUT ══ */}
      {step === 'checkout' && (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 20px 40px' }}>
          <button className="btn-back" onClick={goPrev}>
            <ArrowLeft size={15} />
            {currentSubIdx === 0 ? 'Voltar ao cardápio' : 'Voltar'}
          </button>

          {/* Progress */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              {checkoutStepsFiltered.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < checkoutStepsFiltered.length - 1 ? 1 : 'none' }}>
                  <div className={`prog-dot ${i < currentSubIdx ? 'done' : i === currentSubIdx ? 'active' : 'pending'}`}>
                    {i < currentSubIdx ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  {i < checkoutStepsFiltered.length - 1 && (
                    <div className="prog-line" style={{ flex: 1, margin: '0 6px' }}>
                      <div className="prog-line-fill" style={{ width: i < currentSubIdx ? '100%' : '0%' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {checkoutStepsFiltered.map((s, i) => (
                <span key={s} style={{ fontSize: 10, fontWeight: i === currentSubIdx ? 700 : 500, color: i === currentSubIdx ? theme.primary_color : 'rgba(0,0,0,.3)', textAlign: 'center', flex: 1 }}>
                  {STEP_LABELS[s]}
                </span>
              ))}
            </div>
          </div>

          {/* ── Step: Tipo ── */}
          {checkoutSub === 'type' && (
            <div className="checkout-section">
              <p className="section-label">Como quer receber?</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className={`type-btn ${orderType === 'delivery' ? 'active' : ''}`} onClick={() => setOrderType('delivery')}>
                  <Bike size={24} color={orderType === 'delivery' ? theme.primary_color : 'rgba(0,0,0,.3)'} />
                  <span className="type-btn-label">Entrega</span>
                  {zones.length > 0 && <span style={{ fontSize: 10, color: 'rgba(0,0,0,.35)' }}>{zones.length} bairro{zones.length > 1 ? 's' : ''}</span>}
                </button>
                <button className={`type-btn ${orderType === 'pickup' ? 'active' : ''}`} onClick={() => setOrderType('pickup')}>
                  <Store size={24} color={orderType === 'pickup' ? theme.primary_color : 'rgba(0,0,0,.3)'} />
                  <span className="type-btn-label">Retirada</span>
                  <span style={{ fontSize: 10, color: 'rgba(0,0,0,.35)' }}>No local</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Step: Dados ── */}
          {checkoutSub === 'info' && (
            <div className="checkout-section">
              <p className="section-label">Seus dados</p>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(0,0,0,.5)' }}>Nome completo</label>
                <input className="input" placeholder="João Silva" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(0,0,0,.5)' }}>WhatsApp / Telefone</label>
                <input className="input" placeholder="(00) 00000-0000" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
              </div>
            </div>
          )}

          {/* ── Step: Endereço ── */}
          {checkoutSub === 'address' && orderType === 'delivery' && (
            <div className="checkout-section">
              <p className="section-label">Endereço de entrega</p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(0,0,0,.5)' }}>Bairro / Região</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedZone ? theme.primary_color : 'rgba(0,0,0,.3)' }} />
                  <select
                    className="input"
                    value={selectedZone}
                    onChange={e => setSelectedZone(e.target.value)}
                    style={{ paddingLeft: 40, appearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="">Selecione o bairro...</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>
                        {z.neighborhood}{z.delivery_fee === 0 ? ' — Entrega grátis' : ` — ${fmt(z.delivery_fee)}`}
                      </option>
                    ))}
                  </select>
                  <ChevronRight size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none', color: 'rgba(0,0,0,.3)' }} />
                </div>
                {/* Preview da taxa após seleção */}
                {selectedZone && (() => {
                  const zone = zones.find(z => z.id === selectedZone);
                  if (!zone) return null;
                  return (
                    <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: zone.delivery_fee === 0 ? 'rgba(34,197,94,.08)' : `color-mix(in srgb, ${theme.primary_color} 8%, transparent)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'rgba(0,0,0,.5)' }}>Taxa de entrega</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: zone.delivery_fee === 0 ? '#16a34a' : theme.primary_color }}>
                        {zone.delivery_fee === 0 ? 'Grátis 🎉' : fmt(zone.delivery_fee)}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(0,0,0,.5)' }}>Endereço completo</label>
                  <input className="input" placeholder="Rua, número" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(0,0,0,.5)' }}>Complemento (opcional)</label>
                  <input className="input" placeholder="Apto, bloco..." value={complement} onChange={e => setComplement(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(0,0,0,.5)' }}>Ponto de referência (opcional)</label>
                  <input className="input" placeholder="Próximo ao..." value={reference} onChange={e => setReference(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step: Pagamento ── */}
          {checkoutSub === 'payment' && (
            <div className="checkout-section">
              <p className="section-label">Forma de pagamento</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {([
                  { value: 'pix', label: 'PIX', icon: <Smartphone size={18} /> },
                  { value: 'credit_card', label: 'Crédito', icon: <CreditCard size={18} /> },
                  { value: 'debit_card', label: 'Débito', icon: <Wallet size={18} /> },
                  { value: 'cash', label: 'Dinheiro', icon: <Banknote size={18} /> },
                ] as const).map(opt => (
                  <button key={opt.value} className={`pay-btn ${paymentMethod === opt.value ? 'active' : ''}`} onClick={() => setPaymentMethod(opt.value)}>
                    <span style={{ color: paymentMethod === opt.value ? theme.primary_color : 'rgba(0,0,0,.3)' }}>{opt.icon}</span>
                    <span className="pay-label">{opt.label}</span>
                  </button>
                ))}
              </div>
              {paymentMethod === 'cash' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(0,0,0,.5)' }}>Troco para (opcional)</label>
                  <input className="input" type="number" placeholder="R$ 0,00" value={changeFor} onChange={e => setChangeFor(e.target.value)} />
                </div>
              )}
              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(0,0,0,.5)' }}>Observações (opcional)</label>
                <textarea className="input" rows={3} placeholder="Sem cebola, entregar no portão..." value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'none' }} />
              </div>
            </div>
          )}

          {/* ── Step: Resumo ── */}
          {checkoutSub === 'confirm' && (
            <>
              <div className="checkout-section">
                <p className="section-label">Itens do pedido</p>
                {cart.map(item => {
                  const img = item.product.product_images?.find(i => i.is_primary)?.url ?? item.product.product_images?.[0]?.url;
                  const price = item.product.promotional_price ?? item.product.price;
                  return (
                    <div key={item.product.id} className="cart-item-row">
                      {img ? <img src={img} alt={item.product.name} className="cart-item-thumb" /> : <div className="cart-item-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={18} style={{ opacity: .2 }} /></div>}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.product.name}</p>
                        <p style={{ fontSize: 12, color: 'rgba(0,0,0,.4)' }}>{item.qty}x {fmt(price)}</p>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 700 }}>{fmt(price * item.qty)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-section">
                <p className="section-label">Resumo</p>
                <div className="summary-row"><span>Subtotal</span><span>{fmt(cartTotal)}</span></div>
                {orderType === 'delivery' && (
                  <div className="summary-row">
                    <span>Taxa de entrega</span>
                    <span style={{ color: deliveryFee === 0 ? '#22c55e' : undefined }}>{deliveryFee === 0 ? 'Grátis' : fmt(deliveryFee)}</span>
                  </div>
                )}
                <div className="summary-row" style={{ paddingTop: 12 }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span className="summary-total">{fmt(finalTotal)}</span>
                </div>
              </div>

              <div className="checkout-section">
                <p className="section-label">Detalhes</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(0,0,0,.4)' }}>Nome</span><span style={{ fontWeight: 600 }}>{customerName}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(0,0,0,.4)' }}>Telefone</span><span style={{ fontWeight: 600 }}>{customerPhone}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(0,0,0,.4)' }}>Tipo</span><span style={{ fontWeight: 600 }}>{orderType === 'delivery' ? 'Entrega' : 'Retirada'}</span></div>
                  {orderType === 'delivery' && address && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(0,0,0,.4)' }}>Endereço</span><span style={{ fontWeight: 600, textAlign: 'right', maxWidth: 200 }}>{address}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(0,0,0,.4)' }}>Pagamento</span><span style={{ fontWeight: 600 }}>{{ pix: 'PIX', credit_card: 'Cartão de Crédito', debit_card: 'Cartão de Débito', cash: 'Dinheiro' }[paymentMethod]}</span></div>
                </div>
              </div>
            </>
          )}

          {/* CTA */}
          {checkoutSub !== 'confirm' ? (
            <button className="btn-confirm" onClick={goNext} disabled={!canAdvance()} style={{ marginTop: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Continuar <ChevronRight size={16} />
              </span>
            </button>
          ) : (
            <button className="btn-confirm" onClick={handleSubmitOrder} disabled={submitting} style={{ marginTop: 8 }}>
              {submitting ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Enviando...</span> : 'Confirmar pedido'}
            </button>
          )}
        </div>
      )}

      {/* ══ SUCCESS ══ */}
      {step === 'success' && (
        <div className="success-wrap">
          <div className="success-icon">
            <CheckCircle size={40} color={theme.primary_color} />
          </div>
          <p style={{ fontSize: 13, color: 'rgba(0,0,0,.4)', marginBottom: 8 }}>Pedido</p>
          <p className="success-number">#{orderNumber}</p>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, marginTop: 12 }}>Pedido confirmado!</h2>
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,.45)', marginBottom: 32, lineHeight: 1.6 }}>
            {store?.name} recebeu seu pedido e está preparando tudo com carinho.
          </p>
          <div style={{ background: theme.surface_color, borderRadius: 16, padding: 16, marginBottom: 24, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={16} color={theme.primary_color} />
              <div>
                <p style={{ fontSize: 12, color: 'rgba(0,0,0,.4)' }}>Forma de entrega</p>
                <p style={{ fontSize: 14, fontWeight: 700 }}>{orderType === 'delivery' ? '🛵 Entrega em domicílio' : '🏪 Retirada no local'}</p>
              </div>
            </div>
          </div>
          <button className="btn-confirm" onClick={() => { setStep('catalog'); setOrderNumber(null); }}>
            Fazer novo pedido
          </button>
        </div>
      )}
    </>
  );
}