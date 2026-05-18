import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollTop = () => {
      // Scroll window
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      // Fallbacks for different browsers/scroll containers
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };

    scrollTop();
    // Run again on next paint to ensure after route transition/layout
    requestAnimationFrame(scrollTop);
  }, [pathname]);

  return null;
}