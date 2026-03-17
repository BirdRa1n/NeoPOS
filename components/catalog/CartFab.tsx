import { fmt } from '@/types/catalog';

interface CartFabProps {
  qty: number;
  total: number;
  onClick: () => void;
}

export function CartFab({ qty, total, onClick }: CartFabProps) {
  if (qty === 0) return null;
  return (
    <button className="cart-fab" onClick={onClick}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ background: 'rgba(255,255,255,.25)', borderRadius: 6, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{qty}</span>
        Ver carrinho
      </span>
      <span style={{ fontWeight: 800 }}>{fmt(total)}</span>
    </button>
  );
}
