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
    // Initialisation rapide - pas de logique complexe
    const hostname = window.location.hostname;
    
    // Développement local - pas de redirection
    if (hostname === 'localhost' || hostname.includes('localhost')) {
      setIsInitialized(true);
      return;
    }

    // Logique simplifiée pour la production
    if (!authLoading && !onboardingLoading) {
      setIsInitialized(true);
    }
  }, [authLoading, onboardingLoading]);

  // Redirections critiques uniquement
  useEffect(() => {
    if (!isInitialized || authLoading || onboardingLoading) return;

    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // 🔒 SÉCURITÉ CRITIQUE : admin.simpshopy.com sans authentification
    if (hostname === 'admin.simpshopy.com' && !user) {
      window.location.href = 'https://simpshopy.com/auth';
      return;
    }

    // 🔄 ONBOARDING CRITIQUE : utilisateur connecté mais pas d'onboarding
    if (hostname === 'admin.simpshopy.com' && user && shouldShowOnboarding && pathname !== '/onboarding') {
      window.location.href = 'https://admin.simpshopy.com/onboarding';
      return;
    }
  }, [isInitialized, user, authLoading, onboardingLoading, shouldShowOnboarding]);

  // Chargement minimal
  if (!isInitialized || authLoading || onboardingLoading) {
    return <div className="min-h-screen bg-white" />;
  }

  return <>{children}</>;
};

export default DomainBasedRouter;
