import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types pour les configurations de paiement
export interface PaymentConfiguration {
  id: string;
  store_id: string;
  
  // Stripe
  stripe_enabled: boolean;
  stripe_test_mode: boolean;
  stripe_api_key: string | null;
  stripe_secret_key: string | null;
  stripe_webhook_url: string | null;
  
  // PayPal
  paypal_enabled: boolean;
  paypal_test_mode: boolean;
  paypal_api_key: string | null;
  paypal_secret_key: string | null;
  paypal_webhook_url: string | null;
  
  // Moneroo
  moneroo_enabled: boolean;
  moneroo_test_mode: boolean;
  moneroo_api_key: string | null;
  moneroo_secret_key: string | null;
  moneroo_webhook_url: string | null;
  
  // Google Pay
  googlepay_enabled: boolean;
  googlepay_test_mode: boolean;
  googlepay_api_key: string | null;
  googlepay_webhook_url: string | null;
  
  // Apple Pay
  applepay_enabled: boolean;
  applepay_test_mode: boolean;
  applepay_api_key: string | null;
  applepay_webhook_url: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface PaymentProviderConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isEnabled: boolean;
  isConfigured: boolean;
  isTestMode: boolean;
  apiKey: string;
  secretKey?: string;
  webhookUrl?: string;
  supportedCurrencies: string[];
  fees?: string;
  setupUrl?: string;
}

export const PAYMENT_PROVIDERS: Omit<PaymentProviderConfig, 'isEnabled' | 'isConfigured' | 'isTestMode' | 'apiKey' | 'secretKey' | 'webhookUrl'>[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Paiements par carte bancaire, Apple Pay, Google Pay',
    icon: '💳',
    color: 'bg-blue-500',
    supportedCurrencies: ['EUR', 'USD', 'GBP', 'XOF'],
    fees: '2.9% + 0.30€ par transaction',
    setupUrl: 'https://dashboard.stripe.com/apikeys'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Paiements sécurisés via PayPal',
    icon: '🔵',
    color: 'bg-blue-600',
    supportedCurrencies: ['EUR', 'USD', 'GBP'],
    fees: '3.4% + 0.35€ par transaction',
    setupUrl: 'https://developer.paypal.com/dashboard/'
  },
  {
    id: 'moneroo',
    name: 'Moneroo',
    description: 'Paiements mobiles en Afrique de l\'Ouest',
    icon: '📱',
    color: 'bg-green-500',
    supportedCurrencies: ['XOF', 'XAF', 'NGN'],
    fees: '1.5% par transaction',
    setupUrl: 'https://dashboard.moneroo.com/'
  },
  {
    id: 'googlepay',
    name: 'Google Pay',
    description: 'Paiements rapides via Google Pay',
    icon: '🤖',
    color: 'bg-gray-800',
    supportedCurrencies: ['EUR', 'USD', 'GBP'],
    fees: 'Intégré avec Stripe',
    setupUrl: 'https://developers.google.com/pay/api'
  },
  {
    id: 'applepay',
    name: 'Apple Pay',
    description: 'Paiements sécurisés via Apple Pay',
    icon: '🍎',
    color: 'bg-black',
    supportedCurrencies: ['EUR', 'USD', 'GBP'],
    fees: 'Intégré avec Stripe',
    setupUrl: 'https://developer.apple.com/apple-pay/'
  }
];

interface UsePaymentConfigurationsReturn {
  configuration: PaymentConfiguration | null;
  providers: PaymentProviderConfig[];
  loading: boolean;
  saving: boolean;
  testing: string | null;
  configuredProviders: PaymentProviderConfig[];
  enabledProviders: PaymentProviderConfig[];
  loadConfiguration: () => Promise<void>;
  saveConfiguration: (providerId: string, config: Partial<PaymentProviderConfig>) => Promise<void>;
  testProvider: (providerId: string) => Promise<void>;
  toggleProvider: (providerId: string, enabled: boolean) => Promise<void>;
  updateProvider: (providerId: string, updates: Partial<PaymentProviderConfig>) => void;
}

export const usePaymentConfigurations = (storeId: string | undefined): UsePaymentConfigurationsReturn => {
  const [configuration, setConfiguration] = useState<PaymentConfiguration | null>(null);
  const [providers, setProviders] = useState<PaymentProviderConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialiser les providers avec les données par défaut
  useEffect(() => {
    if (providers.length === 0) {
      setProviders(PAYMENT_PROVIDERS.map(provider => ({
        ...provider,
        isEnabled: false,
        isConfigured: false,
        isTestMode: true,
        apiKey: '',
        secretKey: undefined,
        webhookUrl: undefined
      })));
    }
  }, [providers.length]);

  // Convertir la configuration en providers
  const convertConfigToProviders = useCallback((config: PaymentConfiguration | null): PaymentProviderConfig[] => {
    return PAYMENT_PROVIDERS.map(provider => {
      const isEnabled = config?.[`${provider.id}_enabled` as keyof PaymentConfiguration] as boolean || false;
      const isTestMode = config?.[`${provider.id}_test_mode` as keyof PaymentConfiguration] as boolean !== false;
      const apiKey = config?.[`${provider.id}_api_key` as keyof PaymentConfiguration] as string || '';
      const secretKey = config?.[`${provider.id}_secret_key` as keyof PaymentConfiguration] as string || '';
      const webhookUrl = config?.[`${provider.id}_webhook_url` as keyof PaymentConfiguration] as string || '';

      return {
        ...provider,
        isEnabled,
        isConfigured: !!(apiKey || secretKey),
        isTestMode,
        apiKey,
        secretKey: secretKey || undefined,
        webhookUrl: webhookUrl || undefined
      };
    });
  }, []);

  // Charger la configuration
  const loadConfiguration = useCallback(async () => {
    if (!storeId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_configurations')
        .select('*')
        .eq('store_id', storeId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur chargement config paiement:', error);
        return;
      }

      setConfiguration(data);
      setProviders(convertConfigToProviders(data));
    } catch (error) {
      console.error('Erreur chargement config:', error);
    } finally {
      setLoading(false);
    }
  }, [storeId, convertConfigToProviders]);

  // Sauvegarder la configuration
  const saveConfiguration = useCallback(async (providerId: string, config: Partial<PaymentProviderConfig>) => {
    if (!storeId) {
      console.error('❌ saveConfiguration: storeId manquant');
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Sauvegarde configuration:', { providerId, storeId, config });

      const updateData: any = {
        store_id: storeId,
        [`${providerId}_enabled`]: config.isEnabled,
        [`${providerId}_test_mode`]: config.isTestMode,
        [`${providerId}_api_key`]: config.apiKey,
        [`${providerId}_webhook_url`]: config.webhookUrl,
        updated_at: new Date().toISOString()
      };

      // Ajouter la clé secrète si elle existe
      if (config.secretKey !== undefined) {
        updateData[`${providerId}_secret_key`] = config.secretKey;
      }

      console.log('📤 Données à envoyer:', updateData);

      // Vérifier d'abord si une configuration existe déjà
      const { data: existingConfig, error: checkError } = await supabase
        .from('payment_configurations')
        .select('id')
        .eq('store_id', storeId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Erreur vérification config existante:', checkError);
        throw checkError;
      }

      let result;
      if (existingConfig) {
        // Mise à jour
        console.log('🔄 Mise à jour configuration existante');
        result = await supabase
          .from('payment_configurations')
          .update(updateData)
          .eq('store_id', storeId);
      } else {
        // Insertion
        console.log('➕ Création nouvelle configuration');
        result = await supabase
          .from('payment_configurations')
          .insert(updateData);
      }

      if (result.error) {
        console.error('❌ Erreur sauvegarde:', result.error);
        throw result.error;
      }

      console.log('✅ Configuration sauvegardée avec succès');

      toast({
        title: "Configuration sauvegardée",
        description: `${config.name} a été configuré avec succès.`,
      });

      // Recharger la configuration
      await loadConfiguration();

    } catch (error: any) {
      console.error('❌ Erreur sauvegarde config:', error);
      
      // Gestion spécifique des erreurs
      let errorMessage = "Impossible de sauvegarder la configuration.";
      
      if (error.code === '409') {
        errorMessage = "Une configuration existe déjà pour cette boutique. Veuillez réessayer.";
      } else if (error.code === '42501') {
        errorMessage = "Permission refusée. Vérifiez vos droits d'accès.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [storeId, loadConfiguration, toast]);

  // Tester un fournisseur
  const testProvider = useCallback(async (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider || !provider.apiKey) return;

    setTesting(providerId);
    try {
      // Simulation de test - à remplacer par de vrais appels API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Test réussi",
        description: `${provider.name} est correctement configuré.`,
      });
    } catch (error) {
      toast({
        title: "Test échoué",
        description: "Vérifiez vos clés API et réessayez.",
        variant: "destructive"
      });
    } finally {
      setTesting(null);
    }
  }, [providers, toast]);

  // Activer/désactiver un fournisseur
  const toggleProvider = useCallback(async (providerId: string, enabled: boolean) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return;

    if (enabled && !provider.isConfigured) {
      toast({
        title: "Configuration requise",
        description: "Configurez d'abord les clés API avant d'activer ce fournisseur.",
        variant: "destructive"
      });
      return;
    }

    await saveConfiguration(providerId, { ...provider, isEnabled: enabled });
  }, [providers, saveConfiguration, toast]);

  // Mettre à jour un provider localement
  const updateProvider = useCallback((providerId: string, updates: Partial<PaymentProviderConfig>) => {
    setProviders(prev => prev.map(p => 
      p.id === providerId ? { ...p, ...updates } : p
    ));
  }, []);

  // Charger la configuration au montage et quand storeId change
  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  // Calculer les statistiques
  const configuredProviders: PaymentProviderConfig[] = providers.filter(p => p.isConfigured);
  const enabledProviders: PaymentProviderConfig[] = providers.filter(p => p.isEnabled);

  return {
    configuration,
    providers,
    loading,
    saving,
    testing,
    configuredProviders,
    enabledProviders,
    loadConfiguration,
    saveConfiguration,
    testProvider,
    toggleProvider,
    updateProvider
  };
};
