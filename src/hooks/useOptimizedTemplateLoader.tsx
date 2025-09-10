
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Template } from '@/types/template';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useStores } from '@/hooks/useStores';
import { useSiteTemplates } from '@/hooks/useSiteTemplates';
import { preBuiltTemplates } from '@/data/preBuiltTemplates';

interface LoadingState {
  currentStep: string;
  progress: number;
  isLoading: boolean;
  error: string | null;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY_PREFIX = 'template_cache_';

// Cache global pour les templates précompilés
const templateCompilationCache = new Map<string, Template>();

// Fonction pour précompiler un template (optimisation des images et données)
const precompileTemplate = (template: Template): Template => {
  // Vérifier si déjà précompilé
  if (templateCompilationCache.has(template.id)) {
    return templateCompilationCache.get(template.id)!;
  }

  // Optimiser les images dans les blocs
  const optimizedBlocks = template.blocks?.map(block => {
    if (block.content?.backgroundImage) {
      // Optimiser les URLs d'images avec compression WebP
      const originalUrl = block.content.backgroundImage;
      if (originalUrl.includes('unsplash.com')) {
        block.content.backgroundImage = `${originalUrl}?w=800&h=600&fit=crop&auto=format&q=75&fm=webp`;
      }
    }
    return block;
  });

  // Optimiser les pages
  const optimizedPages = template.pages ? Object.fromEntries(
    Object.entries(template.pages).map(([pageName, pageBlocks]) => [
      pageName,
      pageBlocks.map(block => {
        if (block.content?.backgroundImage) {
          const originalUrl = block.content.backgroundImage;
          if (originalUrl.includes('unsplash.com')) {
            block.content.backgroundImage = `${originalUrl}?w=800&h=600&fit=crop&auto=format&q=75&fm=webp`;
          }
        }
        return block;
      })
    ])
  ) : {};

  const optimizedTemplate: Template = {
    ...template,
    blocks: optimizedBlocks,
    pages: optimizedPages
  };

  // Mettre en cache
  templateCompilationCache.set(template.id, optimizedTemplate);
  
  return optimizedTemplate;
};

export const useOptimizedTemplateLoader = (templateId: string) => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { stores, isLoading: storesLoading, refetchStores } = useStores();
  const selectedStore = stores.length > 0 ? stores[0] : null;
  const { loadTemplate, saveTemplate } = useSiteTemplates(selectedStore?.id);

  const [template, setTemplate] = useState<Template | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    currentStep: 'auth',
    progress: 0,
    isLoading: true,
    error: null
  });

  // Cache utilities optimisées
  const getCachedTemplate = useCallback((id: string): Template | null => {
    try {
      const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${id}`);
      if (cached) {
        const { data, timestamp, version } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          // Vérifier si le template est déjà précompilé
          if (version === 'precompiled') {
            return data;
          } else {
            // Précompiler le template mis en cache
            const precompiled = precompileTemplate(data);
            // Mettre à jour le cache avec la version précompilée
            setCachedTemplate(id, precompiled);
            return precompiled;
          }
        }
        localStorage.removeItem(`${CACHE_KEY_PREFIX}${id}`);
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }
    return null;
  }, []);

  const setCachedTemplate = useCallback((id: string, data: Template) => {
    try {
      // Vérifier si le template est déjà précompilé
      const isPrecompiled = templateCompilationCache.has(id);
      localStorage.setItem(`${CACHE_KEY_PREFIX}${id}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        version: isPrecompiled ? 'precompiled' : 'raw'
      }));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }, []);

  const updateProgress = useCallback((step: string, progress: number) => {
    setLoadingState(prev => ({ ...prev, currentStep: step, progress }));
  }, []);

  // Préchargement des images critiques
  const preloadCriticalImages = useCallback(async (template: Template) => {
    const imageUrls: string[] = [];
    
    // Collecter toutes les URLs d'images du template
    template.blocks?.forEach(block => {
      if (block.content?.backgroundImage) {
        imageUrls.push(block.content.backgroundImage);
      }
    });

    Object.values(template.pages || {}).forEach(pageBlocks => {
      pageBlocks.forEach(block => {
        if (block.content?.backgroundImage) {
          imageUrls.push(block.content.backgroundImage);
        }
      });
    });

    // Précharger les 3 premières images en priorité
    const criticalImages = imageUrls.slice(0, 3);
    const preloadPromises = criticalImages.map(url => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Continuer même en cas d'erreur
        img.src = url;
      });
    });

    await Promise.allSettled(preloadPromises);
  }, []);

  const loadTemplateData = useCallback(async () => {
    if (!templateId || !selectedStore) return;

    try {
      updateProgress('template', 60);

      // Check cache first
      const cachedTemplate = getCachedTemplate(templateId);
      if (cachedTemplate) {
        console.log('Template loaded from cache:', cachedTemplate);
        setTemplate(cachedTemplate);
        updateProgress('ready', 100);
        setLoadingState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Load from database
      const savedTemplate = await loadTemplate(selectedStore.id, templateId);
      
      if (savedTemplate) {
        console.log('Template loaded from database:', savedTemplate);
        const optimizedTemplate = precompileTemplate(savedTemplate);
        setTemplate(optimizedTemplate);
        setCachedTemplate(templateId, optimizedTemplate);
      } else {
        // Load pre-built template
        updateProgress('template', 70);
        const foundTemplate = preBuiltTemplates.find(t => t.id === templateId);
        
        if (foundTemplate) {
          console.log('Pre-built template loaded:', foundTemplate);
          const optimizedTemplate = precompileTemplate(foundTemplate);
          setTemplate(optimizedTemplate);
          setCachedTemplate(templateId, optimizedTemplate);
          
          // Précharger les images critiques en arrière-plan
          updateProgress('images', 85);
          preloadCriticalImages(optimizedTemplate).catch(console.warn);
          
          // Save to database in background
          updateProgress('template', 80);
          try {
            await saveTemplate(selectedStore.id, foundTemplate.id, foundTemplate);
            console.log('Template saved to database');
          } catch (saveError) {
            console.warn('Background save failed:', saveError);
          }
        } else {
          throw new Error('Template not found');
        }
      }

      updateProgress('ready', 100);
      setLoadingState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Template loading error:', error);
      setLoadingState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, [templateId, selectedStore, getCachedTemplate, setCachedTemplate, updateProgress, loadTemplate, saveTemplate, preloadCriticalImages]);

  // Initialization
  useEffect(() => {
    if (authLoading || storesLoading) {
      updateProgress('auth', authLoading ? 20 : 40);
      return;
    }

    if (!user) {
      setLoadingState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Authentication required' 
      }));
      return;
    }

    if (!selectedStore) {
      setLoadingState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'No store found' 
      }));
      return;
    }

    loadTemplateData();
  }, [user, authLoading, storesLoading, selectedStore, loadTemplateData, updateProgress]);

  // Mémoisation de l'état de prêt
  const isReady = useMemo(() => {
    return !loadingState.isLoading && !loadingState.error && template !== null;
  }, [loadingState.isLoading, loadingState.error, template]);

  return {
    template,
    loadingState,
    selectedStore,
    isReady,
    refetch: loadTemplateData
  };
};
