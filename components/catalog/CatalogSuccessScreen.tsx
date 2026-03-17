import { CheckCircle, Clock } from 'lucide-react';
import { CatalogTheme, OrderType } from '@/types/catalog';

interface CatalogSuccessScreenProps {
  orderNumber: number;
  storeName: string;
  orderType: OrderType;
  theme: CatalogTheme;
  onNewOrder: () => void;
}

export function CatalogSuccessScreen({ orderNumber, storeName, orderType, theme, onNewOrder }: CatalogSuccessScreenProps) {
  return (
    <div className="success-wrap">
      <div className="success-icon">
        <CheckCircle size={40} color={theme.primary_color} />
      </div>
      <p style={{ fontSize: 13, color: 'rgba(0,0,0,.4)', marginBottom: 8 }}>Pedido</p>
      <p className="success-number">#{orderNumber}</p>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, marginTop: 12 }}>Pedido confirmado!</h2>
      <p style={{ fontSize: 14, color: 'rgba(0,0,0,.45)', marginBottom: 32, lineHeight: 1.6 }}>
        {storeName} recebeu seu pedido e está preparando tudo com carinho.
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
      <button className="btn-confirm" onClick={onNewOrder}>Fazer novo pedido</button>
    </div>
  );
}
