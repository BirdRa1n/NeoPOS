import { useEffect } from 'react';

export function useThemeColor(color: string) {
  useEffect(() => {
    // Atualiza meta theme-color
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.setAttribute('content', color);

    // Atualiza meta apple-mobile-web-app-status-bar-style
    let metaAppleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    
    if (!metaAppleStatusBar) {
      metaAppleStatusBar = document.createElement('meta');
      metaAppleStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      document.head.appendChild(metaAppleStatusBar);
    }
    
    // Define estilo baseado na cor
    const isDark = color === '#080B12' || color === '#0A0D14' || color === '#0F1117';
    metaAppleStatusBar.setAttribute('content', isDark ? 'black-translucent' : 'default');
  }, [color]);
}
