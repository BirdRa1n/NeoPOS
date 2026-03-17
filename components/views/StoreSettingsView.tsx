'use client';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/supabase/client';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/forms/Textarea';
import { FormField } from '@/components/forms/FormField';
import { PageHeader } from '@/components/layout/PageHeader';
import { RoleEditorModal } from '@/components/RoleEditorModal';
import { TeamTab } from '@/components/settings/TeamTab';
import { useIsDark } from '@/hooks/useIsDark';

import {
  Store, Globe, Phone, MapPin, Image as ImageIcon, Palette,
  Save, Upload, CheckCircle2, Loader2, AlertTriangle,
  Eye, Hash, Mail, FileText, RefreshCw,
  Monitor, ExternalLink, Copy, Check,
  Sun, Droplets, Layers, Zap, MessageCircle, Power, Sparkles, Server,
  Users, Settings,
} from 'lucide-react';

// ─── Palette presets ──────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { name: 'Índigo', primary: '#6366F1', secondary: '#8B5CF6', accent: '#10B981' },
  { name: 'Rosa', primary: '#EC4899', secondary: '#F43F5E', accent: '#F59E0B' },
  { name: 'Azul', primary: '#3B82F6', secondary: '#6366F1', accent: '#10B981' },
  { name: 'Verde', primary: '#10B981', secondary: '#059669', accent: '#6366F1' },
  { name: 'Laranja', primary: '#F59E0B', secondary: '#EF4444', accent: '#8B5CF6' },
  { name: 'Roxo', primary: '#8B5CF6', secondary: '#A855F7', accent: '#EC4899' },
  { name: 'Ciano', primary: '#06B6D4', secondary: '#0891B2', accent: '#F59E0B' },
  { name: 'Lima', primary: '#84CC16', secondary: '#65A30D', accent: '#EF4444' },
];

const db = () => supabase.schema('core');
const catalog = () => supabase.schema('catalog');

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  label,
  color = '#6366F1',
  subtitle,
}: {
  icon: React.FC<any>;
  label: string;
  color?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg,${color},${color}99)` }}
      >
        <Icon size={16} color="#fff" />
      </div>
      <div>
        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          {label}
        </p>
        {subtitle && (
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="relative rounded-full transition-all shrink-0 flex items-center"
      style={{ width: 40, height: 22, background: value ? '#6366F1' : 'rgba(107,114,128,0.3)' }}
    >
      <div
        className="absolute w-4 h-4 rounded-full bg-white shadow transition-all"
        style={{ left: value ? 22 : 4 }}
      />
    </button>
  );
}

function ImageUpload({
  label,
  hint,
  currentUrl,
  bucket,
  path,
  height = 120,
  onUploaded,
  rounded = false,
}: {
  label: string;
  hint: string;
  currentUrl?: string | null;
  bucket: string;
  path: string;
  height?: number;
  onUploaded: (url: string) => void;
  rounded?: boolean;
}) {
  const isDark = useIsDark();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  useEffect(() => {
    setPreview(currentUrl || null);
  }, [currentUrl]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fullPath = `${path}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(fullPath, file, { upsert: true });
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(fullPath);
      setPreview(`${publicUrl}?t=${Date.now()}`);
      onUploaded(publicUrl);
    } catch (err: any) {
      alert(err.message ?? 'Erro ao fazer upload');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <FormField label={label} hint={hint}>
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        className="relative overflow-hidden cursor-pointer transition-all group"
        style={{
          height,
          borderRadius: rounded ? '50%' : 14,
          width: rounded ? height : '100%',
          border: '2px dashed var(--input-border)',
          background: isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.02)',
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.borderColor = '#6366F1')
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)')
        }
      >
        {preview ? (
          <>
            <img src={preview} alt="" className="w-full h-full object-cover" />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            >
              <div className="flex items-center gap-2 text-white text-xs font-semibold">
                <Upload size={14} /> Trocar imagem
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            {uploading ? (
              <Loader2 size={22} className="animate-spin" style={{ color: '#6366F1' }} />
            ) : (
              <>
                <Upload size={22} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Clique para upload
                </span>
              </>
            )}
          </div>
        )}
        {uploading && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.45)' }}
          >
            <Loader2 size={22} className="animate-spin text-white" />
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </FormField>
  );
}

function CatalogPreview({ store, theme }: { store: any; theme: any }) {
  const primary = theme.primary_color || '#6366F1';
  const secondary = theme.secondary_color || '#8B5CF6';
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: '#fff' }}
    >
      <div
        style={{
          height: 72,
          background: `linear-gradient(135deg,${primary}aa,${secondary}88)`,
          position: 'relative',
        }}
      >
        {store.cover_url && (
          <img src={store.cover_url} alt="" className="w-full h-full object-cover opacity-70" />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.35))',
          }}
        />
      </div>
      <div style={{ padding: '0 14px 14px', marginTop: -20, background: '#fff' }}>
        <div className="flex items-end gap-3">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: '2px solid #fff',
              overflow: 'hidden',
              background: `linear-gradient(135deg,${primary},${secondary})`,
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {store.logo_url ? (
              <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>
                {store.name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="pb-1">
            <p style={{ fontWeight: 800, fontSize: 13, color: '#111' }}>
              {store.name || 'Minha Loja'}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#10B981',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: 10, color: '#6B7280' }}>Aberto</span>
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 10,
            height: 30,
            borderRadius: 8,
            background: '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 10,
            gap: 6,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: 2, background: '#D1D5DB' }} />
          <div style={{ height: 8, width: 80, borderRadius: 4, background: '#E5E7EB' }} />
        </div>
        <div className="flex gap-1.5 mt-2.5 overflow-hidden">
          {['Todos', 'Destaque', 'Promoção'].map((c, i) => (
            <div
              key={c}
              style={{
                padding: '4px 10px',
                borderRadius: 99,
                fontSize: 9,
                fontWeight: 700,
                background: i === 0 ? primary : '#F3F4F6',
                color: i === 0 ? '#fff' : '#6B7280',
                flexShrink: 0,
              }}
            >
              {c}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                borderRadius: 10,
                overflow: 'hidden',
                background: '#F9FAFB',
                border: '1px solid #F3F4F6',
              }}
            >
              <div
                style={{
                  height: 50,
                  background: `linear-gradient(135deg,${primary}22,${secondary}18)`,
                }}
              />
              <div style={{ padding: '6px 8px' }}>
                <div
                  style={{
                    height: 7,
                    width: '70%',
                    borderRadius: 4,
                    background: '#E5E7EB',
                    marginBottom: 4,
                  }}
                />
                <div className="flex items-center justify-between">
                  <div style={{ height: 9, width: '45%', borderRadius: 4, background: primary }} />
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 99,
                      background: primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
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

// ─── Main View ────────────────────────────────────────────────────────────────
export function StoreSettingsView() {
  const isDark = useIsDark();
  const { store, refetch } = useStore();

  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'info' | 'appearance' | 'catalog' | 'whatsapp' | 'team'
  >('info');
  const [copied, setCopied] = useState(false);

  // ── WhatsApp state ──────────────────────────────────────────────────────────
  const [useOwnServer, setUseOwnServer] = useState(false);
  const [whatsapp, setWhatsapp] = useState({
    api_key: '',
    instance_name: '',
    evolution_url: '',
    send_on_confirmed: true,
    send_on_preparing: true,
    send_on_out_for_delivery: true,
    send_on_delivered: true,
    send_on_cancelled: true,
  });
  const [apiKeyMasked, setApiKeyMasked] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<
    'disconnected' | 'connecting' | 'connected'
  >('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);

  // ── Store info ──────────────────────────────────────────────────────────────
  const [info, setInfo] = useState({
    name: '',
    nickname: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    logo_url: '',
    cover_url: '',
    is_open: true,
  });

  // ── Theme ───────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState({
    primary_color: '#6366F1',
    secondary_color: '#8B5CF6',
    accent_color: '#10B981',
    background_color: '#FFFFFF',
    surface_color: '#F9FAFB',
    text_color: '#111827',
    font_family: 'Inter',
    border_radius: 'rounded',
    card_style: 'shadow',
    header_style: 'cover',
    show_cover: true,
    show_stock_quantity: false,
  });

  useEffect(() => {
    if (!store) return;
    setInfo({
      name: store.name || '',
      nickname: (store as any).nickname || '',
      description: (store as any).description || '',
      phone: (store as any).phone || '',
      email: (store as any).email || '',
      address: (store as any).address || '',
      city: (store as any).city || '',
      state: (store as any).state || '',
      zip_code: (store as any).zip_code || '',
      logo_url: (store as any).logo_url || '',
      cover_url: (store as any).cover_url || '',
      is_open: (store as any).is_open ?? true,
    });

    catalog()
      .from('store_theme')
      .select('*')
      .eq('store_id', store.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setTheme((t) => ({ ...t, ...data }));
      });

    supabase
      .schema('integrations')
      .from('whatsapp_config_safe')
      .select('*')
      .eq('store_id', store.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setUseOwnServer(data.use_own_server ?? false);
        setWhatsapp((f) => ({
          ...f,
          instance_name: data.instance_name || '',
          evolution_url: '',
          send_on_confirmed: data.send_on_confirmed ?? true,
          send_on_preparing: data.send_on_preparing ?? true,
          send_on_out_for_delivery: data.send_on_out_for_delivery ?? true,
          send_on_delivered: data.send_on_delivered ?? true,
          send_on_cancelled: data.send_on_cancelled ?? true,
        }));
        setApiKeyMasked(data.api_key_masked || '');
        setHasApiKey(data.has_api_key || false);
        const st = data.instance_status;
        if (st === 'connected' || st === 'open') setWhatsappStatus('connected');
      });
  }, [store]);

  const handleSaveInfo = async () => {
    if (!store) return;
    setSaving(true);
    try {
      const { error } = await db()
        .from('stores')
        .update({
          name: info.name,
          nickname: info.nickname,
          description: info.description,
          phone: info.phone || null,
          email: info.email || null,
          address: info.address || null,
          city: info.city || null,
          state: info.state || null,
          zip_code: info.zip_code || null,
          logo_url: info.logo_url || null,
          cover_url: info.cover_url || null,
          is_open: info.is_open,
        })
        .eq('id', store.id);
      if (error) throw error;
      await refetch();
      showSaveOk();
    } catch (err: any) {
      alert(err.message ?? 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTheme = async () => {
    if (!store) return;
    setSaving(true);
    try {
      const { data: existing } = await catalog()
        .from('store_theme')
        .select('id')
        .eq('store_id', store.id)
        .maybeSingle();
      const payload = { ...theme, store_id: store.id };
      const { error } = existing
        ? await catalog().from('store_theme').update(payload).eq('store_id', store.id)
        : await catalog().from('store_theme').insert(payload);
      if (error) throw error;
      showSaveOk();
    } catch (err: any) {
      alert(err.message ?? 'Erro ao salvar tema');
    } finally {
      setSaving(false);
    }
  };

  const showSaveOk = () => {
    setSaveOk(true);
    setTimeout(() => setSaveOk(false), 2500);
  };

  const handleSaveWhatsapp = async () => {
    if (!store) return;
    if (!useOwnServer && !info.nickname) {
      alert('Configure o nickname da loja antes de usar o servidor da plataforma.');
      setActiveTab('info');
      return;
    }
    if (useOwnServer && !whatsapp.api_key && !hasApiKey) {
      alert('Informe a API Key do seu servidor Evolution.');
      return;
    }
    if (useOwnServer && !whatsapp.evolution_url) {
      alert('Informe a URL do seu servidor Evolution.');
      return;
    }

    setSaving(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const payload: Record<string, unknown> = {
        use_own_server: useOwnServer,
        send_on_confirmed: whatsapp.send_on_confirmed,
        send_on_preparing: whatsapp.send_on_preparing,
        send_on_out_for_delivery: whatsapp.send_on_out_for_delivery,
        send_on_delivered: whatsapp.send_on_delivered,
        send_on_cancelled: whatsapp.send_on_cancelled,
      };
      if (useOwnServer) {
        payload.instance_name = whatsapp.instance_name;
        payload.evolution_url = whatsapp.evolution_url;
        if (whatsapp.api_key) payload.api_key = whatsapp.api_key;
        else payload.keep_api_key = true;
      }
      const res = await fetch('/api/functions/whatsapp-config?action=save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar');
      setWhatsapp((f) => ({ ...f, api_key: '', evolution_url: '' }));
      if (useOwnServer && whatsapp.api_key) setHasApiKey(true);
      showSaveOk();
    } catch (err: any) {
      alert(err.message ?? 'Erro ao salvar WhatsApp');
    } finally {
      setSaving(false);
    }
  };

  const handleConnectWhatsapp = async () => {
    setLoadingWhatsapp(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/functions/whatsapp-config?action=connect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao conectar');
      setWhatsappStatus('connecting');
      setTimeout(() => handleGetQrCode(), 2000);
      const pollInterval = setInterval(async () => {
        const t = (await supabase.auth.getSession()).data.session?.access_token;
        const r = await fetch('/api/functions/whatsapp-config?action=status', {
          method: 'POST',
          headers: { Authorization: `Bearer ${t}` },
        });
        if (r.ok) {
          const json = await r.json();
          const state = json.data?.instance?.state;
          if (state === 'open' || state === 'connected') {
            setWhatsappStatus('connected');
            setQrCode(null);
            clearInterval(pollInterval);
          }
        }
      }, 5000);
      setTimeout(() => clearInterval(pollInterval), 300000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingWhatsapp(false);
    }
  };

  const handleGetQrCode = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/functions/whatsapp-config?action=qrcode', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const qr = data.data;
      if (qr?.base64) setQrCode(qr.base64);
      else if (qr?.code) setQrCode(qr.code);
    } catch (err) {
      console.error('QR code error:', err);
    }
  };

  const handleCheckStatus = async () => {
    setLoadingWhatsapp(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/functions/whatsapp-config?action=status', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const state = json.data?.instance?.state;
      if (state === 'open' || state === 'connected') {
        setWhatsappStatus('connected');
        setQrCode(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWhatsapp(false);
    }
  };

  const handleDisconnectWhatsapp = async () => {
    if (!confirm('Desconectar o WhatsApp?')) return;
    setLoadingWhatsapp(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      await fetch('/api/functions/whatsapp-config?action=disconnect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setWhatsappStatus('disconnected');
      setQrCode(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWhatsapp(false);
    }
  };

  const catalogUrl = info.nickname
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${info.nickname}/catalogo`
    : '';

  const copyUrl = () => {
    if (!catalogUrl) return;
    navigator.clipboard.writeText(catalogUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const si = (k: keyof typeof info) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setInfo((f) => ({ ...f, [k]: e.target.value }));
  const st = (k: keyof typeof theme) => (v: any) =>
    setTheme((f) => ({ ...f, [k]: v }));

  const canConnect = useOwnServer
    ? whatsapp.instance_name.length > 0 && hasApiKey
    : info.nickname.length > 0;

  const TABS = [
    { id: 'info', label: 'Informações', icon: Store },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'catalog', label: 'Catálogo', icon: Globe },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'team', label: 'Equipe', icon: Users },
  ] as const;

  if (!store)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title="Configurações"
        subtitle="Gerencie informações e aparência da loja"
        action={
          activeTab !== 'team' ? (
            <Button
              onClick={
                activeTab === 'whatsapp'
                  ? handleSaveWhatsapp
                  : activeTab === 'appearance'
                  ? handleSaveTheme
                  : handleSaveInfo
              }
              disabled={saving}
              icon={
                saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : saveOk ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <Save size={14} />
                )
              }
              style={{
                background: saveOk
                  ? 'linear-gradient(135deg,#10B981,#059669)'
                  : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                color: 'white',
                border: 'none',
              }}
            >
              {saving ? 'Salvando...' : saveOk ? 'Salvo!' : 'Salvar Alterações'}
            </Button>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background:
                activeTab === id
                  ? isDark
                    ? 'rgba(99,102,241,0.2)'
                    : 'rgba(99,102,241,0.12)'
                  : 'transparent',
              color: activeTab === id ? '#818CF8' : 'var(--text-muted)',
            }}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB: INFO ── */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Card className="p-6">
              <SectionHeader
                icon={Store}
                label="Dados da Loja"
                subtitle="Informações principais do negócio"
              />
              <div className="space-y-4">
                <FormField label="Nome da Loja" required>
                  <Input
                    icon={Store}
                    value={info.name}
                    onChange={si('name')}
                    placeholder="Ex: Pizzaria do João"
                  />
                </FormField>
                <FormField
                  label="Apelido (nickname)"
                  hint="Usado na URL do catálogo — apenas letras, números e hifens"
                  required
                >
                  <div className="relative">
                    <Hash
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'var(--text-muted)' }}
                    />
                    <input
                      value={info.nickname}
                      onChange={(e) =>
                        setInfo((f) => ({
                          ...f,
                          nickname: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, ''),
                        }))
                      }
                      placeholder="minha-loja"
                      className="w-full rounded-xl text-sm outline-none transition-all"
                      style={{
                        paddingLeft: '2.25rem',
                        paddingRight: '0.875rem',
                        paddingTop: '0.625rem',
                        paddingBottom: '0.625rem',
                        background: 'var(--input-bg)',
                        border: '1px solid var(--input-border)',
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace',
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')}
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor = 'var(--input-border)')
                      }
                    />
                  </div>
                  {info.nickname && (
                    <div
                      className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl text-xs"
                      style={{
                        background: isDark
                          ? 'rgba(99,102,241,0.08)'
                          : 'rgba(99,102,241,0.05)',
                        border: '1px solid rgba(99,102,241,0.15)',
                      }}
                    >
                      <Globe size={11} style={{ color: '#818CF8' }} />
                      <span className="font-mono truncate" style={{ color: '#818CF8' }}>
                        /{info.nickname}/catalogo
                      </span>
                    </div>
                  )}
                </FormField>
                <FormField label="Descrição">
                  <Textarea
                    value={info.description}
                    onChange={si('description')}
                    placeholder="Descreva sua loja para os clientes..."
                    rows={3}
                  />
                </FormField>
              </div>
            </Card>

            <Card className="p-6">
              <SectionHeader
                icon={Phone}
                label="Contato"
                subtitle="Formas de entrar em contato"
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Telefone / WhatsApp">
                  <Input
                    icon={Phone}
                    value={info.phone}
                    onChange={si('phone')}
                    placeholder="(00) 00000-0000"
                  />
                </FormField>
                <FormField label="E-mail">
                  <Input
                    icon={Mail}
                    value={info.email}
                    onChange={si('email')}
                    type="email"
                    placeholder="contato@loja.com"
                  />
                </FormField>
              </div>
            </Card>

            <Card className="p-6">
              <SectionHeader
                icon={MapPin}
                label="Endereço"
                subtitle="Localização da loja"
                color="#10B981"
              />
              <div className="space-y-4">
                <FormField label="Endereço">
                  <Input
                    icon={MapPin}
                    value={info.address}
                    onChange={si('address')}
                    placeholder="Rua das Flores, 123"
                  />
                </FormField>
                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-2">
                    <FormField label="Cidade">
                      <Input
                        value={info.city}
                        onChange={si('city')}
                        placeholder="Fortaleza"
                      />
                    </FormField>
                  </div>
                  <FormField label="UF">
                    <Input
                      value={info.state}
                      onChange={si('state')}
                      placeholder="CE"
                      maxLength={2}
                    />
                  </FormField>
                  <div className="col-span-2">
                    <FormField label="CEP">
                      <Input
                        value={info.zip_code}
                        onChange={si('zip_code')}
                        placeholder="60000-000"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="p-6">
              <SectionHeader
                icon={ImageIcon}
                label="Logo"
                subtitle="Imagem da marca"
                color="#8B5CF6"
              />
              <ImageUpload
                label="Logo da Loja"
                hint="Quadrado, PNG ou JPG — 200×200px"
                currentUrl={info.logo_url}
                bucket="store-images"
                path={`stores/${store.id}/logo`}
                height={120}
                rounded
                onUploaded={(url) => setInfo((f) => ({ ...f, logo_url: url }))}
              />
            </Card>
            <Card className="p-6">
              <SectionHeader
                icon={ImageIcon}
                label="Capa"
                subtitle="Imagem de fundo do catálogo"
                color="#F59E0B"
              />
              <ImageUpload
                label="Imagem de Capa"
                hint="Formato paisagem — 1200×400px"
                currentUrl={info.cover_url}
                bucket="store-images"
                path={`stores/${store.id}/cover`}
                height={100}
                onUploaded={(url) => setInfo((f) => ({ ...f, cover_url: url }))}
              />
            </Card>
            <Card className="p-6">
              <SectionHeader
                icon={Zap}
                label="Status"
                subtitle="Status atual da loja"
                color="#10B981"
              />
              <button
                type="button"
                onClick={() => setInfo((f) => ({ ...f, is_open: !f.is_open }))}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: info.is_open
                    ? isDark
                      ? 'rgba(16,185,129,0.1)'
                      : 'rgba(16,185,129,0.07)'
                    : isDark
                    ? 'rgba(107,114,128,0.1)'
                    : 'rgba(107,114,128,0.06)',
                  border: `1px solid ${
                    info.is_open ? 'rgba(16,185,129,0.2)' : 'var(--border)'
                  }`,
                }}
              >
                <div className="relative">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: info.is_open ? '#10B981' : '#6B7280' }}
                  />
                  {info.is_open && (
                    <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p
                    className="text-sm font-bold"
                    style={{ color: info.is_open ? '#10B981' : 'var(--text-secondary)' }}
                  >
                    {info.is_open ? 'Loja Aberta' : 'Loja Fechada'}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {info.is_open
                      ? 'Clientes podem fazer pedidos'
                      : 'Loja temporariamente fechada'}
                  </p>
                </div>
                <Toggle
                  value={info.is_open}
                  onChange={(v) => setInfo((f) => ({ ...f, is_open: v }))}
                />
              </button>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB: APPEARANCE ── */}
      {activeTab === 'appearance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Card className="p-6">
              <SectionHeader
                icon={Palette}
                label="Paleta de Cores"
                subtitle="Escolha uma combinação pronta ou personalize"
                color="#EC4899"
              />
              <div className="grid grid-cols-4 gap-2 mb-5">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() =>
                      setTheme((t) => ({
                        ...t,
                        primary_color: preset.primary,
                        secondary_color: preset.secondary,
                        accent_color: preset.accent,
                      }))
                    }
                    className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                    style={{ border: '1px solid var(--border)', background: 'var(--input-bg)' }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.borderColor = preset.primary)
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')
                    }
                  >
                    <div className="flex gap-1">
                      {[preset.primary, preset.secondary, preset.accent].map((c, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {preset.name}
                    </span>
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
                      <div
                        className="relative w-10 h-9 rounded-lg overflow-hidden cursor-pointer shrink-0"
                        style={{ border: '2px solid var(--input-border)' }}
                      >
                        <input
                          type="color"
                          value={(theme as any)[key]}
                          onChange={(e) => st(key as keyof typeof theme)(e.target.value)}
                          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                        />
                        <div
                          className="w-full h-full"
                          style={{ background: (theme as any)[key] }}
                        />
                      </div>
                      <input
                        value={(theme as any)[key]}
                        onChange={(e) => st(key as keyof typeof theme)(e.target.value)}
                        className="flex-1 rounded-xl text-xs font-mono outline-none transition-all"
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: 'var(--input-bg)',
                          border: '1px solid var(--input-border)',
                          color: 'var(--text-primary)',
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')}
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor = 'var(--input-border)')
                        }
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
                  <select
                    value={theme.font_family}
                    onChange={(e) => st('font_family')(e.target.value)}
                    className="w-full rounded-xl text-sm outline-none transition-all"
                    style={{
                      padding: '0.625rem 0.875rem',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {[
                      'Inter',
                      'Poppins',
                      'Nunito',
                      'Raleway',
                      'DM Sans',
                      'Roboto',
                      'Lato',
                      'Open Sans',
                    ].map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Bordas">
                  <div className="flex gap-2">
                    {[
                      { value: 'sharp', label: 'Reto' },
                      { value: 'rounded', label: 'Arredondado' },
                      { value: 'pill', label: 'Oval' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => st('border_radius')(value)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background:
                            theme.border_radius === value
                              ? isDark
                                ? 'rgba(99,102,241,0.2)'
                                : 'rgba(99,102,241,0.12)'
                              : 'var(--input-bg)',
                          border: `1px solid ${
                            theme.border_radius === value ? '#6366F1' : 'var(--input-border)'
                          }`,
                          color:
                            theme.border_radius === value ? '#818CF8' : 'var(--text-muted)',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField label="Estilo dos Cards">
                  <div className="flex gap-2">
                    {[
                      { value: 'shadow', label: 'Sombra', icon: Layers },
                      { value: 'bordered', label: 'Borda', icon: Sun },
                      { value: 'flat', label: 'Flat', icon: Droplets },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => st('card_style')(value)}
                        className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background:
                            theme.card_style === value
                              ? isDark
                                ? 'rgba(99,102,241,0.2)'
                                : 'rgba(99,102,241,0.12)'
                              : 'var(--input-bg)',
                          border: `1px solid ${
                            theme.card_style === value ? '#6366F1' : 'var(--input-border)'
                          }`,
                          color:
                            theme.card_style === value ? '#818CF8' : 'var(--text-muted)',
                        }}
                      >
                        <Icon size={14} />
                        {label}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="Estilo do Header">
                  <div className="flex gap-2">
                    {[
                      { value: 'cover', label: 'Capa' },
                      { value: 'solid', label: 'Sólido' },
                      { value: 'minimal', label: 'Minimal' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => st('header_style')(value)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background:
                            theme.header_style === value
                              ? isDark
                                ? 'rgba(99,102,241,0.2)'
                                : 'rgba(99,102,241,0.12)'
                              : 'var(--input-bg)',
                          border: `1px solid ${
                            theme.header_style === value ? '#6366F1' : 'var(--input-border)'
                          }`,
                          color:
                            theme.header_style === value ? '#818CF8' : 'var(--text-muted)',
                        }}
                      >
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
              <SectionHeader
                icon={Monitor}
                label="Preview"
                subtitle="Como ficará o catálogo"
                color="#6366F1"
              />
              <CatalogPreview store={{ ...store, ...info }} theme={theme} />
              <p
                className="text-[10px] font-bold uppercase tracking-widest mt-3 text-center"
                style={{ color: 'var(--text-muted)' }}
              >
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
                    <div
                      className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0"
                      style={{ border: '2px solid var(--border)' }}
                    >
                      <input
                        type="color"
                        value={(theme as any)[key]}
                        onChange={(e) => st(key as keyof typeof theme)(e.target.value)}
                        className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                      />
                      <div
                        className="w-full h-full"
                        style={{ background: (theme as any)[key] }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {label}
                      </p>
                      <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                        {(theme as any)[key]}
                      </p>
                    </div>
                  </div>
                ))}
                <div
                  className="flex items-center justify-between pt-2"
                  style={{ borderTop: '1px solid var(--border-soft)' }}
                >
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      Mostrar capa
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      Exibir imagem de capa no topo
                    </p>
                  </div>
                  <Toggle value={theme.show_cover} onChange={(v) => st('show_cover')(v)} />
                </div>
                <div
                  className="flex items-center justify-between pt-2"
                  style={{ borderTop: '1px solid var(--border-soft)' }}
                >
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      Exibir quantidade disponível
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      Mostra estoque restante no cardápio
                    </p>
                  </div>
                  <Toggle
                    value={(theme as any).show_stock_quantity}
                    onChange={(v) => st('show_stock_quantity')(v)}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB: CATALOG ── */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-6">
            <SectionHeader
              icon={Globe}
              label="Link do Catálogo"
              subtitle="URL pública para seus clientes"
              color="#10B981"
            />
            {info.nickname ? (
              <div className="space-y-4">
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: '#10B981' }}
                  >
                    URL do Catálogo
                  </p>
                  <div className="flex items-center gap-2">
                    <p
                      className="text-sm font-mono flex-1 truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {catalogUrl}
                    </p>
                    <button
                      onClick={copyUrl}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0"
                      style={{
                        background: copied ? 'rgba(16,185,129,0.2)' : 'var(--input-bg)',
                        color: copied ? '#10B981' : 'var(--text-muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {copied ? <><Check size={12} />Copiado</> : <><Copy size={12} />Copiar</>}
                    </button>
                  </div>
                </div>
                <a
                  href={catalogUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg,#10B981,#059669)',
                    color: '#fff',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                  }}
                >
                  <ExternalLink size={14} />
                  Abrir Catálogo
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 gap-3">
                <AlertTriangle size={22} style={{ color: '#F59E0B' }} />
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Nickname não configurado
                </p>
                <button
                  onClick={() => setActiveTab('info')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}
                >
                  <Store size={13} />
                  Ir para Informações
                </button>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <SectionHeader
              icon={ImageIcon}
              label="Imagens do Catálogo"
              subtitle="Logo e capa que aparecem para seus clientes"
              color="#8B5CF6"
            />
            <div className="grid grid-cols-2 gap-4 items-start">
              <div className="flex flex-col items-center gap-2">
                <ImageUpload
                  label="Logo"
                  hint="Exibida no topo do catálogo"
                  currentUrl={info.logo_url}
                  bucket="store-images"
                  path={`stores/${store.id}/logo`}
                  height={100}
                  rounded
                  onUploaded={(url) => setInfo((f) => ({ ...f, logo_url: url }))}
                />
              </div>
              <ImageUpload
                label="Imagem de Capa"
                hint="Banner no topo da página"
                currentUrl={info.cover_url}
                bucket="store-images"
                path={`stores/${store.id}/cover`}
                height={100}
                onUploaded={(url) => setInfo((f) => ({ ...f, cover_url: url }))}
              />
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB: WHATSAPP ── */}
      {activeTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-5">
            <Card className="p-6">
              <SectionHeader
                icon={Server}
                label="Servidor Evolution API"
                subtitle="Escolha como conectar sua instância"
                color="#6366F1"
              />
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  {
                    id: false,
                    title: 'Plataforma',
                    desc: 'Servidor gerenciado, sem configuração',
                    icon: Sparkles,
                    warning: !info.nickname,
                  },
                  {
                    id: true,
                    title: 'Servidor Próprio',
                    desc: 'Conecte sua própria instância Evolution',
                    icon: Server,
                    warning: false,
                  },
                ].map(({ id, title, desc, icon: Icon, warning }) => (
                  <button
                    key={String(id)}
                    type="button"
                    onClick={() => setUseOwnServer(id)}
                    className="flex flex-col items-start gap-2 p-4 rounded-2xl transition-all text-left"
                    style={{
                      background:
                        useOwnServer === id
                          ? isDark
                            ? 'rgba(99,102,241,0.15)'
                            : 'rgba(99,102,241,0.08)'
                          : 'var(--input-bg)',
                      border: `2px solid ${
                        useOwnServer === id ? '#6366F1' : 'var(--border)'
                      }`,
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{
                          background: useOwnServer === id ? '#6366F1' : 'var(--border)',
                        }}
                      >
                        <Icon size={15} color="#fff" />
                      </div>
                      {useOwnServer === id && (
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: '#6366F1' }}
                        >
                          <Check size={10} color="#fff" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{
                          color: useOwnServer === id ? '#818CF8' : 'var(--text-primary)',
                        }}
                      >
                        {title}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {desc}
                      </p>
                    </div>
                    {warning && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle size={10} style={{ color: '#F59E0B' }} />
                        <span className="text-[10px]" style={{ color: '#F59E0B' }}>
                          Requer nickname
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {!useOwnServer ? (
                info.nickname ? (
                  <div
                    className="p-3 rounded-xl flex items-start gap-2.5"
                    style={{
                      background: isDark
                        ? 'rgba(16,185,129,0.08)'
                        : 'rgba(16,185,129,0.05)',
                      border: '1px solid rgba(16,185,129,0.2)',
                    }}
                  >
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: '#10B981' }} />
                    <div className="text-xs">
                      <p className="font-semibold" style={{ color: '#10B981' }}>
                        Pronto para conectar!
                      </p>
                      <p className="mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Instância:{' '}
                        <span
                          className="font-mono font-bold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {info.nickname}
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-3 rounded-xl flex items-start gap-2.5"
                    style={{
                      background: isDark
                        ? 'rgba(245,158,11,0.08)'
                        : 'rgba(245,158,11,0.05)',
                      border: '1px solid rgba(245,158,11,0.2)',
                    }}
                  >
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: '#F59E0B' }} />
                    <div className="text-xs">
                      <p className="font-semibold" style={{ color: '#F59E0B' }}>
                        Nickname não configurado
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <FormField label="API Key" required>
                    <div className="relative">
                      <Eye
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'var(--text-muted)' }}
                      />
                      <input
                        type="password"
                        value={whatsapp.api_key}
                        onChange={(e) =>
                          setWhatsapp((f) => ({ ...f, api_key: e.target.value }))
                        }
                        placeholder={hasApiKey ? apiKeyMasked : 'Cole sua API Key aqui'}
                        className="w-full rounded-xl text-sm outline-none transition-all"
                        style={{
                          paddingLeft: '2.25rem',
                          paddingRight: '0.875rem',
                          paddingTop: '0.625rem',
                          paddingBottom: '0.625rem',
                          background: 'var(--input-bg)',
                          border: '1px solid var(--input-border)',
                          color: 'var(--text-primary)',
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')}
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor = 'var(--input-border)')
                        }
                      />
                    </div>
                    {hasApiKey && !whatsapp.api_key && (
                      <p
                        className="text-[11px] mt-1 flex items-center gap-1"
                        style={{ color: '#10B981' }}
                      >
                        <CheckCircle2 size={11} /> API Key configurada — deixe vazio para
                        manter
                      </p>
                    )}
                  </FormField>
                  <FormField
                    label="Nome da Instância"
                    required
                    hint="Identificador único no seu servidor Evolution"
                  >
                    <Input
                      icon={Hash}
                      value={whatsapp.instance_name}
                      onChange={(e) =>
                        setWhatsapp((f) => ({ ...f, instance_name: e.target.value }))
                      }
                      placeholder="minha-loja"
                    />
                  </FormField>
                  <FormField
                    label="URL do Servidor Evolution"
                    required
                    hint="Ex: https://meu-servidor.com"
                  >
                    <Input
                      icon={Globe}
                      value={whatsapp.evolution_url}
                      onChange={(e) =>
                        setWhatsapp((f) => ({ ...f, evolution_url: e.target.value }))
                      }
                      placeholder="https://meu-servidor.com"
                    />
                  </FormField>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <SectionHeader
                icon={CheckCircle2}
                label="Notificações Automáticas"
                subtitle="Escolha quais eventos enviam mensagem"
                color="#6366F1"
              />
              <div className="space-y-3">
                {[
                  { key: 'send_on_confirmed', label: 'Pedido Confirmado', desc: 'Notifica quando o pedido é confirmado' },
                  { key: 'send_on_preparing', label: 'Em Preparo', desc: 'Notifica quando começa a preparar' },
                  { key: 'send_on_out_for_delivery', label: 'Saiu para Entrega', desc: 'Notifica quando sai para entrega' },
                  { key: 'send_on_delivered', label: 'Entregue', desc: 'Notifica quando é entregue' },
                  { key: 'send_on_cancelled', label: 'Cancelado', desc: 'Notifica quando é cancelado' },
                ].map(({ key, label, desc }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setWhatsapp((f) => ({ ...f, [key]: !(f as any)[key] }))
                    }
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: (whatsapp as any)[key]
                        ? isDark
                          ? 'rgba(99,102,241,0.1)'
                          : 'rgba(99,102,241,0.07)'
                        : 'var(--input-bg)',
                      border: `1px solid ${
                        (whatsapp as any)[key] ? '#6366F1' : 'var(--border)'
                      }`,
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                      style={{
                        background: (whatsapp as any)[key] ? '#6366F1' : 'var(--border)',
                      }}
                    >
                      {(whatsapp as any)[key] && <Check size={14} color="#fff" />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {label}
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="p-6">
              <SectionHeader
                icon={Power}
                label="Status da Conexão"
                subtitle="Gerencie a conexão do WhatsApp"
                color="#25D366"
              />

              {whatsappStatus === 'disconnected' && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center py-6 gap-3">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(37,211,102,0.1)' }}
                    >
                      <MessageCircle size={32} style={{ color: '#25D366' }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        WhatsApp Desconectado
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {!canConnect
                          ? useOwnServer
                            ? 'Salve as configurações antes de conectar'
                            : 'Configure o nickname da loja primeiro'
                          : 'Clique em conectar para gerar o QR Code'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleConnectWhatsapp}
                    disabled={loadingWhatsapp || !canConnect}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
                    style={{
                      background: 'linear-gradient(135deg,#25D366,#128C7E)',
                      boxShadow: canConnect ? '0 4px 14px rgba(37,211,102,0.3)' : 'none',
                    }}
                  >
                    {loadingWhatsapp ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Power size={16} />
                    )}
                    Conectar WhatsApp
                  </button>
                </div>
              )}

              {whatsappStatus === 'connecting' && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center py-4 gap-3">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {qrCode ? 'Escaneie o QR Code' : 'Gerando QR Code...'}
                    </p>
                    {qrCode ? (
                      <div className="p-4 rounded-2xl" style={{ background: '#fff' }}>
                        <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                      </div>
                    ) : (
                      <div
                        className="w-48 h-48 rounded-2xl flex items-center justify-center"
                        style={{ background: 'var(--input-bg)' }}
                      >
                        <Loader2
                          size={32}
                          className="animate-spin"
                          style={{ color: '#25D366' }}
                        />
                      </div>
                    )}
                    <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                      Abra o WhatsApp no celular → Aparelhos conectados → Conectar aparelho
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleGetQrCode}
                      disabled={loadingWhatsapp}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: 'var(--input-bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <RefreshCw size={13} />
                      Atualizar QR
                    </button>
                    <button
                      onClick={handleCheckStatus}
                      disabled={loadingWhatsapp}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition-all"
                      style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}
                    >
                      {loadingWhatsapp ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={13} />
                      )}
                      Verificar Status
                    </button>
                  </div>
                </div>
              )}

              {whatsappStatus === 'connected' && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center py-6 gap-3">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
                      style={{ background: 'rgba(16,185,129,0.1)' }}
                    >
                      <CheckCircle2 size={32} style={{ color: '#10B981' }} />
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 animate-ping opacity-60" />
                      <div
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full"
                        style={{ background: '#10B981' }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold" style={{ color: '#10B981' }}>
                        WhatsApp Conectado
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Mensagens serão enviadas automaticamente
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnectWhatsapp}
                    disabled={loadingWhatsapp}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.07)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      color: '#EF4444',
                    }}
                  >
                    {loadingWhatsapp ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Power size={13} />
                    )}
                    Desconectar
                  </button>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <SectionHeader
                icon={FileText}
                label="Como Funciona"
                subtitle="Mensagens automáticas por status"
                color="#6366F1"
              />
              <div className="space-y-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                {[
                  { color: '#6366F1', label: 'Pedido Criado', desc: 'Resumo completo com itens, total e endereço' },
                  { color: '#10B981', label: 'Confirmado', desc: '"Seu pedido foi confirmado!"' },
                  { color: '#F59E0B', label: 'Em Preparo', desc: '"Nossos cozinheiros estão preparando..."' },
                  { color: '#8B5CF6', label: 'Saiu p/ Entrega', desc: '"Seu pedido saiu para entrega!"' },
                  { color: '#10B981', label: 'Entregue', desc: '"Bom apetite! Volte sempre!"' },
                  { color: '#EF4444', label: 'Cancelado', desc: '"Infelizmente seu pedido foi cancelado."' },
                ].map(({ color, label, desc }) => (
                  <div key={label} className="flex gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ background: color }}
                    />
                    <p>
                      <strong style={{ color: 'var(--text-primary)' }}>{label}:</strong> {desc}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB: TEAM ── */}
      {activeTab === 'team' && store && (
        <TeamTab storeId={store.id} isDark={isDark} />
      )}
    </div>
  );
}
