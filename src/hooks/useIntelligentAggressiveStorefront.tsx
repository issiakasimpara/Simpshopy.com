// 🧠 HOOK STOREFRONT INTELLIGENT + AGRESSIF
// Date: 2025-01-28
// Objectif: Combiner cache agressif avec intelligence et monitoring

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { OptimizedStorefrontService, StorefrontData } from '@/services/optimizedStorefrontService';
import { IntelligentCacheService, DataCriticality } from '@/services/intelligentCacheService';
import { CacheMonitoringService } from '@/services/cacheMonitoringService';
import { CACHE_KEYS } from '@/services/aggressiveCacheService';

export interface UseIntelligentAggressiveStorefrontReturn {
  data: StorefrontData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  storeSlug: string | undefined;
  isFromCache: boolean;
  cacheMetrics: {
    hitRate: number;
    responseTime: number;
    criticality: DataCriticality;
  };
}

/**
 * Hook intelligent qui combine cache agressif + monitoring + criticité
 */
export function useIntelligentAggressiveStorefront(): UseIntelligentAggressiveStorefrontReturn {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [initialData, setInitialData] = useState<StorefrontData | null>(null);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [cacheMetrics, setCacheMetrics] = useState({
    hitRate: 0,
    responseTime: 0,
    criticality: DataCriticality.IMPORTANT,
  });

  // 🚀 RÉCUPÉRATION INTELLIGENTE DES DONNÉES
  useEffect(() => {
    if (!storeSlug) return;

    const startTime = performance.now();

    // Vérifier les données instantanées (critiques)
    const instantData = localStorage.getItem('instant-storefront-data');
    if (instantData) {
      try {
        const parsedData = JSON.parse(instantData);
        console.log('⚡ Données instantanées trouvées (CRITICAL)');
        
        // Stocker avec criticité critique
        const cacheKey = CACHE_KEYS.STOREFRONT(storeSlug);
        IntelligentCacheService.set(cacheKey, parsedData, DataCriticality.CRITICAL);
        
        setInitialData(parsedData);
        setHasInitialData(true);
        
        const responseTime = performance.now() - startTime;
        CacheMonitoringService.recordHit(cacheKey, responseTime);
        
        // Nettoyer le cache instantané
        localStorage.removeItem('instant-storefront-data');
        return;
      } catch (error) {
        console.warn('Erreur parsing données instantanées:', error);
      }
    }

    // Vérifier le cache intelligent
    const cacheKey = CACHE_KEYS.STOREFRONT(storeSlug);
    const cachedData = IntelligentCacheService.get<StorefrontData>(cacheKey);
    if (cachedData) {
      console.log('⚡ Données en cache intelligent trouvées');
      
      const responseTime = performance.now() - startTime;
      CacheMonitoringService.recordHit(cacheKey, responseTime);
      
      setInitialData(cachedData);
      setHasInitialData(true);
      
      // Mettre à jour les métriques
      const metrics = CacheMonitoringService.getGlobalStats();
      setCacheMetrics({
        hitRate: metrics.globalHitRate,
        responseTime: metrics.averageResponseTime,
        criticality: DataCriticality.IMPORTANT,
      });
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
    queryKey: ['intelligent-storefront', storeSlug],
    queryFn: async () => {
      if (!storeSlug) {
        throw new Error('Slug de boutique manquant');
      }

      const startTime = performance.now();
      const cacheKey = CACHE_KEYS.STOREFRONT(storeSlug);

      // Si on a déjà des données initiales, les utiliser
      if (hasInitialData && initialData) {
        return initialData;
      }

      // Récupérer depuis Supabase
      console.log('⏳ Récupération depuis Supabase pour:', storeSlug);
      const freshData = await OptimizedStorefrontService.getStorefrontBySlug(storeSlug);
      
      const responseTime = performance.now() - startTime;
      
      if (freshData) {
        // Stocker avec criticité selon le type de données
        const criticality = this.determineCriticality(freshData);
        IntelligentCacheService.set(cacheKey, freshData, criticality);
        
        // Enregistrer le miss (puisque c'était pas en cache)
        CacheMonitoringService.recordMiss(cacheKey, responseTime);
        
        console.log(`💾 Storefront mis en cache intelligent (${criticality})`);
      }
      
      return freshData;
    },
    enabled: !!storeSlug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  // Déterminer la criticité des données
  const determineCriticality = useCallback((storefrontData: StorefrontData): DataCriticality => {
    // Si c'est une boutique avec des produits en stock critique
    const hasCriticalStock = storefrontData.products?.some(product => 
      product.status === 'active' && product.price > 0
    );
    
    // Si c'est une boutique avec des promotions actives
    const hasActivePromotions = storefrontData.store?.settings?.promotions?.length > 0;
    
    if (hasCriticalStock || hasActivePromotions) {
      return DataCriticality.CRITICAL;
    }
    
    return DataCriticality.IMPORTANT;
  }, []);

  // Utiliser les données initiales si disponibles, sinon les données de la requête
  const finalData = hasInitialData && initialData ? initialData : data;
  const isFromCache = hasInitialData || (!isFetching && !!data);

  // Mettre à jour les métriques périodiquement
  useEffect(() => {
    const updateMetrics = () => {
      const metrics = CacheMonitoringService.getGlobalStats();
      setCacheMetrics({
        hitRate: metrics.globalHitRate,
        responseTime: metrics.averageResponseTime,
        criticality: determineCriticality(finalData || {} as StorefrontData),
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Toutes les 30 secondes
    
    return () => clearInterval(interval);
  }, [finalData, determineCriticality]);

  return {
    data: finalData || null,
    isLoading: !hasInitialData && isLoading && !finalData,
    isError,
    error: error as Error | null,
    refetch,
    storeSlug,
    isFromCache,
    cacheMetrics,
  };
}

/**
 * Hook pour invalider intelligemment le cache
 */
export function useIntelligentCacheInvalidation() {
  const invalidateByCriticality = useCallback((criticality: DataCriticality) => {
    IntelligentCacheService.invalidateByCriticality(criticality);
    console.log(`🗑️ Cache invalidated by criticality: ${criticality}`);
  }, []);

  const invalidateStorefront = useCallback((storeSlug: string) => {
    const cacheKey = CACHE_KEYS.STOREFRONT(storeSlug);
    IntelligentCacheService.invalidate(cacheKey);
    CacheMonitoringService.recordInvalidation(cacheKey);
  }, []);

  const getCacheStats = useCallback(() => {
    return {
      intelligent: IntelligentCacheService.getIntelligentStats(),
      monitoring: CacheMonitoringService.getGlobalStats(),
      alerts: CacheMonitoringService.getAlerts(),
    };
  }, []);

  return {
    invalidateByCriticality,
    invalidateStorefront,
    getCacheStats,
  };
}

/**
 * Hook pour obtenir les métriques de cache en temps réel
 */
export function useCacheMetrics() {
  const [metrics, setMetrics] = useState(() => CacheMonitoringService.getGlobalStats());
  const [alerts, setAlerts] = useState(() => CacheMonitoringService.getAlerts());

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(CacheMonitoringService.getGlobalStats());
      setAlerts(CacheMonitoringService.getAlerts());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Toutes les 5 secondes
    
    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    alerts,
    refresh: () => {
      setMetrics(CacheMonitoringService.getGlobalStats());
      setAlerts(CacheMonitoringService.getAlerts());
    },
  };
}
