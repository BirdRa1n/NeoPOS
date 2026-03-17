import { useState } from 'react';
import { useInventory, useProductStock } from '@/hooks/useInventory';
import { useStore } from '@/contexts/StoreContext';
import { useIsDark } from '@/hooks/useIsDark';
import { Search, Plus, Package } from 'lucide-react';
import { SortKey, InventoryTab, InventoryModal } from '@/types/inventory';
import {
  InventoryTabs, InventoryStatsStrip, LowStockAlert,
  SuppliesTable, ProductsTable,
  SupplyModal, MovementModal, ProductStockEditModal, ProductMovementModal,
} from '@/components/inventory';
import { formatCurrency } from '@/lib/utils/format';

export function InventoryView() {
  const isDark = useIsDark();
  const { store } = useStore();
  const { supplies, loading: suppliesLoading, refetch: refetchSupplies } = useInventory();
  const { productStocks, loading: productsLoading, refetch: refetchProducts } = useProductStock();

  const [activeTab, setActiveTab] = useState<InventoryTab>('supplies');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [modal, setModal] = useState<InventoryModal>(null);
  const [selected, setSelected] = useState<any>(null);

  const loading = suppliesLoading || productsLoading;
  const isProducts = activeTab === 'products';

  const filteredSupplies = (supplies ?? []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProducts = (productStocks ?? []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let va: any = a[sortKey as keyof typeof a];
    let vb: any = b[sortKey as keyof typeof b];
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const lowStock = isProducts
    ? (productStocks ?? []).filter(p => p.below_minimum)
    : (supplies ?? []).filter(s => s.current_quantity <= s.minimum_quantity);

  const totalValue = isProducts
    ? (productStocks ?? []).reduce((acc, p) => acc + (p.stock_value || 0), 0)
    : (supplies ?? []).reduce((acc, s) => acc + (s.current_quantity ?? 0) * (s.unit_cost ?? 0), 0);

  const totalItems = isProducts ? (productStocks?.length ?? 0) : (supplies?.length ?? 0);

  const closeModal = () => setModal(null);
  const afterSupply = async () => { await refetchSupplies?.(); closeModal(); };
  const afterProduct = async () => { await refetchProducts?.(); closeModal(); };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Estoque</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Controle de insumos e inventário de produtos</p>
        </div>
        {!isProducts && (
          <button
            onClick={() => { setSelected(null); setModal('supply-create'); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}
          >
            <Plus size={15} /> Novo Insumo
          </button>
        )}
      </div>

      <InventoryTabs activeTab={activeTab} onChange={setActiveTab} />

      <InventoryStatsStrip totalItems={totalItems} lowStockCount={lowStock.length} totalValue={totalValue} />

      <LowStockAlert items={lowStock} isDark={isDark} />

      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Buscar ${isProducts ? 'produto ou categoria' : 'insumos'}...`}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', boxShadow: 'var(--surface-box)' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#6366F1')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
        <div className="overflow-x-auto">
          {!isProducts
            ? <SuppliesTable supplies={filteredSupplies} isDark={isDark} onMovement={s => { setSelected(s); setModal('movement'); }} onEdit={s => { setSelected(s); setModal('supply-edit'); }} />
            : <ProductsTable products={sortedProducts} isDark={isDark} sortKey={sortKey} sortAsc={sortAsc} onSort={handleSort} onMovement={p => { setSelected(p); setModal('product-movement'); }} onEdit={p => { setSelected(p); setModal('product-edit'); }} />
          }
        </div>

        {((!isProducts && filteredSupplies.length === 0) || (isProducts && filteredProducts.length === 0)) && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Package size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {search ? 'Nenhum resultado para a busca' : `Nenhum ${isProducts ? 'produto' : 'insumo'} cadastrado`}
            </p>
          </div>
        )}
      </div>

      {modal === 'supply-create' && store && <SupplyModal storeId={store.id} onClose={closeModal} onSuccess={afterSupply} />}
      {modal === 'supply-edit' && selected && store && <SupplyModal supply={selected} storeId={store.id} onClose={closeModal} onSuccess={afterSupply} />}
      {modal === 'movement' && selected && store && <MovementModal supply={selected} storeId={store.id} onClose={closeModal} onSuccess={afterSupply} />}
      {modal === 'product-movement' && selected && store && <ProductMovementModal productStock={selected} storeId={store.id} onClose={closeModal} onSuccess={afterProduct} />}
      {modal === 'product-edit' && selected && store && <ProductStockEditModal productStock={selected} storeId={store.id} onClose={closeModal} onSuccess={afterProduct} />}
    </div>
  );
}
