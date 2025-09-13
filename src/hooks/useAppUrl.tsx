// 🚀 HOOK POUR GÉRER LES URLs DE L'APPLICATION
// Date: 2025-01-28
// Objectif: Permettre à l'application d'utiliser les bonnes URLs selon le contexte

import { useSubdomain } from '@/contexts/SubdomainContext';

export function useAppUrl() {
  const { isSubdomain, baseUrl, originalHostname } = useSubdomain();

  // 🚀 GÉNÉRER L'URL DE BASE DE L'APPLICATION
  const getAppUrl = (path: string = '') => {
    if (isSubdomain) {
      // Si on est sur un sous-domaine, utiliser l'URL du sous-domaine
      return `${baseUrl}${path}`;
    } else {
      // Sinon, utiliser l'URL principale
      return `https://simpshopy.com${path}`;
    }
  };

  // 🚀 GÉNÉRER L'URL D'UNE BOUTIQUE
  const getStoreUrl = (storeSlug: string, path: string = '') => {
    if (isSubdomain) {
      // Si on est sur un sous-domaine, rester sur le même sous-domaine
      return `${baseUrl}${path}`;
    } else {
      // Sinon, utiliser l'URL avec le slug
      return `https://simpshopy.com/${storeSlug}${path}`;
    }
  };

  // 🚀 GÉNÉRER L'URL D'ADMIN
  const getAdminUrl = (path: string = '') => {
    if (isSubdomain) {
      // Si on est sur un sous-domaine, rediriger vers l'admin principal
      return `https://simpshopy.com${path}`;
    } else {
      // Sinon, utiliser l'URL admin
      return `https://simpshopy.com${path}`;
    }
  };

  return {
    isSubdomain,
    baseUrl,
    originalHostname,
    getAppUrl,
    getStoreUrl,
    getAdminUrl
  };
}
