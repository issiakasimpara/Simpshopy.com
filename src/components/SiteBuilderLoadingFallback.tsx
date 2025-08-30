import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Sparkles, Zap, Grid, Check } from 'lucide-react';

const SiteBuilderLoadingFallback: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps = [
    { name: 'Initialisation', description: 'Préparation de l\'éditeur...' },
    { name: 'Chargement des templates', description: 'Récupération des thèmes...' },
    { name: 'Optimisation des images', description: 'Compression WebP...' },
    { name: 'Configuration du cache', description: 'Mise en place du cache intelligent...' },
    { name: 'Finalisation', description: 'Ouverture de l\'éditeur...' }
  ];

  useEffect(() => {
    // Animation d'entrée
    setIsVisible(true);

    // Simulation de progression
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5; // Progression variable
      });
    }, 200);

    // Changement d'étape
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return steps.length - 1;
        }
        return prev + 1;
      });
    }, 800);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center p-4 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Card className="w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-0 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Icon animé avec les couleurs du SiteBuilder */}
            <div className="relative">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 flex items-center justify-center shadow-lg animate-pulse">
                <Palette className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                <div className="absolute -top-1 -right-1 p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-pulse">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-20 animate-ping" />
            </div>

            {/* Titre avec gradient du SiteBuilder */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
                Créateur de Site
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {steps[currentStep]?.description || 'Chargement en cours...'}
              </p>
            </div>

            {/* Barre de progression avec couleurs du SiteBuilder */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Progression</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full transition-all duration-300 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            {/* Étape actuelle */}
            <div className="flex justify-center">
              <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                <Grid className="h-3 w-3 mr-1" />
                {steps[currentStep]?.name || 'Initialisation'}
              </Badge>
            </div>

            {/* Indicateurs de performance avec couleurs du SiteBuilder - TROIS LIGNES COLORÉES */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="font-semibold text-green-600 dark:text-green-400">Cache</div>
                <div className="text-green-500">Actif</div>
              </div>
              <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="font-semibold text-blue-600 dark:text-blue-400">Images</div>
                <div className="text-blue-500">Optimisées</div>
              </div>
              <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="font-semibold text-purple-600 dark:text-purple-400">Bundle</div>
                <div className="text-purple-500">Minifié</div>
              </div>
            </div>

            {/* Message de performance */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Zap className="h-3 w-3 text-amber-500" />
              <span>Performance optimisée</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteBuilderLoadingFallback;
