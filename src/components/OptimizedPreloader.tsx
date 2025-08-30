import React, { useEffect } from 'react';

const OptimizedPreloader: React.FC = () => {
  useEffect(() => {
    // Nettoyer les preloads existants problématiques
    const cleanupProblematicPreloads = () => {
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      preloadLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && (href.includes('?t=') || href.includes('&t='))) {
          // Supprimer les preloads avec des timestamps (générés automatiquement)
          link.remove();
          console.log(`🧹 Nettoyage du preload problématique: ${href}`);
        }
      });
    };

    // Nettoyer immédiatement
    cleanupProblematicPreloads();

    // Nettoyer périodiquement
    const interval = setInterval(cleanupProblematicPreloads, 5000); // Toutes les 5 secondes

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Composant invisible
  return null;
};

export default OptimizedPreloader;
