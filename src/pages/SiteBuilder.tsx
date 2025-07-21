import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Eye, Sparkles, Grid, Star, Zap } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { preBuiltTemplates } from "@/data/preBuiltTemplates";
import { templateCategories } from "@/data/templateCategories";
import TemplateCategoriesSection from "@/components/site-builder/TemplateCategoriesSection";
import { useStores } from "@/hooks/useStores";

const SiteBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { store } = useStores();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Redirection conditionnelle selon le contexte
  useEffect(() => {
    // Si on vient de /store-config/site-builder ET qu'on a une boutique, rediriger vers l'éditeur
    if (location.pathname === '/store-config/site-builder' && store) {
      const defaultTemplate = preBuiltTemplates[0];
      navigate(`/store-config/site-builder/editor/${defaultTemplate.id}`, { replace: true });
    }
    // Si on vient de /store-config/site-builder SANS boutique, rediriger vers la création
    else if (location.pathname === '/store-config/site-builder' && !store) {
      navigate('/store-config', { replace: true });
    }
  }, [location.pathname, store, navigate]);

  // Déterminer le contexte : galerie de thèmes ou personnalisation boutique
  const isThemeGallery = location.pathname === '/themes/gallery';
  const isStoreCustomization = location.pathname.includes('/store-config/site-builder');

  const filteredTemplates = selectedCategory === 'all' 
    ? preBuiltTemplates 
    : preBuiltTemplates.filter(template => template.category === selectedCategory);

  const getCategoryName = (categoryId: string) => {
    const category = templateCategories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  // Function to get icon based on category
  const getTemplateIcon = (category: string) => {
    const categoryData = templateCategories.find(cat => cat.id === category);
    return categoryData?.icon || '🎨';
  };

  // Function to get preview image based on template category
  const getPreviewImage = (category: string) => {
    const previewImages = {
      fashion: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop", // Fashion boutique
      electronics: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop", // Electronics/tech
      beauty: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=250&fit=crop", // Beauty products
      food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop", // Food/restaurant
      sports: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop", // Sports equipment
      home: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=250&fit=crop", // Home decor
      art: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=250&fit=crop", // Art gallery
      default: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop"
    };
    return previewImages[category] || previewImages.default;
  };

  // Si on est en train de rediriger, afficher un loading
  if (location.pathname === '/store-config/site-builder' && store) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Ouverture de l'éditeur de personnalisation...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header moderne */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-blue-600/5 rounded-3xl" />
          <div className="relative p-8 bg-gradient-to-br from-background via-background to-muted/20 rounded-3xl border border-border/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-2xl shadow-inner">
                  <Palette className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                  <div className="absolute -top-1 -right-1 p-1 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-pulse">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
                    {isThemeGallery ? 'Galerie de Thèmes' : 'Créateur de Site'}
                  </h1>
                  <p className="text-lg text-muted-foreground font-medium mt-2 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    {isThemeGallery
                      ? 'Choisissez un thème pour créer votre boutique'
                      : 'Choisissez un template et personnalisez votre boutique'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Catégories avec design modernisé */}
        <TemplateCategoriesSection 
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        {/* Templates Grid avec design amélioré */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl" />
          <div className="relative p-6 bg-gradient-to-br from-background via-background to-muted/20 rounded-2xl border border-border/50 shadow-lg">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-xl">
                    <Grid className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Templates Disponibles
                  </h2>
                </div>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {selectedCategory === 'all' 
                  ? "Tous les templates disponibles" 
                  : `Templates pour ${getCategoryName(selectedCategory)}`
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 bg-gradient-to-br from-background via-background to-muted/10 cursor-pointer">
                  {/* Gradient border effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-60" />
                  
                  <CardHeader className="relative pb-4">
                    <div className="flex items-center justify-between">
                      <div className="relative w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <span className="text-2xl">{getTemplateIcon(template.category)}</span>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-400 fill-current" />
                        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                          4.8
                        </span>
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-foreground group-hover:text-purple-600 transition-colors duration-300">
                        {template.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {template.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative pt-0">
                    {/* Preview Image */}
                    <div className="relative w-full h-32 rounded-xl mb-4 overflow-hidden shadow-inner group-hover:shadow-lg transition-shadow duration-300">
                      <img 
                        src={getPreviewImage(template.category)} 
                        alt={`Aperçu ${template.name}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 group-hover:opacity-80 transition-opacity duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 dark:bg-gray-900/90 rounded-full p-2">
                          <Eye className="h-6 w-6 text-purple-500" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Template Info */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                        {getCategoryName(template.category)}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">
                        Gratuit
                      </span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 group/btn bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-950 dark:to-blue-950/20 hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 border-border/60 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300"
                        onClick={() => {
                          if (isThemeGallery) {
                            // Si on est dans la galerie de thèmes, aller à l'aperçu
                            navigate(`/store-config/site-builder/preview/${template.id}`);
                          } else {
                            // Si on est dans la personnalisation, ouvrir l'aperçu dans l'éditeur
                            console.log('Aperçu dans l\'éditeur:', template.id);
                          }
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" />
                        Aperçu
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                        onClick={() => {
                          if (isThemeGallery) {
                            // Si on est dans la galerie de thèmes, ouvrir le formulaire de création de boutique
                            // TODO: Implémenter l'ouverture du formulaire avec le thème sélectionné
                            console.log('Créer boutique avec thème:', template.id);
                          } else {
                            // Si on est dans la personnalisation, aller à l'éditeur
                            navigate(`/store-config/site-builder/editor/${template.id}`);
                          }
                        }}
                      >
                        <Palette className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" />
                        {isThemeGallery ? 'Utiliser ce thème' : 'Utiliser'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg mb-6">
                  <Palette className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Aucun template disponible
                </h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Aucun template n'est disponible pour la catégorie "{getCategoryName(selectedCategory)}" pour le moment.
                </p>
                <Button 
                  onClick={() => setSelectedCategory('all')} 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Voir tous les templates
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SiteBuilder;
