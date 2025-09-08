
import { TemplateBlock, Template, PageMetadata } from '@/types/template';
import { useToast } from '@/hooks/use-toast';

interface UseTemplateOperationsProps {
  templateData: Template;
  currentPage: string;
  selectedBlock: TemplateBlock | null;
  onTemplateUpdate: (template: Template) => void;
  setSelectedBlock: (block: TemplateBlock | null) => void;
}

export const useTemplateOperations = ({
  templateData,
  currentPage,
  selectedBlock,
  onTemplateUpdate,
  setSelectedBlock,
}: UseTemplateOperationsProps) => {
  const { toast } = useToast();

  const pageBlocks = templateData.pages[currentPage] || [];

  const handlePageChange = (page: string) => {
    // Si la page n'existe pas encore, la créer
    if (!templateData.pages[page]) {
      const updatedTemplate = {
        ...templateData,
        pages: {
          ...templateData.pages,
          [page]: []
        }
      };
      onTemplateUpdate(updatedTemplate);
    }
    
    setSelectedBlock(null);
  };

  // Gestion des pages personnalisées
  const handlePageCreate = (pageData: { name: string; description?: string }) => {
    const pageId = `custom-${Date.now()}`;
    const slug = pageData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const currentPageMetadata = templateData.pageMetadata || {};
    const maxOrder = Math.max(...Object.values(currentPageMetadata).map(p => p.order), 0);
    
    const updatedTemplate = {
      ...templateData,
      pages: {
        ...templateData.pages,
        [pageId]: [] // Page vide
      },
      pageMetadata: {
        ...currentPageMetadata,
        [pageId]: {
          id: pageId,
          name: pageData.name,
          slug,
          description: pageData.description,
          isSystem: false,
          isVisible: true,
          order: maxOrder + 1
        }
      }
    };
    
    onTemplateUpdate(updatedTemplate);
    toast({
      title: "Page créée",
      description: `La page "${pageData.name}" a été créée avec succès.`,
    });
  };

  const handlePageDelete = (pageId: string) => {
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

    // Combiner les métadonnées par défaut avec celles du template
    const currentMetadata = {
      ...defaultPageMetadata,
      ...templateData.pageMetadata
    };

    const pageMetadata = currentMetadata[pageId];
    
    // Empêcher la suppression des pages ultra-système
    if (['home', 'checkout', 'cart', 'product-detail'].includes(pageId)) {
      toast({
        title: "Impossible de supprimer",
        description: "Cette page est vitale pour le fonctionnement du système.",
        variant: "destructive"
      });
      return;
    }
    
    // Avertissement spécial pour les pages système
    if (pageMetadata?.isSystem) {
      const confirmed = window.confirm(
        `⚠️ ATTENTION : Vous êtes sur le point de supprimer une page système (${pageMetadata.name}).\n\n` +
        `Cette action peut affecter le fonctionnement de votre boutique.\n\n` +
        `Êtes-vous sûr de vouloir continuer ?`
      );
      
      if (!confirmed) {
        return;
      }
    }
    
    const { [pageId]: deletedPage, ...remainingPages } = templateData.pages;
    const { [pageId]: deletedMetadata, ...remainingMetadata } = templateData.pageMetadata || {};
    
    const updatedTemplate = {
      ...templateData,
      pages: remainingPages,
      pageMetadata: remainingMetadata
    };
    
    onTemplateUpdate(updatedTemplate);
    toast({
      title: "Page supprimée",
      description: `La page "${pageMetadata?.name}" a été supprimée.`,
    });
  };

  const handlePageRename = (pageId: string, newName: string) => {
    const newSlug = newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
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

    // Combiner les métadonnées par défaut avec celles du template
    const currentMetadata = {
      ...defaultPageMetadata,
      ...templateData.pageMetadata
    };
    
    const updatedTemplate = {
      ...templateData,
      pageMetadata: {
        ...currentMetadata,
        [pageId]: {
          ...currentMetadata[pageId],
          name: newName,
          slug: newSlug
        }
      }
    };
    
    onTemplateUpdate(updatedTemplate);
    toast({
      title: "Page renommée",
      description: `La page a été renommée en "${newName}".`,
    });
  };

  const handlePageReorder = (pageId: string, newOrder: number) => {
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

    // Combiner les métadonnées par défaut avec celles du template
    const currentMetadata = {
      ...defaultPageMetadata,
      ...templateData.pageMetadata
    };

    const updatedTemplate = {
      ...templateData,
      pageMetadata: {
        ...currentMetadata,
        [pageId]: {
          ...currentMetadata[pageId],
          order: newOrder
        }
      }
    };
    
    onTemplateUpdate(updatedTemplate);
  };

  const handlePageVisibility = (pageId: string, isVisible: boolean) => {
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

    // Combiner les métadonnées par défaut avec celles du template
    const currentMetadata = {
      ...defaultPageMetadata,
      ...templateData.pageMetadata
    };

    const updatedTemplate = {
      ...templateData,
      pageMetadata: {
        ...currentMetadata,
        [pageId]: {
          ...currentMetadata[pageId],
          isVisible
        }
      }
    };
    
    onTemplateUpdate(updatedTemplate);
  };

  const handleBlockSelect = (block: TemplateBlock) => {
    setSelectedBlock(block);
  };

  const updatePageBlocks = (newBlocks: TemplateBlock[]) => {
    const updatedTemplate = {
      ...templateData,
      pages: {
        ...templateData.pages,
        [currentPage]: newBlocks
      }
    };
    console.log('updatePageBlocks - Template mis à jour:', updatedTemplate);
    onTemplateUpdate(updatedTemplate);
  };

  const handleBlockUpdate = (updatedBlock: TemplateBlock) => {
    console.log('handleBlockUpdate - Bloc mis à jour:', updatedBlock);
    const updatedBlocks = pageBlocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    );
    updatePageBlocks(updatedBlocks);
    setSelectedBlock(updatedBlock);
  };

  const handleBlockAdd = (newBlock: TemplateBlock) => {
    console.log('handleBlockAdd - Nouveau bloc:', newBlock);
    const blockWithOrder = {
      ...newBlock,
      id: `${newBlock.type}-${Date.now()}`,
      order: pageBlocks.length + 1
    };
    updatePageBlocks([...pageBlocks, blockWithOrder]);
    toast({
      title: "Bloc ajouté",
      description: "Le bloc a été ajouté à votre page.",
    });
  };

  const handleBlockDelete = (blockId: string) => {
    console.log('handleBlockDelete - Suppression du bloc:', blockId);
    const updatedBlocks = pageBlocks.filter(block => block.id !== blockId);
    // Réorganiser l'ordre
    updatedBlocks.forEach((block, index) => {
      block.order = index + 1;
    });
    updatePageBlocks(updatedBlocks);
    
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
    
    toast({
      title: "Bloc supprimé",
      description: "Le bloc a été retiré de votre page.",
    });
  };

  const handleBlockReorder = (draggedBlockId: string, targetBlockId: string) => {
    console.log('handleBlockReorder - Réorganisation:', draggedBlockId, '->', targetBlockId);
    const draggedBlock = pageBlocks.find(b => b.id === draggedBlockId);
    const targetBlock = pageBlocks.find(b => b.id === targetBlockId);
    
    if (!draggedBlock || !targetBlock) return;

    const newBlocks = [...pageBlocks];
    const draggedIndex = newBlocks.findIndex(b => b.id === draggedBlockId);
    const targetIndex = newBlocks.findIndex(b => b.id === targetBlockId);

    newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(targetIndex, 0, draggedBlock);

    // Mettre à jour l'ordre
    newBlocks.forEach((block, index) => {
      block.order = index + 1;
    });

    updatePageBlocks(newBlocks);
  };

  return {
    pageBlocks,
    handlePageChange,
    handlePageCreate,
    handlePageDelete,
    handlePageRename,
    handlePageReorder,
    handlePageVisibility,
    handleBlockSelect,
    handleBlockUpdate,
    handleBlockAdd,
    handleBlockDelete,
    handleBlockReorder,
  };
};
