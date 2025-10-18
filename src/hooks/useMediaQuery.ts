import { useState, useEffect } from 'react';

/**
 * Hook para detectar media queries y hacer componentes responsive
 * @param query - Media query string (ej: '(max-width: 768px)')
 * @returns boolean - true si la media query coincide
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Create listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    // Add listener
    media.addEventListener('change', listener);
    
    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

// Breakpoints predefinidos para usar en toda la app
export const useBreakpoints = () => {
  const isMobile = useMediaQuery('(max-width: 480px)'); // Solo móviles reales
  const isTablet = useMediaQuery('(min-width: 481px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const isSmallScreen = useMediaQuery('(max-width: 768px)'); // Solo móviles y tablets pequeñas

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen
  };
};
