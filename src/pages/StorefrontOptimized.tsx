import React, { useEffect, useState, memo, useMemo, Suspense, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Store, ShoppingBag, ArrowLeft, Home, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import BlockRenderer from '@/components/site-builder/BlockRenderer';
import CartWidget from '@/components/site-builder/blocks/CartWidget';
import { Template } from '@/types/template';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import type { Tables } from '@/integrations/supabase/types';
import { useBranding } from '@/hooks/useBranding';


// Composant de chargement supprimé - chargement immédiat

type StoreType = Tables<'stores'>;
type ProductType = Tables<'products'>;

const StorefrontOptimized = () => {
  const { storeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { setStoreId } = useCart();

  // Optimisation 1: Requête unique pour récupérer boutique + template + produits
  const { data: storeData, isLoading, error } = useOptimizedQuery({
    queryKey: ['storefront', storeSlug],
    queryFn: async () => {
      if (!storeSlug) throw new Error('Slug de boutique manquant');

      // Requête unique optimisée avec jointures
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select(`
          *,
          site_templates!inner(
            template_data,
            is_published,
            updated_at
          ),
          products(
            id,
            name,
            description,
            price,
            images,
            status,
            category_id
          )
        `)
        .eq('status', 'active')
        .eq('site_templates.is_published', true)
        .ilike('name', `%${storeSlug.replace(/-/g, ' ')}%`)
        .order('site_templates.updated_at', { ascending: false })
        .limit(1)
        .single();

      if (storeError) throw storeError;
      if (!store) throw new Error(`Boutique "${storeSlug}" non trouvée`);

      // Filtrer les produits actifs
      const activeProducts = store.products?.filter(p => p.status === 'active') || [];

      return {
        store,
        template: store.site_templates?.[0]?.template_data || null,
        products: activeProducts
      };
    },
    enabled: !!storeSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes de cache
    cacheTime: 10 * 60 * 1000, // 10 minutes de cache
  });

  // Optimisation 2: Mémoisation des données
  const { store, template, products } = useMemo(() => {
    if (!storeData) return { store: null, template: null, products: [] };
    return storeData;
  }, [storeData]);

  // Optimisation 3: Callbacks mémorisés
  const handleProductClick = useCallback((productId: string) => {
    setSelectedProductId(productId);
    setCurrentPage('product-detail');
    navigate(`?page=product-detail&product=${productId}`, { replace: false });
  }, [navigate]);

  const handlePageNavigation = useCallback((page: string) => {
    setCurrentPage(page);
    setSelectedProductId(null);
    navigate(page === 'home' ? '' : `?page=${page}`, { replace: false });
  }, [navigate]);

  const handleCartNavigation = useCallback(() => {
    setCurrentPage('cart');
    setSelectedProductId(null);
    navigate('?page=cart', { replace: false });
  }, [navigate]);

  // Optimisation 4: Configuration du store une seule fois
  useEffect(() => {
    if (store?.id) {
      setStoreId(store.id);
    }
  }, [store?.id, setStoreId]);

  // Optimisation 5: Récupération des données de branding mémorisée
  const brandingData = useBranding(template);

  // Optimisation 6: Calcul des blocs mémorisé
  const currentPageBlocks = useMemo(() => {
    if (!template?.pages?.[currentPage]) return [];
    return template.pages[currentPage].sort((a, b) => a.order - b.order);
  }, [template, currentPage]);

  // Optimisation 7: Navigation mémorisée
  const renderNavigation = useMemo(() => (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Store className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">
              {store?.name || 'Ma Boutique'}
            </span>
          </div>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handlePageNavigation('home')}
              className={`text-sm font-medium transition-colors ${
                currentPage === 'home' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Accueil
            </button>
            <button
              onClick={() => handlePageNavigation('product')}
              className={`text-sm font-medium transition-colors ${
                currentPage === 'product' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Produits
            </button>
            <button
              onClick={() => handlePageNavigation('contact')}
              className={`text-sm font-medium transition-colors ${
                currentPage === 'contact' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Contact
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCartNavigation}
              className="relative"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Panier
              {products?.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {products.length}
                </span>
              )}
            </Button>

            {/* Menu mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  handlePageNavigation('home');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                Accueil
              </button>
              <button
                onClick={() => {
                  handlePageNavigation('product');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                Produits
              </button>
              <button
                onClick={() => {
                  handlePageNavigation('contact');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  ), [store?.name, currentPage, products?.length, mobileMenuOpen, handlePageNavigation, handleCartNavigation, setMobileMenuOpen]);

  // Gestion des erreurs
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Boutique introuvable</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  // Chargement immédiat - affichage progressif
  if (isLoading || !store) {
    return (
      <div className="min-h-screen bg-white">
        {/* Affichage immédiat du contenu avec skeleton */}
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200"></div>
          <div className="container mx-auto p-4">
            <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {renderNavigation}

      {/* Contenu principal - chargement immédiat */}
      <Suspense fallback={null}>
        <div className="min-h-screen animate-fade-in-up">
          {currentPageBlocks.map((block, index) => (
            <div
              key={`${block.id}-${block.order}`}
              className="animate-scale-in"
              style={{ '--animation-delay': `${index * 50}ms` } as React.CSSProperties} // Réduit de 100ms à 50ms
            >
              <BlockRenderer
                block={block}
                isEditing={false}
                viewMode="desktop"
                selectedStore={store}
                productId={selectedProductId}
                onProductClick={handleProductClick}
                products={products}
              />
            </div>
          ))}
        </div>
      </Suspense>

      <CartWidget />
    </div>
  );
};

export default memo(StorefrontOptimized);
