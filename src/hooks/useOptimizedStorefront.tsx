// 🚀 HOOK OPTIMISÉ POUR LE STOREFRONT
// Date: 2025-01-28
// Objectif: Hook optimisé pour récupérer toutes les données d'une boutique avec une seule requête

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { OptimizedStorefrontService, StorefrontData } from '@/services/optimizedStorefrontService';

export interface UseOptimizedStorefrontReturn {
  data: StorefrontData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  storeSlug: string | undefined;
}

/**
 * Hook optimisé pour récupérer toutes les données d'une boutique
 * Utilise une seule requête optimisée au lieu de plusieurs requêtes séquentielles
 */
export function useOptimizedStorefront(): UseOptimizedStorefrontReturn {
  const { storeSlug } = useParams<{ storeSlug: string }>();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['storefront', storeSlug],
    queryFn: async () => {
      if (!storeSlug) {
        throw new Error('Slug de boutique manquant');
      }
      return OptimizedStorefrontService.getStorefrontBySlug(storeSlug);
    },
    enabled: !!storeSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    data: data || null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    storeSlug
  };
}

/**
 * Hook pour vérifier si une boutique existe
 */
export function useStoreExists(storeSlug: string | undefined) {
  return useQuery({
    queryKey: ['store-exists', storeSlug],
    queryFn: async () => {
      if (!storeSlug) return false;
      return OptimizedStorefrontService.storeExistsBySlug(storeSlug);
    },
    enabled: !!storeSlug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook pour récupérer uniquement les informations de base d'une boutique
 */
export function useStoreBasicInfo(storeSlug: string | undefined) {
  return useQuery({
    queryKey: ['store-basic-info', storeSlug],
    queryFn: async () => {
      if (!storeSlug) return null;
      return OptimizedStorefrontService.getStoreBasicInfoBySlug(storeSlug);
    },
    enabled: !!storeSlug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}