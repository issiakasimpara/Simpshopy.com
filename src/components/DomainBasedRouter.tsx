import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';

interface DomainBasedRouterProps {
  children: React.ReactNode;
}

const DomainBasedRouter: React.FC<DomainBasedRouterProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { shouldShowOnboarding, isLoading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    // Initialisation simple
    const hostname = window.location.hostname;
    
    // Développement local - pas de redirection
    if (hostname === 'localhost' || hostname.includes('localhost')) {
      setIsInitialized(true);
      return;
    }

    // Production - initialiser quand l'auth est prêt
    if (!authLoading) {
      setIsInitialized(true);
    }
  }, [authLoading]);

  // Redirections critiques uniquement - plus conservatrices
  useEffect(() => {
    if (!isInitialized || authLoading) {
      return;
    }

    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // 🔒 SÉCURITÉ : admin.simpshopy.com sans authentification
    // Seulement si on n'est pas déjà sur /auth et que l'utilisateur n'est vraiment pas connecté
    if (hostname === 'admin.simpshopy.com' && !user && pathname !== '/auth') {
      window.location.href = 'https://simpshopy.com/auth';
      return;
    }

    // 🔄 ONBOARDING : utilisateur connecté mais pas d'onboarding
    // Seulement si on n'est pas déjà sur /onboarding ou /auth
    if (hostname === 'admin.simpshopy.com' && 
        user && 
        shouldShowOnboarding && 
        pathname !== '/onboarding' && 
        pathname !== '/auth') {
      window.location.href = 'https://admin.simpshopy.com/onboarding';
      return;
    }
  }, [isInitialized, user, authLoading, shouldShowOnboarding]);

  // Chargement minimal
  if (!isInitialized || authLoading) {
    return <div className="min-h-screen bg-white" />;
  }

  return <>{children}</>;
};

export default DomainBasedRouter;
