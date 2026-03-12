import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ShoppingCart, Search, MapPin, Phone, ArrowLeft, Minus, Plus, X } from 'lucide-react';
import { supabase } from '@/supabase/client';

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
  background_color: string;
  surface_color: string;
  text_color: string;
  font_family: string;
  border_radius: string;
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
  product_images: { url: string; is_primary: boolean }[];
}

interface CartItem {
  product: Product;
  qty: number;
}

interface DeliveryZone {
  id: string;
  neighborhood: string;
  delivery_fee: number;
}

const DEFAULT_THEME: Theme = {
  primary_color: '#6366F1',
  secondary_color: '#8B5CF6',
  background_color: '#FFFFFF',
  surface_color: '#F9FAFB',
  text_color: '#111827',
  font_family: 'Inter',
  border_radius: 'rounded',
};

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function buildCSS(t: Theme) {
  const r = t.border_radius === 'pill' ? '99px' : t.border_radius === 'rounded' ? '14px' : '4px';
  return `
@import url('https://fonts.googleapis.com/css2?family=${t.font_family.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap');
:root{--p:${t.primary_color};--s:${t.secondary_color};--bg:${t.background_color};--sf:${t.surface_color};--tx:${t.text_color};--r:${r};font-family:'${t.font_family}',system-ui,sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--tx)}
.cat-chip{padding:8px 18px;border-radius:99px;font-size:13px;font-weight:600;border:2px solid transparent;cursor:pointer;transition:all .2s;white-space:nowrap}
.cat-chip.active{background:var(--p);color:white;border-color:var(--p)}
.cat-chip.inactive{background:transparent;color:var(--tx);border-color:rgba(0,0,0,0.12)}
.cat-chip.inactive:hover{border-color:var(--p);color:var(--p)}
.prod-card{background:var(--sf);border-radius:var(--r);overflow:hidden;cursor:pointer;transition:transform .2s,box-shadow .2s;box-shadow:0 2px 12px rgba(0,0,0,0.08)}
.prod-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.12)}
.btn{padding:14px 20px;border-radius:var(--r);border:none;cursor:pointer;font-size:14px;font-weight:700;transition:all .2s}
.btn-primary{background:linear-gradient(135deg,var(--p),var(--s));color:white;box-shadow:0 4px 16px color-mix(in srgb,var(--p) 40%,transparent)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 6px 20px color-mix(in srgb,var(--p) 50%,transparent)}
.btn-secondary{background:var(--sf);color:var(--tx);border:1.5px solid rgba(0,0,0,0.1)}
.btn-secondary:hover{border-color:var(--p);color:var(--p)}
.input{width:100%;padding:12px 16px;border-radius:var(--r);border:1.5px solid rgba(0,0,0,0.1);background:var(--sf);font-size:14px;font-family:'${t.font_family}',sans-serif;color:var(--tx);outline:none;transition:all .2s}
.input:focus{border-color:var(--p);box-shadow:0 0 0 3px color-mix(in srgb,var(--p) 15%,transparent)}
.drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:60;backdrop-filter:blur(4px)}
.drawer{position:fixed;right:0;top:0;bottom:0;width:min(400px,100vw);background:var(--bg);z-index:70;overflow-y:auto;box-shadow:-8px 0 32px rgba(0,0,0,0.15);display:flex;flex-direction:column;animation:slideIn .3s cubic-bezier(.4,0,.2,1) both}
@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
.qty-btn{width:30px;height:30px;border-radius:8px;border:none;cursor:pointer;background:var(--sf);color:var(--tx);font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,0.1);transition:all .15s}
.qty-btn:hover{background:var(--p);color:white;border-color:var(--p)}
`;
}

type Step = 'catalog' | 'checkout' | 'success';

export default function CatalogPage() {
  const router = useRouter();
  const { nickname } = router.query as { nickname: string };

  const [store, setStore] = useState<Store | null>(null);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<Step>('catalog');

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
      const { data: storeData } = await supabase.schema('core').from('stores')
        .select('id,name,nickname,description,logo_url,cover_url,phone,city,state,is_open')
        .eq('nickname', nickname)
        .single();

      if (!storeData) { setLoading(false); return; }
      setStore(storeData);

      const [themeRes, catsRes, prodsRes, zonesRes] = await Promise.all([
        supabase.schema('catalog').from('store_theme').select('*').eq('store_id', storeData.id).maybeSingle(),
        supabase.schema('catalog').from('categories').select('id,name,sort_order').eq('store_id', storeData.id).eq('active', true).order('sort_order'),
        supabase.schema('catalog').from('products')
          .select('id,category_id,name,description,price,promotional_price,available,product_images(url,is_primary)')
          .eq('store_id', storeData.id)
          .eq('available', true)
          .order('sort_order'),
        supabase.schema('core').from('delivery_zones').select('id,neighborhood,delivery_fee').eq('store_id', storeData.id).eq('active', true),
      ]);

      if (themeRes.data) setTheme({ ...DEFAULT_THEME, ...themeRes.data });
      if (catsRes.data) setCategories(catsRes.data);
      if (prodsRes.data) setProducts(prodsRes.data as Product[]);
      if (zonesRes.data) setZones(zonesRes.data);
      setLoading(false);
    })();
  }, [nickname]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id);
      if (idx >= 0) return prev.map((i, n) => n === idx ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));
  };

  const cartTotal = cart.reduce((s, i) => s + (i.product.promotional_price ?? i.product.price) * i.qty, 0);
  const cartQty = cart.reduce((s, i) => s + i.qty, 0);
  const deliveryFee = orderType === 'delivery' && selectedZone ? zones.find(z => z.id === selectedZone)?.delivery_fee || 0 : 0;
  const finalTotal = cartTotal + deliveryFee;

  const filteredProducts = products.filter(p => {
    const matchCat = !activeCategory || p.category_id === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSubmitOrder = async () => {
    if (!store || !customerName || !customerPhone) return;
    if (orderType === 'delivery' && (!selectedZone || !address)) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY}`,
        },
        body: JSON.stringify({
          store_id: store.id,
          type: orderType,
          payment_method: paymentMethod,
          items: cart.map(i => ({
            product_id: i.product.id,
            product_name: i.product.name,
            unit_price: i.product.promotional_price ?? i.product.price,
            quantity: i.qty,
          })),
          customer: {
            name: customerName,
            phone: customerPhone,
          },
          delivery: orderType === 'delivery' ? {
            zone_id: selectedZone,
            address,
            complement,
            reference,
          } : undefined,
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
    } catch (error) {
      alert('Erro ao criar pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <>
      <style>{buildCSS(theme)}</style>
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
      </Head>
      <style>{buildCSS(theme)}</style>

      {step === 'catalog' && (
        <>
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              {store?.logo_url && <img src={store.logo_url} alt="logo" style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover' }} />}
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800 }}>{store?.name}</h1>
                <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>{store?.description}</p>
              </div>
            </div>

            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Search size={15} color="rgba(0,0,0,0.35)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input className="input" placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 44 }} />
            </div>

            {categories.length > 0 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 24 }}>
                <button className={`cat-chip ${!activeCategory ? 'active' : 'inactive'}`} onClick={() => setActiveCategory(null)}>Todos</button>
                {categories.map(cat => (
                  <button key={cat.id} className={`cat-chip ${activeCategory === cat.id ? 'active' : 'inactive'}`} onClick={() => setActiveCategory(cat.id)}>{cat.name}</button>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, paddingBottom: 100 }}>
              {filteredProducts.map(product => {
                const img = product.product_images?.find(i => i.is_primary)?.url ?? product.product_images?.[0]?.url;
                const cartItem = cart.find(i => i.product.id === product.id);
                const price = product.promotional_price ?? product.price;
                return (
                  <div key={product.id} className="prod-card">
                    {img && <div style={{ height: 140, overflow: 'hidden' }}><img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                    <div style={{ padding: 12 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{product.name}</p>
                      {product.description && <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 10 }}>{product.description}</p>}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: 16, fontWeight: 800, color: theme.primary_color }}>{fmt(price)}</p>
                        {cartItem ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button className="qty-btn" onClick={() => updateQty(product.id, -1)}><Minus size={12} /></button>
                            <span style={{ fontSize: 14, fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{cartItem.qty}</span>
                            <button className="qty-btn" onClick={() => updateQty(product.id, +1)}><Plus size={12} /></button>
                          </div>
                        ) : (
                          <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 12 }} onClick={() => addToCart(product)}>Adicionar</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {cartQty > 0 && (
            <div style={{ position: 'fixed', bottom: 24, right: 24, left: 24, maxWidth: 900, margin: '0 auto' }}>
              <button className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => setStep('checkout')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingCart size={16} />
                  {cartQty} {cartQty === 1 ? 'item' : 'itens'}
                </span>
                <span>{fmt(cartTotal)}</span>
              </button>
            </div>
          )}
        </>
      )}

      {step === 'checkout' && (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
          <button className="btn btn-secondary" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setStep('catalog')}>
            <ArrowLeft size={16} />Voltar
          </button>

          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Finalizar Pedido</h2>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Tipo de Pedido</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className={`btn ${orderType === 'delivery' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setOrderType('delivery')}>Entrega</button>
              <button className={`btn ${orderType === 'pickup' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setOrderType('pickup')}>Retirada</button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Nome</label>
            <input className="input" value={customerName} onChange={e => setCustomerName(e.target.value)} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Telefone</label>
            <input className="input" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
          </div>

          {orderType === 'delivery' && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Bairro</label>
                <select className="input" value={selectedZone} onChange={e => setSelectedZone(e.target.value)}>
                  <option value="">Selecione</option>
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.neighborhood} - {fmt(z.delivery_fee)}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Endereço</label>
                <input className="input" value={address} onChange={e => setAddress(e.target.value)} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Complemento</label>
                <input className="input" value={complement} onChange={e => setComplement(e.target.value)} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Ponto de Referência</label>
                <input className="input" value={reference} onChange={e => setReference(e.target.value)} />
              </div>
            </>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Forma de Pagamento</label>
            <select className="input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)}>
              <option value="pix">PIX</option>
              <option value="cash">Dinheiro</option>
              <option value="credit_card">Cartão de Crédito</option>
              <option value="debit_card">Cartão de Débito</option>
            </select>
          </div>

          {paymentMethod === 'cash' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Troco para</label>
              <input className="input" type="number" value={changeFor} onChange={e => setChangeFor(e.target.value)} />
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Observações</label>
            <textarea className="input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div style={{ background: theme.surface_color, padding: 16, borderRadius: 12, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Subtotal</span>
              <span>{fmt(cartTotal)}</span>
            </div>
            {orderType === 'delivery' && deliveryFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Taxa de Entrega</span>
                <span>{fmt(deliveryFee)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <span>Total</span>
              <span>{fmt(finalTotal)}</span>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmitOrder} disabled={submitting}>
            {submitting ? 'Enviando...' : 'Confirmar Pedido'}
          </button>
        </div>
      )}

      {step === 'success' && (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Pedido Realizado!</h2>
          <p style={{ fontSize: 16, color: 'rgba(0,0,0,0.5)', marginBottom: 24 }}>
            Seu pedido #{orderNumber} foi registrado com sucesso.
          </p>
          <button className="btn btn-primary" onClick={() => { setStep('catalog'); setOrderNumber(null); }}>
            Fazer Novo Pedido
          </button>
        </div>
      )}
    </>
  );
}
