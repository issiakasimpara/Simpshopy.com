import { useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationCache {
  [key: string]: {
    timestamp: number;
    scrollPosition: number;
  };
}

const NAVIGATION_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const useFastNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationCache = useRef<NavigationCache>({});
  const isNavigating = useRef(false);

  // Sauvegarder la position de scroll avant navigation
  const saveScrollPosition = useCallback((path: string) => {
    navigationCache.current[path] = {
      timestamp: Date.now(),
      scrollPosition: window.scrollY
    };
  }, []);

  // Restaurer la position de scroll après navigation
  const restoreScrollPosition = useCallback((path: string) => {
    const cached = navigationCache.current[path];
    if (cached && Date.now() - cached.timestamp < NAVIGATION_CACHE_DURATION) {
      // Restaurer la position de scroll de manière fluide
      window.scrollTo({
        top: cached.scrollPosition,
        behavior: 'smooth'
      });
    } else {
      // Scroll vers le haut si pas de cache
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Navigation ultra-rapide
  const fastNavigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (isNavigating.current) return; // Éviter les navigations multiples
    
    isNavigating.current = true;
    
    // Sauvegarder la position actuelle
    saveScrollPosition(location.pathname);
    
    // Navigation immédiate
    navigate(to, options);
    
    // Réinitialiser le flag après un court délai
    setTimeout(() => {
      isNavigating.current = false;
    }, 100);
  }, [navigate, location.pathname, saveScrollPosition]);

  // Restaurer la position au changement de route
  useEffect(() => {
    const timer = setTimeout(() => {
      restoreScrollPosition(location.pathname);
    }, 50); // Petit délai pour laisser le DOM se mettre à jour

    return () => clearTimeout(timer);
  }, [location.pathname, restoreScrollPosition]);

  // Nettoyer le cache expiré
  useEffect(() => {
    const cleanExpiredCache = () => {
      const now = Date.now();
      Object.keys(navigationCache.current).forEach(path => {
        const cached = navigationCache.current[path];
        if (now - cached.timestamp > NAVIGATION_CACHE_DURATION) {
          delete navigationCache.current[path];
        }
      });
    };

    // Nettoyer toutes les 5 minutes
    const interval = setInterval(cleanExpiredCache, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    fastNavigate,
    isNavigating: isNavigating.current,
    saveScrollPosition,
    restoreScrollPosition
  };
};
