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

  // 🔍 LOGS DE DIAGNOSTIC
  console.log('🔍 DomainBasedRouter - État actuel:', {
    isInitialized,
    user: user ? `✅ Connecté: ${user.email}` : '❌ Non connecté',
    authLoading: authLoading ? '⏳ Auth loading...' : '✅ Auth loaded',
    shouldShowOnboarding,
    onboardingLoading: onboardingLoading ? '⏳ Onboarding loading...' : '✅ Onboarding loaded',
    pathname: window.location.pathname,
    hostname: window.location.hostname
  });

  useEffect(() => {
    console.log('🔍 DomainBasedRouter - useEffect initialisation:', {
      hostname: window.location.hostname,
      authLoading
    });

    // Initialisation simple
    const hostname = window.location.hostname;
    
    // Développement local - pas de redirection
    if (hostname === 'localhost' || hostname.includes('localhost')) {
      console.log('🔍 DomainBasedRouter - Développement local, pas de redirection');
      setIsInitialized(true);
      return;
    }

    // Production - initialiser quand l'auth est prêt
    if (!authLoading) {
      console.log('🔍 DomainBasedRouter - Auth prêt, initialisation terminée');
      setIsInitialized(true);
    }
  }, [authLoading]);

  // Redirections critiques uniquement - plus conservatrices
  useEffect(() => {
    console.log('🔍 DomainBasedRouter - useEffect redirections:', {
      isInitialized,
      authLoading,
      user: user ? 'connecté' : 'non connecté',
      pathname: window.location.pathname,
      hostname: window.location.hostname
    });

    if (!isInitialized || authLoading) {
      console.log('🔍 DomainBasedRouter - Pas encore initialisé ou auth en cours');
      return;
    }

    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // 🔒 SÉCURITÉ : admin.simpshopy.com sans authentification
    // Seulement si on n'est pas déjà sur /auth et que l'utilisateur n'est vraiment pas connecté
    if (hostname === 'admin.simpshopy.com' && !user && pathname !== '/auth') {
      console.log('🔍 DomainBasedRouter - REDIRECTION: admin.simpshopy.com sans auth vers simpshopy.com/auth');
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
      console.log('🔍 DomainBasedRouter - REDIRECTION: utilisateur connecté vers onboarding');
      window.location.href = 'https://admin.simpshopy.com/onboarding';
      return;
    }

    console.log('🔍 DomainBasedRouter - Aucune redirection nécessaire');
  }, [isInitialized, user, authLoading, shouldShowOnboarding]);

  // Chargement minimal
  if (!isInitialized || authLoading) {
    console.log('🔍 DomainBasedRouter - Affichage du loader minimal');
    return <div className="min-h-screen bg-white" />;
  }

  console.log('🔍 DomainBasedRouter - Affichage du contenu principal');
  return <>{children}</>;
};

export default DomainBasedRouter;
