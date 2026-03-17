import { Server, Sparkles, CheckCircle2, AlertTriangle, Eye, Hash, Globe, Check, Power, MessageCircle, Loader2, RefreshCw, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/forms/FormField';
import { useIsDark } from '@/hooks/useIsDark';
import { SectionHeader } from './SectionHeader';
import { WhatsappConfig, WhatsappStatus } from '@/types/settings';

const NOTIFICATIONS = [
  { key: 'send_on_confirmed',        label: 'Pedido Confirmado',   desc: 'Notifica quando o pedido é confirmado' },
  { key: 'send_on_preparing',        label: 'Em Preparo',          desc: 'Notifica quando começa a preparar' },
  { key: 'send_on_out_for_delivery', label: 'Saiu para Entrega',   desc: 'Notifica quando sai para entrega' },
  { key: 'send_on_delivered',        label: 'Entregue',            desc: 'Notifica quando é entregue' },
  { key: 'send_on_cancelled',        label: 'Cancelado',           desc: 'Notifica quando é cancelado' },
];

const HOW_IT_WORKS = [
  { color: '#6366F1', label: 'Pedido Criado',    desc: 'Resumo completo com itens, total e endereço' },
  { color: '#10B981', label: 'Confirmado',        desc: '"Seu pedido foi confirmado!"' },
  { color: '#F59E0B', label: 'Em Preparo',        desc: '"Nossos cozinheiros estão preparando..."' },
  { color: '#8B5CF6', label: 'Saiu p/ Entrega',  desc: '"Seu pedido saiu para entrega!"' },
  { color: '#10B981', label: 'Entregue',          desc: '"Bom apetite! Volte sempre!"' },
  { color: '#EF4444', label: 'Cancelado',         desc: '"Infelizmente seu pedido foi cancelado."' },
];

interface WhatsappTabProps {
  whatsapp: WhatsappConfig;
  useOwnServer: boolean;
  hasApiKey: boolean;
  apiKeyMasked: string;
  nickname: string;
  status: WhatsappStatus;
  qrCode: string | null;
  loading: boolean;
  canConnect: boolean;
  onChangeWhatsapp: (k: keyof WhatsappConfig, v: any) => void;
  onSetUseOwnServer: (v: boolean) => void;
  onConnect: () => void;
  onGetQrCode: () => void;
  onCheckStatus: () => void;
  onDisconnect: () => void;
}

export function WhatsappTab({
  whatsapp, useOwnServer, hasApiKey, apiKeyMasked, nickname,
  status, qrCode, loading, canConnect,
  onChangeWhatsapp, onSetUseOwnServer,
  onConnect, onGetQrCode, onCheckStatus, onDisconnect,
}: WhatsappTabProps) {
  const isDark = useIsDark();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="space-y-5">
        <Card className="p-6">
          <SectionHeader icon={Server} label="Servidor Evolution API" subtitle="Escolha como conectar sua instância" color="#6366F1" />
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { id: false, title: 'Plataforma', desc: 'Servidor gerenciado, sem configuração', icon: Sparkles, warning: !nickname },
              { id: true,  title: 'Servidor Próprio', desc: 'Conecte sua própria instância Evolution', icon: Server, warning: false },
            ].map(({ id, title, desc, icon: Icon, warning }) => (
              <button key={String(id)} type="button" onClick={() => onSetUseOwnServer(id)}
                className="flex flex-col items-start gap-2 p-4 rounded-2xl transition-all text-left"
                style={{
                  background: useOwnServer === id ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)') : 'var(--input-bg)',
                  border: `2px solid ${useOwnServer === id ? '#6366F1' : 'var(--border)'}`,
                }}>
                <div className="flex items-center justify-between w-full">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: useOwnServer === id ? '#6366F1' : 'var(--border)' }}>
                    <Icon size={15} color="#fff" />
                  </div>
                  {useOwnServer === id && (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#6366F1' }}>
                      <Check size={10} color="#fff" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: useOwnServer === id ? '#818CF8' : 'var(--text-primary)' }}>{title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
                {warning && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle size={10} style={{ color: '#F59E0B' }} />
                    <span className="text-[10px]" style={{ color: '#F59E0B' }}>Requer nickname</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {!useOwnServer ? (
            nickname ? (
              <div className="p-3 rounded-xl flex items-start gap-2.5" style={{ background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: '#10B981' }} />
                <div className="text-xs">
                  <p className="font-semibold" style={{ color: '#10B981' }}>Pronto para conectar!</p>
                  <p className="mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Instância: <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{nickname}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl flex items-start gap-2.5" style={{ background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: '#F59E0B' }} />
                <p className="text-xs font-semibold" style={{ color: '#F59E0B' }}>Nickname não configurado</p>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <FormField label="API Key" required>
                <div className="relative">
                  <Eye size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    value={whatsapp.api_key}
                    onChange={e => onChangeWhatsapp('api_key', e.target.value)}
                    placeholder={hasApiKey ? apiKeyMasked : 'Cole sua API Key aqui'}
                    className="w-full rounded-xl text-sm outline-none transition-all"
                    style={{ paddingLeft: '2.25rem', paddingRight: '0.875rem', paddingTop: '0.625rem', paddingBottom: '0.625rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#6366F1')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--input-border)')}
                  />
                </div>
                {hasApiKey && !whatsapp.api_key && (
                  <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: '#10B981' }}>
                    <CheckCircle2 size={11} /> API Key configurada — deixe vazio para manter
                  </p>
                )}
              </FormField>
              <FormField label="Nome da Instância" required hint="Identificador único no seu servidor Evolution">
                <Input icon={Hash} value={whatsapp.instance_name} onChange={e => onChangeWhatsapp('instance_name', e.target.value)} placeholder="minha-loja" />
              </FormField>
              <FormField label="URL do Servidor Evolution" required hint="Ex: https://meu-servidor.com">
                <Input icon={Globe} value={whatsapp.evolution_url} onChange={e => onChangeWhatsapp('evolution_url', e.target.value)} placeholder="https://meu-servidor.com" />
              </FormField>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <SectionHeader icon={CheckCircle2} label="Notificações Automáticas" subtitle="Escolha quais eventos enviam mensagem" color="#6366F1" />
          <div className="space-y-3">
            {NOTIFICATIONS.map(({ key, label, desc }) => (
              <button key={key} type="button" onClick={() => onChangeWhatsapp(key as keyof WhatsappConfig, !(whatsapp as any)[key])}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: (whatsapp as any)[key] ? (isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)') : 'var(--input-bg)',
                  border: `1px solid ${(whatsapp as any)[key] ? '#6366F1' : 'var(--border)'}`,
                }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center transition-all" style={{ background: (whatsapp as any)[key] ? '#6366F1' : 'var(--border)' }}>
                  {(whatsapp as any)[key] && <Check size={14} color="#fff" />}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card className="p-6">
          <SectionHeader icon={Power} label="Status da Conexão" subtitle="Gerencie a conexão do WhatsApp" color="#25D366" />

          {status === 'disconnected' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center py-6 gap-3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(37,211,102,0.1)' }}>
                  <MessageCircle size={32} style={{ color: '#25D366' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>WhatsApp Desconectado</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {!canConnect ? (useOwnServer ? 'Salve as configurações antes de conectar' : 'Configure o nickname da loja primeiro') : 'Clique em conectar para gerar o QR Code'}
                  </p>
                </div>
              </div>
              <button onClick={onConnect} disabled={loading || !canConnect}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', boxShadow: canConnect ? '0 4px 14px rgba(37,211,102,0.3)' : 'none' }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
                Conectar WhatsApp
              </button>
            </div>
          )}

          {status === 'connecting' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center py-4 gap-3">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{qrCode ? 'Escaneie o QR Code' : 'Gerando QR Code...'}</p>
                {qrCode ? (
                  <div className="p-4 rounded-2xl" style={{ background: '#fff' }}>
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-2xl flex items-center justify-center" style={{ background: 'var(--input-bg)' }}>
                    <Loader2 size={32} className="animate-spin" style={{ color: '#25D366' }} />
                  </div>
                )}
                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                  Abra o WhatsApp no celular → Aparelhos conectados → Conectar aparelho
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={onGetQrCode} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <RefreshCw size={13} /> Atualizar QR
                </button>
                <button onClick={onCheckStatus} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}>
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  Verificar Status
                </button>
              </div>
            </div>
          )}

          {status === 'connected' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center py-6 gap-3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative" style={{ background: 'rgba(16,185,129,0.1)' }}>
                  <CheckCircle2 size={32} style={{ color: '#10B981' }} />
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 animate-ping opacity-60" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full" style={{ background: '#10B981' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold" style={{ color: '#10B981' }}>WhatsApp Conectado</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Mensagens serão enviadas automaticamente</p>
                </div>
              </div>
              <button onClick={onDisconnect} disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{ background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Power size={13} />}
                Desconectar
              </button>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <SectionHeader icon={FileText} label="Como Funciona" subtitle="Mensagens automáticas por status" color="#6366F1" />
          <div className="space-y-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            {HOW_IT_WORKS.map(({ color, label, desc }) => (
              <div key={label} className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
                <p><strong style={{ color: 'var(--text-primary)' }}>{label}:</strong> {desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
