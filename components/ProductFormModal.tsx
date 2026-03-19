"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import { Modal, Button } from '@heroui/react';
import {
  X, Upload, ImagePlus, Trash2, GripVertical, Plus,
  Package, DollarSign, FileText, Tag, Star,
  AlertCircle, CheckCircle2, Loader2, ArrowLeft, ArrowRight, FolderTree
} from 'lucide-react';
import { supabase } from '@/supabase/client';
import { useStore } from '@/contexts/StoreContext';
import toast from 'react-hot-toast';
import { COLORS, ALPHA } from '@/lib/constants';

// ─── helpers ─────────────────────────────────────────────────────────────────
function useIsDark(): boolean {
  if (typeof window === 'undefined') return true;
  return (getComputedStyle(document.documentElement).getPropertyValue('--bg') || '').trim().startsWith('#08');
}

// ─── types ────────────────────────────────────────────────────────────────────
interface ExistingImage {
  id: string;
  url: string;
  storage_path: string;
  is_primary: boolean;
  sort_order: number;
}

interface NewImage {
  file: File;
  preview: string;
  sort_order: number;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  onSuccess: () => void;
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--text-muted)' }}>
        {label}
        {required && <span style={{ color: COLORS.danger }}>*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  );
}

// ─── Styled input ─────────────────────────────────────────────────────────────
function StyledInput({ icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.FC<any> }) {
  const isDark = useIsDark();
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon size={14} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
      <input
        {...props}
        className="w-full rounded-xl text-sm outline-none transition-all"
        style={{
          paddingLeft: Icon ? '2.25rem' : '0.875rem',
          paddingRight: '0.875rem',
          paddingTop: '0.625rem',
          paddingBottom: '0.625rem',
          background: 'var(--input-bg)',
          border: '1px solid var(--input-border)',
          color: 'var(--text-primary)',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = COLORS.accent)}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')}
      />
    </div>
  );
}

// ─── Styled textarea ──────────────────────────────────────────────────────────
function StyledTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full rounded-xl text-sm outline-none transition-all resize-none"
      style={{
        padding: '0.625rem 0.875rem',
        background: 'var(--input-bg)',
        border: '1px solid var(--input-border)',
        color: 'var(--text-primary)',
        minHeight: 80,
      }}
      onFocus={e => (e.currentTarget.style.borderColor = COLORS.accent)}
      onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')}
    />
  );
}

// ─── Image thumbnail ──────────────────────────────────────────────────────────
function ImageThumb({
  src, isPrimary, index, total,
  onDelete, onMoveLeft, onMoveRight, onSetPrimary,
  isExisting = false,
}: {
  src: string; isPrimary: boolean; index: number; total: number;
  onDelete: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onSetPrimary: () => void;
  isExisting?: boolean;
}) {
  const isDark = useIsDark();
  return (
    <div className="relative group rounded-xl overflow-hidden aspect-square"
      style={{
        border: isPrimary
          ? `2px solid ${COLORS.accent}`
          : '2px solid var(--border)',
        boxShadow: isPrimary ? ALPHA.accentGlow : 'none',
        transition: 'all 0.15s',
      }}>

      <img src={src} alt="" className="w-full h-full object-cover" />

      {/* Primary badge */}
      {isPrimary && (
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-bold text-white"
          style={{ background: COLORS.accent }}>
          <Star size={8} fill="white" /> Principal
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1.5"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}>

        {/* Order controls */}
        <div className="flex items-center gap-1">
          <button onClick={onMoveLeft} disabled={index === 0}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-white transition-all disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}>
            <ArrowLeft size={11} />
          </button>
          <span className="text-[10px] text-white/60 font-mono w-8 text-center">{index + 1}/{total}</span>
          <button onClick={onMoveRight} disabled={index === total - 1}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-white transition-all disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}>
            <ArrowRight size={11} />
          </button>
        </div>

        {/* Set as primary */}
        {!isPrimary && (
          <button onClick={onSetPrimary}
            className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-white transition-all"
            style={{ background: 'rgba(99,102,241,0.7)' }}
            onMouseEnter={e => (e.currentTarget.style.background = `${COLORS.accent}ee`)}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.7)')}>
            <Star size={9} /> Definir principal
          </button>
        )}

        {/* Delete */}
        <button onClick={onDelete}
          className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-white transition-all"
          style={{ background: 'rgba(239,68,68,0.7)' }}
          onMouseEnter={e => (e.currentTarget.style.background = `${COLORS.danger}ee`)}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.7)')}>
          <Trash2 size={9} /> Remover
        </button>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export function ProductFormModal({ isOpen, onClose, product, onSuccess }: ProductFormModalProps) {
  const isDark = useIsDark();
  const { store } = useStore();
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  useEffect(() => {
    if (!store?.id) return;
    loadCategories();
  }, [store?.id]);

  const loadCategories = async () => {
    if (!store?.id) return;
    const { data } = await supabase.schema('catalog').from('categories')
      .select('id,name')
      .eq('store_id', store.id)
      .eq('active', true)
      .order('sort_order');
    setCategories(data || []);
  };

  const handleCreateCategory = async () => {
    if (!store?.id || !newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      const { error } = await supabase.schema('catalog').from('categories').insert({
        store_id: store.id,
        name: newCategoryName.trim(),
        sort_order: categories.length,
        active: true,
      });
      if (error) throw error;
      toast.success('Categoria criada!');
      await loadCategories();
      setNewCategoryName('');
      setShowCategoryModal(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao criar categoria');
    } finally {
      setCreatingCategory(false);
    }
  };

  // Existing images (edit mode)
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);

  // New images to upload
  const [newImages, setNewImages] = useState<NewImage[]>([]);

  // Reset images when product changes
  useEffect(() => {
    if (isOpen) {
      const images = (product?.product_images ?? [])
        .slice()
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((img: any, i: number) => ({ ...img, sort_order: i }));
      setExistingImages(images);
      setNewImages([]);
    }
  }, [product?.id, isOpen]);

  const totalImages = existingImages.length + newImages.length;

  // ── image helpers ─────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (totalImages + files.length > 5) {
      toast.error('Máximo de 5 imagens por produto');
      return;
    }
    const next: NewImage[] = files.map((file, i) => ({
      file,
      preview: URL.createObjectURL(file),
      sort_order: totalImages + i,
    }));
    setNewImages(prev => [...prev, ...next]);
    e.target.value = '';
  };

  // All items as a flat list for unified ordering
  type ImgItem =
    | { kind: 'existing'; data: ExistingImage; globalIndex: number }
    | { kind: 'new'; data: NewImage; localIndex: number; globalIndex: number };

  const allItems: ImgItem[] = [
    ...existingImages.map((data, i) => ({ kind: 'existing' as const, data, globalIndex: i })),
    ...newImages.map((data, localIndex) => ({
      kind: 'new' as const, data, localIndex, globalIndex: existingImages.length + localIndex,
    })),
  ];

  const moveItem = (fromGlobal: number, toGlobal: number) => {
    if (toGlobal < 0 || toGlobal >= totalImages) return;

    // Rebuild flat order
    const ids = allItems.map(item =>
      item.kind === 'existing' ? `e:${item.data.id}` : `n:${item.localIndex}`
    );
    const tmp = ids[fromGlobal];
    ids[fromGlobal] = ids[toGlobal];
    ids[toGlobal] = tmp;

    // Re-assign sort_orders
    const newExisting = [...existingImages];
    const newNew = [...newImages];

    ids.forEach((id, order) => {
      if (id.startsWith('e:')) {
        const idx = newExisting.findIndex(e => e.id === id.slice(2));
        if (idx >= 0) newExisting[idx] = { ...newExisting[idx], sort_order: order };
      } else {
        const idx = parseInt(id.slice(2));
        if (idx >= 0) newNew[idx] = { ...newNew[idx], sort_order: order };
      }
    });

    setExistingImages(newExisting.sort((a, b) => a.sort_order - b.sort_order));
    setNewImages(newNew.sort((a, b) => a.sort_order - b.sort_order));
  };

  const deleteExisting = async (img: ExistingImage) => {
    // Optimistic remove
    setExistingImages(prev => prev.filter(i => i.id !== img.id).map((i, idx) => ({ ...i, sort_order: idx })));
    try {
      await supabase.storage.from('product-images').remove([img.storage_path]);
      await supabase.schema('catalog').from('product_images').delete().eq('id', img.id);
    } catch {
      toast.error('Erro ao remover imagem');
    }
  };

  const deleteNew = (localIndex: number) => {
    setNewImages(prev => {
      const filtered = prev.filter((_, i) => i !== localIndex);
      return filtered.map((img, i) => ({ ...img, sort_order: existingImages.length + i }));
    });
  };

  const setPrimary = (globalIndex: number) => {
    const item = allItems[globalIndex];
    if (!item) return;

    setExistingImages(prev => prev.map(img => ({ ...img, is_primary: item.kind === 'existing' && img.id === item.data.id })));
    setNewImages(prev => prev.map((img, i) => ({ ...img, is_primary: item.kind === 'new' && i === item.localIndex } as any)));
  };

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!store) return;
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const categoryId = formData.get('category_id') as string;
      const productData = {
        store_id: store.id,
        category_id: categoryId || null,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        promotional_price: formData.get('promotional_price')
          ? parseFloat(formData.get('promotional_price') as string)
          : null,
        available: true,
        featured: false,
      };

      let productId = product?.id;

      if (product) {
        const { error } = await supabase.schema('catalog').from('products').update(productData).eq('id', product.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.schema('catalog').from('products').insert(productData).select().single();
        if (error) throw error;
        productId = data.id;
      }

      // Update sort_order + is_primary for existing images
      for (const img of existingImages) {
        await supabase.schema('catalog').from('product_images')
          .update({ sort_order: img.sort_order, is_primary: img.is_primary })
          .eq('id', img.id);
      }

      // Upload new images
      const primaryGlobalIdx = allItems.find(i => i.kind === 'existing' ? i.data.is_primary : false)?.globalIndex ?? 0;
      const hasPrimary = existingImages.some(i => i.is_primary);

      for (let i = 0; i < newImages.length; i++) {
        const { file, sort_order } = newImages[i];
        const ext = file.name.split('.').pop();
        const path = `stores/${store.id}/${Date.now()}-${i}.${ext}`;

        const { error: upErr } = await supabase.storage.from('product-images').upload(path, file);
        if (upErr) throw upErr;

        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
        const isPrimary = !hasPrimary && i === 0;

        await supabase.schema('catalog').from('product_images').insert({
          product_id: productId,
          storage_path: path,
          url: publicUrl,
          is_primary: isPrimary,
          sort_order,
        });
      }

      toast.success(product ? 'Produto atualizado!' : 'Produto criado!');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  // Reset state when product changes
  useEffect(() => {
    if (!isOpen) {
      setExistingImages([]);
      setNewImages([]);
      setNewCategoryName('');
    }
  }, [isOpen]);

  // ── render ────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  const isEdit = !!product;

  return (
    <>
      {/* Backdrop */}
      <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: ALPHA.overlayMd, backdropFilter: ALPHA.backdropBlur }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
        {/* Dialog */}
        <div
          className="relative w-full sm:max-w-2xl max-h-[96vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-[var(--surface-box)] rounded-t-[20px] sm:rounded-2xl"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: COLORS.accentGradient }}>
                <Package size={15} color={COLORS.white} />
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {isEdit ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {isEdit ? `Editando: ${product.name}` : 'Preencha as informações do produto'}
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: 'var(--text-primary)' })}
              onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'transparent', color: 'var(--text-muted)' })}>
              <X size={16} />
            </button>
          </div>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto">
            <form id="product-form" onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">

                {/* ── Section: Basic info ── */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COLORS.accent }}>
                    Informações Básicas
                  </p>

                  <Field label="Categoria">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <FolderTree size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <select
                          name="category_id"
                          defaultValue={product?.category_id || ''}
                          className="w-full rounded-xl text-sm outline-none transition-all appearance-none"
                          style={{
                            paddingLeft: '2.25rem',
                            paddingRight: '2.5rem',
                            paddingTop: '0.625rem',
                            paddingBottom: '0.625rem',
                            background: 'var(--input-bg)',
                            border: '1px solid var(--input-border)',
                            color: 'var(--text-primary)',
                          }}
                          onFocus={e => (e.currentTarget.style.borderColor = COLORS.accent)}
                          onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')}>
                          <option value="">Sem categoria</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }} />
                          </svg>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCategoryModal(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0"
                        style={{
                          background: isDark ? ALPHA.accentBgSubtleD : ALPHA.accentBgSubtleL,
                          color: COLORS.accentLight,
                          border: `1px solid ${ALPHA.accentBorder}`,
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark ? ALPHA.accentBgD : ALPHA.accentBgL}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isDark ? ALPHA.accentBgSubtleD : ALPHA.accentBgSubtleL}>
                        <Plus size={13} /> Nova
                      </button>
                    </div>
                  </Field>

                  <Field label="Nome do Produto" required>
                    <StyledInput
                      name="name"
                      placeholder="Ex: Pizza Margherita"
                      defaultValue={product?.name}
                      required
                      icon={Package}
                    />
                  </Field>

                  <Field label="Descrição">
                    <StyledTextarea
                      name="description"
                      placeholder="Descreva o produto, ingredientes, tamanho..."
                      defaultValue={product?.description}
                      rows={3}
                    />
                  </Field>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'var(--border)' }} />

                {/* ── Section: Pricing ── */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COLORS.success }}>
                    Preços
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Preço Regular" required>
                      <StyledInput
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        defaultValue={product?.price}
                        required
                        icon={DollarSign}
                      />
                    </Field>
                    <Field label="Preço Promocional" hint="Deixe vazio para sem promoção">
                      <StyledInput
                        name="promotional_price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        defaultValue={product?.promotional_price}
                        icon={Tag}
                      />
                    </Field>
                  </div>

                  {/* Price preview */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                    style={{ background: isDark ? ALPHA.successBgSubtle : 'rgba(16,185,129,0.04)', border: `1px solid ${ALPHA.successBorder}` }}>
                    <CheckCircle2 size={13} style={{ color: COLORS.success }} />
                    <span style={{ color: 'var(--text-muted)' }}>
                      Preço promocional aparece em destaque no catálogo público
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'var(--border)' }} />

                {/* ── Section: Images ── */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COLORS.purple }}>
                      Imagens ({totalImages}/5)
                    </p>
                    {totalImages > 0 && (
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        Passe o mouse para reordenar ou remover
                      </p>
                    )}
                  </div>

                  {/* Image grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {/* Existing images */}
                    {allItems.map((item, idx) => (
                      <ImageThumb
                        key={item.kind === 'existing' ? `e-${item.data.id}` : `n-${item.localIndex}`}
                        src={item.kind === 'existing' ? item.data.url : item.data.preview}
                        isPrimary={item.kind === 'existing' ? item.data.is_primary : false}
                        index={idx}
                        total={totalImages}
                        isExisting={item.kind === 'existing'}
                        onMoveLeft={() => moveItem(idx, idx - 1)}
                        onMoveRight={() => moveItem(idx, idx + 1)}
                        onSetPrimary={() => setPrimary(idx)}
                        onDelete={() =>
                          item.kind === 'existing'
                            ? deleteExisting(item.data)
                            : deleteNew(item.localIndex)
                        }
                      />
                    ))}

                    {/* Upload button */}
                    {totalImages < 5 && (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all group"
                        style={{
                          border: `2px dashed var(--border)`,
                          background: 'var(--input-bg)',
                          color: 'var(--text-muted)',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = COLORS.accent;
                          (e.currentTarget as HTMLElement).style.color = COLORS.accentLight;
                          (e.currentTarget as HTMLElement).style.background = isDark ? ALPHA.accentBgSubtleD : ALPHA.accentBgSubtleL;
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                          (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                          (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)';
                        }}>
                        <ImagePlus size={20} />
                        <span className="text-[10px] font-semibold">Adicionar</span>
                      </button>
                    )}
                  </div>

                  {/* Drop hint */}
                  {totalImages === 0 && (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-3 py-8 rounded-xl transition-all"
                      style={{
                        border: `2px dashed var(--border)`,
                        background: 'var(--input-bg)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = COLORS.accent;
                        (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                        (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)';
                      }}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: isDark ? ALPHA.accentBgSubtleD : 'rgba(99,102,241,0.07)' }}>
                        <Upload size={22} style={{ color: COLORS.accentLight }} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold" style={{ color: COLORS.accentLight }}>Clique para fazer upload</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>PNG, JPG, WEBP · Máx 5 imagens</p>
                      </div>
                    </button>
                  )}

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Legend */}
                  {totalImages > 0 && (
                    <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded border-2 shrink-0" style={{ borderColor: COLORS.accent }} />
                        Imagem principal
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ArrowLeft size={12} /><ArrowRight size={12} />
                        Reordenar
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star size={11} />
                        Definir como principal
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 shrink-0 bg-[var(--surface-hover)]"
            style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {isEdit ? 'Alterações são salvas imediatamente' : 'Campos com * são obrigatórios'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)'}>
                Cancelar
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{
                  background: loading ? COLORS.accent : COLORS.accentGradient,
                  boxShadow: loading ? 'none' : COLORS.accentShadow,
                }}>
                {loading ? (
                  <><Loader2 size={14} className="animate-spin" /> Salvando...</>
                ) : (
                  <><CheckCircle2 size={14} />{isEdit ? 'Salvar Alterações' : 'Criar Produto'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Creation Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: ALPHA.overlayDark, backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && setShowCategoryModal(false)}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-[var(--surface-box)]"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
            }}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: COLORS.accentGradient }}>
                  <FolderTree size={18} color={COLORS.white} />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Nova Categoria</h3>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Organize seus produtos</p>
                </div>
              </div>

              <div className="space-y-4">
                <Field label="Nome da Categoria" required>
                  <StyledInput
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="Ex: Pizzas, Bebidas, Sobremesas..."
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleCreateCategory()}
                  />
                </Field>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowCategoryModal(false); setNewCategoryName(''); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)'}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim() || creatingCategory}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                    style={{ background: COLORS.accentGradient, boxShadow: COLORS.accentShadow }}>
                    {creatingCategory ? (
                      <><Loader2 size={14} className="animate-spin" /> Criando...</>
                    ) : (
                      <><CheckCircle2 size={14} /> Criar Categoria</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}