"use client";
import { useState, useRef, useCallback } from 'react';
import { Modal, Button } from '@heroui/react';
import {
  X, Upload, ImagePlus, Trash2, GripVertical,
  Package, DollarSign, FileText, Tag, Star,
  AlertCircle, CheckCircle2, Loader2, ArrowLeft, ArrowRight
} from 'lucide-react';
import { supabase } from '@/supabase/client';
import { useStore } from '@/contexts/StoreContext';
import toast from 'react-hot-toast';

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
        {required && <span style={{ color: '#EF4444' }}>*</span>}
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
        onFocus={e => (e.currentTarget.style.borderColor = '#6366F1')}
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
      onFocus={e => (e.currentTarget.style.borderColor = '#6366F1')}
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
          ? '2px solid #6366F1'
          : '2px solid var(--border)',
        boxShadow: isPrimary ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
        transition: 'all 0.15s',
      }}>

      <img src={src} alt="" className="w-full h-full object-cover" />

      {/* Primary badge */}
      {isPrimary && (
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-bold text-white"
          style={{ background: '#6366F1' }}>
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
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.9)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.7)')}>
            <Star size={9} /> Definir principal
          </button>
        )}

        {/* Delete */}
        <button onClick={onDelete}
          className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-white transition-all"
          style={{ background: 'rgba(239,68,68,0.7)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.9)')}
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

  // Existing images (edit mode)
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(() =>
    (product?.product_images ?? [])
      .slice()
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((img: any, i: number) => ({ ...img, sort_order: i }))
  );

  // New images to upload
  const [newImages, setNewImages] = useState<NewImage[]>([]);

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

      const productData = {
        store_id: store.id,
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
  const resetState = () => {
    setExistingImages(
      (product?.product_images ?? [])
        .slice()
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((img: any, i: number) => ({ ...img, sort_order: i }))
    );
    setNewImages([]);
  };

  // ── render ────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  const isEdit = !!product;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        {/* Dialog */}
        <div
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: isDark ? '#0F1117' : '#FFFFFF',
            border: '1px solid var(--border)',
            boxShadow: isDark
              ? '0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)'
              : '0 25px 60px rgba(0,0,0,0.15)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                <Package size={15} color="#fff" />
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
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6366F1' }}>
                    Informações Básicas
                  </p>

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
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#10B981' }}>
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
                    style={{ background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.12)' }}>
                    <CheckCircle2 size={13} style={{ color: '#10B981' }} />
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
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8B5CF6' }}>
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
                          (e.currentTarget as HTMLElement).style.borderColor = '#6366F1';
                          (e.currentTarget as HTMLElement).style.color = '#818CF8';
                          (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)';
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
                        (e.currentTarget as HTMLElement).style.borderColor = '#6366F1';
                        (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                        (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)';
                      }}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)' }}>
                        <Upload size={22} style={{ color: '#818CF8' }} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold" style={{ color: '#818CF8' }}>Clique para fazer upload</p>
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
                        <span className="w-3 h-3 rounded border-2 shrink-0" style={{ borderColor: '#6366F1' }} />
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
          <div className="flex items-center justify-between gap-3 px-6 py-4 shrink-0"
            style={{ borderTop: '1px solid var(--border)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
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
                  background: loading ? '#6366F1' : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
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
    </>
  );
}