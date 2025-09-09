import React, { Suspense } from 'react';
import { useOnDemandLoading, useSmartPreload, useLazyImage } from '@/hooks/useOnDemandLoading';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface LazyComponentProps {
  importFn: () => Promise<any>;
  fallback?: React.ReactNode;
  loadingStrategy?: 'intersection' | 'hover' | 'focus' | 'click' | 'visibility';
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  placeholder?: React.ReactNode;
  className?: string;
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="h-6 w-6 animate-spin" />
    <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
  </div>
);

const SkeletonFallback = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export const LazyComponent: React.FC<LazyComponentProps> = ({
  importFn,
  fallback = <DefaultFallback />,
  loadingStrategy = 'intersection',
  threshold = 0.1,
  rootMargin = '50px',
  delay = 0,
  placeholder,
  className = ''
}) => {
  // Utiliser le hook approprié selon la stratégie
  const intersectionData = useOnDemandLoading(importFn, {
    threshold,
    rootMargin,
    delay
  });

  const preloadData = useSmartPreload(importFn, loadingStrategy as any);

  // Sélectionner les données du bon hook
  const data = loadingStrategy === 'intersection' ? intersectionData : preloadData;
  const { component, isLoading, error, ref } = data;

  if (error) {
    return (
      <div className={`p-4 text-center text-red-500 ${className}`}>
        <p>Erreur de chargement</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-blue-500 hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!component) {
    return (
      <div ref={ref} className={className}>
        {placeholder || fallback}
      </div>
    );
  }

  return (
    <Suspense fallback={fallback}>
      {React.createElement(component.default || component)}
    </Suspense>
  );
};

// Composant spécialisé pour les images - CORRIGÉ
interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  width?: number;
  height?: number;
  fallback?: React.ReactNode;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  className = '',
  width,
  height,
  fallback = <Skeleton className="w-full h-32" />
}) => {
  const { src: imageSrc, isLoaded, error, ref } = useLazyImage(src, placeholder);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <span className="text-red-500 text-sm">Erreur d'image</span>
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {!isLoaded ? (
        fallback
      ) : (
        <img
          src={imageSrc || placeholder}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          fetchPriority="auto"
        />
      )}
    </div>
  );
};

// Composant pour le préchargement intelligent
interface SmartPreloadProps {
  importFn: () => Promise<any>;
  trigger: 'hover' | 'focus' | 'click' | 'visibility';
  children: React.ReactNode;
  className?: string;
}

export const SmartPreload: React.FC<SmartPreloadProps> = ({
  importFn,
  trigger,
  children,
  className = ''
}) => {
  const { preload, isPreloading } = useSmartPreload(importFn, trigger);

  return (
    <div 
      className={className}
      onMouseEnter={trigger === 'hover' ? preload : undefined}
      onFocus={trigger === 'focus' ? preload : undefined}
      onClick={trigger === 'click' ? preload : undefined}
    >
      {children}
      {isPreloading && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </div>
  );
};
