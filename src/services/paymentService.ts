import { supabase } from '@/integrations/supabase/client';

// Types pour les paiements
export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isEnabled: boolean;
  isConfigured: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  storeId: string;
  customerEmail: string;
  customerName: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  redirectUrl?: string;
  error?: string;
  provider?: string;
}

export interface PaymentVerification {
  success: boolean;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount?: number;
  currency?: string;
  error?: string;
}

// Service de paiement principal
export class PaymentService {
  private static async getPaymentConfiguration(storeId: string) {
    const { data, error } = await supabase
      .from('payment_configurations')
      .select('*')
      .eq('store_id', storeId)
      .single();

    if (error) {
      console.error('Erreur récupération config paiement:', error);
      return null;
    }

    return data;
  }

  private static getEnabledProviders(config: any): PaymentMethod[] {
    const providers: PaymentMethod[] = [];
    
    // Stripe
    if (config.stripe_enabled && config.stripe_api_key) {
      providers.push({
        id: 'stripe',
        name: 'Stripe',
        description: 'Carte bancaire, Apple Pay, Google Pay',
        icon: '💳',
        color: 'bg-blue-500',
        isEnabled: true,
        isConfigured: true
      });
    }

    // PayPal
    if (config.paypal_enabled && config.paypal_api_key) {
      providers.push({
        id: 'paypal',
        name: 'PayPal',
        description: 'Paiement sécurisé via PayPal',
        icon: '🔵',
        color: 'bg-blue-600',
        isEnabled: true,
        isConfigured: true
      });
    }

    // Moneroo
    if (config.moneroo_enabled && config.moneroo_api_key) {
      providers.push({
        id: 'moneroo',
        name: 'Moneroo',
        description: 'Paiement mobile Afrique de l\'Ouest',
        icon: '📱',
        color: 'bg-green-500',
        isEnabled: true,
        isConfigured: true
      });
    }


    return providers;
  }

  // Récupérer les méthodes de paiement disponibles pour une boutique
  static async getAvailablePaymentMethods(storeId: string): Promise<PaymentMethod[]> {
    const config = await this.getPaymentConfiguration(storeId);
    
    if (!config) {
      return [];
    }

    return this.getEnabledProviders(config);
  }

  // Vérifier si une boutique a des moyens de paiement configurés
  static async hasPaymentMethods(storeId: string): Promise<boolean> {
    const methods = await this.getAvailablePaymentMethods(storeId);
    return methods.length > 0;
  }

  // Initialiser un paiement
  static async initializePayment(
    request: PaymentRequest,
    providerId: string
  ): Promise<PaymentResponse> {
    const config = await this.getPaymentConfiguration(request.storeId);
    
    if (!config) {
      return {
        success: false,
        error: 'Configuration de paiement non trouvée'
      };
    }

    // Vérifier que le fournisseur est configuré et activé
    const isEnabled = config[`${providerId}_enabled`];
    const apiKey = config[`${providerId}_api_key`];
    
    if (!isEnabled || !apiKey) {
      return {
        success: false,
        error: `Le fournisseur ${providerId} n'est pas configuré ou activé`
      };
    }

    try {
      switch (providerId) {
        case 'stripe':
          return await this.initializeStripePayment(request, config);
        case 'paypal':
          return await this.initializePayPalPayment(request, config);
        case 'moneroo':
          return await this.initializeMonerooPayment(request, config);
        case 'googlepay':
          return await this.initializeGooglePayPayment(request, config);
        case 'applepay':
          return await this.initializeApplePayPayment(request, config);
        default:
          return {
            success: false,
            error: `Fournisseur de paiement ${providerId} non supporté`
          };
      }
    } catch (error) {
      console.error(`Erreur initialisation paiement ${providerId}:`, error);
      return {
        success: false,
        error: `Erreur lors de l'initialisation du paiement: ${error}`
      };
    }
  }

  // Vérifier le statut d'un paiement
  static async verifyPayment(
    paymentId: string,
    providerId: string,
    storeId: string
  ): Promise<PaymentVerification> {
    const config = await this.getPaymentConfiguration(storeId);
    
    if (!config) {
      return {
        success: false,
        status: 'failed',
        error: 'Configuration de paiement non trouvée'
      };
    }

    try {
      switch (providerId) {
        case 'stripe':
          return await this.verifyStripePayment(paymentId, config);
        case 'paypal':
          return await this.verifyPayPalPayment(paymentId, config);
        case 'moneroo':
          return await this.verifyMonerooPayment(paymentId, config);
        case 'googlepay':
          return await this.verifyStripePayment(paymentId, config); // Utilise Stripe
        case 'applepay':
          return await this.verifyStripePayment(paymentId, config); // Utilise Stripe
        default:
          return {
            success: false,
            status: 'failed',
            error: `Fournisseur de paiement ${providerId} non supporté`
          };
      }
    } catch (error) {
      console.error(`Erreur vérification paiement ${providerId}:`, error);
      return {
        success: false,
        status: 'failed',
        error: `Erreur lors de la vérification: ${error}`
      };
    }
  }

  // Implémentations spécifiques aux fournisseurs
  private static async initializeStripePayment(request: PaymentRequest, config: any): Promise<PaymentResponse> {
    // TODO: Implémenter l'intégration Stripe
    // Pour l'instant, simulation
    return {
      success: true,
      paymentId: `stripe_${Date.now()}`,
      redirectUrl: `https://checkout.stripe.com/pay/${Date.now()}`,
      provider: 'stripe'
    };
  }

  private static async initializePayPalPayment(request: PaymentRequest, config: any): Promise<PaymentResponse> {
    // TODO: Implémenter l'intégration PayPal
    return {
      success: true,
      paymentId: `paypal_${Date.now()}`,
      redirectUrl: `https://www.paypal.com/checkoutnow/${Date.now()}`,
      provider: 'paypal'
    };
  }

  private static async initializeMonerooPayment(request: PaymentRequest, config: any): Promise<PaymentResponse> {
    // TODO: Implémenter l'intégration Moneroo
    return {
      success: true,
      paymentId: `moneroo_${Date.now()}`,
      redirectUrl: `https://moneroo.com/pay/${Date.now()}`,
      provider: 'moneroo'
    };
  }

  private static async initializeGooglePayPayment(request: PaymentRequest, config: any): Promise<PaymentResponse> {
    // Google Pay utilise Stripe en arrière-plan
    return await this.initializeStripePayment(request, config);
  }

  private static async initializeApplePayPayment(request: PaymentRequest, config: any): Promise<PaymentResponse> {
    // Apple Pay utilise Stripe en arrière-plan
    return await this.initializeStripePayment(request, config);
  }

  private static async verifyStripePayment(paymentId: string, config: any): Promise<PaymentVerification> {
    // TODO: Implémenter la vérification Stripe
    return {
      success: true,
      status: 'completed',
      amount: 1000,
      currency: 'EUR'
    };
  }

  private static async verifyPayPalPayment(paymentId: string, config: any): Promise<PaymentVerification> {
    // TODO: Implémenter la vérification PayPal
    return {
      success: true,
      status: 'completed',
      amount: 1000,
      currency: 'EUR'
    };
  }

  private static async verifyMonerooPayment(paymentId: string, config: any): Promise<PaymentVerification> {
    // TODO: Implémenter la vérification Moneroo
    return {
      success: true,
      status: 'completed',
      amount: 1000,
      currency: 'XOF'
    };
  }

  // Obtenir le message d'erreur pour les boutiques sans moyens de paiement
  static getNoPaymentMethodsMessage(): string {
    return "Aucun moyen de paiement n'est configuré pour cette boutique. Veuillez contacter le propriétaire de la boutique pour configurer les paiements.";
  }

  // Obtenir le message d'erreur pour les problèmes de fournisseur
  static getProviderErrorMessage(providerName: string): string {
    return `Un problème a été détecté avec votre compte ${providerName}. Veuillez contacter votre fournisseur de paiement pour résoudre ce problème.`;
  }
}
