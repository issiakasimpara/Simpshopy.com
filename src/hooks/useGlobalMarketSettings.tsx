import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

interface MarketSettings {
  id: string;
  store_id: string;
  default_currency: string;
  currency_symbol: string;
  currency_position: 'before' | 'after';
  decimal_places: number;
  thousand_separator: string;
  decimal_separator: string;
  created_at: string;
  updated_at: string;
}

// Cache global pour éviter les requêtes multiples
const globalMarketSettingsCache = new Map<string, MarketSettings>();

export function useGlobalMarketSettings(storeId: string | null) {
  const queryClient = useQueryClient();
  const cacheKey = `global-market-settings-${storeId}`;

  return useQuery({
    queryKey: [cacheKey],
    queryFn: async (): Promise<MarketSettings | null> => {
      if (!storeId) return null;

      // 🔐 Validation multi-tenant supplémentaire
      if (typeof storeId !== 'string' || storeId.length === 0) {
        console.error('❌ StoreId invalide pour multi-tenant:', storeId);
        return null;
      }

      // Vérifier le cache global d'abord
      if (globalMarketSettingsCache.has(storeId)) {
        console.log(`📦 Cache global hit pour store ${storeId}`);
        return globalMarketSettingsCache.get(storeId)!;
      }

      console.log(`🌐 Requête globale market_settings pour store ${storeId}`);
      
      const { data, error } = await supabase
        .from('market_settings')
        .select('*')
        .eq('store_id', storeId)
        .single();

      if (error) {
        console.error('Erreur market_settings globale:', error);
        return null;
      }

      // 🔐 Validation multi-tenant des données reçues
      if (data && data.store_id !== storeId) {
        console.error('❌ Violation multi-tenant détectée:', {
          requested: storeId,
          received: data.store_id
        });
        return null;
      }

      // Mettre en cache global
      globalMarketSettingsCache.set(storeId, data);
      
      return data;
    },
    enabled: !!storeId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 heure
    refetchOnWindowFocus: false,
    retry: false,
  });
}

// Fonction pour invalider le cache global
export function invalidateGlobalMarketSettings(storeId: string) {
  globalMarketSettingsCache.delete(storeId);
  queryClient.invalidateQueries({ queryKey: [`global-market-settings-${storeId}`] });
}

// Fonction pour mettre à jour le cache global
export function updateGlobalMarketSettings(storeId: string, settings: MarketSettings) {
  globalMarketSettingsCache.set(storeId, settings);
  queryClient.setQueryData([`global-market-settings-${storeId}`], settings);
}

// Hook pour nettoyer le cache global
export function useGlobalMarketSettingsCleanup() {
  return () => {
    globalMarketSettingsCache.clear();
  };
}
