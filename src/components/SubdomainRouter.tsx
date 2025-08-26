import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStoreCurrency } from '@/hooks/useStoreCurrency';
import { useAuth } from '@/hooks/useAuth';
import StorefrontRenderer from './storefront/StorefrontRenderer';

interface StoreData {
  store: any;
  domain: any;
  isSubdomain: boolean;
  isCustomDomain: boolean;
}

interface SubdomainRouterProps {
  children: React.ReactNode;
}

const SubdomainRouter: React.FC<SubdomainRouterProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [isAdminDomain, setIsAdminDomain] = useState(false);
  const [isMainDomain, setIsMainDomain] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { formatPrice } = useStoreCurrency(storeData?.store?.id);
  const { user, session } = useAuth();

  useEffect(() => {
    const handleSubdomainRouting = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const hostname = window.location.hostname;
        console.log('🔍 Subdomain Router - Checking hostname:', hostname);

        // Skip routing for localhost during development
        if (hostname === 'localhost' || hostname.includes('localhost')) {
          console.log('🔍 Development mode - serving admin interface');
          setIsAdminDomain(true);
          setIsLoading(false);
          return;
        }

        // Check if this is the admin domain (admin.simpshopy.com)
        if (hostname === 'admin.simpshopy.com') {
          console.log('🔍 Admin domain detected - serving admin interface');
          setIsAdminDomain(true);
          setIsLoading(false);
          return;
        }

        // Check if this is the main domain (simpshopy.com) - main site with full functionality
        if (hostname === 'simpshopy.com' || hostname === 'www.simpshopy.com') {
          console.log('🔍 Main domain detected - serving main site with full functionality');
          setIsMainDomain(true);
          setIsLoading(false);
          return;
        }

        // Call the domain-router edge function to get store data for subdomains/custom domains
        const { data, error: routerError } = await supabase.functions.invoke('domain-router', {
          body: { hostname },
        });

        if (routerError) {
          console.error('❌ Domain router error:', routerError);
          setError('Erreur lors du chargement de la boutique');
          setIsLoading(false);
          return;
        }

        if (data.success && data.store) {
          console.log('✅ Store found for domain:', data.store.name);
          setStoreData({
            store: data.store,
            domain: data.domain,
            isSubdomain: data.isSubdomain,
            isCustomDomain: data.isCustomDomain
          });
          setIsLoading(false);
          return;
        } else {
          console.log('❌ Store not found for domain:', hostname);
          setError('Boutique non trouvée');
          setIsLoading(false);
          return;
        }

      } catch (error) {
        console.error('❌ Subdomain routing error:', error);
        setError('Erreur lors du chargement de la boutique');
        setIsLoading(false);
      }
    };

    handleSubdomainRouting();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (storeData) {
    // Render storefront for subdomain/custom domain
    return <StorefrontRenderer hostname={window.location.hostname} />;
  }

  if (isMainDomain) {
    // Main domain - render main site with full functionality
    return <MainSite />;
  }

  // Admin domain - render admin interface
  return <>{children}</>;
};

// Main site component (simpshopy.com) - full functionality with authentication
const MainSite = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">SimpShopy</h1>
              <p className="text-sm text-muted-foreground">Plateforme E-commerce Internationale</p>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    Connecté en tant que {user.email}
                  </span>
                  <a 
                    href="https://admin.simpshopy.com/dashboard" 
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Accéder à l'admin
                  </a>
                  <button 
                    onClick={signOut}
                    className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    Se déconnecter
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <a 
                    href="/auth" 
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Se connecter
                  </a>
                  <a 
                    href="/auth?mode=signup" 
                    className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    Créer un compte
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Créez votre boutique en ligne en 2 minutes
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            SimpShopy est la plateforme e-commerce internationale avec paiements globaux, 
            support français/anglais et tarifs en devises locales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <a 
                href="https://admin.simpshopy.com/dashboard" 
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Accéder à mon dashboard
              </a>
            ) : (
              <a 
                href="/auth?mode=signup" 
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Commencer maintenant
              </a>
            )}
            <a 
              href="/features" 
              className="bg-secondary text-secondary-foreground px-8 py-3 rounded-lg text-lg font-semibold hover:bg-secondary/90 transition-colors"
            >
              Découvrir les fonctionnalités
            </a>
          </div>
        </div>
      </main>
      
      <footer className="bg-muted py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 SimpShopy. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SubdomainRouter;
