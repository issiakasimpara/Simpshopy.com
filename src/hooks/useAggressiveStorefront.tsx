// 🚀 HOOK STOREFRONT AVEC CACHE AGRESSIF
// Date: 2025-01-28
// Objectif: Éliminer le skeleton avec un cache multi-niveau

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { OptimizedStorefrontService, StorefrontData } from '@/services/optimizedStorefrontService';
import { AggressiveCacheService, CACHE_KEYS, CACHE_DURATIONS } from '@/services/aggressiveCacheService';
import { PreloadService } from '@/services/preloadService';
import { SmartCacheInvalidation } from '@/services/smartCacheInvalidation';

export interface UseAggressiveStorefrontReturn {
  data: StorefrontData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  storeSlug: string | undefined;
  isFromCache: boolean;
}

/**
 * Hook avec cache agressif pour éliminer le skeleton
 */
export function useAggressiveStorefront(): UseAggressiveStorefrontReturn {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [initialData, setInitialData] = useState<StorefrontData | null>(null);
  const [hasInitialData, setHasInitialData] = useState(false);

  // 🚀 RÉCUPÉRATION IMMÉDIATE DES DONNÉES INSTANTANÉES
  useEffect(() => {
    const fetchInitialData = async () => {
    if (!storeSlug) return;

    // Vérifier les données instantanées
    const instantData = localStorage.getItem('instant-storefront-data');
    if (instantData) {
      try {
        const parsedData = JSON.parse(instantData);
        console.log('⚡ Données instantanées trouvées, affichage immédiat');
        setInitialData(parsedData);
        setHasInitialData(true);
        // Nettoyer le cache instantané
        localStorage.removeItem('instant-storefront-data');
        return;
      } catch (error) {
        console.warn('Erreur parsing données instantanées:', error);
      }
    }

    // Vérifier le cache agressif
    const cacheKey = CACHE_KEYS.STOREFRONT(storeSlug);
    const cachedData = await AggressiveCacheService.get<StorefrontData>(cacheKey);
    if (cachedData) {
      console.log('⚡ Données en cache trouvées, affichage immédiat');
      setInitialData(cachedData);
      setHasInitialData(true);
    }
    };

    fetchInitialData();
    
    // Enregistrer la visite pour le préchargement intelligent
    if (storeSlug) {
      PreloadService.recordVisit(storeSlug);
    }
  }, [storeSlug]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['storefront', storeSlug],
    queryFn: async () => {
      if (!storeSlug) {
        throw new Error('Slug de boutique manquant');
      }

      // Si on a déjà des données initiales, les utiliser
      if (hasInitialData && initialData) {
        return initialData;
      }

      // Sinon, récupérer depuis Supabase
      console.log('⏳ Récupération depuis Supabase pour:', storeSlug);
      const freshData = await OptimizedStorefrontService.getStorefrontBySlug(storeSlug);
      
      // Mettre en cache agressif
      if (freshData) {
        const cacheKey = CACHE_KEYS.STOREFRONT(storeSlug);
        AggressiveCacheService.set(cacheKey, freshData, CACHE_DURATIONS.STOREFRONT);
        console.log('💾 Storefront mis en cache agressif');
      }
      
      return freshData;
    },
    enabled: !!storeSlug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    // 🚀 OPTIMISATIONS AGRESSIVES
    refetchOnMount: false, // Ne pas refetch si déjà en cache
    refetchOnReconnect: false, // Ne pas refetch sur reconnexion
    refetchInterval: false, // Pas de refetch automatique
  });

  // 🧠 ACTIVATION DU POLLING INTELLIGENT (fonction SQL créée avec succès)
  useEffect(() => {
    if (storeSlug) {
      // Démarrer le polling intelligent
      SmartCacheInvalidation.startForStore(storeSlug);
      console.log('🧠 Polling intelligent démarré pour:', storeSlug);

      // Écouter les événements d'invalidation
      const handleCacheInvalidated = () => {
        console.log('🔄 Cache invalidé - Rechargement des données');
        refetch(); // Recharger les données
      };

      window.addEventListener('cache-invalidated', handleCacheInvalidated);

      // Cleanup
      return () => {
        window.removeEventListener('cache-invalidated', handleCacheInvalidated);
        SmartCacheInvalidation.stop();
        console.log('🧠 Polling intelligent arrêté pour:', storeSlug);
      };
    }
  }, [storeSlug, refetch]);

  // Utiliser les données initiales si disponibles, sinon les données de la requête
  const finalData = hasInitialData && initialData ? initialData : data;
  const isFromCache = hasInitialData || (!isFetching && !!data);

  return {
    data: finalData || null,
    isLoading: !hasInitialData && isLoading && !finalData, // Pas de loading si on a des données (initiales ou finales)
    isError,
    error: error as Error | null,
    refetch,
    storeSlug,
    isFromCache,
  };
}

/**
 * Hook pour préchauffer le cache d'une boutique
 */
export function usePrewarmStorefront(storeSlug: string) {
  const prewarm = async () => {
    if (!storeSlug) return;

    try {
      // Récupérer les données
      const data = await OptimizedStorefrontService.getStorefrontBySlug(storeSlug);
      
      if (data) {
        // Mettre en cache agressif
        const cacheKey = CACHE_KEYS.STOREFRONT(storeSlug);
        AggressiveCacheService.set(cacheKey, data, CACHE_DURATIONS.STOREFRONT);
        
        // Préchauffer aussi les sous-données
        if (data.store) {
          AggressiveCacheService.set(
            CACHE_KEYS.STORE_DATA(storeSlug), 
            data.store, 
            CACHE_DURATIONS.STORE_DATA
          );
        }
        
        if (data.template) {
          AggressiveCacheService.set(
            CACHE_KEYS.TEMPLATE(data.store.id), 
            data.template, 
            CACHE_DURATIONS.TEMPLATE
          );
        }
        
        if (data.products) {
          AggressiveCacheService.set(
            CACHE_KEYS.PRODUCTS(data.store.id), 
            data.products, 
            CACHE_DURATIONS.PRODUCTS
          );
        }
        
        console.log('🔥 Cache préchauffé pour:', storeSlug);
      }
    } catch (error) {
      console.error('Erreur préchauffage cache:', error);
    }
  };

  return { prewarm };
}

/**
 * Hook pour invalider le cache d'une boutique
 */
export function useInvalidateStorefrontCache() {
  const invalidate = (storeSlug: string) => {
    const keys = [
      CACHE_KEYS.STOREFRONT(storeSlug),
      CACHE_KEYS.STORE_DATA(storeSlug),
    ];
    
    keys.forEach(key => AggressiveCacheService.delete(key));
    console.log('🗑️ Cache invalidé pour:', storeSlug);
  };

  const invalidateAll = () => {
    AggressiveCacheService.clear();
    console.log('🧹 Tous les caches invalidés');
  };

  return { invalidate, invalidateAll };
}
