import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StoreData {
  domain: any;
  store: any;
  products: any[];
  siteTemplate: any;
  metadata: {
    totalProducts: number;
    storeActive: boolean;
    sslEnabled: boolean;
    lastUpdated: string;
  };
}

interface DomainRouterProps {
  children: React.ReactNode;
}

const DomainRouter: React.FC<DomainRouterProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [isMainDomain, setIsMainDomain] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleDomainRouting = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const hostname = window.location.hostname;
        console.log('🔍 Checking domain:', hostname);

        // Skip routing for localhost during development
        if (hostname === 'localhost' || hostname.includes('localhost')) {
          setIsMainDomain(true);
          setIsLoading(false);
          return;
        }

        // Check if this is the main domain
        if (hostname === 'simpshopy.com' || hostname === 'www.simpshopy.com') {
          setIsMainDomain(true);
          setIsLoading(false);
          return;
        }

        // Check for custom domain or subdomain
        const { data, error: routerError } = await supabase.functions.invoke('domain-router', {
          body: { hostname },
        });

        if (routerError) {
          console.error('Domain router error:', routerError);
          setError('Erreur lors du routage du domaine');
          setIsLoading(false);
          return;
        }

        if (data.error) {
          console.log('Domain not found:', data.error);
          setError(data.error);
          setIsLoading(false);
          return;
        }

        if (data.isMainDomain) {
          setIsMainDomain(true);
          setIsLoading(false);
          return;
        }

        // Custom domain or subdomain found
        console.log('✅ Store data found:', data);
        setStoreData(data);
        setIsLoading(false);

      } catch (error) {
        console.error('Domain routing error:', error);
        setError('Erreur lors du chargement de la boutique');
        setIsLoading(false);
      }
    };

    handleDomainRouting();
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
          <h2 className="text-xl font-semibold mb-2">Domaine non trouvé</h2>
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
    // Render storefront for custom domain/subdomain
    return (
      <div className="storefront-container">
        {/* Storefront content will be rendered here */}
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">{storeData.store.name}</h1>
          <p className="text-muted-foreground mb-4">{storeData.store.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {storeData.products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.description}</p>
                <p className="text-lg font-bold mt-2">{product.price} XOF</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main domain - render normal app
  return <>{children}</>;
};

export default DomainRouter; 