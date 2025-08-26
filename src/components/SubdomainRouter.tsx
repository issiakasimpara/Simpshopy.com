import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import StorefrontRenderer from './storefront/StorefrontRenderer';
import Home from '@/pages/Home';

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
    // Main domain - render the real homepage (Home.tsx)
    return <Home />;
  }

  // Admin domain - render admin interface
  return <>{children}</>;
};

export default SubdomainRouter;
