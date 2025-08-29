import { useEffect, useRef } from 'react';

interface StylesheetConfig {
  href: string;
  media?: string;
  disabled?: boolean;
}

export const useStylesheetOptimizer = () => {
  const loadedStylesheets = useRef<Set<string>>(new Set());

  // Charger une stylesheet de manière optimisée
  const loadStylesheet = (config: StylesheetConfig): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Éviter de recharger la même stylesheet
      if (loadedStylesheets.current.has(config.href)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = config.href;
      
      if (config.media) {
        link.media = config.media;
      }
      
      if (config.disabled) {
        link.disabled = true;
      }

      // Gestion des erreurs MIME
      link.onerror = () => {
        console.warn(`Stylesheet failed to load: ${config.href}`);
        // Ne pas rejeter, juste ignorer l'erreur
        resolve();
      };

      link.onload = () => {
        loadedStylesheets.current.add(config.href);
        resolve();
      };

      // Timeout pour éviter les blocages
      const timeout = setTimeout(() => {
        console.warn(`Stylesheet load timeout: ${config.href}`);
        resolve();
      }, 5000);

      link.onload = () => {
        clearTimeout(timeout);
        loadedStylesheets.current.add(config.href);
        resolve();
      };

      document.head.appendChild(link);
    });
  };

  // Charger plusieurs stylesheets en parallèle
  const loadStylesheets = async (configs: StylesheetConfig[]): Promise<void> => {
    const promises = configs.map(config => loadStylesheet(config));
    await Promise.allSettled(promises);
  };

  // Précharger les stylesheets critiques
  const preloadCriticalStylesheets = () => {
    const criticalStylesheets = [
      { href: '/src/index.css' },
      { href: '/src/components/ui/styles.css' },
      // Ajouter d'autres stylesheets critiques ici
    ];

    loadStylesheets(criticalStylesheets);
  };

  // Nettoyer les stylesheets non utilisées
  const cleanupUnusedStylesheets = () => {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !loadedStylesheets.current.has(href)) {
        // Marquer comme non critique pour permettre la suppression
        link.setAttribute('data-non-critical', 'true');
      }
    });
  };

  // Optimiser le chargement au démarrage
  useEffect(() => {
    preloadCriticalStylesheets();
    
    // Nettoyer au démontage
    return () => {
      cleanupUnusedStylesheets();
    };
  }, []);

  return {
    loadStylesheet,
    loadStylesheets,
    preloadCriticalStylesheets,
    cleanupUnusedStylesheets
  };
};
