import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatCurrency } from '@/lib/utils/format';
import { ProductFormModal } from '@/components/ProductFormModal';
import { useOverlayState } from '@heroui/react';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/forms/SearchBar';
import { StatCard } from '@/components/data/StatCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import {
  Plus, Edit, Trash2, Package, Tag,
  LayoutGrid, List, ImageOff, CheckCircle2, XCircle,
  AlertTriangle, Loader2
} from 'lucide-react';

function useIsDark(): boolean {
  if (typeof window === 'undefined') return true;
  return (getComputedStyle(document.documentElement).getPropertyValue('--bg') || '').trim().startsWith('#08');
}

type ViewMode = 'grid' | 'list';

export function ProductsView() {
  const isDark = useIsDark();
  const { products, loading, refetch } = useProducts();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const modalState = useOverlayState();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const active = filtered.filter(p => p.available);
  const inactive = filtered.filter(p => !p.available);
  const promoted = filtered.filter(p => p.promotional_price);

  const handleEdit = (product: any) => { setSelectedProduct(product); modalState.open(); };
  const handleNew = () => { setSelectedProduct(null); modalState.open(); };
  const handleDeleteClick = (product: any) => { setSelectedProduct(product); setDeleteModal(true); };
  
  const handleDelete = async () => {
    if (!selectedProduct) return;
    setDeleting(true);
    try {
      // Delete product images from storage
      if (selectedProduct.product_images?.length > 0) {
        const paths = selectedProduct.product_images.map((img: any) => img.storage_path);
        await supabase.storage.from('product-images').remove(paths);
      }
      
      // Delete product (cascade will delete images records)
      const { error } = await supabase.schema('catalog').from('products').delete().eq('id', selectedProduct.id);
      if (error) throw error;
      
      await refetch?.();
      setDeleteModal(false);
      setSelectedProduct(null);
    } catch (err: any) {
      alert(err.message ?? 'Erro ao deletar produto');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Produtos"
        subtitle="Gerencie seu catálogo de produtos"
        action={
          <Button onClick={handleNew} icon={<Plus size={15} />}>
            Novo Produto
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={products.length} icon={Package} color="#6366F1" />
        <StatCard label="Ativos" value={products.filter(p => p.available).length} icon={CheckCircle2} color="#10B981" />
        <StatCard label="Inativos" value={products.filter(p => !p.available).length} icon={XCircle} color="#EF4444" />
        <StatCard label="Promoções" value={products.filter(p => p.promotional_price).length} icon={Tag} color="#F59E0B" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <SearchBar
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar produtos..."
          className="flex-1 w-full"
        />

        <Card className="flex items-center gap-1 p-1 shrink-0">
          {(['grid', 'list'] as ViewMode[]).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className="w-8 h-7 flex items-center justify-center rounded-lg transition-all"
              style={{
                background: viewMode === mode ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)') : 'transparent',
                color: viewMode === mode ? '#818CF8' : 'var(--text-muted)',
              }}>
              {mode === 'grid' ? <LayoutGrid size={14} /> : <List size={14} />}
            </button>
          ))}
        </Card>
      </div>

      {/* Grid view */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => (
            <div key={product.id}
              className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl group"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>

              {/* Image */}
              <div className="aspect-square relative overflow-hidden"
                style={{ background: isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.04)' }}>
                {(product as any).product_images?.[0]?.url ? (
                  <img src={(product as any).product_images[0].url} alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <ImageOff size={28} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                    <p className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.4 }}>Sem imagem</p>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {!product.available && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(239,68,68,0.85)', color: '#fff' }}>Inativo</span>
                  )}
                  {product.promotional_price && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ background: 'rgba(245,158,11,0.9)', color: '#fff' }}>
                      <Tag size={9} /> Promoção
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-sm mb-1 truncate" style={{ color: 'var(--text-primary)' }}>{product.name}</h3>
                <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                  {product.description || 'Sem descrição'}
                </p>

                <div className="flex items-end justify-between mb-3">
                  <div>
                    {product.promotional_price ? (
                      <>
                        <p className="text-[11px] line-through" style={{ color: 'var(--text-muted)' }}>{formatCurrency(product.price)}</p>
                        <p className="text-base font-bold" style={{ color: '#10B981' }}>{formatCurrency(product.promotional_price)}</p>
                      </>
                    ) : (
                      <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(product.price)}</p>
                    )}
                  </div>
                  <span className="w-2 h-2 rounded-full" style={{ background: product.available ? '#10B981' : '#6B7280' }} />
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)', color: '#818CF8' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)'}>
                    <Edit size={13} /> Editar
                  </button>
                  <button onClick={() => handleDeleteClick(product)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-xs font-semibold transition-all"
                    style={{ background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.08)', color: '#F87171' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.15)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.08)'}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Produto', 'Preço', 'Promoção', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: 'var(--text-label)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id} className="transition-colors"
                    style={{ borderBottom: '1px solid var(--border-soft)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                          style={{ background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)' }}>
                          {(product as any).product_images?.[0]?.url
                            ? <img src={(product as any).product_images[0].url} alt={product.name} className="w-full h-full object-cover" />
                            : <Package size={16} style={{ color: '#818CF8', opacity: 0.5 }} />}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                          <p className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>{product.description || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(product.price)}</td>
                    <td className="px-5 py-4">
                      {product.promotional_price
                        ? <span className="font-bold" style={{ color: '#10B981' }}>{formatCurrency(product.promotional_price)}</span>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{
                          background: product.available ? (isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)') : (isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)'),
                          color: product.available ? (isDark ? '#6EE7B7' : '#065F46') : (isDark ? '#FCA5A5' : '#991B1B'),
                        }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: product.available ? '#10B981' : '#EF4444' }} />
                        {product.available ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(product)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(99,102,241,0.12)', color: '#818CF8' })}
                          onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}>
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteClick(product)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(239,68,68,0.12)', color: '#F87171' })}
                          onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Package size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      )}

      <ProductFormModal
        isOpen={modalState.isOpen}
        onClose={modalState.close}
        product={selectedProduct}
        onSuccess={async () => { await refetch?.(); modalState.close(); }}
      />

      {/* Delete Confirmation Modal */}
      {deleteModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={e => e.target === e.currentTarget && setDeleteModal(false)}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: isDark ? '#0F1117' : '#FFFFFF', border: '1px solid var(--border)', boxShadow: isDark ? '0 24px 64px rgba(0,0,0,0.7)' : '0 24px 64px rgba(0,0,0,0.14)' }}>
            <div className="p-7 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.07)' }}>
                <AlertTriangle size={26} style={{ color: '#EF4444' }} />
              </div>
              <div>
                <p className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Deletar Produto?</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Tem certeza que deseja deletar <strong>{selectedProduct.name}</strong>?<br />
                  Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => setDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)'}>
                  Cancelar
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                  {deleting ? <><Loader2 size={14} className="animate-spin" /> Deletando...</> : <><Trash2 size={14} /> Deletar</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}