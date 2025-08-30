import { useState, useEffect, useCallback, useMemo } from 'react';

interface ImageLoadState {
  isLoading: boolean;
  isLoaded: boolean;
  isError: boolean;
  src: string;
}

interface UseOptimizedImageLoaderOptions {
  threshold?: number;
  rootMargin?: string;
  priority?: 'high' | 'low' | 'auto';
  retries?: number;
  timeout?: number;
}

// Cache global pour les images
const imageCache = new Map<string, ImageLoadState>();

// Images optimisées avec compression WebP
const OPTIMIZED_IMAGES = {
  fashion: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop&auto=format&q=75&fm=webp",
  electronics: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop&auto=format&q=75&fm=webp",
  beauty: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=250&fit=crop&auto=format&q=75&fm=webp",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop&auto=format&q=75&fm=webp",
  sports: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop&auto=format&q=75&fm=webp",
  home: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=250&fit=crop&auto=format&q=75&fm=webp",
  art: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=250&fit=crop&auto=format&q=75&fm=webp",
  default: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop&auto=format&q=75&fm=webp"
};

export const useOptimizedImageLoader = (
  category: string,
  options: UseOptimizedImageLoaderOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    priority = 'auto',
    retries = 2,
    timeout = 10000
  } = options;

  const [isInView, setIsInView] = useState(false);
  const [loadState, setLoadState] = useState<ImageLoadState>({
    isLoading: false,
    isLoaded: false,
    isError: false,
    src: ''
  });

  // Obtenir l'URL optimisée de l'image
  const optimizedSrc = useMemo(() => {
    return OPTIMIZED_IMAGES[category as keyof typeof OPTIMIZED_IMAGES] || OPTIMIZED_IMAGES.default;
  }, [category]);

  // Vérifier le cache
  const cachedState = useMemo(() => {
    return imageCache.get(optimizedSrc);
  }, [optimizedSrc]);

  // Charger l'image avec retry
  const loadImage = useCallback(async (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      let retryCount = 0;

      const attemptLoad = () => {
        const timeoutId = setTimeout(() => {
          if (retryCount < retries) {
            retryCount++;
            console.log(`Retry ${retryCount}/${retries} for image: ${src}`);
            attemptLoad();
          } else {
            resolve(false);
          }
        }, timeout);

        img.onload = () => {
          clearTimeout(timeoutId);
          resolve(true);
        };

        img.onerror = () => {
          clearTimeout(timeoutId);
          if (retryCount < retries) {
            retryCount++;
            setTimeout(() => attemptLoad(), 1000);
          } else {
            resolve(false);
          }
        };

        img.src = src;
      };

      attemptLoad();
    });
  }, [retries, timeout]);

  // Intersection Observer pour le lazy loading
  useEffect(() => {
    if (cachedState?.isLoaded) {
      setLoadState(cachedState);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    // Observer l'élément parent (sera attaché via ref)
    const element = document.querySelector(`[data-category="${category}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [category, cachedState, threshold, rootMargin]);

  // Charger l'image quand elle entre dans le viewport
  useEffect(() => {
    if (!isInView || cachedState?.isLoaded) return;

    setLoadState(prev => ({ ...prev, isLoading: true, src: optimizedSrc }));

    loadImage(optimizedSrc).then((success) => {
      const newState: ImageLoadState = {
        isLoading: false,
        isLoaded: success,
        isError: !success,
        src: optimizedSrc
      };

      setLoadState(newState);
      imageCache.set(optimizedSrc, newState);
    });
  }, [isInView, optimizedSrc, cachedState, loadImage]);

  // Précharger l'image si priorité haute
  useEffect(() => {
    if (priority === 'high' && !cachedState?.isLoaded) {
      loadImage(optimizedSrc).then((success) => {
        const newState: ImageLoadState = {
          isLoading: false,
          isLoaded: success,
          isError: !success,
          src: optimizedSrc
        };

        imageCache.set(optimizedSrc, newState);
        if (isInView) {
          setLoadState(newState);
        }
      });
    }
  }, [priority, optimizedSrc, cachedState, loadImage, isInView]);

  return {
    ...loadState,
    isInView,
    optimizedSrc,
    // Fonction pour attacher l'observer à un élément
    ref: useCallback((element: HTMLElement | null) => {
      if (element) {
        element.setAttribute('data-category', category);
      }
    }, [category])
  };
};

// Hook pour précharger plusieurs images
export const useBatchImagePreloader = (categories: string[]) => {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = categories.slice(0, 3).map(async (category) => {
        const src = OPTIMIZED_IMAGES[category as keyof typeof OPTIMIZED_IMAGES] || OPTIMIZED_IMAGES.default;
        
        if (imageCache.has(src)) {
          return src;
        }

        return new Promise<string>((resolve) => {
          const img = new Image();
          img.onload = () => {
            imageCache.set(src, {
              isLoading: false,
              isLoaded: true,
              isError: false,
              src
            });
            resolve(src);
          };
          img.onerror = () => resolve(src);
          img.src = src;
        });
      });

      const loadedImages = await Promise.allSettled(imagePromises);
      const successfulImages = loadedImages
        .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
        .map(result => result.value);

      setPreloadedImages(new Set(successfulImages));
    };

    preloadImages();
  }, [categories]);

  return preloadedImages;
};
