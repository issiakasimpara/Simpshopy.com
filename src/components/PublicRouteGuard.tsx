import React from 'react';

interface PublicRouteGuardProps {
  children: React.ReactNode;
}

const PublicRouteGuard: React.FC<PublicRouteGuardProps> = ({ children }) => {
  // Vérification rapide uniquement pour admin.simpshopy.com
  React.useEffect(() => {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // Redirection uniquement si on est sur admin.simpshopy.com avec une route publique
    if (hostname === 'admin.simpshopy.com' && pathname !== '/auth') {
      window.location.href = `https://simpshopy.com${pathname}`;
    }
  }, []);

  return <>{children}</>;
};

export default PublicRouteGuard;
