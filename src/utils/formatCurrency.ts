/**
 * Utilitaires pour formater les devises africaines
 */

export type Currency = 'XOF' | 'XAF' | 'GHS' | 'NGN' | 'EUR' | 'USD';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  XOF: {
    code: 'XOF',
    symbol: 'CFA',
    name: 'Franc CFA (BCEAO)',
    locale: 'fr-ML',
    decimals: 0
  },
  XAF: {
    code: 'XAF', 
    symbol: 'FCFA',
    name: 'Franc CFA (BEAC)',
    locale: 'fr-CM',
    decimals: 0
  },
  GHS: {
    code: 'GHS',
    symbol: '₵',
    name: 'Cedi ghanéen',
    locale: 'en-GH',
    decimals: 2
  },
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Naira nigérian',
    locale: 'en-NG',
    decimals: 2
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'fr-FR',
    decimals: 2
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Dollar américain',
    locale: 'en-US',
    decimals: 2
  }
};

/**
 * Formate un montant selon la devise spécifiée
 */
export function formatCurrency(
  amount: number, 
  currency: Currency = 'XOF',
  options: {
    showSymbol?: boolean;
    compact?: boolean;
    locale?: string;
  } = {}
): string {
  const config = CURRENCIES[currency];
  const { showSymbol = true, compact = false, locale } = options;
  
  const formatLocale = locale || config.locale;
  
  try {
    if (compact && amount >= 1000000) {
      const millions = amount / 1000000;
      return `${millions.toFixed(1)}M ${showSymbol ? config.symbol : ''}`.trim();
    }
    
    if (compact && amount >= 1000) {
      const thousands = amount / 1000;
      return `${thousands.toFixed(0)}K ${showSymbol ? config.symbol : ''}`.trim();
    }
    
    const formatted = new Intl.NumberFormat(formatLocale, {
      style: 'decimal',
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(amount);
    
    return showSymbol ? `${formatted} ${config.symbol}` : formatted;
    
  } catch (error) {
    // Fallback si la locale n'est pas supportée
    const formatted = amount.toLocaleString('fr-FR', {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    });
    
    return showSymbol ? `${formatted} ${config.symbol}` : formatted;
  }
}

/**
 * Formate spécifiquement pour le franc CFA (devise par défaut)
 */
export function formatCFA(amount: number, compact = false): string {
  return formatCurrency(amount, 'XOF', { compact });
}

/**
 * Parse un montant depuis une chaîne formatée
 */
export function parseCurrency(value: string): number {
  // Supprime tous les caractères non numériques sauf le point et la virgule
  const cleaned = value.replace(/[^\d.,]/g, '');
  
  // Remplace la virgule par un point pour la conversion
  const normalized = cleaned.replace(',', '.');
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Convertit entre devises (taux de change fictifs pour la démo)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  // Taux de change fictifs (en production, utiliser une API de change)
  const rates: Record<Currency, number> = {
    XOF: 1,        // Base: Franc CFA BCEAO
    XAF: 1,        // Parité avec XOF
    EUR: 0.0015,   // 1 EUR ≈ 655 XOF
    USD: 0.0016,   // 1 USD ≈ 620 XOF
    GHS: 0.0095,   // 1 GHS ≈ 105 XOF
    NGN: 0.0013,   // 1 NGN ≈ 770 XOF
  };
  
  if (fromCurrency === toCurrency) return amount;
  
  // Convertir vers XOF puis vers la devise cible
  const inXOF = fromCurrency === 'XOF' ? amount : amount / rates[fromCurrency];
  const result = toCurrency === 'XOF' ? inXOF : inXOF * rates[toCurrency];
  
  return Math.round(result * 100) / 100;
}

/**
 * Obtient la liste des devises supportées pour un pays
 */
export function getCurrenciesForCountry(countryCode: string): Currency[] {
  const countryToCurrencies: Record<string, Currency[]> = {
    'ML': ['XOF'], // Mali
    'SN': ['XOF'], // Sénégal
    'CI': ['XOF'], // Côte d'Ivoire
    'BF': ['XOF'], // Burkina Faso
    'NE': ['XOF'], // Niger
    'TG': ['XOF'], // Togo
    'BJ': ['XOF'], // Bénin
    'GW': ['XOF'], // Guinée-Bissau
    'CM': ['XAF'], // Cameroun
    'GA': ['XAF'], // Gabon
    'CF': ['XAF'], // République centrafricaine
    'TD': ['XAF'], // Tchad
    'CG': ['XAF'], // Congo
    'GQ': ['XAF'], // Guinée équatoriale
    'GH': ['GHS'], // Ghana
    'NG': ['NGN'], // Nigeria
  };
  
  return countryToCurrencies[countryCode] || ['XOF', 'EUR', 'USD'];
}
