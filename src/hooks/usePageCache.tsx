import { useState, useEffect, useCallback } from 'react';

interface PageCache {
  [key: string]: {
    timestamp: number;
    data: any;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const usePageCache = () => {
  const [cache, setCache] = useState<PageCache>({});

  // Charger le cache depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedCache = localStorage.getItem('simpshopy-page-cache');
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        // Nettoyer le cache expiré
        const now = Date.now();
        const validCache: PageCache = {};
        
        Object.entries(parsedCache).forEach(([key, value]: [string, any]) => {
          if (now - value.timestamp < CACHE_DURATION) {
            validCache[key] = value;
          }
        });
        
        setCache(validCache);
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du cache:', error);
    }
  }, []);

  // Sauvegarder le cache dans localStorage
  const saveCache = useCallback((newCache: PageCache) => {
    try {
      localStorage.setItem('simpshopy-page-cache', JSON.stringify(newCache));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du cache:', error);
    }
  }, []);

  // Ajouter une page au cache
  const cachePage = useCallback((pageKey: string, data: any) => {
    const newCache = {
      ...cache,
      [pageKey]: {
        timestamp: Date.now(),
        data
      }
    };
    setCache(newCache);
    saveCache(newCache);
  }, [cache, saveCache]);

  // Récupérer une page du cache
  const getCachedPage = useCallback((pageKey: string) => {
    const cached = cache[pageKey];
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION) {
      // Cache expiré, le supprimer
      const newCache = { ...cache };
      delete newCache[pageKey];
      setCache(newCache);
      saveCache(newCache);
      return null;
    }
    
    return cached.data;
  }, [cache, saveCache]);

  // Vérifier si une page est en cache
  const isPageCached = useCallback((pageKey: string) => {
    return getCachedPage(pageKey) !== null;
  }, [getCachedPage]);

  // Nettoyer le cache expiré
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    const newCache: PageCache = {};
    
    Object.entries(cache).forEach(([key, value]) => {
      if (now - value.timestamp < CACHE_DURATION) {
        newCache[key] = value;
      }
    });
    
    setCache(newCache);
    saveCache(newCache);
  }, [cache, saveCache]);

  // Vider tout le cache
  const clearCache = useCallback(() => {
    setCache({});
    localStorage.removeItem('simpshopy-page-cache');
  }, []);

  // Statistiques du cache
  const getCacheStats = useCallback(() => {
    const now = Date.now();
    const validEntries = Object.values(cache).filter(
      entry => now - entry.timestamp < CACHE_DURATION
    );
    
    return {
      totalEntries: Object.keys(cache).length,
      validEntries: validEntries.length,
      expiredEntries: Object.keys(cache).length - validEntries.length,
      cacheSize: JSON.stringify(cache).length
    };
  }, [cache]);

  return {
    cachePage,
    getCachedPage,
    isPageCached,
    cleanExpiredCache,
    clearCache,
    getCacheStats,
    cache
  };
};
