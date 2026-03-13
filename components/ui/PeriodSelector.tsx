import { useTheme } from '@/contexts/ThemeContext';

interface PeriodSelectorProps<T extends string> {
  period: T;
  setPeriod: (period: T) => void;
  periods: Record<T, string>;
}

export function PeriodSelector<T extends string>({ period, setPeriod, periods }: PeriodSelectorProps<T>) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      {(Object.keys(periods) as T[]).map(p => (
        <button key={p} onClick={() => setPeriod(p)}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: period === p ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)') : 'transparent',
            color: period === p ? '#818CF8' : 'var(--text-muted)',
          }}>
          {periods[p]}
        </button>
      ))}
    </div>
  );
}
