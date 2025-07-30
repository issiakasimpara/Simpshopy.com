import axios from 'axios';

const MONEROO_API_KEY = 'pvk_z5adga|01K1BFNPNF7NN3K364C05V03M8';
const MONEROO_API_URL = 'https://api.moneroo.io/v1';

// Fonction utilitaire pour convertir les montants CFA vers le format Moneroo
export const convertToMonerooAmount = (amountInCFA: number): number => {
  // Selon la documentation Moneroo, le montant doit être en centimes USD
  // 1 USD ≈ 620 CFA (taux approximatif)
  // Ex: 1500 CFA → 1500/620 ≈ 2.42 USD → 242 centimes
  const usdAmount = amountInCFA / 620; // Conversion CFA vers USD
  const centsAmount = Math.round(usdAmount * 100); // Conversion USD vers centimes
  return centsAmount;
};

// Fonction utilitaire pour afficher le montant correctement
export const formatMonerooAmount = (amountInCentimes: number): string => {
  // Convertir les centimes USD vers CFA pour l'affichage
  const amountInUSD = amountInCentimes / 100;
  const amountInCFA = amountInUSD * 620; // Conversion USD vers CFA
  return `${Math.round(amountInCFA)} CFA`;
};

export interface MonerooPaymentData {
  amount: number; // Montant en centimes USD selon documentation Moneroo
  currency: string; // Devise USD selon documentation Moneroo
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
      
      // Gestion spécifique de l'erreur 429 (limite API dépassée)
      if (error.response?.status === 429) {
        throw new Error('Limite de requêtes API dépassée. Veuillez attendre 10-15 minutes avant de réessayer.');
      }
      
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