import { useState, useEffect } from 'react';
import { ThemeMode } from '@/types/auth';

export function useAuthTheme() {
  const [mode, setMode] = useState<ThemeMode>('auto');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('neo-auth-theme-mode') as ThemeMode | null;
    const savedMode = saved === 'auto' || saved === 'dark' || saved === 'light' ? saved : 'auto';
    setMode(savedMode);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => {
      if (savedMode === 'auto') setTheme(mq.matches ? 'dark' : 'light');
      else setTheme(savedMode);
    };
    updateTheme();
    setReady(true);
    const handler = () => { if (savedMode === 'auto') updateTheme(); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const cycleMode = () => {
    const next: ThemeMode = mode === 'auto' ? 'light' : mode === 'light' ? 'dark' : 'auto';
    setMode(next);
    localStorage.setItem('neo-auth-theme-mode', next);
    if (next === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setTheme(mq.matches ? 'dark' : 'light');
    } else setTheme(next);
  };

  return { theme, mode, cycleMode, ready };
}
