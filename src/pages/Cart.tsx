
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStores } from '@/hooks/useStores';
import { useStoreCurrency } from '@/hooks/useStoreCurrency';
import { useEffect } from 'react';
import { getStoreHomeUrl } from '@/utils/storeNavigation';

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart, setStoreId, storeId } = useCart();
  const navigate = useNavigate();
  const { stores } = useStores();
  const { storeSlug } = useParams();
  const { formatPrice } = useStoreCurrency(storeId);

  // Initialiser le panier avec le premier store disponible
  useEffect(() => {
    if (stores.length > 0 && !storeId) {
      console.log('Cart: Initializing with storeId:', stores[0].id);
      setStoreId(stores[0].id);
    }
  }, [stores, storeId, setStoreId]);

  const handleCheckout = () => {
    // Si nous sommes dans une boutique spécifique, naviguer vers son checkout
    if (storeSlug) {
      navigate(`/store/${storeSlug}/checkout`);
    } else {
      // Sinon, utiliser la première boutique disponible
      if (stores.length > 0) {
        const firstStore = stores[0];
        navigate(`/store/${firstStore.slug || firstStore.id}/checkout`);
      } else {
        navigate('/checkout'); // Fallback
      }
    }
  };

  const handleContinueShopping = () => {
    navigate(getStoreHomeUrl(window.location.pathname));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Mon Panier</h1>

        {items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 sm:py-12">
              <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg sm:text-xl font-medium mb-2">Votre panier est vide</h3>
              <p className="text-gray-600 mb-6">Ajoutez des produits pour commencer vos achats</p>
              <Button onClick={handleContinueShopping}>
                Continuer mes achats
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Liste des articles */}
            <div className="space-y-3 sm:space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      {/* Image et infos produit */}
                      <div className="flex items-center gap-3 sm:gap-4 flex-1">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{item.name}</h3>
                          {item.sku && (
                            <p className="text-xs sm:text-sm text-gray-500">SKU: {item.sku}</p>
                          )}
                          <p className="text-base sm:text-lg font-bold text-blue-600">{formatPrice(item.price)}</p>
                        </div>
                      </div>
                      
                      {/* Contrôles de quantité */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.variant_id)}
                            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                          >
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <span className="w-8 sm:w-12 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.variant_id)}
                            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                        
                        {/* Prix total et bouton supprimer */}
                        <div className="flex flex-col items-end gap-2">
                          <p className="font-bold text-base sm:text-lg">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.product_id, item.variant_id)}
                            className="text-red-500 hover:text-red-700 h-8 w-8 sm:h-9 sm:w-9 p-0"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Résumé et actions */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between text-base sm:text-lg">
                    <span>Sous-total</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Livraison</span>
                    <span>Calculée à l'étape suivante</span>
                  </div>
                  <div className="border-t pt-3 sm:pt-4">
                    <div className="flex justify-between text-lg sm:text-xl font-bold">
                      <span>Total</span>
                      <span>{formatPrice(getTotalPrice())}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                    <Button variant="outline" onClick={clearCart} className="flex-1">
                      Vider le panier
                    </Button>
                    <Button onClick={handleCheckout} className="flex-1">
                      Passer la commande
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
