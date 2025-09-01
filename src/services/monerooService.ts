import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

// Supprimer la clé API hardcodée
// const MONEROO_API_KEY = 'pvk_z5adga|01K1BFNPNF7NN3K364C05V03M8';
const MONEROO_API_URL = 'https://api.moneroo.io/v1';

// Fonction utilitaire pour convertir les montants CFA vers le format Moneroo
export const convertToMonerooAmount = (amountInCFA: number): number => {
  // Selon la documentation Moneroo, pour XOF, le montant est envoyé tel quel
  // Ex: 1500 CFA → 1500 (pas de conversion nécessaire)
  return Math.round(amountInCFA);
};

// Fonction utilitaire pour afficher le montant correctement
export const formatMonerooAmount = (amountInCFA: number): string => {
  // Pour XOF, le montant est déjà en CFA
  return `${Math.round(amountInCFA)} CFA`;
};

// Fonction pour vérifier si Moneroo est configuré pour une boutique
export const isMonerooConfigured = async (storeId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('payment_configurations')
      .select('moneroo_enabled, moneroo_api_key')
      .eq('store_id', storeId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.moneroo_enabled && !!data.moneroo_api_key;
  } catch (error) {
    console.error('Erreur vérification config Moneroo:', error);
    return false;
  }
};

// Fonction pour récupérer la configuration Moneroo d'une boutique
export const getMonerooConfig = async (storeId: string) => {
  try {
    const { data, error } = await supabase
      .from('payment_configurations')
      .select('moneroo_enabled, moneroo_test_mode, moneroo_api_key, moneroo_secret_key')
      .eq('store_id', storeId)
      .single();

    if (error || !data) {
      throw new Error('Configuration Moneroo non trouvée');
    }

    if (!data.moneroo_enabled || !data.moneroo_api_key) {
      throw new Error('Moneroo n\'est pas configuré pour cette boutique');
    }

    return {
      apiKey: data.moneroo_api_key,
      secretKey: data.moneroo_secret_key,
      testMode: data.moneroo_test_mode
    };
  } catch (error) {
    console.error('Erreur récupération config Moneroo:', error);
    throw error;
  }
};

export interface MonerooPaymentData {
  amount: number; // Montant en CFA selon documentation Moneroo
  currency: string; // Devise XOF selon documentation Moneroo
  description: string;
  return_url: string;
  customer: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
  metadata?: Record<string, string>;
  methods?: string[];
  restrict_country_code?: string;
}

export interface MonerooPaymentResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    checkout_url: string;
  };
}

export class MonerooService {
  private static isInitializing = false;

  static async initializePayment(paymentData: MonerooPaymentData & { storeId: string }): Promise<MonerooPaymentResponse> {
    // Éviter les appels multiples
    if (this.isInitializing) {
      console.log('⏳ Paiement Moneroo déjà en cours d\'initialisation...');
      throw new Error('Paiement déjà en cours d\'initialisation');
    }

    this.isInitializing = true;

    try {
      // Vérifier que Moneroo est configuré pour cette boutique
      const isConfigured = await isMonerooConfigured(paymentData.storeId);
      if (!isConfigured) {
        throw new Error('Moneroo n\'est pas configuré pour cette boutique');
      }

      // Récupérer la configuration Moneroo
      const config = await getMonerooConfig(paymentData.storeId);

      console.log('🚀 Initialisation paiement Moneroo...');
      
      const response = await axios.post(`${MONEROO_API_URL}/payments/initialize`, paymentData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 30000 // Timeout de 30 secondes
      });

      console.log('📡 Réponse Moneroo:', response.data);

      // Vérifier si la réponse contient une erreur
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Erreur lors de l\'initialisation du paiement');
      }

      // Si la réponse contient un message de succès, c'est normal
      if (response.data && response.data.message && response.data.message.includes('successfully')) {
        console.log('✅ Paiement Moneroo initialisé avec succès');
        return {
          success: true,
          message: response.data.message,
          data: response.data.data || response.data
        };
      }

      // Vérifier le statut HTTP
      if (response.status !== 201 && response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      console.log('✅ Paiement Moneroo initialisé avec succès');
      return {
        success: true,
        message: 'Paiement initialisé avec succès',
        data: response.data.data || response.data
      };
    } catch (error: any) {
      console.error('❌ Erreur Moneroo:', error);
      
      // Gestion spécifique de l'erreur 429 (limite API dépassée)
      if (error.response?.status === 429) {
        throw new Error('Limite de requêtes API dépassée. Veuillez attendre 10-15 minutes avant de réessayer.');
      }
      
      if (error.response) {
        throw new Error(error.response.data?.message || 'Erreur lors de l\'initialisation du paiement');
      }
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  static async verifyPayment(paymentId: string, storeId: string): Promise<any> {
    try {
      // Vérifier que Moneroo est configuré pour cette boutique
      const isConfigured = await isMonerooConfigured(storeId);
      if (!isConfigured) {
        throw new Error('Moneroo n\'est pas configuré pour cette boutique');
      }

      // Récupérer la configuration Moneroo
      const config = await getMonerooConfig(storeId);

      const response = await axios.get(`${MONEROO_API_URL}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return response.data;
    } catch (error: any) {
      console.error('Erreur vérification Moneroo:', error);
      
      // Gestion spécifique de l'erreur 429 (limite API dépassée)
      if (error.response?.status === 429) {
        throw new Error('Limite de requêtes API dépassée. Veuillez attendre 10-15 minutes avant de réessayer.');
      }
      
      if (error.response) {
        throw new Error(error.response.data?.message || 'Erreur lors de la vérification du paiement');
      }
      throw error;
    }
  }
} 