import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { useReactiveState } from '@/hooks/useReactiveState';
import { useSmoothAnimation } from '@/hooks/useSmoothAnimations';
import { LazyImage } from './LazyComponent';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  isFavorite: boolean;
}

interface ReactiveProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onToggleFavorite: (productId: string) => void;
  onViewDetails: (productId: string) => void;
}

export const ReactiveProductCard: React.FC<ReactiveProductCardProps> = ({
  product,
  onAddToCart,
  onToggleFavorite,
  onViewDetails
}) => {
  // 🚀 État réactif pour les interactions
  const favoriteState = useReactiveState({
    initialValue: product.isFavorite,
    debounceMs: 300,
    enableOptimisticUpdates: true
  });

  const cartState = useReactiveState({
    initialValue: false,
    throttleMs: 500,
    maxUpdatesPerSecond: 2
  });

  // 🎨 Animations fluides
  const hoverAnimation = useSmoothAnimation({
    duration: 200,
    easing: 'ease-out'
  });

  const clickAnimation = useSmoothAnimation({
    duration: 150,
    easing: 'bounce'
  });

  // 🎯 Gestionnaires d'événements optimisés
  const handleFavoriteClick = () => {
    clickAnimation.startAnimation();
    favoriteState.setValueOptimistic(!favoriteState.value);
    onToggleFavorite(product.id);
  };

  const handleAddToCart = () => {
    clickAnimation.startAnimation();
    cartState.setValueOptimistic(true);
    onAddToCart(product.id);
    
    // Reset après 2 secondes
    setTimeout(() => {
      cartState.setValue(false);
    }, 2000);
  };

  const handleViewDetails = () => {
    onViewDetails(product.id);
  };

  // 🧮 Calculs mémorisés
  const discountPercentage = useMemo(() => {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }, [product.price, product.originalPrice]);

  const priceDisplay = useMemo(() => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(product.price);
  }, [product.price]);

  const originalPriceDisplay = useMemo(() => {
    if (!product.originalPrice) return null;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(product.originalPrice);
  }, [product.originalPrice]);

  // 🎨 Styles dynamiques basés sur les animations
  const cardStyle = {
    transform: `scale(${1 + hoverAnimation.progress * 0.05})`,
    boxShadow: `0 ${4 + hoverAnimation.progress * 8}px ${12 + hoverAnimation.progress * 16}px rgba(0,0,0,${0.1 + hoverAnimation.progress * 0.05})`,
    transition: 'all 0.2s ease-out'
  };

  const buttonStyle = {
    transform: `scale(${1 + clickAnimation.progress * 0.1})`,
    transition: 'transform 0.15s ease-out'
  };

  return (
    <Card 
      className="relative overflow-hidden group cursor-pointer"
      style={cardStyle}
      onMouseEnter={hoverAnimation.startAnimation}
      onMouseLeave={() => {
        hoverAnimation.resetAnimation();
        hoverAnimation.startAnimation();
      }}
    >
      {/* Badge de réduction */}
      {discountPercentage > 0 && (
        <Badge 
          className="absolute top-2 left-2 z-10 bg-red-500 text-white"
          style={{ transform: `scale(${1 + clickAnimation.progress * 0.2})` }}
        >
          -{discountPercentage}%
        </Badge>
      )}

      {/* Badge de stock */}
      <Badge 
        className={`absolute top-2 right-2 z-10 ${
          product.inStock ? 'bg-green-500' : 'bg-red-500'
        } text-white`}
      >
        {product.inStock ? 'En stock' : 'Rupture'}
      </Badge>

      {/* Image du produit */}
      <div className="relative aspect-square overflow-hidden">
        <LazyImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          fallback={
            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
              <span className="text-gray-400">Chargement...</span>
            </div>
          }
        />
      </div>

      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {/* Prix */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-green-600">{priceDisplay}</span>
          {originalPriceDisplay && (
            <span className="text-sm text-gray-500 line-through">{originalPriceDisplay}</span>
          )}
        </div>

        {/* Note et avis */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
          <span className="text-sm text-gray-500">({product.reviews} avis)</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleViewDetails}
            style={buttonStyle}
          >
            <Eye className="w-4 h-4 mr-1" />
            Voir
          </Button>

          <Button
            variant={favoriteState.value ? "default" : "outline"}
            size="sm"
            onClick={handleFavoriteClick}
            style={buttonStyle}
            disabled={favoriteState.isUpdating}
          >
            <Heart className={`w-4 h-4 ${favoriteState.value ? 'fill-current' : ''}`} />
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleAddToCart}
            style={buttonStyle}
            disabled={cartState.value || !product.inStock}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {cartState.value ? 'Ajouté !' : 'Ajouter'}
          </Button>
        </div>

        {/* Indicateurs d'état */}
        {favoriteState.isUpdating && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
