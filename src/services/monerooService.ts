import axios from 'axios';

const MONEROO_API_KEY = 'pvk_z5adga|01K1BFNPNF7NN3K364C05V03M8';
const MONEROO_API_URL = 'https://api.moneroo.io/v1';

// Fonction utilitaire pour convertir les montants CFA vers le format Moneroo
export const convertToMonerooAmount = (amountInCFA: number): number => {
  // Moneroo semble automatiquement multiplier par 100
  // Solution: Diviser par 100 pour compenser
  // Ex: 2500 CFA → 25 → 2500 FCFA affiché
  return Math.round(amountInCFA / 100);
};

// Fonction utilitaire pour afficher le montant correctement
export const formatMonerooAmount = (amountInCentimes: number): string => {
  // Convertir les centimes en CFA pour l'affichage
  const amountInCFA = amountInCentimes / 100;
  return `${amountInCFA.toFixed(0)} CFA`;
};

export interface MonerooPaymentData {
  amount: number; // Montant divisé par 100 (ex: 25 pour 2500 CFA) car Moneroo multiplie par 100
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
      const response = await axios.post(`${MONEROO_API_URL}/payments/initialize`, paymentData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MONEROO_API_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (response.status !== 201) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return response.data;
    } catch (error: any) {
      console.error('Erreur Moneroo:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Erreur lors de l\'initialisation du paiement');
      }
      throw error;
    }
  }

  static async verifyPayment(paymentId: string): Promise<any> {
    try {
      const response = await axios.get(`${MONEROO_API_URL}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${MONEROO_API_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return response.data;
    } catch (error: any) {
      console.error('Erreur vérification Moneroo:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Erreur lors de la vérification du paiement');
      }
      throw error;
    }
  }
} 