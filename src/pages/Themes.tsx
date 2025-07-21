// 🎨 PAGE GALERIE DE THÈMES (SEULEMENT POUR CHOISIR)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useStores } from '@/hooks/useStores';
import { useAuth } from '@/hooks/useAuth';
import { preBuiltTemplates } from '@/data/preBuiltTemplates';
import CreateStoreDialog from '@/components/CreateStoreDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Eye, Sparkles, Layout, ShoppingBag } from 'lucide-react';

const Themes = () => {
  const navigate = useNavigate();
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const { store, hasStore, isLoading, refetchStores } = useStores();
  const { user, loading: authLoading } = useAuth();

  // Rediriger vers la galerie de thèmes
  useEffect(() => {
    navigate('/themes/gallery', { replace: true });
  }, [navigate]);

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    setShowCreateStore(true);
  };

  const handleStoreCreated = () => {
    setShowCreateStore(false);
    setSelectedTheme(null);
    refetchStores();
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-orange-50/30 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-orange-950/20 pointer-events-none rounded-3xl" />
        
        <div className="relative space-y-8 p-1">
          {/* Header pour choisir un thème */}
          <div className="bg-gradient-to-br from-background/95 via-background to-muted/5 backdrop-blur-sm rounded-3xl border border-border/50 shadow-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                <Palette className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  Choisir un Thème
                </h1>
                <p className="text-muted-foreground text-lg">
                  {hasStore
                    ? "Parcourez nos thèmes pour votre boutique existante"
                    : "Choisissez un thème pour créer votre boutique"
                  }
                </p>
              </div>
            </div>

            {!hasStore && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>💡 Astuce :</strong> Choisissez un thème qui vous plaît, puis cliquez sur "Utiliser ce thème" pour créer votre boutique !
                </p>
              </div>
            )}
          </div>

          {/* Galerie de thèmes SEULEMENT */}
          <div className="bg-gradient-to-br from-background/95 via-background to-muted/5 backdrop-blur-sm rounded-3xl border border-border/50 shadow-xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Layout className="h-5 w-5 text-purple-600" />
              Thèmes disponibles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {preBuiltTemplates.map((template) => (
                <Card key={template.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-purple-200">
                  <CardHeader className="pb-3">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <Layout className="h-8 w-8 text-gray-400" />
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {template.category}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Aperçu
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          onClick={() => handleThemeSelect(template.id)}
                        >
                          <ShoppingBag className="h-3 w-3 mr-1" />
                          {hasStore ? "Changer" : "Utiliser ce thème"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CreateStoreDialog 
        open={showCreateStore} 
        onOpenChange={setShowCreateStore}
        onStoreCreated={handleStoreCreated}
        hasExistingStore={hasStore}
      />
    </DashboardLayout>
  );
};

export default Themes;
