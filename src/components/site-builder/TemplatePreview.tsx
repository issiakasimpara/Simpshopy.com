import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Palette, ShoppingBag, Monitor, Smartphone, Tablet } from 'lucide-react';
import { preBuiltTemplates } from '@/data/preBuiltTemplates';
import { useStores } from '@/hooks/useStores';
import { useState } from 'react';
import CreateStoreDialog from '@/components/CreateStoreDialog';
import BlockRenderer from '@/components/site-builder/BlockRenderer';
import { Template } from '@/types/template';

const TemplatePreview = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { store, hasStore } = useStores();
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Trouver le template
  const template = preBuiltTemplates.find(t => t.id === templateId);

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2">Template non trouvé</h2>
          <p className="text-gray-600 mb-4">Le template demandé n'existe pas.</p>
          <Button onClick={() => navigate('/themes')}>
            Retour aux thèmes
          </Button>
        </div>
      </div>
    );
  }

  const handleUseTemplate = () => {
    if (hasStore) {
      // Si l'utilisateur a déjà une boutique, changer le thème
      // TODO: Implémenter le changement de thème
      navigate(`/store-config/site-builder/editor/${template.id}`);
    } else {
      // Si pas de boutique, ouvrir le formulaire de création
      setShowCreateStore(true);
    }
  };

  const handleBack = () => {
    // Retourner à la galerie de thèmes
    navigate('/themes');
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

  // Récupérer les blocs de la page d'accueil
  const homeBlocks = template.pages?.home || [];

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

          {/* Contrôles de prévisualisation */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aperçu en temps réel</h3>
                <p className="text-sm text-gray-600">Voyez comment votre boutique apparaîtra à vos clients</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                  className="flex items-center gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  Desktop
                </Button>
                <Button
                  variant={viewMode === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('tablet')}
                  className="flex items-center gap-2"
                >
                  <Tablet className="h-4 w-4" />
                  Tablet
                </Button>
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                  className="flex items-center gap-2"
                >
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </Button>
              </div>
            </div>
          </div>

          {/* Aperçu du template */}
          <div className="p-6">
            {/* Barre d'adresse simulée */}
            <div className="bg-gray-100 border-b px-6 py-2 mb-4">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-white rounded-lg px-4 py-2 text-sm text-gray-700 border">
                  {hasStore 
                    ? `${store.name.toLowerCase().replace(/\s+/g, '-')}.commerce-flow.fr`
                    : 'ma-boutique.commerce-flow.fr'
                  }
                </div>
              </div>
            </div>

            {/* Conteneur de prévisualisation */}
            <div className={`
              mx-auto bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden
              ${viewMode === 'desktop' ? 'w-full max-w-4xl' : ''}
              ${viewMode === 'tablet' ? 'w-full max-w-2xl' : ''}
              ${viewMode === 'mobile' ? 'w-full max-w-sm' : ''}
            `}>
              {/* Rendu des blocs du template */}
              <div className="min-h-screen">
                {homeBlocks.length > 0 ? (
                  homeBlocks.map((block) => (
                    <BlockRenderer
                      key={block.id}
                      block={block}
                      isEditing={false}
                      viewMode={viewMode}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎨</div>
                      <h3 className="text-xl font-bold mb-2">Aperçu du thème</h3>
                      <p className="text-gray-600 mb-4">
                        Ce thème sera personnalisable dans l'éditeur après création de votre boutique.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Mode Aperçu :</strong> Les blocs et contenus seront chargés dynamiquement.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fonctionnalités */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
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
            <div className="text-center mt-8">
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
