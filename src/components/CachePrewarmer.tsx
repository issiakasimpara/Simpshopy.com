// 🔥 PRÉCHAUFFEUR DE CACHE
// Date: 2025-01-28
// Objectif: Préchauffer le cache des boutiques populaires

import { useEffect } from 'react';
import { usePrewarmStorefront } from '@/hooks/useAggressiveStorefront';
import { AggressiveCacheService } from '@/services/aggressiveCacheService';

interface CachePrewarmerProps {
  popularStores?: string[];
}

export default function CachePrewarmer({ popularStores = [] }: CachePrewarmerProps) {
  const { prewarm } = usePrewarmStorefront('');

  useEffect(() => {
    // Préchauffer le cache après un délai pour ne pas ralentir l'affichage initial
    const prewarmTimer = setTimeout(() => {
      if (popularStores.length > 0) {
        console.log('🔥 Démarrage du préchauffage du cache...');
        popularStores.forEach((storeSlug, index) => {
          // Préchauffer avec un délai pour éviter la surcharge
          setTimeout(() => {
            prewarm();
          }, index * 1000); // 1 seconde entre chaque préchauffage
        });
      }
    }, 5000); // Attendre 5 secondes avant de commencer

    return () => clearTimeout(prewarmTimer);
  }, [popularStores, prewarm]);

  // Préchauffer aussi les données statiques
  useEffect(() => {
    const prewarmStaticData = () => {
      // Préchauffer des données statiques communes
      const staticData = {
        'static:branding': {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          logoPosition: 'left' as const,
        },
        'static:config': {
          currency: 'EUR',
          language: 'fr',
          timezone: 'Europe/Paris',
        },
      };

      Object.entries(staticData).forEach(([key, data]) => {
        AggressiveCacheService.set(key, data, 60 * 60 * 1000); // 1 heure
      });

      console.log('🔥 Données statiques préchauffées');
    };

    // Préchauffer les données statiques immédiatement
    prewarmStaticData();
  }, []);

  return null; // Ce composant ne rend rien
}
