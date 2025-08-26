import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoadingFallback from './LoadingFallback';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { user, session, loading } = useAuth();

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté et qu'on est sur admin.simpshopy.com
    if (!loading && !user && !session) {
      const currentHostname = window.location.hostname;
      if (currentHostname === 'admin.simpshopy.com') {
        console.log('🔒 Unauthorized access to admin - redirecting to main site');
        window.location.href = 'https://simpshopy.com/auth';
      }
    }

    // Rediriger si quelqu'un essaie d'accéder aux routes publiques sur admin.simpshopy.com
    const currentHostname = window.location.hostname;
    const currentPath = window.location.pathname;
    
    if (currentHostname === 'admin.simpshopy.com') {
      // Routes publiques qui ne doivent pas être accessibles sur admin.simpshopy.com
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
  }, [user, session, loading]);

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return <LoadingFallback />;
  }

  // Si l'utilisateur n'est pas connecté, ne rien afficher (redirection en cours)
  if (!user || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, afficher le contenu admin
  return <>{children}</>;
};

export default AdminRouteGuard;
