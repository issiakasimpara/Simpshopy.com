// 🚀 CONTEXTE POUR GÉRER LES SOUS-DOMAINES
// Date: 2025-01-28
// Objectif: Permettre à l'application de savoir qu'elle est sur un sous-domaine

import React, { createContext, useContext, ReactNode } from 'react';

interface SubdomainContextType {
  isSubdomain: boolean;
  storeSlug: string | null;
  baseUrl: string;
  originalHostname: string;
}

const SubdomainContext = createContext<SubdomainContextType | undefined>(undefined);

interface SubdomainProviderProps {
  children: ReactNode;
}

export function SubdomainProvider({ children }: SubdomainProviderProps) {
  const hostname = window.location.hostname;
  let isSubdomain = false;
  let storeSlug: string | null = null;
  let baseUrl = 'https://simpshopy.com';
  let originalHostname = hostname;

  // 🚀 DÉTECTION AUTOMATIQUE DU SOUS-DOMAINE
  if (hostname.includes('simpshopy.com') && !hostname.startsWith('www.') && !hostname.startsWith('admin.')) {
    const subdomain = hostname.split('.')[0];
    if (subdomain !== 'simpshopy') {
      console.log('🚀 Sous-domaine détecté dans le contexte:', subdomain);
      isSubdomain = true;
      storeSlug = subdomain;
      baseUrl = `https://${hostname}`;
    }
  }
  
  // 🚀 DÉTECTION LOCALHOST POUR DÉVELOPPEMENT
  if (hostname.includes('localhost') && hostname.split('.').length > 1) {
    const subdomain = hostname.split('.')[0];
    if (subdomain !== 'localhost') {
      console.log('🚀 Sous-domaine localhost détecté dans le contexte:', subdomain);
      isSubdomain = true;
      storeSlug = subdomain;
      baseUrl = `http://${hostname}`;
    }
  }

  const value: SubdomainContextType = {
    isSubdomain,
    storeSlug,
    baseUrl,
    originalHostname
  };

  return (
    <SubdomainContext.Provider value={value}>
      {children}
    </SubdomainContext.Provider>
  );
}

export function useSubdomain() {
  const context = useContext(SubdomainContext);
  if (context === undefined) {
    throw new Error('useSubdomain must be used within a SubdomainProvider');
  }
  return context;
}
