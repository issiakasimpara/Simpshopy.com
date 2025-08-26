import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import LoadingFallback from './LoadingFallback';

interface DomainBasedRouterProps {
  children: React.ReactNode;
}

const DomainBasedRouter: React.FC<DomainBasedRouterProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentDomain, setCurrentDomain] = useState<'main' | 'admin' | 'development'>('main');
  const { user, loading: authLoading } = useAuth();
  const { shouldShowOnboarding, isLoading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    const determineDomain = () => {
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;

      console.log('🔍 DomainBasedRouter - Checking:', { hostname, pathname });

      // Développement local
      if (hostname === 'localhost' || hostname.includes('localhost')) {
        console.log('🔍 Development mode detected');
        setCurrentDomain('development');
        setIsLoading(false);
        return;
      }

      // Domaine admin
      if (hostname === 'admin.simpshopy.com') {
        console.log('🔍 Admin domain detected');
        setCurrentDomain('admin');
        setIsLoading(false);
        return;
      }

      // Domaine principal
      if (hostname === 'simpshopy.com' || hostname === 'www.simpshopy.com') {
        console.log('🔍 Main domain detected');
        setCurrentDomain('main');
        setIsLoading(false);
        return;
      }

      // Autres domaines (sous-domaines, domaines personnalisés) - traiter comme admin
      console.log('🔍 Other domain detected - treating as admin');
      setCurrentDomain('admin');
      setIsLoading(false);
    };

    determineDomain();
  }, []);

  useEffect(() => {
    if (isLoading || authLoading || onboardingLoading) return;

    const handleDomainRouting = () => {
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;

      // 🔒 LOGIQUE DE SÉCURITÉ POUR admin.simpshopy.com
      if (currentDomain === 'admin') {
        // Si on est sur admin.simpshopy.com sans être connecté
        if (!user) {
          console.log('🔒 Unauthorized access to admin domain - redirecting to main site');
          window.location.href = 'https://simpshopy.com/auth';
          return;
        }

        // Si l'utilisateur doit faire l'onboarding, rediriger vers l'onboarding sur admin
        if (shouldShowOnboarding && pathname !== '/onboarding') {
          console.log('🔒 User needs onboarding - redirecting to onboarding');
          window.location.href = 'https://admin.simpshopy.com/onboarding';
          return;
        }

        // Si l'utilisateur est sur une route publique sur admin.simpshopy.com, rediriger
        const publicRoutes = [
          '/store/',
          '/cart',
          '/checkout',
          '/payment-success',
          '/product/',
          '/features',
          '/pricing',
          '/testimonials',
          '/why-choose-us',
          '/support',
          '/about',
          '/legal',
          '/privacy',
          '/terms'
        ];

        const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
        if (isPublicRoute) {
          console.log('🔒 Public route accessed on admin domain - redirecting to main site');
          window.location.href = `https://simpshopy.com${pathname}`;
          return;
        }
      }

      // 🔄 LOGIQUE DE REDIRECTION POUR simpshopy.com
      if (currentDomain === 'main') {
        // Si l'utilisateur est connecté et a terminé l'onboarding, rediriger vers admin
        if (user && !shouldShowOnboarding) {
          // Vérifier si on est sur une route admin
          const adminRoutes = [
            '/dashboard',
            '/analytics',
            '/products',
            '/orders',
            '/customers',
            '/settings',
            '/site-builder',
            '/integrations',
            '/testimonials',
            '/categories',
            '/store-config',
            '/shipping',
            '/payments',
            '/marketing',
            '/monitoring'
          ];

          const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
          if (isAdminRoute) {
            console.log('🔄 Admin route accessed on main domain - redirecting to admin domain');
            window.location.href = `https://admin.simpshopy.com${pathname}`;
            return;
          }
        }
      }
    };

    handleDomainRouting();
  }, [currentDomain, user, authLoading, onboardingLoading, shouldShowOnboarding]);

  // Affichage du loader pendant la détermination du domaine
  if (isLoading || authLoading || onboardingLoading) {
    return <LoadingFallback />;
  }

  // Rendu du contenu selon le domaine
  return <>{children}</>;
};

export default DomainBasedRouter;
