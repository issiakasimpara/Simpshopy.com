import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStoreCurrency } from '@/hooks/useStoreCurrency';
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
  const [isMainDomain, setIsMainDomain] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { formatPrice } = useStoreCurrency(storeData?.store?.id);

  useEffect(() => {
    const handleSubdomainRouting = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const hostname = window.location.hostname;
        console.log('🔍 Subdomain Router - Checking hostname:', hostname);

        // Skip routing for localhost during development
        if (hostname === 'localhost' || hostname.includes('localhost')) {
          console.log('🔍 Development mode - skipping routing');
          setIsMainDomain(true);
          setIsLoading(false);
          return;
        }

        // Check if this is the main domain (admin interface)
        if (hostname === 'simpshopy.com' || hostname === 'www.simpshopy.com') {
          console.log('🔍 Main domain detected - serving admin interface');
          setIsMainDomain(true);
          setIsLoading(false);
          return;
        }

        // Check if this is a subdomain (boutique.simpshopy.com)
        if (hostname.includes('simpshopy.com')) {
          const subdomain = hostname.split('.')[0];
          console.log('🔍 Subdomain detected:', subdomain);

          // Skip www subdomain
          if (subdomain === 'www') {
            console.log('🔍 www subdomain - redirecting to main domain');
            window.location.href = 'https://simpshopy.com';
            return;
          }

          // Call the domain-router edge function to get store data
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
            console.log('✅ Store found for subdomain:', data.store.name);
            setStoreData({
              store: data.store,
              domain: data.domain,
              isSubdomain: data.isSubdomain,
              isCustomDomain: data.isCustomDomain
            });
            setIsLoading(false);
            return;
          } else {
            console.log('❌ Store not found for subdomain:', subdomain);
            setError('Boutique non trouvée');
            setIsLoading(false);
            return;
          }
        }

        // Check for custom domains
        console.log('🔍 Checking for custom domain:', hostname);
        
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
          console.log('✅ Store found for custom domain:', data.store.name);
          setStoreData({
            store: data.store,
            domain: data.domain,
            isSubdomain: data.isSubdomain,
            isCustomDomain: data.isCustomDomain
          });
          setIsLoading(false);
          return;
        }

        console.log('🔍 No matching domain found');
        setError('Domaine non trouvé');
        setIsLoading(false);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Chargement...</h2>
          <p className="text-muted-foreground">Vérification du domaine</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Boutique non trouvée</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = 'https://simpshopy.com'}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Retour à SimpShopy
          </button>
        </div>
      </div>
    );
  }

  if (storeData) {
    // Render storefront for subdomain/custom domain
    return <StorefrontRenderer hostname={window.location.hostname} />;
  }

  // Main domain - render admin interface
  return <>{children}</>;
};

export default SubdomainRouter;
