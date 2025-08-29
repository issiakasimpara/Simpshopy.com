import { useState, useEffect, useRef, useCallback } from 'react';

interface UseOnDemandLoadingOptions {
  threshold?: number; // Pourcentage de visibilité requis (0-1)
  rootMargin?: string; // Marge autour de l'élément
  delay?: number; // Délai avant chargement (ms)
}

export const useOnDemandLoading = <T>(
  importFn: () => Promise<T>,
  options: UseOnDemandLoadingOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    delay = 0
  } = options;

  const [component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const loadComponent = useCallback(async () => {
    if (hasTriggered || isLoading) return;

    setIsLoading(true);
    setHasTriggered(true);

    try {
      // Délai optionnel avant chargement
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const module = await importFn();
      setComponent(module);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur de chargement'));
    } finally {
      setIsLoading(false);
    }
  }, [importFn, delay, hasTriggered, isLoading]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadComponent();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [loadComponent, threshold, rootMargin]);

  return {
    component,
    isLoading,
    error,
    ref,
    loadComponent // Fonction manuelle pour forcer le chargement
  };
};

// Hook spécialisé pour les images - CORRIGÉ
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
            };
            img.onerror = () => {
              const err = new Error(`Impossible de charger l'image: ${src}`);
              setError(err);
            };
            img.src = src;
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [src]);

  return {
    src: imageSrc,
    isLoaded,
    error,
    ref
  };
};

// Hook pour les composants avec préchargement intelligent
export const useSmartPreload = <T>(
  importFn: () => Promise<T>,
  preloadTrigger: 'hover' | 'focus' | 'click' | 'visibility' = 'hover'
) => {
  const [component, setComponent] = useState<T | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const ref = useRef<HTMLElement>(null);

  const preload = useCallback(async () => {
    if (isPreloading || isLoaded) return;

    setIsPreloading(true);
    try {
      const module = await importFn();
      setComponent(module);
      setIsLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur de préchargement'));
    } finally {
      setIsPreloading(false);
    }
  }, [importFn, isPreloading, isLoaded]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTrigger = () => {
      if (preloadTrigger === 'hover') {
        element.addEventListener('mouseenter', preload, { once: true });
      } else if (preloadTrigger === 'focus') {
        element.addEventListener('focus', preload, { once: true });
      } else if (preloadTrigger === 'click') {
        element.addEventListener('click', preload, { once: true });
      } else if (preloadTrigger === 'visibility') {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                preload();
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.1, rootMargin: '200px' }
        );
        observer.observe(element);
        return () => observer.unobserve(element);
      }
    };

    handleTrigger();

    return () => {
      element.removeEventListener('mouseenter', preload);
      element.removeEventListener('focus', preload);
      element.removeEventListener('click', preload);
    };
  }, [preload, preloadTrigger]);

  return {
    component,
    isPreloading,
    isLoaded,
    error,
    ref,
    preload
  };
};
