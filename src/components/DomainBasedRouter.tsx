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
      // DÉLAI TEMPORAIRE POUR CAPTURER LES LOGS
      setTimeout(() => {
        window.location.href = 'https://simpshopy.com/auth';
      }, 3000); // 3 secondes de délai
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
      // DÉLAI TEMPORAIRE POUR CAPTURER LES LOGS
      setTimeout(() => {
        window.location.href = 'https://admin.simpshopy.com/onboarding';
      }, 3000); // 3 secondes de délai
      return;
    }

    console.log('🔍 DomainBasedRouter - Aucune redirection nécessaire');
  }, [isInitialized, user, authLoading, shouldShowOnboarding]);

  // Chargement minimal
  if (!isInitialized || authLoading) {
    console.log('🔍 DomainBasedRouter - Affichage du loader minimal');
    return (
      <div className="min-h-screen bg-white">
        {/* MESSAGE TEMPORAIRE POUR DIAGNOSTIC */}
        <div className="fixed top-4 right-4 p-4 bg-blue-100 border border-blue-400 rounded-lg z-50">
          <p className="text-sm text-blue-800">
            <strong>🔍 DomainBasedRouter :</strong><br/>
            Initialized: {isInitialized ? '✅' : '❌'}<br/>
            Auth Loading: {authLoading ? '⏳' : '✅'}<br/>
            User: {user ? '✅' : '❌'}<br/>
            Should Show Onboarding: {shouldShowOnboarding ? '✅' : '❌'}
          </p>
        </div>
      </div>
    );
  }

  console.log('🔍 DomainBasedRouter - Affichage du contenu principal');
  return <>{children}</>;
};

export default DomainBasedRouter;
