import { Store, Phone, MapPin, Image as ImageIcon, Globe, Hash, Mail, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/forms/Textarea';
import { FormField } from '@/components/forms/FormField';
import { useIsDark } from '@/hooks/useIsDark';
import { SectionHeader } from './SectionHeader';
import { Toggle } from './Toggle';
import { ImageUpload } from './ImageUpload';
import { StoreInfo } from '@/types/settings';

interface InfoTabProps {
  info: StoreInfo;
  storeId: string;
  onChange: (k: keyof StoreInfo, v: any) => void;
}

export function InfoTab({ info, storeId, onChange }: InfoTabProps) {
  const isDark = useIsDark();
  const si = (k: keyof StoreInfo) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(k, e.target.value);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Card className="p-6">
          <SectionHeader icon={Store} label="Dados da Loja" subtitle="Informações principais do negócio" />
          <div className="space-y-4">
            <FormField label="Nome da Loja" required>
              <Input icon={Store} value={info.name} onChange={si('name')} placeholder="Ex: Pizzaria do João" />
            </FormField>
            <FormField label="Apelido (nickname)" hint="Usado na URL do catálogo — apenas letras, números e hifens" required>
              <div className="relative">
                <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                <input
                  value={info.nickname}
                  onChange={e => onChange('nickname', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="minha-loja"
                  className="w-full rounded-xl text-sm outline-none transition-all"
                  style={{ paddingLeft: '2.25rem', paddingRight: '0.875rem', paddingTop: '0.625rem', paddingBottom: '0.625rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', fontFamily: 'monospace' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#6366F1')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')}
                />
              </div>
              {info.nickname && (
                <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl text-xs"
                  style={{ background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <Globe size={11} style={{ color: '#818CF8' }} />
                  <span className="font-mono truncate" style={{ color: '#818CF8' }}>/{info.nickname}/catalogo</span>
                </div>
              )}
            </FormField>
            <FormField label="Descrição">
              <Textarea value={info.description} onChange={si('description')} placeholder="Descreva sua loja para os clientes..." rows={3} />
            </FormField>
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader icon={Phone} label="Contato" subtitle="Formas de entrar em contato" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Telefone / WhatsApp">
              <Input icon={Phone} value={info.phone} onChange={si('phone')} placeholder="(00) 00000-0000" />
            </FormField>
            <FormField label="E-mail">
              <Input icon={Mail} value={info.email} onChange={si('email')} type="email" placeholder="contato@loja.com" />
            </FormField>
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader icon={MapPin} label="Endereço" subtitle="Localização da loja" color="#10B981" />
          <div className="space-y-4">
            <FormField label="Endereço">
              <Input icon={MapPin} value={info.address} onChange={si('address')} placeholder="Rua das Flores, 123" />
            </FormField>
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-2">
                <FormField label="Cidade">
                  <Input value={info.city} onChange={si('city')} placeholder="Fortaleza" />
                </FormField>
              </div>
              <FormField label="UF">
                <Input value={info.state} onChange={si('state')} placeholder="CE" maxLength={2} />
              </FormField>
              <div className="col-span-2">
                <FormField label="CEP">
                  <Input value={info.zip_code} onChange={si('zip_code')} placeholder="60000-000" />
                </FormField>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card className="p-6">
          <SectionHeader icon={ImageIcon} label="Logo" subtitle="Imagem da marca" color="#8B5CF6" />
          <ImageUpload
            label="Logo da Loja" hint="Quadrado, PNG ou JPG — 200×200px"
            currentUrl={info.logo_url} bucket="store-images" path={`stores/${storeId}/logo`}
            height={120} rounded onUploaded={url => onChange('logo_url', url)}
          />
        </Card>
        <Card className="p-6">
          <SectionHeader icon={ImageIcon} label="Capa" subtitle="Imagem de fundo do catálogo" color="#F59E0B" />
          <ImageUpload
            label="Imagem de Capa" hint="Formato paisagem — 1200×400px"
            currentUrl={info.cover_url} bucket="store-images" path={`stores/${storeId}/cover`}
            height={100} onUploaded={url => onChange('cover_url', url)}
          />
        </Card>
        <Card className="p-6">
          <SectionHeader icon={Zap} label="Status" subtitle="Status atual da loja" color="#10B981" />
          <button
            type="button"
            onClick={() => onChange('is_open', !info.is_open)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
            style={{
              background: info.is_open ? (isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.07)') : (isDark ? 'rgba(107,114,128,0.1)' : 'rgba(107,114,128,0.06)'),
              border: `1px solid ${info.is_open ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
            }}
          >
            <div className="relative">
              <div className="w-3 h-3 rounded-full" style={{ background: info.is_open ? '#10B981' : '#6B7280' }} />
              {info.is_open && <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold" style={{ color: info.is_open ? '#10B981' : 'var(--text-secondary)' }}>
                {info.is_open ? 'Loja Aberta' : 'Loja Fechada'}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {info.is_open ? 'Clientes podem fazer pedidos' : 'Loja temporariamente fechada'}
              </p>
            </div>
            <Toggle value={info.is_open} onChange={v => onChange('is_open', v)} />
          </button>
        </Card>
      </div>
    </div>
  );
}
