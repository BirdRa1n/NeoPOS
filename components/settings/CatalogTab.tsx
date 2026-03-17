import { useState } from 'react';
import { Globe, Image as ImageIcon, AlertTriangle, ExternalLink, Copy, Check, Store } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useIsDark } from '@/hooks/useIsDark';
import { SectionHeader } from './SectionHeader';
import { ImageUpload } from './ImageUpload';
import { StoreInfo } from '@/types/settings';

interface CatalogTabProps {
  info: StoreInfo;
  storeId: string;
  onChangeInfo: (k: keyof StoreInfo, v: any) => void;
  onGoToInfo: () => void;
}

export function CatalogTab({ info, storeId, onChangeInfo, onGoToInfo }: CatalogTabProps) {
  const isDark = useIsDark();
  const [copied, setCopied] = useState(false);

  const catalogUrl = info.nickname
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${info.nickname}/catalogo`
    : '';

  const copyUrl = () => {
    if (!catalogUrl) return;
    navigator.clipboard.writeText(catalogUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card className="p-6">
        <SectionHeader icon={Globe} label="Link do Catálogo" subtitle="URL pública para seus clientes" color="#10B981" />
        {info.nickname ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl" style={{ background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#10B981' }}>URL do Catálogo</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{catalogUrl}</p>
                <button onClick={copyUrl}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0"
                  style={{ background: copied ? 'rgba(16,185,129,0.2)' : 'var(--input-bg)', color: copied ? '#10B981' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  {copied ? <><Check size={12} />Copiado</> : <><Copy size={12} />Copiar</>}
                </button>
              </div>
            </div>
            <a href={catalogUrl} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff', textDecoration: 'none', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
              <ExternalLink size={14} /> Abrir Catálogo
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 gap-3">
            <AlertTriangle size={22} style={{ color: '#F59E0B' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Nickname não configurado</p>
            <button onClick={onGoToInfo}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
              <Store size={13} /> Ir para Informações
            </button>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <SectionHeader icon={ImageIcon} label="Imagens do Catálogo" subtitle="Logo e capa que aparecem para seus clientes" color="#8B5CF6" />
        <div className="grid grid-cols-2 gap-4 items-start">
          <div className="flex flex-col items-center gap-2">
            <ImageUpload label="Logo" hint="Exibida no topo do catálogo" currentUrl={info.logo_url}
              bucket="store-images" path={`stores/${storeId}/logo`} height={100} rounded
              onUploaded={url => onChangeInfo('logo_url', url)} />
          </div>
          <ImageUpload label="Imagem de Capa" hint="Banner no topo da página" currentUrl={info.cover_url}
            bucket="store-images" path={`stores/${storeId}/cover`} height={100}
            onUploaded={url => onChangeInfo('cover_url', url)} />
        </div>
      </Card>
    </div>
  );
}
