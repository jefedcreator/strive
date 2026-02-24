'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export function MetaThemeColorMeta() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // These must be the exact hex codes from your Tailwind config
    // corresponding to bg-background-light and bg-background-dark
    const lightColor = '#F7F9FB'; 
    const darkColor = '#0B0F19';  

    // Determine the active color based on the current theme
    const activeColor = resolvedTheme === 'dark' ? darkColor : lightColor;
    
    // Check if the meta tag already exists
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    // If it exists, update it. If not, create and inject it.
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', activeColor);
    } else {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      metaThemeColor.setAttribute('content', activeColor);
      document.head.appendChild(metaThemeColor);
    }
  }, [resolvedTheme]);

  // This component manages the DOM head and renders no UI
  return null; 
}