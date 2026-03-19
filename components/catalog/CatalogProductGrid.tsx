import { Minus, Plus, Package } from 'lucide-react';
import { Product, CartItem, CatalogTheme, fmt } from '@/types/catalog';

interface CatalogProductGridProps {
  products: Product[];
  cart: CartItem[];
  theme: CatalogTheme;
  onAdd: (p: Product) => void;
  onUpdateQty: (id: string, delta: number) => void;
}

function ProductCard({ product, cart, theme, onAdd, onUpdateQty }: { product: Product; cart: CartItem[]; theme: CatalogTheme; onAdd: (p: Product) => void; onUpdateQty: (id: string, delta: number) => void }) {
  const img = product.product_images?.find(i => i.is_primary)?.url ?? product.product_images?.[0]?.url;
  const cartItem = cart.find(i => i.product.id === product.id);
  const price = product.promotional_price ?? product.price;
  const hasPromo = !!product.promotional_price;

  return (
    <div className="prod-card" onClick={() => !cartItem && onAdd(product)}>
      <div className="prod-img-wrap">
        {img
          ? <img src={img} alt={product.name} className="prod-img" />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={32} style={{ opacity: .15 }} /></div>
        }
        {hasPromo && <span className="promo-badge">Promoção</span>}
      </div>
      <div className="prod-body">
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{product.name}</p>
        {product.description && (
          <p style={{ fontSize: 11, color: 'rgba(0,0,0,.4)', marginBottom: 10, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>
        )}
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
              <button className="qty-btn" onClick={() => onUpdateQty(product.id, -1)}><Minus size={11} /></button>
              <span style={{ fontSize: 14, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{cartItem.qty}</span>
              <button className="qty-btn" onClick={() => onUpdateQty(product.id, +1)}><Plus size={11} /></button>
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
}

export function CatalogProductGrid({ products, cart, theme, onAdd, onUpdateQty }: CatalogProductGridProps) {
  if (products.length === 0) return (
    <div className="empty">
      <Package size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: .3 }} />
      <p>Nenhum produto encontrado</p>
    </div>
  );

  const promos = products.filter(p => !!p.promotional_price);
  const regular = products.filter(p => !p.promotional_price);

  return (
    <>
      {promos.length > 0 && (
        <>
          <div className="prod-section-header">
            <span className="prod-section-tag promo-tag">🔥 Promoções</span>
            <span className="prod-section-line" />
          </div>
          <div className="promo-scroll" style={{ marginBottom: 8 }}>
            {promos.map(product => (
              <ProductCard key={product.id} product={product} cart={cart} theme={theme} onAdd={onAdd} onUpdateQty={onUpdateQty} />
            ))}
          </div>
        </>
      )}
      {regular.length > 0 && (
        <>
          {promos.length > 0 && (
            <div className="prod-section-header">
              <span className="prod-section-tag">Todos os produtos</span>
              <span className="prod-section-line" />
            </div>
          )}
          <div className="prod-grid">
            {regular.map(product => (
              <ProductCard key={product.id} product={product} cart={cart} theme={theme} onAdd={onAdd} onUpdateQty={onUpdateQty} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
