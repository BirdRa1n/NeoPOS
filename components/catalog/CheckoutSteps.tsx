import { Bike, Store, MapPin, ChevronRight, CreditCard, Banknote, Smartphone, Wallet, Package } from 'lucide-react';
import { CartItem, CatalogTheme, DeliveryZone, OrderType, PaymentMethod, fmt } from '@/types/catalog';

/* ── Step: Tipo ── */
export function StepType({ orderType, zones, theme, onChange }: {
  orderType: OrderType; zones: DeliveryZone[]; theme: CatalogTheme; onChange: (t: OrderType) => void;
}) {
  return (
    <div className="checkout-section">
      <p className="section-label">Como quer receber?</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className={`type-btn ${orderType === 'delivery' ? 'active' : ''}`} onClick={() => onChange('delivery')}>
          <Bike size={24} color={orderType === 'delivery' ? theme.primary_color : 'rgba(0,0,0,.3)'} />
          <span className="type-btn-label">Entrega</span>
          {zones.length > 0 && <span style={{ fontSize: 10, color: 'rgba(0,0,0,.35)' }}>{zones.length} bairro{zones.length > 1 ? 's' : ''}</span>}
        </button>
        <button className={`type-btn ${orderType === 'pickup' ? 'active' : ''}`} onClick={() => onChange('pickup')}>
          <Store size={24} color={orderType === 'pickup' ? theme.primary_color : 'rgba(0,0,0,.3)'} />
          <span className="type-btn-label">Retirada</span>
          <span style={{ fontSize: 10, color: 'rgba(0,0,0,.35)' }}>No local</span>
        </button>
      </div>
    </div>
  );
}

/* ── Step: Dados ── */
export function StepInfo({ name, phone, onName, onPhone }: {
  name: string; phone: string; onName: (v: string) => void; onPhone: (v: string) => void;
}) {
  return (
    <div className="checkout-section">
      <p className="section-label">Seus dados</p>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(0,0,0,.5)' }}>Nome completo</label>
        <input className="input" placeholder="João Silva" value={name} onChange={e => onName(e.target.value)} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(0,0,0,.5)' }}>WhatsApp / Telefone</label>
        <input className="input" placeholder="(00) 00000-0000" value={phone} onChange={e => onPhone(e.target.value)} />
      </div>
    </div>
  );
}

/* ── Step: Endereço ── */
export function StepAddress({ zones, selectedZone, address, complement, reference, theme, onZone, onAddress, onComplement, onReference }: {
  zones: DeliveryZone[]; selectedZone: string; address: string; complement: string; reference: string;
  theme: CatalogTheme; onZone: (v: string) => void; onAddress: (v: string) => void;
  onComplement: (v: string) => void; onReference: (v: string) => void;
}) {
  const zone = zones.find(z => z.id === selectedZone);
  return (
    <div className="checkout-section">
      <p className="section-label">Endereço de entrega</p>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(0,0,0,.5)' }}>Bairro / Região</label>
        <div style={{ position: 'relative' }}>
          <MapPin size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: selectedZone ? theme.primary_color : 'rgba(0,0,0,.3)' }} />
          <select className="input" value={selectedZone} onChange={e => onZone(e.target.value)} style={{ paddingLeft: 40, appearance: 'none', cursor: 'pointer' }}>
            <option value="">Selecione o bairro...</option>
            {zones.map(z => (
              <option key={z.id} value={z.id}>{z.neighborhood}{z.delivery_fee === 0 ? ' — Entrega grátis' : ` — ${fmt(z.delivery_fee)}`}</option>
            ))}
          </select>
          <ChevronRight size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none', color: 'rgba(0,0,0,.3)' }} />
        </div>
        {zone && (
          <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: zone.delivery_fee === 0 ? 'rgba(34,197,94,.08)' : `color-mix(in srgb, ${theme.primary_color} 8%, transparent)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'rgba(0,0,0,.5)' }}>Taxa de entrega</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: zone.delivery_fee === 0 ? '#16a34a' : theme.primary_color }}>
              {zone.delivery_fee === 0 ? 'Grátis 🎉' : fmt(zone.delivery_fee)}
            </span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { label: 'Endereço completo', placeholder: 'Rua, número', value: address, onChange: onAddress },
          { label: 'Complemento (opcional)', placeholder: 'Apto, bloco...', value: complement, onChange: onComplement },
          { label: 'Ponto de referência (opcional)', placeholder: 'Próximo ao...', value: reference, onChange: onReference },
        ].map(({ label, placeholder, value, onChange }) => (
          <div key={label}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(0,0,0,.5)' }}>{label}</label>
            <input className="input" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Step: Pagamento ── */
export function StepPayment({ paymentMethod, changeFor, notes, theme, onPayment, onChangeFor, onNotes }: {
  paymentMethod: PaymentMethod; changeFor: string; notes: string; theme: CatalogTheme;
  onPayment: (v: PaymentMethod) => void; onChangeFor: (v: string) => void; onNotes: (v: string) => void;
}) {
  const opts = [
    { value: 'pix' as PaymentMethod, label: 'PIX', icon: <Smartphone size={18} /> },
    { value: 'credit_card' as PaymentMethod, label: 'Crédito', icon: <CreditCard size={18} /> },
    { value: 'debit_card' as PaymentMethod, label: 'Débito', icon: <Wallet size={18} /> },
    { value: 'cash' as PaymentMethod, label: 'Dinheiro', icon: <Banknote size={18} /> },
  ];
  return (
    <div className="checkout-section">
      <p className="section-label">Forma de pagamento</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {opts.map(opt => (
          <button key={opt.value} className={`pay-btn ${paymentMethod === opt.value ? 'active' : ''}`} onClick={() => onPayment(opt.value)}>
            <span style={{ color: paymentMethod === opt.value ? theme.primary_color : 'rgba(0,0,0,.3)' }}>{opt.icon}</span>
            <span className="pay-label">{opt.label}</span>
          </button>
        ))}
      </div>
      {paymentMethod === 'cash' && (
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(0,0,0,.5)' }}>Troco para (opcional)</label>
          <input className="input" type="number" placeholder="R$ 0,00" value={changeFor} onChange={e => onChangeFor(e.target.value)} />
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(0,0,0,.5)' }}>Observações (opcional)</label>
        <textarea className="input" rows={3} placeholder="Sem cebola, entregar no portão..." value={notes} onChange={e => onNotes(e.target.value)} style={{ resize: 'none' }} />
      </div>
    </div>
  );
}

/* ── Step: Resumo ── */
export function StepConfirm({ cart, orderType, customerName, customerPhone, address, paymentMethod, cartTotal, deliveryFee, finalTotal }: {
  cart: CartItem[]; orderType: OrderType; customerName: string; customerPhone: string;
  address: string; paymentMethod: PaymentMethod; cartTotal: number; deliveryFee: number; finalTotal: number;
}) {
  const PAYMENT_LABELS: Record<PaymentMethod, string> = { pix: 'PIX', credit_card: 'Cartão de Crédito', debit_card: 'Cartão de Débito', cash: 'Dinheiro' };
  return (
    <>
      <div className="checkout-section">
        <p className="section-label">Itens do pedido</p>
        {cart.map(item => {
          const img = item.product.product_images?.find(i => i.is_primary)?.url ?? item.product.product_images?.[0]?.url;
          const price = item.product.promotional_price ?? item.product.price;
          return (
            <div key={item.product.id} className="cart-item-row">
              {img
                ? <img src={img} alt={item.product.name} className="cart-item-thumb" />
                : <div className="cart-item-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={18} style={{ opacity: .2 }} /></div>
              }
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
          {[
            { label: 'Nome', value: customerName },
            { label: 'Telefone', value: customerPhone },
            { label: 'Tipo', value: orderType === 'delivery' ? 'Entrega' : 'Retirada' },
            ...(orderType === 'delivery' && address ? [{ label: 'Endereço', value: address }] : []),
            { label: 'Pagamento', value: PAYMENT_LABELS[paymentMethod] },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(0,0,0,.4)' }}>{label}</span>
              <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: 200 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
