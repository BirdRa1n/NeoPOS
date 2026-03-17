import { InventoryTab } from '@/types/inventory';

interface InventoryTabsProps {
  activeTab: InventoryTab;
  onChange: (tab: InventoryTab) => void;
}

export function InventoryTabs({ activeTab, onChange }: InventoryTabsProps) {
  return (
    <div
      className="flex items-center gap-2 p-1 rounded-xl w-max"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--surface-box)' }}
    >
      {(['supplies', 'products'] as const).map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: activeTab === tab ? 'var(--bg-primary)' : 'transparent',
            color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
            boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
          }}
        >
          {tab === 'supplies' ? 'Insumos' : 'Produtos'}
        </button>
      ))}
    </div>
  );
}
