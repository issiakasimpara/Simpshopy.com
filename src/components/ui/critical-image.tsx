import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CriticalImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  quality?: number;
  preload?: boolean;
}

const CriticalImage = React.memo(({
  src,
  alt,
  className,
  fallback = '/placeholder-image.jpg',
  quality = 90,
  preload = true,
  ...props
}: CriticalImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Préchargement immédiat pour les images critiques
  useEffect(() => {
    if (!preload) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setHasError(true);
    img.src = src;
  }, [src, preload]);

  // Optimiser l'URL de l'image
  const optimizedSrc = React.useMemo(() => {
    if (hasError) return fallback;
    
    // Si c'est une URL Supabase, ajouter des paramètres d'optimisation
    if (src.includes('supabase')) {
      const url = new URL(src);
      url.searchParams.set('quality', quality.toString());
      url.searchParams.set('format', 'webp');
      return url.toString();
    }
    
    return src;
  }, [src, quality, hasError, fallback]);

  return (
    <div 
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-gray-100",
        className
      )}
    >
      {/* Skeleton loader minimal pour les images critiques */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}
      
      {/* Image critique - chargement immédiat */}
      <img
        src={optimizedSrc}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          "transition-opacity duration-200",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        loading="eager"
        fetchPriority="high"
        decoding="sync"
        {...props}
      />
    </div>
  );
});

CriticalImage.displayName = 'CriticalImage';

export default CriticalImage;
