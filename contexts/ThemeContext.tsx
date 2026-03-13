import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '@/lib/constants/theme';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ 
  theme: 'dark', 
  toggle: () => {} 
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' ? localStorage.getItem('theme') : null) as Theme | null;
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);

  const toggle = () => setTheme(t => {
    const next: Theme = t === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') localStorage.setItem('theme', next);
    return next;
  });

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
