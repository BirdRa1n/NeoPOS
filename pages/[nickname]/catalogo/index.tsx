import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import {
  buildCatalogCSS, CatalogHeader, CatalogProductGrid, CartFab,
  CheckoutProgress, StepType, StepInfo, StepAddress, StepPayment, StepConfirm,
  CatalogSuccessScreen,
} from '@/components/catalog';
import {
  StoreData, CatalogTheme, Category, Product, CartItem, DeliveryZone,
  CatalogStep, CheckoutSub, PaymentMethod, OrderType,
  DEFAULT_CATALOG_THEME, CHECKOUT_STEPS,
} from '@/types/catalog';

export default function CatalogPage() {
  const router = useRouter();
  const { nickname } = router.query as { nickname: string };

  const [store, setStore] = useState<StoreData | null>(null);
  const [theme, setTheme] = useState<CatalogTheme>(DEFAULT_CATALOG_THEME);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<CatalogStep>('catalog');
  const [checkoutSub, setCheckoutSub] = useState<CheckoutSub>('type');

  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [address, setAddress] = useState('');
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!nickname) return;
    (async () => {
      setLoading(true);
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) return;
        const url = new URL('/functions/v1/get-store-catalog', supabaseUrl);
        url.searchParams.set('nickname', nickname);
        const res = await fetch(url.toString());
        if (!res.ok) return;
        const data = await res.json();
        if (data.store) setStore(data.store);
        if (data.theme) setTheme({ ...DEFAULT_CATALOG_THEME, ...data.theme });
        if (data.categories) setCategories(data.categories);
        if (data.products) setProducts(data.products);
        if (data.zones) setZones(data.zones);
      } catch (err) { console.error('Erro ao carregar catálogo:', err); }
      finally { setLoading(false); }
    })();
  }, [nickname]);

  const addToCart = (product: Product) =>
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id);
      if (idx >= 0) return prev.map((i, n) => n === idx ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });

  const updateQty = (productId: string, delta: number) =>
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));

  const cartTotal = cart.reduce((s, i) => s + (i.product.promotional_price ?? i.product.price) * i.qty, 0);
  const cartQty = cart.reduce((s, i) => s + i.qty, 0);
  const deliveryFee = orderType === 'delivery' && selectedZone ? zones.find(z => z.id === selectedZone)?.delivery_fee || 0 : 0;
  const finalTotal = cartTotal + deliveryFee;

  const filteredProducts = products.filter(p =>
    (!activeCategory || p.category_id === activeCategory) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const checkoutStepsFiltered: CheckoutSub[] = orderType === 'pickup'
    ? ['type', 'info', 'payment', 'confirm']
    : CHECKOUT_STEPS;

  const currentSubIdx = checkoutStepsFiltered.indexOf(checkoutSub);

  const canAdvance = () => {
    if (checkoutSub === 'info') return !!customerName && !!customerPhone;
    if (checkoutSub === 'address') return !!selectedZone && !!address;
    return true;
  };

  const goNext = () => { const next = checkoutStepsFiltered[currentSubIdx + 1]; if (next) setCheckoutSub(next); };
  const goPrev = () => {
    const prev = checkoutStepsFiltered[currentSubIdx - 1];
    if (prev) setCheckoutSub(prev);
    else { setStep('catalog'); setCheckoutSub('type'); }
  };

  const handleSubmitOrder = async () => {
    if (!store) return;
    setSubmitting(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
      if (!supabaseUrl || !anonKey) throw new Error('Configuração inválida');
      const url = new URL('/functions/v1/create-order', supabaseUrl);
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anonKey}` },
        body: JSON.stringify({
          store_id: store.id, type: orderType, payment_method: paymentMethod,
          items: cart.map(i => ({ product_id: i.product.id, product_name: i.product.name, unit_price: i.product.promotional_price ?? i.product.price, quantity: i.qty })),
          customer: { name: customerName, phone: customerPhone },
          delivery: orderType === 'delivery' ? { zone_id: selectedZone, address, complement, reference } : undefined,
          change_for: paymentMethod === 'cash' && changeFor ? parseFloat(changeFor) : undefined,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) { setOrderNumber(data.order.order_number); setStep('success'); setCart([]); }
    } catch { alert('Erro ao criar pedido'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <>
      <style>{buildCatalogCSS(theme)}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
        <div className="spinner" />
        <p style={{ fontSize: 14, color: 'rgba(0,0,0,.4)', fontFamily: 'system-ui' }}>Carregando cardápio...</p>
      </div>
    </>
  );

  return (
    <>
      <Head><title>{store?.name ?? 'Cardápio'}</title></Head>
      <style>{buildCatalogCSS(theme)}</style>

      {step === 'catalog' && (
        <>
          <CatalogHeader store={store} theme={theme} categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} search={search} onSearch={setSearch} />
          <div className="store-info">
            <CatalogProductGrid products={filteredProducts} cart={cart} theme={theme} onAdd={addToCart} onUpdateQty={updateQty} />
          </div>
          <CartFab qty={cartQty} total={cartTotal} onClick={() => { setStep('checkout'); setCheckoutSub('type'); }} />
        </>
      )}

      {step === 'checkout' && (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 20px 40px' }}>
          <button className="btn-back" onClick={goPrev}>
            <ArrowLeft size={15} />{currentSubIdx === 0 ? 'Voltar ao cardápio' : 'Voltar'}
          </button>
          <CheckoutProgress steps={checkoutStepsFiltered} current={checkoutSub} theme={theme} />

          {checkoutSub === 'type' && <StepType orderType={orderType} zones={zones} theme={theme} onChange={setOrderType} />}
          {checkoutSub === 'info' && <StepInfo name={customerName} phone={customerPhone} onName={setCustomerName} onPhone={setCustomerPhone} />}
          {checkoutSub === 'address' && orderType === 'delivery' && (
            <StepAddress zones={zones} selectedZone={selectedZone} address={address} complement={complement} reference={reference} theme={theme} onZone={setSelectedZone} onAddress={setAddress} onComplement={setComplement} onReference={setReference} />
          )}
          {checkoutSub === 'payment' && <StepPayment paymentMethod={paymentMethod} changeFor={changeFor} notes={notes} theme={theme} onPayment={setPaymentMethod} onChangeFor={setChangeFor} onNotes={setNotes} />}
          {checkoutSub === 'confirm' && (
            <StepConfirm cart={cart} orderType={orderType} customerName={customerName} customerPhone={customerPhone} address={address} paymentMethod={paymentMethod} cartTotal={cartTotal} deliveryFee={deliveryFee} finalTotal={finalTotal} />
          )}

          {checkoutSub !== 'confirm' ? (
            <button className="btn-confirm" onClick={goNext} disabled={!canAdvance()} style={{ marginTop: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>Continuar <ChevronRight size={16} /></span>
            </button>
          ) : (
            <button className="btn-confirm" onClick={handleSubmitOrder} disabled={submitting} style={{ marginTop: 8 }}>
              {submitting
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Enviando...</span>
                : 'Confirmar pedido'}
            </button>
          )}
        </div>
      )}

      {step === 'success' && orderNumber && store && (
        <CatalogSuccessScreen orderNumber={orderNumber} storeName={store.name} orderType={orderType} theme={theme} onNewOrder={() => { setStep('catalog'); setOrderNumber(null); }} />
      )}
    </>
  );
}
