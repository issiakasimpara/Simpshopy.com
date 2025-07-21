/**
 * Configuration globale de l'application Simpshopy
 */

export const APP_CONFIG = {
  // Informations de base
  name: 'Simpshopy',
  tagline: 'Votre boutique en ligne simple et efficace',
  description: 'La plateforme e-commerce adaptée à l\'Afrique qui vous aide à vendre en ligne facilement.',
  
  // URLs et domaines
  domain: 'simpshopy.com',
  website: 'https://simpshopy.com',
  supportEmail: 'support@simpshopy.com',
  salesEmail: 'ventes@simpshopy.com',
  
  // Réseaux sociaux
  social: {
    facebook: 'https://facebook.com/simpshopy',
    twitter: 'https://twitter.com/simpshopy',
    instagram: 'https://instagram.com/simpshopy',
    linkedin: 'https://linkedin.com/company/simpshopy',
    youtube: 'https://youtube.com/@simpshopy'
  },
  
  // Configuration régionale
  region: {
    primary: 'West Africa',
    countries: ['ML', 'SN', 'CI', 'BF', 'NE', 'TG', 'BJ', 'GW'],
    defaultCurrency: 'XOF',
    defaultLocale: 'fr-ML',
    timezone: 'Africa/Bamako'
  },
  
  // Tarification (en francs CFA)
  pricing: {
    starter: {
      name: 'Starter',
      price: 15000,
      currency: 'XOF',
      period: 'mois',
      description: 'Parfait pour débuter',
      features: [
        '100 produits inclus',
        'Boutique responsive',
        'Support email',
        'SSL & sécurité',
        'Templates premium',
        'Paiement mobile money'
      ]
    },
    business: {
      name: 'Business',
      price: 35000,
      currency: 'XOF',
      period: 'mois',
      description: 'Pour la croissance',
      features: [
        'Produits illimités',
        'Analytics avancées',
        'Support prioritaire',
        'API personnalisée',
        'Multi-devises',
        'Abandon cart recovery',
        'Intégration Orange Money/MTN'
      ],
      popular: true
    },
    enterprise: {
      name: 'Enterprise',
      price: 85000,
      currency: 'XOF',
      period: 'mois',
      description: 'Performance maximale',
      features: [
        'Tout Business +',
        'Manager dédié',
        'Infrastructure dédiée',
        'SLA 99.99%',
        'Formation équipe',
        'White-label complet',
        'Intégration bancaire complète'
      ]
    }
  },
  
  // Moyens de paiement supportés
  paymentMethods: {
    mobileMoney: [
      {
        name: 'Orange Money',
        countries: ['ML', 'SN', 'CI', 'BF'],
        icon: '🟠'
      },
      {
        name: 'MTN Mobile Money',
        countries: ['GH', 'CI', 'CM', 'UG'],
        icon: '🟡'
      },
      {
        name: 'Moov Money',
        countries: ['BJ', 'TG', 'CI', 'ML'],
        icon: '🔵'
      }
    ],
    traditional: [
      {
        name: 'Virements bancaires',
        countries: ['ALL'],
        icon: '🏦'
      },
      {
        name: 'Cartes Visa/Mastercard',
        countries: ['ALL'],
        icon: '💳'
      },
      {
        name: 'Paiement à la livraison',
        countries: ['URBAN'],
        icon: '💵'
      }
    ]
  },
  
  // Fonctionnalités
  features: {
    core: [
      {
        title: 'Boutique en ligne simple',
        description: 'Créez votre boutique en quelques clics avec des templates adaptés au marché africain',
        icon: 'store'
      },
      {
        title: 'Gestion produits intuitive',
        description: 'Ajoutez vos produits facilement, gérez vos stocks et organisez vos catégories',
        icon: 'shopping-cart'
      },
      {
        title: 'Suivi des ventes',
        description: 'Tableaux de bord clairs pour suivre vos commandes, revenus et clients',
        icon: 'bar-chart'
      },
      {
        title: 'Paiements locaux',
        description: 'Orange Money, MTN Mobile Money, Moov Money et virements bancaires',
        icon: 'credit-card'
      },
      {
        title: 'Multi-pays Afrique',
        description: 'Vendez dans toute l\'Afrique de l\'Ouest avec support multi-devises',
        icon: 'globe'
      },
      {
        title: 'Rapide et fiable',
        description: 'Sites optimisés pour les connexions mobiles africaines',
        icon: 'zap'
      }
    ]
  },
  
  // Statistiques (pour la page d'accueil)
  stats: {
    stores: '100+',
    revenue: '50M+ CFA',
    customers: '5K+',
    countries: '8'
  },
  
  // Configuration technique
  technical: {
    apiVersion: 'v1',
    maxFileSize: '10MB',
    supportedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxProductsPerStore: {
      starter: 100,
      business: -1, // illimité
      enterprise: -1
    }
  },
  
  // Support et contact
  support: {
    phone: '+223 XX XX XX XX',
    whatsapp: '+223 XX XX XX XX',
    hours: 'Lun-Ven 8h-18h GMT',
    languages: ['français', 'bambara', 'wolof'],
    responseTime: '< 2h'
  }
};

export default APP_CONFIG;
