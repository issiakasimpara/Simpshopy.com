// Types pour le système d'onboarding et multi-devises

export interface UserOnboarding {
  id: string;
  user_id: string;
  experience_level: 'beginner' | 'experienced';
  business_type: 'digital_products' | 'online_services' | 'free_choice';
  country_code: string;
  currency_code: string;
  onboarding_completed: boolean;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export interface SupportedCurrency {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  is_active: boolean;
  exchange_rate_to_usd: number;
  last_updated: string;
}

export interface SupportedCountry {
  code: string;
  name: string;
  flag_emoji: string;
  default_currency: string;
  is_active: boolean;
  created_at: string;
}

export interface CountryCurrency {
  id: string;
  country_code: string;
  currency_code: string;
  is_primary: boolean;
  created_at: string;
}

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  component: string;
  isCompleted: boolean;
}

export interface OnboardingData {
  experience_level: 'beginner' | 'experienced';
  business_type: 'digital_products' | 'online_services' | 'free_choice';
  country_code: string;
  currency_code: string;
}

// Types pour les composants d'onboarding
export interface ExperienceLevelOption {
  id: 'beginner' | 'experienced';
  title: string;
  description: string;
  icon: string;
  emoji: string;
}

export interface BusinessTypeOption {
  id: 'digital_products' | 'online_services' | 'free_choice';
  title: string;
  description: string;
  icon: string;
}

export interface CountryOption {
  code: string;
  name: string;
  flag_emoji: string;
  default_currency: string;
}

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  is_primary: boolean;
}

// Configuration des étapes d'onboarding
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: "Expérience en ligne",
    description: "Parlez-nous de votre niveau d'expérience",
    component: "ExperienceLevel",
    isCompleted: false
  },
  {
    id: 2,
    title: "Type de business",
    description: "Que proposerez-vous ?",
    component: "BusinessType",
    isCompleted: false
  },
  {
    id: 3,
    title: "Localisation",
    description: "Où êtes-vous basé ?",
    component: "LocationSetup",
    isCompleted: false
  }
];

// Options pour le niveau d'expérience
export const EXPERIENCE_LEVEL_OPTIONS: ExperienceLevelOption[] = [
  {
    id: 'beginner',
    title: 'Je suis débutant',
    description: 'Je découvre le e-commerce',
    icon: '😊',
    emoji: '😊'
  },
  {
    id: 'experienced',
    title: 'Je suis expérimenté',
    description: 'J\'ai déjà vendu en ligne',
    icon: '🤓',
    emoji: '🤓'
  }
];

// Options pour le type de business
export const BUSINESS_TYPE_OPTIONS: BusinessTypeOption[] = [
  {
    id: 'digital_products',
    title: 'Produits digitaux',
    description: 'Vendez facilement vos contenus numériques : e-books, cours en ligne, modèles et fichiers téléchargeables.',
    icon: '📁'
  },
  {
    id: 'online_services',
    title: 'Services en ligne',
    description: 'Proposez vos compétences sous forme de prestations personnalisées.',
    icon: '📅'
  },
  {
    id: 'free_choice',
    title: 'Libre choix',
    description: 'Prenez le temps de choisir et ajoutez différents types de produits au moment qui vous convient. Pas de stress !',
    icon: '⏳'
  }
];
