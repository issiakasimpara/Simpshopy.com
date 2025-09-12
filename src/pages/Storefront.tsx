import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowLeft, Home, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import BlockRenderer from '@/components/site-builder/BlockRenderer';
import CartWidget from '@/components/site-builder/blocks/CartWidget';
import { useAggressiveStorefront } from '@/hooks/useAggressiveStorefront';
import VisitorTracker from '@/components/VisitorTracker';
import { useBranding } from '@/hooks/useBranding';
import InstantStorefront from '@/components/InstantStorefront';

const Storefront = () => {
  const { storeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { setStoreId } = useCart();

  // 🚀 UTILISATION DU CACHE AGRESSIF (ULTRA-RAPIDE)
  const { data: storefrontData, isLoading, isError, error } = useAggressiveStorefront();
  
  // Extraire les données du storefront
  const store = storefrontData?.store || null;
  const template = storefrontData?.template?.template_data || null;
  const products = storefrontData?.products || [];

  // Récupérer les données de branding
  const brandingData = useBranding(template);

  console.log('🚀 Storefront optimisé: Loading store:', storeSlug);

  // 🚀 SYSTÈME OPTIMISÉ - Plus besoin de fetchStoreData !
  // Le hook useOptimizedStorefront gère tout automatiquement

  // Mettre à jour le storeId dans le contexte du panier
  useEffect(() => {
    if (store?.id) {
      setStoreId(store.id);
      console.log('✅ Store ID mis à jour dans le contexte:', store.id);
    }
  }, [store?.id, setStoreId]);

  // Effet pour mettre à jour le favicon et le titre de la page
  useEffect(() => {
    console.log('🔄 Mise à jour branding:', {
      favicon: brandingData.favicon ? 'Présent' : 'Absent',
      brandName: brandingData.brandName
    });

    if (brandingData.favicon) {
      try {
        // Supprimer seulement les favicons personnalisés des boutiques (pas le favicon principal SimpShopy)
        const existingCustomFavicons = document.querySelectorAll("link[rel*='icon'][data-custom='true']");
        existingCustomFavicons.forEach(favicon => favicon.remove());

        // Créer un nouveau favicon personnalisé
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = brandingData.favicon;
        link.setAttribute('data-custom', 'true'); // Marquer comme favicon personnalisé

        // Ajouter au head
        document.getElementsByTagName('head')[0].appendChild(link);

        console.log('✅ Favicon personnalisé mis à jour:', brandingData.favicon.substring(0, 50) + '...');
      } catch (error) {
        console.error('❌ Erreur mise à jour favicon personnalisé:', error);
      }
    }

    // Mettre à jour le titre de la page
    if (brandingData.brandName) {
      document.title = brandingData.brandName;
    } else if (store?.name) {
      document.title = store.name;
    }
  }, [brandingData, store]);

  // Gérer les paramètres d'URL pour la navigation
  useEffect(() => {
    const page = searchParams.get('page') || 'home';
    const productId = searchParams.get('product');

    console.log('Storefront: URL params changed', { page, productId, productsLoaded: products.length > 0, isLoading });

    // Toujours définir la page immédiatement pour éviter le "flash" de la page d'accueil
    setCurrentPage(page);
    setSelectedProductId(productId);

    // Si on est sur une page produit-detail avec un productId
    if (page === 'product-detail' && productId) {
      // Si les produits ne sont pas encore chargés, on garde la page mais on attend
      if (isLoading || products.length === 0) {
        console.log('Storefront: Products not loaded yet, keeping page but waiting...');
        return;
      }

      // Vérifier que le produit existe maintenant que les produits sont chargés
      const productExists = products.find(p => p.id === productId);
      if (!productExists) {
        console.log('Storefront: Product not found, redirecting to boutique');
        navigate('?page=product', { replace: true });
        return;
      }
    }
  }, [searchParams, products, navigate, isLoading]);

  // Écouter les changements d'historique (bouton retour du navigateur)
  useEffect(() => {
    const handlePopState = () => {
      console.log('Storefront: Browser back/forward detected');
      // Forcer la re-lecture des paramètres URL
      const urlParams = new URLSearchParams(window.location.search);
      const page = urlParams.get('page') || 'home';
      const productId = urlParams.get('product');

      console.log('Storefront: Restoring state from URL', { page, productId });

      setCurrentPage(page);
      setSelectedProductId(productId);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleProductClick = (productId: string) => {
    console.log('Storefront: Product clicked', productId);
    setSelectedProductId(productId);
    setCurrentPage('product-detail');
    // Utiliser navigate pour une meilleure synchronisation avec React Router
    navigate(`?page=product-detail&product=${productId}`, { replace: false });
  };

  const handlePageNavigation = (page: string) => {
    console.log('Storefront: Page navigation', page);
    setCurrentPage(page);
    setSelectedProductId(null);
    navigate(page === 'home' ? '' : `?page=${page}`, { replace: false });
  };

  const handleCartNavigation = () => {
    console.log('Storefront: Cart navigation');
    setCurrentPage('cart');
    setSelectedProductId(null);
    navigate('?page=cart', { replace: false });
  };

  const getPageBlocks = (pageName: string) => {
    if (!template) return [];
    
    // Métadonnées par défaut pour les pages système
    const defaultPageMetadata = {
      home: { id: 'home', name: 'Accueil', slug: 'home', description: 'Page d\'accueil principale', isSystem: true, isVisible: true, order: 1 },
      product: { id: 'product', name: 'Produits', slug: 'product', description: 'Catalogue des produits', isSystem: true, isVisible: true, order: 2 },
      'product-detail': { id: 'product-detail', name: 'Détail produit', slug: 'product-detail', description: 'Page de détail d\'un produit', isSystem: true, isVisible: false, order: 3 },
      category: { id: 'category', name: 'Catégories', slug: 'category', description: 'Pages de catégories', isSystem: true, isVisible: true, order: 4 },
      contact: { id: 'contact', name: 'Contact', slug: 'contact', description: 'Informations de contact', isSystem: true, isVisible: true, order: 5 },
      cart: { id: 'cart', name: 'Panier', slug: 'cart', description: 'Panier d\'achat', isSystem: true, isVisible: false, order: 6 },
      checkout: { id: 'checkout', name: 'Checkout', slug: 'checkout', description: 'Page de commande', isSystem: true, isVisible: false, order: 7 }
    };
    
    // Filtrer les pages supprimées des métadonnées par défaut
    const filteredDefaultMetadata = Object.fromEntries(
      Object.entries(defaultPageMetadata).filter(([id]) => {
        const customMetadata = template.pageMetadata?.[id];
        return !customMetadata?.isDeleted;
      })
    );
    
    // Combiner les métadonnées par défaut filtrées avec celles du template
    const pageMetadata = {
      ...filteredDefaultMetadata,
      ...template.pageMetadata
    };
    
    // Chercher par slug ou par ID dans les métadonnées
    const pageId = Object.keys(pageMetadata).find(id => 
      pageMetadata[id].slug === pageName || id === pageName
    );
    
    if (pageId) {
      return template.pages[pageId] ? template.pages[pageId].sort((a: any, b: any) => a.order - b.order) : [];
    }
    
    // Fallback pour les pages sans métadonnées
    return template.pages[pageName] ? template.pages[pageName].sort((a: any, b: any) => a.order - b.order) : [];
  };

  const renderNavigation = () => {
    if (!template) return null;

    // Métadonnées par défaut pour les pages système
    const defaultPageMetadata = {
      home: { id: 'home', name: 'Accueil', slug: 'home', description: 'Page d\'accueil principale', isSystem: true, isVisible: true, order: 1 },
      product: { id: 'product', name: 'Produits', slug: 'product', description: 'Catalogue des produits', isSystem: true, isVisible: true, order: 2 },
      'product-detail': { id: 'product-detail', name: 'Détail produit', slug: 'product-detail', description: 'Page de détail d\'un produit', isSystem: true, isVisible: false, order: 3 },
      category: { id: 'category', name: 'Catégories', slug: 'category', description: 'Pages de catégories', isSystem: true, isVisible: true, order: 4 },
      contact: { id: 'contact', name: 'Contact', slug: 'contact', description: 'Informations de contact', isSystem: true, isVisible: true, order: 5 },
      cart: { id: 'cart', name: 'Panier', slug: 'cart', description: 'Panier d\'achat', isSystem: true, isVisible: false, order: 6 },
      checkout: { id: 'checkout', name: 'Checkout', slug: 'checkout', description: 'Page de commande', isSystem: true, isVisible: false, order: 7 }
    };

    // Filtrer les pages supprimées des métadonnées par défaut
    const filteredDefaultMetadata = Object.fromEntries(
      Object.entries(defaultPageMetadata).filter(([id]) => {
        const customMetadata = template.pageMetadata?.[id];
        return !customMetadata?.isDeleted;
      })
    );

    // Combiner les métadonnées par défaut filtrées avec celles du template
    const pageMetadata = {
      ...filteredDefaultMetadata,
      ...template.pageMetadata
    };
    
    const visiblePages = Object.entries(pageMetadata)
      .filter(([, metadata]: [string, any]) => metadata.isVisible)
      .sort(([,a]: [string, any], [,b]: [string, any]) => a.order - b.order);
    
    const logoPosition = brandingData.logoPosition || 'left';

    // Composant Logo réutilisable
    const LogoComponent = () => (
      <div className="flex items-center space-x-3">
        {brandingData.logo ? (
          <img
            src={brandingData.logo}
            alt={brandingData.brandName || store?.name}
            className="h-10 max-w-32 object-contain"
          />
        ) : store?.logo_url ? (
          <img
            src={store.logo_url}
            alt={store.name}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : (
          <div className="p-2 rounded-lg storefront-brand-icon" style={{ '--primary-color': template.styles.primaryColor } as React.CSSProperties}>
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
        )}
        <span className="text-xl font-bold">
          {brandingData.brandName || store?.name}
        </span>
      </div>
    );

    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="relative flex items-center justify-between h-16">
            {/* Position gauche */}
            {logoPosition === 'left' && <LogoComponent />}
            {logoPosition !== 'left' && <div></div>} {/* Spacer */}

            {/* Position centre */}
            {logoPosition === 'center' && (
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <LogoComponent />
              </div>
            )}

            {/* Navigation principale */}
            <div className={`hidden md:flex items-center space-x-8 ${logoPosition === 'center' ? 'ml-auto' : ''}`}>
              {visiblePages.map(([pageId, metadata]: [string, any]) => (
                <button
                  key={pageId}
                  onClick={() => handlePageNavigation(metadata.slug)}
                  className={`text-gray-700 hover:text-gray-900 transition-colors font-medium ${
                    currentPage === metadata.slug ? 'border-b-2 pb-1' : ''
                  }`}
                  style={{
                    '--primary-color': template.styles.primaryColor,
                    '--border-color': currentPage === metadata.slug ? 'var(--primary-color)' : 'transparent'
                  } as React.CSSProperties}
                >
                  {metadata.name}
                </button>
              ))}
            </div>

            {/* Actions et Position droite */}
            <div className="flex items-center space-x-4">
              {/* Position droite */}
              {logoPosition === 'right' && <LogoComponent />}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleCartNavigation}
                className="relative"
              >
                <ShoppingBag className="h-5 w-5" />
              </Button>

              {/* Menu hamburger mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Menu mobile déroulant */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-white">
              <div className="px-4 py-2 space-y-1">
                {visiblePages.map(([pageId, metadata]: [string, any]) => (
                  <button
                    key={pageId}
                    onClick={() => {
                      handlePageNavigation(metadata.slug);
                      setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      currentPage === metadata.slug
                        ? 'text-white'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    style={{
                      '--primary-color': template.styles.primaryColor,
                      '--bg-color': currentPage === metadata.slug ? 'var(--primary-color)' : 'transparent'
                    } as React.CSSProperties}
                  >
                    {metadata.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  };

  const renderBreadcrumb = () => {
    if (currentPage === 'home') return null;

    return (
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => handlePageNavigation('home')}
              className="hover:text-gray-900 flex items-center gap-1"
            >
              <Home className="h-3 w-3" />
              Accueil
            </button>
            <span>/</span>
            {currentPage === 'product-detail' && selectedProductId ? (
              <>
                <button
                  onClick={() => handlePageNavigation('product')}
                  className="hover:text-gray-900"
                >
                  Boutique
                </button>
                <span>/</span>
                <span className="text-gray-900 font-medium">Détail du produit</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageNavigation('product')}
                  className="ml-2 h-6 px-2 text-xs"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Retour
                </Button>
              </>
            ) : (
              <span className="text-gray-900 font-medium">
                {currentPage === 'product' ? 'Boutique' :
                 currentPage === 'category' ? 'Catégories' :
                 currentPage === 'contact' ? 'Contact' :
                 currentPage === 'cart' ? 'Panier' : currentPage}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 🚀 AFFICHAGE CONDITIONNEL INTELLIGENT
  // Ne jamais afficher "boutique non trouvée" pendant le chargement
  
  if (isError && !isLoading) {
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

  // Si on charge encore, ne rien afficher (l'HTML statique est déjà là)
  if (isLoading && !store) {
    return null; // L'HTML statique d'InstantStorefront reste affiché
  }

  // Si pas de template, utiliser un template par défaut
  if (!template) {
    // Template par défaut non utilisé, suppression de la variable
    return null;
  }

  const currentPageBlocks = getPageBlocks(currentPage);

  return (
    <InstantStorefront>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Tracker les visiteurs réactivé */}
        {store && <VisitorTracker storeId={store.id} storeSlug={storeSlug} />}
        
        {/* Indicateur de cache supprimé */}
        
        {renderNavigation()}
        {renderBreadcrumb()}

        {/* Contenu principal - RENDU SYNCHRONE (rapide comme Shopify) */}
        <div className="min-h-screen">
          {currentPageBlocks.map((block: any, index: number) => (
            <div
              key={`${block.id}-${block.order}`}
              className="animate-fade-in"
              style={{ '--animation-delay': `${index * 20}ms` } as React.CSSProperties} // Réduit de 100ms à 20ms
            >
              <BlockRenderer
                block={block}
                isEditing={false}
                viewMode="desktop"
                selectedStore={store ? { ...store, status: store.status as 'draft' | 'active' | 'suspended' } : null}
                productId={selectedProductId}
                onProductClick={handleProductClick}
                products={products}
              />
            </div>
          ))}
        </div>

        <CartWidget currentStoreId={store?.id} />
      </div>
    </InstantStorefront>
  );
};

export default Storefront;
