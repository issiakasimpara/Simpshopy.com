import React, { useEffect } from 'react';

/**
 * Composant pour rediriger automatiquement vers admin.simpshopy.com/auth
 * quand on est sur simpshopy.com et qu'on essaie d'accéder à l'authentification
 */
const AuthRedirect: React.FC = () => {
  useEffect(() => {
    const currentHostname = window.location.hostname;
    
    // Si on est sur simpshopy.com et qu'on essaie d'accéder à l'auth
    if (currentHostname === 'simpshopy.com' || currentHostname === 'www.simpshopy.com') {
      // Rediriger vers admin.simpshopy.com/auth
      window.location.href = 'https://admin.simpshopy.com/auth';
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Redirection...</h2>
        <p className="text-muted-foreground">Transfert vers l'interface d'administration</p>
      </div>
    </div>
  );
};

export default AuthRedirect;
