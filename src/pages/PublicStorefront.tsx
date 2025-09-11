// 🚀 BOUTIQUE PUBLIQUE ULTRA-LÉGÈRE
// Date: 2025-01-28
// Objectif: Boutique publique sans les composants admin lourds

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Store, ShoppingBag, ArrowLeft, Home, Menu, X } from 'lucide-react';
import BlockRenderer from '@/components/site-builder/BlockRenderer';
import CartWidget from '@/components/site-builder/blocks/CartWidget';
import { Template } from '@/types/template';
import { useAggressiveStorefront } from '@/hooks/useAggressiveStorefront';
import VisitorTracker from '@/components/VisitorTracker';
import { useBranding } from '@/hooks/useBranding';
import { PublicStorefrontProvider } from '@/components/PublicStorefrontProvider';

const PublicStorefrontContent = () => {
  const { storeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 🚀 UTILISATION DU CACHE AGRESSIF (PAS DE SKELETON)
  const { data: storefrontData, isLoading, isError, error, isFromCache } = useAggressiveStorefront();

  // Extraire les données du storefront
  const store = storefrontData?.store || null;
  const template = storefrontData?.template?.template_data || null;
  const products = storefrontData?.products || [];

  // Récupérer les données de branding
  const brandingData = useBranding(template);

  console.log('🚀 Public Storefront: Loading store:', storeSlug);

  // Gérer les paramètres d'URL pour la navigation
  useEffect(() => {
    const page = searchParams.get('page') || 'home';
    const productId = searchParams.get('product');

    console.log('Public Storefront: URL params changed', { page, productId, productsLoaded: products.length > 0, isLoading });

    // Toujours définir la page immédiatement pour éviter le "flash" de la page d'accueil
    setCurrentPage(page);
    setSelectedProductId(productId);

    // Si on est sur une page produit-detail avec un productId
    if (page === 'product-detail' && productId) {
      // Si les produits ne sont pas encore chargés, on garde la page mais on attend
      if (isLoading || products.length === 0) {
        console.log('Public Storefront: Products not loaded yet, keeping page but waiting...');
        return;
      }

      // Vérifier que le produit existe maintenant que les produits sont chargés
      const productExists = products.find(p => p.id === productId);
      if (!productExists) {
        console.log('Public Storefront: Product not found, redirecting to boutique');
        navigate('?page=product', { replace: true });
        return;
      }
    }
  }, [searchParams, products, navigate, isLoading]);

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentPage('product-detail');
    navigate(`?page=product-detail&product=${productId}`, { replace: false });
  };

  const handlePageNavigation = (page: string) => {
    setCurrentPage(page);
    setSelectedProductId(null);
    navigate(page === 'home' ? '' : `?page=${page}`, { replace: false });
  };

  const handleCartNavigation = () => {
    setCurrentPage('cart');
    setSelectedProductId(null);
    navigate('?page=cart', { replace: false });
  };

  const getPageBlocks = (page: string) => {
    if (!template?.pages?.[page]) return [];
    return template.pages[page].sort((a, b) => a.order - b.order);
  };

  const renderNavigation = () => {
    if (!store) return null;

    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Store className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">{store.name}</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCartNavigation}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <ShoppingBag className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  const renderBreadcrumb = () => {
    if (currentPage === 'home') return null;

    return (
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => handlePageNavigation('home')}
              className="hover:text-gray-900 flex items-center space-x-1"
            >
              <Home className="h-4 w-4" />
              <span>Accueil</span>
            </button>
            <span>/</span>
            <span className="text-gray-900 capitalize">{currentPage}</span>
          </div>
        </div>
      </div>
    );
  };

  // 🚀 CACHE AGRESSIF - PAS DE LOADING !
  // L'HTML statique s'affiche déjà, pas besoin de loading supplémentaire
  // On affiche directement le contenu, même si en cours de chargement

  if (isError || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Boutique non trouvée</h1>
          <p className="text-gray-600 mb-6">
            {error?.message || 'Cette boutique n\'existe pas ou n\'est pas encore publiée.'}
          </p>
          <Button onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  // Si pas de template, utiliser un template par défaut
  if (!template) {
    const defaultTemplate: Template = {
      id: 'default',
      name: 'Template par défaut',
      category: 'default',
      pages: {
        home: [
          {
            id: 'welcome',
            type: 'hero',
            order: 1,
            data: {
              title: `Bienvenue sur ${store.name}`,
              subtitle: 'Votre boutique en ligne',
              ctaText: 'Voir les produits',
              ctaLink: '?page=product'
            }
          }
        ],
        product: [
          {
            id: 'products-list',
            type: 'product-grid',
            order: 1,
            data: {
              title: 'Nos produits',
              products: products || []
            }
          }
        ]
      }
    };
    // setTemplate(defaultTemplate);
  }

  const currentPageBlocks = getPageBlocks(currentPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Tracker les visiteurs en temps réel */}
      {store && <VisitorTracker storeId={store.id} storeSlug={storeSlug} />}
      
      {/* Indicateur de cache discret */}
      {isFromCache && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium shadow-lg">
          ⚡ Cache
        </div>
      )}
      
      {renderNavigation()}
      {renderBreadcrumb()}

      {/* Contenu principal - RENDU SYNCHRONE (rapide comme Shopify) */}
      <div className="min-h-screen">
        {currentPageBlocks.map((block, index) => (
          <div
            key={`${block.id}-${block.order}`}
            className="animate-fade-in"
            style={{ '--animation-delay': `${index * 20}ms` } as React.CSSProperties}
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

      <CartWidget currentStoreId={store?.id} />
    </div>
  );
};

const PublicStorefront = () => {
  return (
    <PublicStorefrontProvider>
      <PublicStorefrontContent />
    </PublicStorefrontProvider>
  );
};

export default PublicStorefront;
