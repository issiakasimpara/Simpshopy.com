import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Template, TemplateBlock } from '@/types/template';
import BlockRenderer from './BlockRenderer';
import CartWidget from './blocks/CartWidget';
import { useCart } from '@/contexts/CartContext';
import { ArrowLeft, Home, Package, Grid, Phone, Eye, ShoppingBag, Search, User, Heart } from 'lucide-react';
import { useStores } from '@/hooks/useStores';
import { useDomains } from '@/hooks/useDomains';
import { generateSimpshopyUrl } from '@/utils/domainUtils';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'stores'>;

interface SitePreviewProps {
  template: Template;
  currentPage: string;
  blocks: TemplateBlock[];
  open: boolean;
  onClose: () => void;
}

// Composant interne qui utilise le CartContext
const SitePreviewContent = ({
  template,
  currentPage,
  blocks,
  open,
  onClose
}: SitePreviewProps) => {
  const [activePreviewPage, setActivePreviewPage] = useState<string>(currentPage);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const { stores } = useStores();
  const { getTotalItems, setStoreId, storeId, items } = useCart();
  const selectedStore = stores.length > 0 ? stores[0] : null;

  // Debug logs
  console.log('SitePreview: Current state', {
    selectedStore: selectedStore?.id,
    storeId,
    itemsCount: items.length,
    totalItems: getTotalItems()
  });
  
  // Récupérer les domaines pour afficher la bonne URL
  const { domains } = useDomains(selectedStore?.id);

  // Initialiser le panier avec le storeId de la boutique sélectionnée
  useEffect(() => {
    console.log('SitePreview: useEffect triggered', {
      selectedStoreId: selectedStore?.id,
      open,
      currentStoreId: storeId
    });

    if (selectedStore?.id && open) {
      console.log('SitePreview: Initializing cart with storeId:', selectedStore.id);
      setStoreId(selectedStore.id);
    }
  }, [selectedStore?.id, open, setStoreId, storeId]);

  // Synchroniser la page active avec la page courante de l'éditeur
  useEffect(() => {
    setActivePreviewPage(currentPage);
    setSelectedProductId(null);
    setNavigationHistory([]);
  }, [currentPage]);

  // Écouter les messages de la page de succès de paiement
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('🔔 SitePreview received message:', event.data);
      console.log('🔔 Event origin:', event.origin);
      console.log('🔔 Current activePreviewPage:', activePreviewPage);

      if (event.data.type === 'CLOSE_PREVIEW') {
        console.log('✅ Handling CLOSE_PREVIEW - returning to home');
        console.log('🏠 Setting activePreviewPage to "home"');
        // Retourner à la page d'accueil de la boutique dans l'aperçu
        setActivePreviewPage('home');
        setSelectedProductId(null);
        setNavigationHistory([]);
        console.log('✅ CLOSE_PREVIEW handled successfully');
      } else if (event.data.type === 'PREVIEW_HOME_LOADED') {
        console.log('✅ Handling PREVIEW_HOME_LOADED - confirming home page');
        // Confirmer que nous sommes bien revenus à l'accueil
        setActivePreviewPage('home');
        setSelectedProductId(null);
        setNavigationHistory([]);
        console.log('✅ PREVIEW_HOME_LOADED handled successfully');
      } else if (event.data.type === 'NAVIGATE_TO_CUSTOMER_ORDERS') {
        console.log('✅ Handling NAVIGATE_TO_CUSTOMER_ORDERS - showing customer orders preview');
        // Dans l'aperçu, on peut simuler la page de suivi des commandes
        // ou simplement afficher un message informatif
        setActivePreviewPage('customer-orders-preview');
        setSelectedProductId(null);
        setNavigationHistory([]);
      }
    };

    console.log('🎧 SitePreview: Adding message listener');
    window.addEventListener('message', handleMessage);
    return () => {
      console.log('🎧 SitePreview: Removing message listener');
      window.removeEventListener('message', handleMessage);
    };
  }, [activePreviewPage]);

  const getDisplayUrl = () => {
    // Vérifier s'il y a un domaine personnalisé actif
    const activeDomain = domains?.find(domain => domain.status === 'active' && domain.is_verified);
    
    if (activeDomain) {
      return `https://${activeDomain.domain_name}`;
    }
    
    // Sinon utiliser notre sous-domaine par défaut
    return generateSimpshopyUrl(selectedStore?.name || 'Ma Boutique');
  };

  const getPageBlocks = (pageName: string) => {
    const pageBlocks = template.pages[pageName] ? template.pages[pageName].sort((a, b) => a.order - b.order) : [];
    return pageBlocks;
  };

  // Pages principales à afficher dans la navigation (comme un vrai site e-commerce)
  const mainNavigationPages = ['home', 'product', 'category', 'contact'];
  
  const getPageDisplayName = (pageName: string) => {
    const names = {
      'home': 'Accueil',
      'product': 'Boutique',
      'category': 'Catégories',
      'contact': 'Contact',
      'product-detail': 'Détail Produit',
      'cart': 'Panier',
      'checkout': 'Commande',
      'customer-orders-preview': 'Suivi des commandes'
    };
    return names[pageName] || pageName;
  };

  const handleProductClick = (productId: string) => {
    if (activePreviewPage !== 'product-detail') {
      setNavigationHistory(prev => [...prev, activePreviewPage]);
    }
    
    setSelectedProductId(productId);
    setActivePreviewPage('product-detail');
  };

  const handleBackNavigation = () => {
    if (navigationHistory.length > 0) {
      const previousPage = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setActivePreviewPage(previousPage);
      setSelectedProductId(null);
    } else {
      setActivePreviewPage('home');
      setSelectedProductId(null);
    }
  };

  const handlePageNavigation = (pageName: string) => {
    setNavigationHistory([]);
    setActivePreviewPage(pageName);
    if (pageName !== 'product-detail') {
      setSelectedProductId(null);
    }
  };

  const handleCartNavigation = () => {
    setNavigationHistory(prev => [...prev, activePreviewPage]);
    setActivePreviewPage('cart');
    setSelectedProductId(null);
  };

  const renderProductDetail = () => {
    const productDetailBlock: TemplateBlock = {
      id: 'product-detail-temp',
      type: 'product-detail',
      content: {
        title: 'Détail du produit',
        showRelatedProducts: true,
        showReviews: true,
        showDescription: true,
        showSpecifications: true,
        showVariantSelector: true,
        showImageGallery: true,
        showInfoTabs: true,
        showSizeGuide: true,
        showComposition: true
      },
      styles: {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        padding: '0',
      },
      order: 1
    };

    return (
      <div className="min-h-screen">
        <BlockRenderer
          key={`product-detail-${selectedProductId}`}
          block={productDetailBlock}
          isEditing={false}
          viewMode="desktop"
          selectedStore={selectedStore}
          productId={selectedProductId}
          onProductClick={handleProductClick}
        />
      </div>
    );
  };

  const renderCartPreview = () => {
    const cartBlock: TemplateBlock = {
      id: 'cart-preview-temp',
      type: 'cart',
      content: {
        title: 'Mon Panier',
        subtitle: 'Vérifiez vos articles avant de passer commande',
        showContinueShopping: true,
        showClearCart: true
      },
      styles: {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        padding: '40px 0',
      },
      order: 1
    };

    return (
      <div className="min-h-screen">
        <BlockRenderer
          key="cart-preview-block"
          block={cartBlock}
          isEditing={false}
          viewMode="desktop"
          selectedStore={selectedStore}
          productId={null}
          onProductClick={handleProductClick}
          onNavigate={handlePageNavigation}
        />
      </div>
    );
  };

  const renderCustomerOrdersPreview = () => {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold mb-2">Suivi des commandes</h3>
          <p className="text-gray-600 mb-4">
            Cette page permettra à vos clients de suivre leurs commandes en utilisant leur email ou numéro de commande.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Mode Aperçu :</strong> Cette fonctionnalité sera disponible sur votre vraie boutique une fois publiée.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => handlePageNavigation('home')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  };

  const renderEmptyPageState = (pageName: string) => {
    const pageDisplayName = getPageDisplayName(pageName);
    
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-bold mb-2">Page "{pageDisplayName}" en construction</h3>
          <p className="text-gray-600 mb-4">
            Cette page est en cours de préparation. Revenez bientôt !
          </p>
          <Button 
            variant="outline" 
            onClick={() => handlePageNavigation('home')}
            disabled={activePreviewPage === 'home'}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  };

  // Navigation professionnelle comme un vrai site e-commerce
  const renderProfessionalNavigation = () => {
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        {/* Navigation principale */}
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo et nom de la boutique */}
            <div className="flex items-center gap-3">
              <div 
                className="text-2xl font-bold cursor-pointer"
                style={{ color: template.styles.primaryColor }}
                onClick={() => handlePageNavigation('home')}
              >
                {selectedStore?.name || template.name}
              </div>
            </div>

            {/* Navigation centrale */}
            <nav className="hidden md:flex items-center gap-8">
              {mainNavigationPages.map((pageName) => (
                <button
                  key={pageName}
                  onClick={() => handlePageNavigation(pageName)}
                  className={`text-gray-700 hover:text-gray-900 transition-colors font-medium ${
                    activePreviewPage === pageName ? 'border-b-2 pb-1' : ''
                  }`}
                  style={{ 
                    borderColor: activePreviewPage === pageName ? template.styles.primaryColor : 'transparent'
                  }}
                >
                  {getPageDisplayName(pageName)}
                </button>
              ))}
            </nav>

            {/* Actions utilisateur */}
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Search className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Heart className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <User className="h-5 w-5 text-gray-600" />
              </button>
              <button 
                onClick={handleCartNavigation}
                className="p-2 hover:bg-gray-100 rounded-full relative"
              >
                <ShoppingBag className="h-5 w-5 text-gray-600" />
                {getTotalItems() > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center"
                    style={{ backgroundColor: template.styles.primaryColor }}
                  >
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  };

  const renderBreadcrumb = () => {
    if (activePreviewPage === 'home') return null;
    
    return (
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button 
              onClick={() => handlePageNavigation('home')}
              className="hover:text-gray-900 flex items-center gap-1"
            >
              <Home className="h-3 w-3" />
              Accueil
            </button>
            <span>/</span>
            {activePreviewPage === 'product-detail' && selectedProductId ? (
              <>
                <button 
                  onClick={handleBackNavigation}
                  className="hover:text-gray-900"
                >
                  Boutique
                </button>
                <span>/</span>
                <span className="text-gray-900 font-medium">Détail du produit</span>
                {navigationHistory.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackNavigation}
                    className="ml-2 h-6 px-2 text-xs"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Retour
                  </Button>
                )}
              </>
            ) : (
              <span className="text-gray-900 font-medium">
                {getPageDisplayName(activePreviewPage)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const currentPageBlocks = getPageBlocks(activePreviewPage);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à l'éditeur
              </Button>
              <DialogTitle>Aperçu Professionnel - {selectedStore?.name || template.name}</DialogTitle>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                Page: {getPageDisplayName(activePreviewPage)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {currentPageBlocks.length} bloc{currentPageBlocks.length !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                ✓ Mode Aperçu Client
              </Badge>
              <Badge variant="outline" className="text-xs">
                Store: {storeId || 'Non défini'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Items: {items.length}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const storeSlug = selectedStore?.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'ma-boutique';
                  window.open(`/store/${storeSlug}`, '_blank');
                }}
                className="text-xs h-6"
              >
                Ouvrir la vraie boutique
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto bg-white relative">
          {/* Barre d'adresse simulée du navigateur */}
          <div className="bg-gray-100 border-b px-6 py-2">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 bg-white rounded-lg px-4 py-2 text-sm text-gray-700 border">
                {getDisplayUrl()}
              </div>
            </div>
          </div>

          {renderProfessionalNavigation()}
          {renderBreadcrumb()}
          
          {/* Contenu principal */}
          {activePreviewPage === 'product-detail' && selectedProductId ? (
            renderProductDetail()
          ) : activePreviewPage === 'cart' ? (
            renderCartPreview()
          ) : activePreviewPage === 'customer-orders-preview' ? (
            renderCustomerOrdersPreview()
          ) : currentPageBlocks.length === 0 ? (
            renderEmptyPageState(activePreviewPage)
          ) : (
            <div className="min-h-screen">
              {currentPageBlocks.map((block) => {
                return (
                  <BlockRenderer
                    key={`${block.id}-${block.order}`}
                    block={block}
                    isEditing={false}
                    viewMode="desktop"
                    selectedStore={selectedStore}
                    productId={null}
                    onProductClick={handleProductClick}
                  />
                );
              })}
            </div>
          )}

          <CartWidget />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Composant principal - utilise le CartProvider global
const SitePreview = (props: SitePreviewProps) => {
  return <SitePreviewContent {...props} />;
};

export default SitePreview;
