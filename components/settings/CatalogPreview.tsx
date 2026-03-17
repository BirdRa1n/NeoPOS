import { StoreTheme } from '@/types/settings';

interface CatalogPreviewProps {
  store: any;
  theme: StoreTheme;
}

export function CatalogPreview({ store, theme }: CatalogPreviewProps) {
  const primary = theme.primary_color || '#6366F1';
  const secondary = theme.secondary_color || '#8B5CF6';

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: '#fff' }}>
      <div style={{ height: 72, background: `linear-gradient(135deg,${primary}aa,${secondary}88)`, position: 'relative' }}>
        {store.cover_url && <img src={store.cover_url} alt="" className="w-full h-full object-cover opacity-70" />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.35))' }} />
      </div>
      <div style={{ padding: '0 14px 14px', marginTop: -20, background: '#fff' }}>
        <div className="flex items-end gap-3">
          <div style={{ width: 44, height: 44, borderRadius: 12, border: '2px solid #fff', overflow: 'hidden', background: `linear-gradient(135deg,${primary},${secondary})`, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {store.logo_url
              ? <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
              : <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{store.name?.[0]?.toUpperCase()}</span>
            }
          </div>
          <div className="pb-1">
            <p style={{ fontWeight: 800, fontSize: 13, color: '#111' }}>{store.name || 'Minha Loja'}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span style={{ fontSize: 10, color: '#6B7280' }}>Aberto</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 10, height: 30, borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', paddingLeft: 10, gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: '#D1D5DB' }} />
          <div style={{ height: 8, width: 80, borderRadius: 4, background: '#E5E7EB' }} />
        </div>
        <div className="flex gap-1.5 mt-2.5 overflow-hidden">
          {['Todos', 'Destaque', 'Promoção'].map((c, i) => (
            <div key={c} style={{ padding: '4px 10px', borderRadius: 99, fontSize: 9, fontWeight: 700, background: i === 0 ? primary : '#F3F4F6', color: i === 0 ? '#fff' : '#6B7280', flexShrink: 0 }}>{c}</div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          {[1, 2].map(i => (
            <div key={i} style={{ borderRadius: 10, overflow: 'hidden', background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
              <div style={{ height: 50, background: `linear-gradient(135deg,${primary}22,${secondary}18)` }} />
              <div style={{ padding: '6px 8px' }}>
                <div style={{ height: 7, width: '70%', borderRadius: 4, background: '#E5E7EB', marginBottom: 4 }} />
                <div className="flex items-center justify-between">
                  <div style={{ height: 9, width: '45%', borderRadius: 4, background: primary }} />
                  <div style={{ width: 20, height: 20, borderRadius: 99, background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>+</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
