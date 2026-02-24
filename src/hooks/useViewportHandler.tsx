import { useEffect } from 'react';

export function useViewportHandler() {
  useEffect(() => {
    const handleResize = () => {
      const root = document.documentElement;

      // 1. Get the actual visual viewport height
      const visualHeight = window.visualViewport?.height || window.innerHeight;
      root.style.setProperty('--dynamic-vh', `${visualHeight}px`);

      // 2. Check if the browser UI is currently hiding the notch
      const isBrowserUIHidden = window.innerHeight > window.screen.height - 100;

      // 3. Dynamically set a top padding variable
      const dynamicSafeTop = isBrowserUIHidden ? 'env(safe-area-inset-top, 0px)' : '0px';
      root.style.setProperty('--dynamic-safe-top', dynamicSafeTop);
    };

    // Run once on mount
    handleResize();

    // Watch for the DOM resizing
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(document.body);

    // Watch for mobile browser UI expanding/collapsing
    window.visualViewport?.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, []);
}