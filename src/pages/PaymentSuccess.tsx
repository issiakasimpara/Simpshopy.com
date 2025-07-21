
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useEffect } from 'react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { storeSlug } = useParams();
  const { clearCart } = useCart();

  // Vérifier si nous sommes dans l'aperçu ou dans une boutique publique
  const isInPreview = searchParams.get('preview') === 'true' ||
                     window.self !== window.top;
  const isInStorefront = location.pathname.includes('/store/');

  useEffect(() => {
    // Vider le panier après un paiement réussi
    clearCart();
  }, [clearCart]);

  const handleReturnToShop = () => {
    console.log('🔘 Button clicked - handleReturnToShop');
    console.log('🖼️ isInPreview:', isInPreview);
    console.log('🏪 isInStorefront:', isInStorefront);
    console.log('🏪 storeSlug from params:', storeSlug);
    console.log('🌐 Current pathname:', location.pathname);

    // Extraire le storeSlug depuis l'URL si pas disponible dans les params
    let detectedStoreSlug = storeSlug;
    if (!detectedStoreSlug && location.pathname.includes('/store/')) {
      const pathParts = location.pathname.split('/');
      const storeIndex = pathParts.indexOf('store');
      if (storeIndex !== -1 && pathParts[storeIndex + 1]) {
        detectedStoreSlug = pathParts[storeIndex + 1];
        console.log('🔍 Detected storeSlug from URL:', detectedStoreSlug);
      }
    }

    if (isInPreview) {
      console.log('📤 In preview mode - sending message to parent');
      // Si nous sommes dans l'aperçu, envoyer un message au parent
      try {
        window.parent.postMessage({ type: 'CLOSE_PREVIEW' }, '*');
        console.log('✅ Message sent to close preview');
      } catch (error) {
        console.error('❌ Error sending message:', error);
      }
    } else if (isInStorefront && detectedStoreSlug) {
      console.log('🏪 In storefront - navigating to store home:', detectedStoreSlug);
      // Si nous sommes dans une boutique publique, retourner à l'accueil de cette boutique
      navigate(`/store/${detectedStoreSlug}`);
    } else {
      console.log('🔄 Default navigation to platform home');
      // Navigation par défaut vers la page d'accueil de la plateforme
      navigate('/');
    }
  };

  const handleViewOrders = () => {
    console.log('Button clicked - handleViewOrders');
    
    // Vérifier si nous sommes dans une iframe (mode aperçu du site builder)
    const isInIframe = window.self !== window.top;
    console.log('Is in iframe:', isInIframe);
    
    if (isInIframe) {
      // Si nous sommes dans l'aperçu, on peut soit naviguer vers une page de suivi,
      // soit indiquer que cette fonctionnalité sera disponible sur le vrai site
      console.log('In preview mode - showing customer orders page');
      window.parent.postMessage({ type: 'NAVIGATE_TO_CUSTOMER_ORDERS' }, '*');
    } else {
      // Navigation normale vers la page de suivi des commandes clients
      console.log('Navigating to customer orders page');
      navigate('/mes-commandes');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-3xl font-bold mb-4">Paiement réussi !</h1>
            <p className="text-gray-600 mb-6">
              Merci pour votre commande. Vous recevrez un email de confirmation sous peu.
            </p>
            <div className="space-y-4">
              <Button onClick={handleReturnToShop} className="w-full">
                Retour à la boutique
              </Button>
              <Button variant="outline" onClick={handleViewOrders} className="w-full">
                Suivre mes commandes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
