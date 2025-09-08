/**
 * Utilitaires pour la navigation intelligente dans les boutiques
 * Détecte automatiquement le contexte de la boutique et construit les URLs appropriées
 */

/**
 * Détecte le slug de la boutique depuis l'URL actuelle
 * @param pathname - Le pathname de l'URL (window.location.pathname)
 * @returns Le slug de la boutique ou null si on n'est pas dans une boutique
 */
export const getStoreSlugFromUrl = (pathname: string): string | null => {
  // Pattern: /store/{storeSlug}/...
  const storeMatch = pathname.match(/^\/store\/([^\/]+)/);
  return storeMatch ? storeMatch[1] : null;
};

/**
 * Construit l'URL de la page d'accueil de la boutique actuelle
 * @param pathname - Le pathname de l'URL actuelle
 * @returns L'URL de la page d'accueil de la boutique ou '/' si on n'est pas dans une boutique
 */
export const getStoreHomeUrl = (pathname: string): string => {
  const storeSlug = getStoreSlugFromUrl(pathname);
  return storeSlug ? `/store/${storeSlug}` : '/';
};

/**
 * Construit une URL relative à la boutique actuelle
 * @param pathname - Le pathname de l'URL actuelle
 * @param path - Le chemin relatif (ex: '/cart', '/checkout', '/products')
 * @returns L'URL complète relative à la boutique ou au site principal
 */
export const getStoreBasedUrl = (pathname: string, path: string): string => {
  const storeSlug = getStoreSlugFromUrl(pathname);
  
  if (storeSlug) {
    // On est dans une boutique, construire l'URL relative à la boutique
    return `/store/${storeSlug}${path}`;
  } else {
    // On est sur le site principal, utiliser le chemin tel quel
    return path;
  }
};

/**
 * Hook personnalisé pour la navigation intelligente dans les boutiques
 * @param pathname - Le pathname de l'URL actuelle (généralement window.location.pathname)
 * @returns Objet avec les fonctions de navigation intelligente
 */
export const useStoreNavigation = (pathname: string) => {
  return {
    /**
     * URL de la page d'accueil de la boutique actuelle
     */
    storeHomeUrl: getStoreHomeUrl(pathname),
    
    /**
     * Slug de la boutique actuelle (ou null)
     */
    storeSlug: getStoreSlugFromUrl(pathname),
    
    /**
     * Construit une URL relative à la boutique actuelle
     */
    getStoreUrl: (path: string) => getStoreBasedUrl(pathname, path),
    
    /**
     * Vérifie si on est actuellement dans une boutique
     */
    isInStore: () => getStoreSlugFromUrl(pathname) !== null,
  };
};
