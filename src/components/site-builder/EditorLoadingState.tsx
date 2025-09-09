
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Sparkles, Zap, Check } from 'lucide-react';

interface EditorLoadingStateProps {
  currentStep: string;
  progress: number;
}

const EditorLoadingState: React.FC<EditorLoadingStateProps> = ({ currentStep, progress }) => {
  const getStepInfo = (step: string) => {
    switch (step) {
      case 'auth':
        return {
          title: 'Authentification',
          description: 'Vérification de votre session...',
          icon: <Check className="h-5 w-5" />,
          color: 'bg-green-500'
        };
      case 'stores':
        return {
          title: 'Chargement des boutiques',
          description: 'Récupération de vos données...',
          icon: <Palette className="h-5 w-5" />,
          color: 'bg-blue-500'
        };
      case 'template':
        return {
          title: 'Chargement du template',
          description: 'Préparation de l\'éditeur...',
          icon: <Sparkles className="h-5 w-5" />,
          color: 'bg-purple-500'
        };
      case 'images':
        return {
          title: 'Optimisation des images',
          description: 'Préchargement des ressources...',
          icon: <Zap className="h-5 w-5" />,
          color: 'bg-amber-500'
        };
      case 'ready':
        return {
          title: 'Prêt !',
          description: 'Ouverture de l\'éditeur...',
          icon: <Check className="h-5 w-5" />,
          color: 'bg-green-500'
        };
      default:
        return {
          title: 'Chargement...',
          description: 'Préparation en cours...',
          icon: <Palette className="h-5 w-5" />,
          color: 'bg-gray-500'
        };
    }
  };

  const stepInfo = getStepInfo(currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Icon animé */}
            <div className="relative">
              <div className={`w-16 h-16 mx-auto rounded-full ${stepInfo.color} flex items-center justify-center text-white shadow-lg animate-pulse`}>
                {stepInfo.icon}
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-20 animate-ping" />
            </div>

            {/* Titre et description */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
                {stepInfo.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {stepInfo.description}
              </p>
            </div>

            {/* Barre de progression */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Progression</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full transition-all duration-500 ease-out loading-progress"
                  style={{ '--progress-width': `${progress}%` } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Badge de statut */}
            <div className="flex justify-center">
              <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50">
                <Sparkles className="h-3 w-3 mr-1" />
                Éditeur optimisé
              </Badge>
            </div>

            {/* Indicateurs de performance */}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorLoadingState;
