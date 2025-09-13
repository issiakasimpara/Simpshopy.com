/**
 * Utilitaires pour la gestion des domaines Simpshopy
 * SYSTÈME SOUS-DOMAINES: Détection automatique du contexte
 */

// 🚀 DÉTECTION AUTOMATIQUE DU CONTEXTE (SOUS-DOMAINE OU PATH)
const getCurrentContext = () => {
  if (typeof window === 'undefined') {
    return { isSubdomain: false, baseDomain: 'localhost:8081', storeSlug: null };
  }

  const hostname = window.location.hostname;
  
  // 🚀 DÉTECTION SOUS-DOMAINE SIMPSHOPY.COM (BOUTIQUES PUBLIQUES UNIQUEMENT)
  if (hostname.includes('simpshopy.com') && !hostname.startsWith('www.') && !hostname.startsWith('admin.')) {
    const subdomain = hostname.split('.')[0];
    if (subdomain !== 'simpshopy') {
      return { 
        isSubdomain: true, 
        baseDomain: hostname, 
        storeSlug: subdomain 
      };
    }
  }
  
  // 🚀 EXCLUSION EXPLICITE DU SOUS-DOMAINE ADMIN
  if (hostname.startsWith('admin.simpshopy.com')) {
    return { 
      isSubdomain: false, 
      baseDomain: hostname, 
      storeSlug: null 
    };
  }
  
  // 🚀 DÉTECTION SOUS-DOMAINE LOCALHOST (DÉVELOPPEMENT)
  if (hostname.includes('localhost') && hostname.split('.').length > 1) {
    const subdomain = hostname.split('.')[0];
    if (subdomain !== 'localhost') {
      return { 
        isSubdomain: true, 
        baseDomain: hostname, 
        storeSlug: subdomain 
      };
    }
  }

  // 🚀 MODE PATH (ANCIEN SYSTÈME)
  return { 
    isSubdomain: false, 
    baseDomain: window.location.host, 
    storeSlug: null 
  };
};

/**
 * Génère un path de boutique à partir du nom
 * TEMPORAIRE: Utilise un système de paths en attendant l'achat du domaine
 * @param storeName - Nom de la boutique
 * @returns Path au format /[nom-boutique]
 */
export function generateStorePath(storeName: string): string {
  if (!storeName) {
    return '/ma-boutique';
  }

  // Nettoyer le nom de la boutique pour créer une URL valide
  const cleanName = storeName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Remplacer les espaces par des tirets
    .replace(/[^a-z0-9-]/g, '')     // Supprimer tous les caractères non alphanumériques sauf les tirets
    .replace(/--+/g, '-')           // Remplacer les tirets multiples par un seul
    .replace(/^-+|-+$/g, '');       // Supprimer les tirets en début et fin

  // S'assurer que le nom n'est pas vide après nettoyage
  const finalName = cleanName || 'ma-boutique';

  return `/${finalName}`;
}

/**
 * Génère un domaine temporaire (pour l'affichage)
 * @param storeName - Nom de la boutique
 * @returns Domaine temporaire pour l'affichage
 */
export function generateSimpshopySubdomain(storeName: string): string {
  const context = getCurrentContext();
  const storeSlug = generateStorePath(storeName).replace('/', '');
  
  if (context.isSubdomain) {
    // 🚀 SOUS-DOMAINE: Retourner le sous-domaine actuel
    return context.baseDomain;
  } else {
    // 🚀 PATH: Utiliser l'ancien système
    return `${context.baseDomain}/${storeSlug}`;
  }
}

/**
 * Génère l'URL complète pour une boutique
 * 🚀 INTELLIGENT: Détecte automatiquement le contexte (sous-domaine ou path)
 * @param storeName - Nom de la boutique
 * @returns URL complète selon le contexte
 */
export function generateSimpshopyUrl(storeName: string): string {
  const context = getCurrentContext();
  const storeSlug = generateStorePath(storeName).replace('/', '');
  
  if (context.isSubdomain) {
    // 🚀 SOUS-DOMAINE: Utiliser le sous-domaine actuel
    const protocol = context.baseDomain.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${context.baseDomain}`;
  } else {
    // 🚀 PATH: Utiliser l'ancien système
    const protocol = context.baseDomain.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${context.baseDomain}/${storeSlug}`;
  }
}

/**
 * 🚀 GÉNÈRE L'URL PUBLIQUE D'UNE BOUTIQUE (SOUS-DOMAINE)
 * @param storeName - Nom de la boutique
 * @returns URL publique au format [nom-boutique].simpshopy.com
 */
export function generatePublicStoreUrl(storeName: string): string {
  const storeSlug = generateStorePath(storeName).replace('/', '');
  
  if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
    // 🚀 DÉVELOPPEMENT: Utiliser localhost
    return `http://${storeSlug}.localhost:4000`;
  } else {
    // 🚀 PRODUCTION: Utiliser simpshopy.com
    return `https://${storeSlug}.simpshopy.com`;
  }
}

/**
 * 🚀 FONCTION PRINCIPALE: Vérifie si l'application est sur un sous-domaine
 * @returns true si l'application est sur un sous-domaine
 */
export function isOnSubdomain(): boolean {
  return getCurrentContext().isSubdomain;
}

/**
 * 🚀 FONCTION PRINCIPALE: Récupère le slug de la boutique actuelle
 * @returns Le slug de la boutique ou null si pas sur un sous-domaine
 */
export function getCurrentStoreSlug(): string | null {
  return getCurrentContext().storeSlug;
}

/**
 * Vérifie si un domaine est un sous-domaine Simpshopy
 * @param domain - Domaine à vérifier
 * @returns true si c'est un sous-domaine Simpshopy
 */
export function isSimpshopySubdomain(domain: string): boolean {
  return domain.endsWith('.simpshopy.com') && domain !== 'simpshopy.com';
}

/**
 * Extrait le nom de la boutique d'un sous-domaine Simpshopy
 * @param domain - Domaine au format [nom-boutique].simpshopy.com
 * @returns Nom de la boutique ou null si ce n'est pas un sous-domaine valide
 */
export function extractStoreNameFromSubdomain(domain: string): string | null {
  if (!isSimpshopySubdomain(domain)) {
    return null;
  }

  const storeName = domain.replace('.simpshopy.com', '');
  return storeName || null;
}

/**
 * Valide qu'un nom de boutique peut être utilisé comme sous-domaine
 * @param storeName - Nom de la boutique à valider
 * @returns true si le nom est valide pour un sous-domaine
 */
export function isValidStoreNameForSubdomain(storeName: string): boolean {
  if (!storeName || storeName.trim().length === 0) {
    return false;
  }

  const cleanName = storeName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Vérifier que le nom nettoyé n'est pas vide et fait au moins 2 caractères
  return cleanName.length >= 2;
}

/**
 * Liste des sous-domaines réservés qui ne peuvent pas être utilisés
 */
export const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'admin',
  'app',
  'mail',
  'ftp',
  'blog',
  'shop',
  'store',
  'support',
  'help',
  'docs',
  'cdn',
  'static',
  'assets',
  'media',
  'images',
  'files',
  'download',
  'upload',
  'test',
  'staging',
  'dev',
  'demo',
  'preview',
  'beta',
  'alpha'
];

/**
 * Vérifie si un nom de boutique utilise un sous-domaine réservé
 * @param storeName - Nom de la boutique
 * @returns true si le nom utilise un sous-domaine réservé
 */
export function isReservedSubdomain(storeName: string): boolean {
  const cleanName = storeName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  return RESERVED_SUBDOMAINS.includes(cleanName);
}
