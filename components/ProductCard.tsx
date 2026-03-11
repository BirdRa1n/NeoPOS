import { Product } from '@/types/database';
import { formatCurrency } from '@/lib/utils/format';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const price = product.promotional_price || product.price;
  const hasPromotion = !!product.promotional_price;

  return (
    <div 
      onClick={onClick}
      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{product.name}</h3>
        {!product.available && (
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
            Indisponível
          </span>
        )}
      </div>
      
      {product.description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
      )}
      
      <div className="flex items-baseline gap-2">
        <span className="font-bold text-lg">{formatCurrency(price)}</span>
        {hasPromotion && (
          <span className="text-sm text-gray-500 line-through">
            {formatCurrency(product.price)}
          </span>
        )}
      </div>
    </div>
  );
}
