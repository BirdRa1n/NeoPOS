import { Store, Palette, Globe, MessageCircle, Users, ShieldCheck } from 'lucide-react';
import { useIsDark } from '@/hooks/useIsDark';
import { SettingsTab } from '@/types/settings';

const TABS: { id: SettingsTab; label: string; icon: React.FC<any> }[] = [
  { id: 'info',       label: 'Informações', icon: Store },
  { id: 'appearance', label: 'Aparência',   icon: Palette },
  { id: 'catalog',    label: 'Catálogo',    icon: Globe },
  { id: 'whatsapp',   label: 'WhatsApp',    icon: MessageCircle },
  { id: 'team',       label: 'Equipe',      icon: Users },
  { id: 'license',    label: 'Licença',     icon: ShieldCheck },
];

interface SettingsTabsProps {
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

export function SettingsTabs({ active, onChange }: SettingsTabsProps) {
  const isDark = useIsDark();
  return (
    <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: active === id ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)') : 'transparent',
            color: active === id ? '#818CF8' : 'var(--text-muted)',
          }}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
    </div>
  );
}
