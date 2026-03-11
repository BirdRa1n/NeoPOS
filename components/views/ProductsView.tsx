import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { ProductFormModal } from '@/components/ProductFormModal';
import { useOverlayState } from '@heroui/react';

export function ProductsView() {
  const { products, loading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const modalState = useOverlayState();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    modalState.open();
  };

  const handleNew = () => {
    setSelectedProduct(null);
    modalState.open();
  };

  const handleSuccess = () => {
    // Refresh products list
    window.location.reload();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-600 mt-1">Gerencie seu catálogo de produtos</p>
        </div>
        <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all">
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
            <div className="aspect-square bg-gray-100 relative">
              {product?.product_images?.[0]?.storage_path ? (
                <img src={product.product_images?.[0]?.url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Sem imagem
                </div>
              )}
              {!product?.available && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  Inativo
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description || 'Sem descrição'}</p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  {product.promotional_price ? (
                    <div className='flex flex-col'>
                      <span className="text-xs text-gray-500 line-through">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, currency: 'BRL' })}</span>
                      <span className="text-lg font-bold text-green-600">R$ {product.promotional_price.toLocaleString('pt-BR', { minimumFractionDigits: 2, currency: 'BRL' })}</span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, currency: 'BRL' })}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(product)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  <Edit size={16} />
                  Editar
                </button>
                <button className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum produto encontrado</p>
        </div>
      )}

      <ProductFormModal
        isOpen={modalState.isOpen}
        onClose={modalState.close}
        product={selectedProduct}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
