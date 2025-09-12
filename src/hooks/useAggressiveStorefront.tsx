// 🚀 HOOK STOREFRONT AVEC CACHE AGRESSIF
// Date: 2025-01-28
// Objectif: Éliminer le skeleton avec un cache multi-niveau

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { OptimizedStorefrontService, StorefrontData } from '@/services/optimizedStorefrontService';
import { AggressiveCacheService, CACHE_KEYS, CACHE_DURATIONS } from '@/services/aggressiveCacheService';

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
    
    // 🚀 PLUS BESOIN DE PRÉCHARGEMENT COMPLEXE - Le cache agressif suffit !
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

  // 🚀 PLUS BESOIN D'INVALIDATION COMPLEXE - Le cache TTL s'occupe de tout !

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

// 🚀 FONCTIONS SUPPRIMÉES - Plus besoin de préchauffage/invalidation complexe !
// Le cache agressif avec TTL s'occupe de tout automatiquement
