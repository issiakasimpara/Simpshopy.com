import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { StoreCurrencyService, type StoreCurrencySettings } from '@/services/storeCurrencyService';
import { formatCurrency, type Currency } from '@/utils/formatCurrency';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

// Canal global partagé pour éviter les souscriptions multiples
let globalChannel: any = null;
let globalStoreId: string | null = null;
let subscribers = new Set<() => void>();

const setupGlobalChannel = (storeId: string) => {
  // Si le canal existe déjà pour ce store, ne rien faire
  if (globalChannel && globalStoreId === storeId) {
    return;
  }

  // Nettoyer le canal existant
  if (globalChannel) {
    console.log('🔕 Nettoyage du canal global existant');
    supabase.removeChannel(globalChannel);
    globalChannel = null;
    globalStoreId = null;
  }

  console.log('🔔 Configuration du canal global pour le store:', storeId);

  globalChannel = supabase
    .channel(`store-currency-${storeId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'market_settings',
        filter: `store_id=eq.${storeId}`
      },
      (payload) => {
        console.log('💰 Changement de devise détecté:', payload);
        
        // Notifier tous les abonnés
        subscribers.forEach(callback => callback());
      }
    )
    .subscribe();

  globalStoreId = storeId;
};

const cleanupGlobalChannel = () => {
  if (globalChannel) {
    console.log('🔕 Nettoyage du canal global');
    supabase.removeChannel(globalChannel);
    globalChannel = null;
    globalStoreId = null;
    subscribers.clear();
  }
};

export const useStoreCurrency = (storeId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Vérifier si storeId est valide
  const isValidStoreId = Boolean(storeId && storeId.trim() !== '' && storeId !== 'undefined');

  // Récupérer la devise de la boutique
  const { data: currency, isLoading: isLoadingCurrency, refetch: refetchCurrency } = useQuery({
    queryKey: ['store-currency', storeId],
    queryFn: () => StoreCurrencyService.getStoreCurrency(storeId!),
    enabled: isValidStoreId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Ne pas retenter si la requête échoue
  });

  // Récupérer tous les paramètres de devise
  const { data: currencySettings, isLoading: isLoadingSettings, refetch: refetchSettings } = useQuery({
    queryKey: ['store-currency-settings', storeId],
    queryFn: () => StoreCurrencyService.getStoreCurrencySettings(storeId!),
    enabled: isValidStoreId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Ne pas retenter si la requête échoue
  });

  // Configuration du temps réel pour les changements de devise
  useEffect(() => {
    if (!isValidStoreId) {
      console.log('🔕 Pas de storeId valide, pas de configuration temps réel');
      return;
    }

    // Configurer le canal global
    setupGlobalChannel(storeId!);

    // Fonction de callback pour ce composant
    const handleCurrencyChange = () => {
      console.log('🔄 Rafraîchissement des données de devise pour le composant');
      refetchCurrency();
      refetchSettings();
      
      // Notification optionnelle
      toast({
        title: "Devise mise à jour",
        description: "La devise de votre boutique a été modifiée.",
      });
    };

    // S'abonner aux changements
    subscribers.add(handleCurrencyChange);

    return () => {
      // Se désabonner
      subscribers.delete(handleCurrencyChange);
      
      // Si plus aucun abonné, nettoyer le canal
      if (subscribers.size === 0) {
        cleanupGlobalChannel();
      }
    };
  }, [storeId, isValidStoreId, refetchCurrency, refetchSettings, toast]);

  // Mutation pour mettre à jour la devise
  const updateCurrencyMutation = useMutation({
    mutationFn: async (newCurrency: Currency) => {
      if (!isValidStoreId) throw new Error('Store ID requis');
      return StoreCurrencyService.updateStoreCurrency(storeId!, newCurrency);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-currency'] });
      queryClient.invalidateQueries({ queryKey: ['store-currency-settings'] });
      toast({
        title: "Devise mise à jour",
        description: `La devise de votre boutique a été changée avec succès.`,
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour de la devise:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la devise. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  // Mutation pour mettre à jour les paramètres de devise
  const updateCurrencySettingsMutation = useMutation({
    mutationFn: async (settings: Partial<StoreCurrencySettings>) => {
      if (!isValidStoreId) throw new Error('Store ID requis');
      return StoreCurrencyService.updateStoreCurrencySettings(storeId!, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-currency-settings'] });
      toast({
        title: "Paramètres mis à jour",
        description: `Les paramètres de devise ont été mis à jour avec succès.`,
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  // Fonction pour initialiser la devise d'une boutique
  const initializeCurrency = async (currency: Currency = 'XOF', countries: string[] = ['ML', 'CI', 'SN', 'BF']) => {
    if (!isValidStoreId) throw new Error('Store ID requis');
    return StoreCurrencyService.initializeStoreCurrency(storeId!, currency, countries);
  };

  // Fonction pour obtenir les devises supportées
  const getSupportedCurrencies = () => {
    return [
      // Afrique (25 devises)
      'XOF', 'XAF', 'GHS', 'NGN', 'ZAR', 'EGP', 'KES', 'UGX', 'TZS', 'MAD', 'DZD', 'TND', 'LYD', 'SDG', 'ETB', 'SOS', 'DJF', 'KMF', 'MUR', 'SCR', 'BIF', 'RWF', 'CDF', 'GMD', 'SLL',
      
      // Europe (30 devises)
      'EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'ISK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'RSD', 'ALL', 'MKD', 'BAM', 'MNT', 'GEL', 'AMD', 'AZN', 'BYN', 'MDL', 'UAH', 'RUB', 'TRY', 'ILS', 'JOD', 'LBP', 'SYP',
      
      // Amériques (35 devises)
      'USD', 'CAD', 'BRL', 'MXN', 'ARS', 'CLP', 'COP', 'PEN', 'UYU', 'PYG', 'BOB', 'GTQ', 'HNL', 'NIO', 'CRC', 'PAB', 'BBD', 'JMD', 'TTD', 'XCD', 'AWG', 'ANG', 'SRD', 'GYD', 'VEF', 'ECU', 'BZD', 'HTG', 'DOP', 'CUP', 'KYD', 'BMD', 'FKP',
      
      // Asie (40 devises)
      'JPY', 'CNY', 'INR', 'KRW', 'SGD', 'HKD', 'TWD', 'THB', 'MYR', 'IDR', 'PHP', 'VND', 'BDT', 'PKR', 'LKR', 'NPR', 'MMK', 'KHR', 'LAK', 'KZT', 'UZS', 'TJS', 'TMM', 'AFN', 'IRR', 'IQD', 'SAR', 'AED', 'QAR', 'KWD', 'BHD', 'OMR', 'YER', 'KGS', 'TMT',
      
      // Océanie (10 devises)
      'AUD', 'NZD', 'FJD', 'PGK', 'SBD', 'TOP', 'VUV', 'WST', 'KID', 'TVD',
      
      // Devises spéciales et crypto
      'XDR', 'XAU', 'XAG', 'BTC', 'ETH', 'USDT', 'USDC'
    ] as const;
  };

  // Fonction pour formater un prix
  const formatPrice = (amount: number, options?: { showSymbol?: boolean; showCode?: boolean }) => {
    // Si pas de storeId valide ou pas de devise récupérée, utiliser XOF par défaut
    const currentCurrency = (isValidStoreId && currency) ? currency : 'XOF';
    return formatCurrency(amount, currentCurrency, options);
  };

  // Fonction pour convertir et formater un prix (pour les montants stockés en XOF)
  const formatConvertedPrice = (amount: number, originalCurrency: Currency = 'XOF', options?: { showSymbol?: boolean; showCode?: boolean }) => {
    // Si pas de storeId valide ou pas de devise récupérée, utiliser XOF par défaut
    const currentCurrency = (isValidStoreId && currency) ? currency : 'XOF';
    
    // Si la devise actuelle est la même que la devise d'origine, pas de conversion nécessaire
    if (currentCurrency === originalCurrency) {
      return formatCurrency(amount, currentCurrency, options);
    }

    // Pour l'instant, on suppose que les montants sont stockés en XOF
    // Dans une vraie application, il faudrait stocker la devise d'origine avec chaque montant
    // Pour l'instant, on utilise un taux fixe pour la démonstration
    let convertedAmount = amount;
    
    if (originalCurrency === 'XOF' && currentCurrency === 'EUR') {
      convertedAmount = amount * 0.00152; // Taux approximatif XOF vers EUR
    } else if (originalCurrency === 'XOF' && currentCurrency === 'USD') {
      convertedAmount = amount * 0.00166; // Taux approximatif XOF vers USD
    } else if (originalCurrency === 'XOF' && currentCurrency === 'GBP') {
      convertedAmount = amount * 0.00130; // Taux approximatif XOF vers GBP
    }
    // Ajouter d'autres conversions selon les besoins
    
    return formatCurrency(convertedAmount, currentCurrency, options);
  };

  // Fonction pour mettre à jour la devise
  const updateCurrency = async (newCurrency: Currency) => {
    return updateCurrencyMutation.mutateAsync(newCurrency);
  };

  // Fonction pour mettre à jour les paramètres
  const updateCurrencySettings = async (settings: Partial<StoreCurrencySettings>) => {
    return updateCurrencySettingsMutation.mutateAsync(settings);
  };

  return {
    currency: (isValidStoreId && currency) ? currency : 'XOF',
    currencySettings,
    isLoading: isValidStoreId && (isLoadingCurrency || isLoadingSettings),
    isUpdating: updateCurrencyMutation.isPending || updateCurrencySettingsMutation.isPending,
    updateCurrency,
    updateCurrencySettings,
    initializeCurrency,
    getSupportedCurrencies,
    formatPrice,
    formatConvertedPrice,
    refetchCurrency,
    refetchSettings,
  };
};
