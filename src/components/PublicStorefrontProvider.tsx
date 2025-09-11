// 🚀 PROVIDER LÉGER POUR BOUTIQUES PUBLIQUES
// Date: 2025-01-28
// Objectif: Charger seulement ce qui est nécessaire pour les boutiques publiques

import React, { createContext, useContext, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// QueryClient léger pour les boutiques publiques
const publicQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    },
  },
});

interface PublicStorefrontContextType {
  isPublicStorefront: boolean;
}

const PublicStorefrontContext = createContext<PublicStorefrontContextType>({
  isPublicStorefront: true,
});

export const usePublicStorefront = () => useContext(PublicStorefrontContext);

interface PublicStorefrontProviderProps {
  children: ReactNode;
}

export const PublicStorefrontProvider: React.FC<PublicStorefrontProviderProps> = ({ children }) => {
  return (
    <PublicStorefrontContext.Provider value={{ isPublicStorefront: true }}>
      <QueryClientProvider client={publicQueryClient}>
        {children}
      </QueryClientProvider>
    </PublicStorefrontContext.Provider>
  );
};
