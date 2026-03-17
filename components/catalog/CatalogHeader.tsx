import { MapPin, Phone } from 'lucide-react';
import { StoreData, CatalogTheme, Category, CartItem } from '@/types/catalog';
import { Search, Package } from 'lucide-react';

interface CatalogHeaderProps {
  store: StoreData | null;
  theme: CatalogTheme;
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (id: string | null) => void;
  search: string;
  onSearch: (v: string) => void;
}

export function CatalogHeader({ store, theme, categories, activeCategory, onCategoryChange, search, onSearch }: CatalogHeaderProps) {
  return (
    <>
      {theme.show_cover && (
        <div className="cover-wrap">
          {store?.cover_url
            ? <img src={store.cover_url} alt="Capa" className="cover-img" />
            : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})` }} />
          }
          <div className="cover-gradient" />
          <div className={`status-pill ${store?.is_open ? 'status-open' : 'status-closed'}`}>
            {store?.is_open ? '● Aberto agora' : '● Fechado'}
          </div>
        </div>
      )}

      {theme.show_cover && (
        <div className="logo-anchor">
          {store?.logo_url
            ? <img src={store.logo_url} alt="Logo" className="logo-float" />
            : <div className="logo-float-placeholder">{store?.name?.charAt(0)}</div>
          }
        </div>
      )}

      <div className="store-info">
        {!theme.show_cover && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            {store?.logo_url
              ? <img src={store.logo_url} alt="Logo" className="logo-no-cover" />
              : <div className="logo-no-cover-placeholder">{store?.name?.charAt(0)}</div>
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 20, fontWeight: 800 }}>{store?.name}</h1>
                <span className={`status-pill ${store?.is_open ? 'status-open' : 'status-closed'}`} style={{ position: 'static', fontSize: 11 }}>
                  {store?.is_open ? '● Aberto' : '● Fechado'}
                </span>
              </div>
              {store?.description && <p style={{ fontSize: 13, color: 'rgba(0,0,0,.45)', lineHeight: 1.4, marginTop: 2 }}>{store.description}</p>}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          {theme.show_cover && (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, marginTop: 12 }}>{store?.name}</h1>
              {store?.description && <p style={{ fontSize: 14, color: 'rgba(0,0,0,.5)', lineHeight: 1.5 }}>{store.description}</p>}
            </>
          )}
          {(store?.city || store?.phone) && (
            <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
              {store?.city && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(0,0,0,.4)' }}><MapPin size={12} />{store.city}, {store.state}</span>}
              {store?.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(0,0,0,.4)' }}><Phone size={12} />{store.phone}</span>}
            </div>
          )}
        </div>

        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input className="input search-input" placeholder="Buscar produto..." value={search} onChange={e => onSearch(e.target.value)} />
        </div>

        {categories.length > 0 && (
          <div className="cats-scroll">
            <button className={`cat-chip ${!activeCategory ? 'active' : 'inactive'}`} onClick={() => onCategoryChange(null)}>Todos</button>
            {categories.map(cat => (
              <button key={cat.id} className={`cat-chip ${activeCategory === cat.id ? 'active' : 'inactive'}`} onClick={() => onCategoryChange(cat.id)}>{cat.name}</button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
