import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Palette, ShoppingBag } from 'lucide-react';
import { preBuiltTemplates } from '@/data/preBuiltTemplates';
import { useStores } from '@/hooks/useStores';
import { useState } from 'react';
import CreateStoreDialog from '@/components/CreateStoreDialog';

const TemplatePreview = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { store, hasStore } = useStores();
  const [showCreateStore, setShowCreateStore] = useState(false);

  // Trouver le template
  const template = preBuiltTemplates.find(t => t.id === templateId);

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2">Template non trouvé</h2>
          <p className="text-gray-600 mb-4">Le template demandé n'existe pas.</p>
          <Button onClick={() => navigate('/themes/gallery')}>
            Retour aux thèmes
          </Button>
        </div>
      </div>
    );
  }

  const handleUseTemplate = () => {
    if (hasStore) {
      // Si l'utilisateur a déjà une boutique, aller à l'éditeur
      navigate(`/store-config/site-builder/editor/${template.id}`);
    } else {
      // Si pas de boutique, ouvrir le formulaire de création
      setShowCreateStore(true);
    }
  };

  const handleBack = () => {
    // Retourner à la galerie de thèmes
    navigate('/themes/gallery');
  };

  // Fonction pour obtenir l'image de prévisualisation
  const getPreviewImage = (category: string) => {
    const previewImages = {
      fashion: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
      electronics: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop",
      beauty: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop",
      food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
      sports: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
      home: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
      art: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
      default: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop"
    };
    return previewImages[category] || previewImages.default;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour aux thèmes
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{template.name}</h1>
                <p className="text-sm text-gray-500">Aperçu du thème</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Voir d'autres thèmes
              </Button>
              <Button
                size="sm"
                onClick={handleUseTemplate}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center gap-2"
              >
                <Palette className="h-4 w-4" />
                {hasStore ? 'Utiliser ce thème' : 'Créer ma boutique'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Info du template */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{template.name}</h2>
                <p className="text-gray-600 mb-4">{template.description}</p>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {template.category}
                  </span>
                  <span className="text-sm text-gray-500">Gratuit</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl mb-2">{template.icon}</div>
              </div>
            </div>
          </div>

          {/* Aperçu du template */}
          <div className="p-6">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
              <img
                src={getPreviewImage(template.category)}
                alt={`Aperçu du thème ${template.name}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Fonctionnalités */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">📱</div>
                <h3 className="font-semibold mb-1">Responsive</h3>
                <p className="text-sm text-gray-600">Optimisé pour tous les appareils</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🎨</div>
                <h3 className="font-semibold mb-1">Personnalisable</h3>
                <p className="text-sm text-gray-600">Couleurs et styles modifiables</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-semibold mb-1">Rapide</h3>
                <p className="text-sm text-gray-600">Chargement ultra-rapide</p>
              </div>
            </div>

            {/* Call to action */}
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleUseTemplate}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                {hasStore ? 'Appliquer ce thème à ma boutique' : 'Créer ma boutique avec ce thème'}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                {hasStore 
                  ? 'Votre thème actuel sera remplacé par celui-ci'
                  : 'Vous pourrez personnaliser ce thème après la création'
                }
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Dialog de création de boutique */}
      <CreateStoreDialog
        open={showCreateStore}
        onOpenChange={setShowCreateStore}
        selectedTheme={template}
      />
    </div>
  );
};

export default TemplatePreview;
