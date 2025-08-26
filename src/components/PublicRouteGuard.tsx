import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoadingFallback from './LoadingFallback';

interface PublicRouteGuardProps {
  children: React.ReactNode;
}

const PublicRouteGuard: React.FC<PublicRouteGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    const currentHostname = window.location.hostname;
    const currentPath = window.location.pathname;

    // Si on est sur admin.simpshopy.com et qu'on essaie d'accéder à une route publique
    if (currentHostname === 'admin.simpshopy.com') {
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

      const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
      
      if (isPublicRoute) {
        console.log('🔒 Public route accessed on admin domain - redirecting to main site');
        window.location.href = `https://simpshopy.com${currentPath}`;
        return;
      }
    }
  }, []);

  // Afficher un loader pendant la vérification
  if (loading) {
    return <LoadingFallback />;
  }

  // Afficher le contenu public
  return <>{children}</>;
};

export default PublicRouteGuard;
