import React, { useState, useEffect } from 'react';
import { usePreloading } from '../hooks/usePreloading';
import { useImagePreloader } from '../utils/imagePreloader';
import { PreloadImage } from '../utils/imagePreloader';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

export const PreloadingDemo: React.FC = () => {
  const { 
    isPreloading, 
    preloadedResources, 
    preloadCritical, 
    preloadImportant, 
    preloadOptional,
    preloadConfig 
  } = usePreloading();

  const { 
    preloadImages, 
    getCacheStats 
  } = useImagePreloader();

  const [cacheStats, setCacheStats] = useState(getCacheStats());
  const [testImages] = useState([
    '/logo-simpshopy.png',
    '/simpfavicon.png',
    '/placeholder.svg'
  ]);

  // Mettre à jour les statistiques du cache
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStats(getCacheStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [getCacheStats]);

  // Calculer les statistiques de progression
  const totalResources = 
    preloadConfig.critical.length + 
    preloadConfig.important.length + 
    preloadConfig.fonts.length + 
    preloadConfig.images.length;
  
  const progress = totalResources > 0 ? (preloadedResources.size / totalResources) * 100 : 0;

  const handlePreloadImages = async () => {
    console.log('🖼️ Préchargement des images de test...');
    const results = await preloadImages(testImages, { priority: 'high' });
    console.log('✅ Résultats du preload:', results);
  };

  const handlePreloadCritical = async () => {
    console.log('🚀 Préchargement des ressources critiques...');
    await preloadCritical();
  };

  const handlePreloadImportant = async () => {
    console.log('📦 Préchargement des ressources importantes...');
    await preloadImportant();
  };

  const handlePreloadOptional = async () => {
    console.log('🎯 Préchargement des ressources optionnelles...');
    await preloadOptional();
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚡ Système de Preloading SimpShopy
            <Badge variant={isPreloading ? "default" : "secondary"}>
              {isPreloading ? "En cours..." : "Prêt"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Démonstration du système de preloading intelligent pour optimiser les performances
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de progression globale */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression globale</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Statistiques détaillées */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {preloadedResources.size}
              </div>
              <div className="text-xs text-muted-foreground">
                Ressources préchargées
              </div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {cacheStats.size}
              </div>
              <div className="text-xs text-muted-foreground">
                Images en cache
              </div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(cacheStats.hitRate * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Taux de réussite
              </div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {totalResources}
              </div>
              <div className="text-xs text-muted-foreground">
                Total ressources
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contrôles de test */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Tests de Preloading</CardTitle>
          <CardDescription>
            Testez manuellement les différentes fonctions de preloading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handlePreloadCritical}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-lg">🚀</span>
              <span>Ressources Critiques</span>
            </Button>
            
            <Button 
              onClick={handlePreloadImportant}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-lg">📦</span>
              <span>Ressources Importantes</span>
            </Button>
            
            <Button 
              onClick={handlePreloadOptional}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-lg">🎯</span>
              <span>Ressources Optionnelles</span>
            </Button>
            
            <Button 
              onClick={handlePreloadImages}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-lg">🖼️</span>
              <span>Images de Test</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Démonstration des images préchargées */}
      <Card>
        <CardHeader>
          <CardTitle>🖼️ Images Préchargées</CardTitle>
          <CardDescription>
            Démonstration du composant PreloadImage avec gestion automatique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testImages.map((src, index) => (
              <div key={src} className="space-y-2">
                <PreloadImage
                  src={src}
                  alt={`Image de test ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                  priority={index === 0}
                  onLoad={() => console.log(`✅ Image chargée: ${src}`)}
                  onError={() => console.warn(`❌ Erreur de chargement: ${src}`)}
                />
                <p className="text-xs text-muted-foreground text-center">
                  {src.split('/').pop()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Détails des ressources */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Détails des Ressources</CardTitle>
          <CardDescription>
            Liste des ressources configurées pour le preloading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(preloadConfig).map(([category, resources]) => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium capitalize text-sm">
                  {category} ({resources.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {resources.map((resource, index) => (
                    <div 
                      key={index}
                      className={`text-xs p-2 rounded border ${
                        preloadedResources.has(resource.href)
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}
                    >
                      <div className="font-medium">{resource.href.split('/').pop()}</div>
                      <div className="text-xs opacity-75">{resource.as}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
