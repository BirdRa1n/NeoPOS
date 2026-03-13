import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '@/lib/constants/theme';

type ThemeMode = 'auto' | 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({ 
  theme: 'dark', 
  mode: 'auto',
  setMode: () => {} 
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [theme, setTheme] = useState<Theme>('dark');

  // Detecta preferência do sistema
  useEffect(() => {
    const saved = (typeof window !== 'undefined' ? localStorage.getItem('theme-mode') : null) as ThemeMode | null;
    if (saved === 'auto' || saved === 'dark' || saved === 'light') {
      setModeState(saved);
    }

    // Listener para mudanças no sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mode === 'auto') {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  // Atualiza tema baseado no modo
  useEffect(() => {
    if (mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setTheme(mediaQuery.matches ? 'dark' : 'light');
    } else {
      setTheme(mode);
    }
  }, [mode]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-mode', newMode);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
