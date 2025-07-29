const MONEROO_API_KEY = 'pvk_z5adga|01K1BFNPNF7NN3K364C05V03M8';
const MONEROO_API_URL = 'https://api.moneroo.io/v1';

export interface MonerooPaymentData {
  amount: number;
  currency: string;
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
  static async initializePayment(paymentData: MonerooPaymentData): Promise<MonerooPaymentResponse> {
    try {
      const response = await fetch(`${MONEROO_API_URL}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MONEROO_API_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de l\'initialisation du paiement');
      }

      return result;
    } catch (error) {
      console.error('Erreur Moneroo:', error);
      throw error;
    }
  }

  static async verifyPayment(paymentId: string): Promise<any> {
    try {
      const response = await fetch(`${MONEROO_API_URL}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MONEROO_API_KEY}`,
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la vérification du paiement');
      }

      return result;
    } catch (error) {
      console.error('Erreur vérification Moneroo:', error);
      throw error;
    }
  }
} 