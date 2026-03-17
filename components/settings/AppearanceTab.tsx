import { Palette, FileText, Monitor, Sun, Droplets, Layers } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/forms/FormField';
import { useIsDark } from '@/hooks/useIsDark';
import { SectionHeader } from './SectionHeader';
import { Toggle } from './Toggle';
import { CatalogPreview } from './CatalogPreview';
import { StoreTheme, COLOR_PRESETS } from '@/types/settings';

const FONTS = ['Inter', 'Poppins', 'Nunito', 'Raleway', 'DM Sans', 'Roboto', 'Lato', 'Open Sans'];

interface AppearanceTabProps {
  theme: StoreTheme;
  store: any;
  info: any;
  onChange: (k: keyof StoreTheme, v: any) => void;
}

export function AppearanceTab({ theme, store, info, onChange }: AppearanceTabProps) {
  const isDark = useIsDark();
  const st = (k: keyof StoreTheme) => (v: any) => onChange(k, v);

  const activeStyle = { background: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)', border: '1px solid #6366F1', color: '#818CF8' };
  const inactiveStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-muted)' };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Card className="p-6">
          <SectionHeader icon={Palette} label="Paleta de Cores" subtitle="Escolha uma combinação pronta ou personalize" color="#EC4899" />
          <div className="grid grid-cols-4 gap-2 mb-5">
            {COLOR_PRESETS.map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => { onChange('primary_color', preset.primary); onChange('secondary_color', preset.secondary); onChange('accent_color', preset.accent); }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                style={{ border: '1px solid var(--border)', background: 'var(--input-bg)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = preset.primary)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
              >
                <div className="flex gap-1">
                  {[preset.primary, preset.secondary, preset.accent].map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{preset.name}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'primary_color', label: 'Cor Primária' },
              { key: 'secondary_color', label: 'Cor Secundária' },
              { key: 'accent_color', label: 'Cor de Destaque' },
            ].map(({ key, label }) => (
              <FormField key={key} label={label}>
                <div className="flex items-center gap-2">
                  <div className="relative w-10 h-9 rounded-lg overflow-hidden cursor-pointer shrink-0" style={{ border: '2px solid var(--input-border)' }}>
                    <input type="color" value={(theme as any)[key]} onChange={e => st(key as keyof StoreTheme)(e.target.value)} className="absolute inset-0 w-full h-full cursor-pointer opacity-0" />
                    <div className="w-full h-full" style={{ background: (theme as any)[key] }} />
                  </div>
                  <input
                    value={(theme as any)[key]}
                    onChange={e => st(key as keyof StoreTheme)(e.target.value)}
                    className="flex-1 rounded-xl text-xs font-mono outline-none transition-all"
                    style={{ padding: '0.5rem 0.75rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#6366F1')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')}
                  />
                </div>
              </FormField>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader icon={FileText} label="Tipografia & Layout" color="#6366F1" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Fonte">
              <select value={theme.font_family} onChange={e => st('font_family')(e.target.value)}
                className="w-full rounded-xl text-sm outline-none transition-all"
                style={{ padding: '0.625rem 0.875rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}>
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </FormField>
            <FormField label="Bordas">
              <div className="flex gap-2">
                {[{ value: 'sharp', label: 'Reto' }, { value: 'rounded', label: 'Arredondado' }, { value: 'pill', label: 'Oval' }].map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => st('border_radius')(value)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={theme.border_radius === value ? activeStyle : inactiveStyle}>
                    {label}
                  </button>
                ))}
              </div>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <FormField label="Estilo dos Cards">
              <div className="flex gap-2">
                {[{ value: 'shadow', label: 'Sombra', icon: Layers }, { value: 'bordered', label: 'Borda', icon: Sun }, { value: 'flat', label: 'Flat', icon: Droplets }].map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button" onClick={() => st('card_style')(value)}
                    className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={theme.card_style === value ? activeStyle : inactiveStyle}>
                    <Icon size={14} />{label}
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label="Estilo do Header">
              <div className="flex gap-2">
                {[{ value: 'cover', label: 'Capa' }, { value: 'solid', label: 'Sólido' }, { value: 'minimal', label: 'Minimal' }].map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => st('header_style')(value)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={theme.header_style === value ? activeStyle : inactiveStyle}>
                    {label}
                  </button>
                ))}
              </div>
            </FormField>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="p-6">
          <SectionHeader icon={Monitor} label="Preview" subtitle="Como ficará o catálogo" color="#6366F1" />
          <CatalogPreview store={{ ...store, ...info }} theme={theme} />
          <p className="text-[10px] font-bold uppercase tracking-widest mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
            Visualização em tempo real
          </p>
        </Card>
        <Card className="p-6">
          <div className="space-y-3">
            {[
              { key: 'background_color', label: 'Fundo do catálogo' },
              { key: 'surface_color', label: 'Fundo dos cards' },
              { key: 'text_color', label: 'Cor do texto' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0" style={{ border: '2px solid var(--border)' }}>
                  <input type="color" value={(theme as any)[key]} onChange={e => st(key as keyof StoreTheme)(e.target.value)} className="absolute inset-0 w-full h-full cursor-pointer opacity-0" />
                  <div className="w-full h-full" style={{ background: (theme as any)[key] }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                  <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{(theme as any)[key]}</p>
                </div>
              </div>
            ))}
            {[
              { key: 'show_cover', label: 'Mostrar capa', desc: 'Exibir imagem de capa no topo' },
              { key: 'show_stock_quantity', label: 'Exibir quantidade disponível', desc: 'Mostra estoque restante no cardápio' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-soft)' }}>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
                <Toggle value={(theme as any)[key]} onChange={v => st(key as keyof StoreTheme)(v)} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
