'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/supabase/client';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import {
  SettingsTabs, InfoTab, AppearanceTab, CatalogTab, WhatsappTab, LicenseTab,
} from '@/components/settings';
import { TeamTab } from '@/components/settings/TeamTab';
import { useIsDark } from '@/hooks/useIsDark';
import { COLORS } from '@/lib/constants';
import {
  SettingsTab, WhatsappStatus, StoreInfo, StoreTheme, WhatsappConfig,
  DEFAULT_STORE_INFO, DEFAULT_THEME, DEFAULT_WHATSAPP,
} from '@/types/settings';

const db = () => supabase.schema('core');
const catalog = () => supabase.schema('catalog');

export function StoreSettingsView() {
  const isDark = useIsDark();
  const { store, refetch } = useStore();

  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('info');

  const [info, setInfo] = useState<StoreInfo>(DEFAULT_STORE_INFO);
  const [theme, setTheme] = useState<StoreTheme>(DEFAULT_THEME);
  const [whatsapp, setWhatsapp] = useState<WhatsappConfig>(DEFAULT_WHATSAPP);
  const [useOwnServer, setUseOwnServer] = useState(false);
  const [apiKeyMasked, setApiKeyMasked] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsappStatus>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);

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

    catalog().from('store_theme').select('*').eq('store_id', store.id).maybeSingle()
      .then(({ data }) => { if (data) setTheme(t => ({ ...t, ...data })); });

    supabase.schema('integrations').from('whatsapp_config_safe').select('*').eq('store_id', store.id).maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setUseOwnServer(data.use_own_server ?? false);
        setWhatsapp(f => ({
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

  const showSaveOk = () => { setSaveOk(true); setTimeout(() => setSaveOk(false), 2500); };

  const handleSaveInfo = async () => {
    if (!store) return;
    setSaving(true);
    try {
      const { error } = await db().from('stores').update({
        name: info.name, nickname: info.nickname, description: info.description,
        phone: info.phone || null, email: info.email || null, address: info.address || null,
        city: info.city || null, state: info.state || null, zip_code: info.zip_code || null,
        logo_url: info.logo_url || null, cover_url: info.cover_url || null, is_open: info.is_open,
      }).eq('id', store.id);
      if (error) throw error;
      await refetch();
      showSaveOk();
    } catch (err: any) { alert(err.message ?? 'Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handleSaveTheme = async () => {
    if (!store) return;
    setSaving(true);
    try {
      const { data: existing } = await catalog().from('store_theme').select('id').eq('store_id', store.id).maybeSingle();
      const payload = { ...theme, store_id: store.id };
      const { error } = existing
        ? await catalog().from('store_theme').update(payload).eq('store_id', store.id)
        : await catalog().from('store_theme').insert(payload);
      if (error) throw error;
      showSaveOk();
    } catch (err: any) { alert(err.message ?? 'Erro ao salvar tema'); }
    finally { setSaving(false); }
  };

  const handleSaveWhatsapp = async () => {
    if (!store) return;
    if (!useOwnServer && !info.nickname) { alert('Configure o nickname da loja antes de usar o servidor da plataforma.'); setActiveTab('info'); return; }
    if (useOwnServer && !whatsapp.api_key && !hasApiKey) { alert('Informe a API Key do seu servidor Evolution.'); return; }
    if (useOwnServer && !whatsapp.evolution_url) { alert('Informe a URL do seu servidor Evolution.'); return; }
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar');
      setWhatsapp(f => ({ ...f, api_key: '', evolution_url: '' }));
      if (useOwnServer && whatsapp.api_key) setHasApiKey(true);
      showSaveOk();
    } catch (err: any) { alert(err.message ?? 'Erro ao salvar WhatsApp'); }
    finally { setSaving(false); }
  };

  const getToken = async () => (await supabase.auth.getSession()).data.session?.access_token;

  const handleConnectWhatsapp = async () => {
    setLoadingWhatsapp(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/functions/whatsapp-config?action=connect', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao conectar');
      setWhatsappStatus('connecting');
      setTimeout(() => handleGetQrCode(), 2000);
      const pollInterval = setInterval(async () => {
        const t = await getToken();
        const r = await fetch('/api/functions/whatsapp-config?action=status', { method: 'POST', headers: { Authorization: `Bearer ${t}` } });
        if (r.ok) {
          const json = await r.json();
          const state = json.data?.instance?.state;
          if (state === 'open' || state === 'connected') { setWhatsappStatus('connected'); setQrCode(null); clearInterval(pollInterval); }
        }
      }, 5000);
      setTimeout(() => clearInterval(pollInterval), 300000);
    } catch (err: any) { alert(err.message); }
    finally { setLoadingWhatsapp(false); }
  };

  const handleGetQrCode = async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/functions/whatsapp-config?action=qrcode', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      const qr = data.data;
      if (qr?.base64) setQrCode(qr.base64);
      else if (qr?.code) setQrCode(qr.code);
    } catch (err) { console.error('QR code error:', err); }
  };

  const handleCheckStatus = async () => {
    setLoadingWhatsapp(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/functions/whatsapp-config?action=status', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      const state = json.data?.instance?.state;
      if (state === 'open' || state === 'connected') { setWhatsappStatus('connected'); setQrCode(null); }
    } catch (err) { console.error(err); }
    finally { setLoadingWhatsapp(false); }
  };

  const handleDisconnectWhatsapp = async () => {
    if (!confirm('Desconectar o WhatsApp?')) return;
    setLoadingWhatsapp(true);
    try {
      const token = await getToken();
      await fetch('/api/functions/whatsapp-config?action=disconnect', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      setWhatsappStatus('disconnected');
      setQrCode(null);
    } catch (err) { console.error(err); }
    finally { setLoadingWhatsapp(false); }
  };

  const canConnect = useOwnServer ? whatsapp.instance_name.length > 0 && hasApiKey : info.nickname.length > 0;

  const handleSave = activeTab === 'whatsapp' ? handleSaveWhatsapp : activeTab === 'appearance' ? handleSaveTheme : handleSaveInfo;

  if (!store) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: COLORS.accent, borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Configurações"
        subtitle="Gerencie informações e aparência da loja"
        action={activeTab !== 'team' && activeTab !== 'license' ? (
          <Button
            onClick={handleSave}
            disabled={saving}
            icon={saving ? <Loader2 size={14} className="animate-spin" /> : saveOk ? <CheckCircle2 size={14} /> : <Save size={14} />}
            style={{
              background: saveOk ? COLORS.successGradient : COLORS.accentGradient,
              boxShadow: COLORS.accentShadow, color: 'white', border: 'none',
            }}
          >
            {saving ? 'Salvando...' : saveOk ? 'Salvo!' : 'Salvar Alterações'}
          </Button>
        ) : undefined}
      />

      <SettingsTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === 'info' && (
        <InfoTab
          info={info}
          storeId={store.id}
          onChange={(k, v) => setInfo(f => ({ ...f, [k]: v }))}
        />
      )}

      {activeTab === 'appearance' && (
        <AppearanceTab
          theme={theme}
          store={store}
          info={info}
          onChange={(k, v) => setTheme(f => ({ ...f, [k]: v }))}
        />
      )}

      {activeTab === 'catalog' && (
        <CatalogTab
          info={info}
          storeId={store.id}
          onChangeInfo={(k, v) => setInfo(f => ({ ...f, [k]: v }))}
          onGoToInfo={() => setActiveTab('info')}
        />
      )}

      {activeTab === 'whatsapp' && (
        <WhatsappTab
          whatsapp={whatsapp}
          useOwnServer={useOwnServer}
          hasApiKey={hasApiKey}
          apiKeyMasked={apiKeyMasked}
          nickname={info.nickname}
          status={whatsappStatus}
          qrCode={qrCode}
          loading={loadingWhatsapp}
          canConnect={canConnect}
          onChangeWhatsapp={(k, v) => setWhatsapp(f => ({ ...f, [k]: v }))}
          onSetUseOwnServer={setUseOwnServer}
          onConnect={handleConnectWhatsapp}
          onGetQrCode={handleGetQrCode}
          onCheckStatus={handleCheckStatus}
          onDisconnect={handleDisconnectWhatsapp}
        />
      )}

      {activeTab === 'team' && <TeamTab storeId={store.id} isDark={isDark} />}

      {activeTab === 'license' && <LicenseTab />}
    </div>
  );
}
