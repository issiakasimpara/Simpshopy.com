import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useStoreCurrency } from '@/hooks/useStoreCurrency';

interface StoreData {
  store: any;
  products: any[];
  siteTemplate: any;
}

interface PublicStoreRouterProps {
  children: React.ReactNode;
}

const PublicStoreRouter: React.FC<PublicStoreRouterProps> = ({ children }) => {
  const { storeId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { formatPrice } = useStoreCurrency(storeData?.store?.id);

  useEffect(() => {
    const loadStoreData = async () => {
      if (!storeId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('🔍 Loading public store:', storeId);

        // Récupérer les données de la boutique
        const { data: store, error: storeError } = await supabase
          .from('stores')
          .select(`
            id,
            name,
            description,
            logo_url,
            settings,
            status,
            slug
          `)
          .eq('slug', storeId)
          .eq('status', 'active')
          .single();

        if (storeError || !store) {
          console.log('🔍 Store not found:', storeId);
          setError('Boutique non trouvée');
          setIsLoading(false);
          return;
        }

        console.log('🔍 Store found:', store);

        // Récupérer les produits de la boutique
        const { data: products } = await supabase
          .from('products')
          .select(`
            id,
            name,
            description,
            price,
            images,
            status
          `)
          .eq('store_id', store.id)
          .eq('status', 'active');

        setStoreData({
          store,
          products: products || [],
          siteTemplate: null
        });
        setIsLoading(false);

      } catch (error) {
        console.error('❌ Error loading store:', error);
        setError('Erreur lors du chargement de la boutique');
        setIsLoading(false);
      }
    };

    loadStoreData();
  }, [storeId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Chargement...</h2>
          <p className="text-muted-foreground">Chargement de la boutique</p>
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
            onClick={() => window.location.href = '/'}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (storeData) {
    // Afficher la boutique publique
    return (
      <div className="storefront-container">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">{storeData.store.name}</h1>
          <p className="text-muted-foreground mb-4">{storeData.store.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {storeData.products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.description}</p>
                <p className="text-lg font-bold mt-2">{formatPrice(product.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Si pas de storeId, afficher le contenu normal
  return <>{children}</>;
};

export default PublicStoreRouter;
