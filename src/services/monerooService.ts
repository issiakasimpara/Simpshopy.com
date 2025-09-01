import { supabase } from '@/integrations/supabase/client';

// Constantes
const MONEROO_API_URL = 'https://api.moneroo.com/v1';

// Fonction pour convertir un montant en centimes (format Moneroo)
export const convertToMonerooAmount = (amount: number): number => {
  return Math.round(amount * 100);
};

// Fonction pour formater un montant Moneroo
export const formatMonerooAmount = (amount: number): string => {
  return (amount / 100).toFixed(2);
};

// Interface pour les données de paiement Moneroo
export interface MonerooPaymentData {
  amount: number;
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
}

// Interface pour la réponse de paiement Moneroo
export interface MonerooPaymentResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    checkout_url: string;
  };
}

// Nouveau service Moneroo utilisant l'Edge Function
export class MonerooService {
  private static isInitializing = false;

  // Vérifier si Moneroo est configuré pour une boutique (via Edge Function)
  static async isConfigured(storeId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/payment-gateway/check-configuration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey
        },
        body: JSON.stringify({
          provider: 'moneroo',
          storeId: storeId
        })
      });

      if (!response.ok) {
        console.error('Error checking Moneroo configuration:', response.status);
        return false;
      }

      const result = await response.json();
      return result.isConfigured === true;
    } catch (error) {
      console.error('Error checking Moneroo configuration:', error);
      return false;
    }
  }

  // Initialiser un paiement Moneroo (via Edge Function)
  static async initializePayment(paymentData: MonerooPaymentData & { storeId: string }): Promise<MonerooPaymentResponse> {
    // Éviter les appels multiples
    if (this.isInitializing) {
      console.log('⏳ Paiement Moneroo déjà en cours d\'initialisation...');
      throw new Error('Paiement déjà en cours d\'initialisation');
    }

    this.isInitializing = true;

    try {
      console.log('🚀 Initialisation paiement Moneroo via Edge Function...');
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/payment-gateway/initialize-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey
        },
        body: JSON.stringify({
          provider: 'moneroo',
          storeId: paymentData.storeId,
          paymentData: {
            amount: paymentData.amount,
            currency: paymentData.currency,
            description: paymentData.description,
            return_url: paymentData.return_url,
            customer: paymentData.customer,
            metadata: paymentData.metadata,
            methods: paymentData.methods
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'initialisation du paiement');
      }

      console.log('✅ Paiement Moneroo initialisé avec succès via Edge Function');
      return {
        success: true,
        message: result.message || 'Paiement initialisé avec succès',
        data: result.data
      };

    } catch (error: any) {
      console.error('❌ Erreur Moneroo via Edge Function:', error);
      
      // Gestion spécifique de l'erreur 429 (limite API dépassée)
      if (error.message?.includes('429')) {
        throw new Error('Limite de requêtes API dépassée. Veuillez attendre 10-15 minutes avant de réessayer.');
      }
      
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  // Vérifier un paiement Moneroo (via Edge Function)
  static async verifyPayment(paymentId: string, storeId: string): Promise<any> {
    try {
      console.log('🔍 Vérification paiement Moneroo via Edge Function...');
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/payment-gateway/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey
        },
        body: JSON.stringify({
          provider: 'moneroo',
          storeId: storeId,
          paymentId: paymentId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la vérification du paiement');
      }

      console.log('✅ Paiement Moneroo vérifié avec succès via Edge Function');
      return result.data;

    } catch (error: any) {
      console.error('Erreur vérification Moneroo via Edge Function:', error);
      
      // Gestion spécifique de l'erreur 429 (limite API dépassée)
      if (error.message?.includes('429')) {
        throw new Error('Limite de requêtes API dépassée. Veuillez attendre 10-15 minutes avant de réessayer.');
      }
      
      throw error;
    }
  }
} 