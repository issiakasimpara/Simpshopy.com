
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import { useSessionOptimizer } from './hooks/useSessionOptimizer';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from './components/ui/toaster';
import ConditionalPreloading from './components/ConditionalPreloading';
import LoadingFallback from './components/LoadingFallback';
import ConditionalCookieConsent from './components/ConditionalCookieConsent';
import StorageInitializer from './components/StorageInitializer';
import ProtectedRoute from './components/ProtectedRoute';
import { useGlobalMarketSettingsCleanup } from './hooks/useGlobalMarketSettings';

// ⚡ IMPORT SYNCHRONE pour la boutique publique (rapide comme Shopify)
import Storefront from './pages/Storefront';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import Index from './pages/Index';

// ⚡ IMPORT SYNCHRONE pour TOUTES les pages admin (navigation instantanée)
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import SiteBuilder from './pages/SiteBuilder';
import Integrations from './pages/Integrations';
import Testimonials from './pages/admin/TestimonialsPage';
import Categories from './pages/Categories';
import StoreConfig from './pages/StoreConfig';
import Shipping from './pages/MarketsShipping';
import Payments from './pages/Payments';
import Themes from './pages/Themes';
import Domains from './pages/Domains';
import PopupsReductions from './pages/PopupsReductions';
const DsersIntegration = lazy(() => import('./pages/integrations/DsersIntegration'));
const MailchimpIntegration = lazy(() => import('./pages/integrations/MailchimpIntegration'));
const IntegrationDetailPage = lazy(() => import('./pages/IntegrationDetailPage'));
const OnboardingWizard = lazy(() => import('./components/onboarding/OnboardingWizard'));
const OptimizedTemplateEditor = lazy(() => import('./components/site-builder/OptimizedTemplateEditor'));
const TemplatePreview = lazy(() => import('./components/site-builder/TemplatePreview'));

// Pages publiques critiques (chargement synchrone) - SEULEMENT les plus importantes
import Home from './pages/Home'; // Main homepage - IMPORT SYNCHRONE pour performance
import Auth from './pages/Auth'; // Page critique - IMPORT SYNCHRONE pour conversion

// Pages publiques secondaires (lazy loading pour optimiser le bundle principal)
const Features = lazy(() => import('./pages/Features'));
const Pricing = lazy(() => import('./pages/Pricing'));
const About = lazy(() => import('./pages/About'));
const TestimonialsPublic = lazy(() => import('./pages/Testimonials'));
const WhyChooseUs = lazy(() => import('./pages/WhyChooseUs'));
const Support = lazy(() => import('./pages/Support'));

// Pages légales (peuvent rester en lazy loading car moins critiques)
const Legal = lazy(() => import('./pages/Legal'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

// Configuration du client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Composant pour les optimisations globales
function GlobalOptimizations() {
  // Optimiseur de session global
  const { configureSession } = useSessionOptimizer();
  
  // Nettoyage du cache global market_settings
  const cleanupMarketSettings = useGlobalMarketSettingsCleanup();
  
  // Configuration de session optimisée au démarrage
  React.useEffect(() => {
    configureSession({
      searchPath: 'public',
      role: 'authenticated'
    });
  }, [configureSession]);

  // Nettoyage au démontage
  React.useEffect(() => {
    return cleanupMarketSettings;
  }, [cleanupMarketSettings]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <StorageInitializer>
              <Router>
                <GlobalOptimizations />
                <ConditionalPreloading />
                
                {/* 🌐 ROUTAGE SIMPLIFIÉ - Tout sur simpshopy.com */}
                <Routes>
                  {/* 🏠 PAGE D'ACCUEIL */}
                  <Route path="/" element={<Home />} />
                  
                  {/* 🛍️ BOUTIQUE PUBLIQUE */}
                  <Route path="/store/:storeSlug" element={<Storefront />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/product/:productId" element={<Index />} />
                  
                  {/* 📄 PAGES PUBLIQUES SEO OPTIMISÉES */}
                  <Route path="/features" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Features />
                    </Suspense>
                  } />
                  <Route path="/pricing" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Pricing />
                    </Suspense>
                  } />
                  <Route path="/testimonials" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <TestimonialsPublic />
                    </Suspense>
                  } />
                  <Route path="/why-choose-us" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <WhyChooseUs />
                    </Suspense>
                  } />
                  <Route path="/support" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Support />
                    </Suspense>
                  } />
                  <Route path="/about" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <About />
                    </Suspense>
                  } />
                  
                  {/* 📜 PAGES LÉGALES */}
                  <Route path="/legal" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Legal />
                    </Suspense>
                  } />
                  <Route path="/privacy" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Privacy />
                    </Suspense>
                  } />
                  <Route path="/terms" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Terms />
                    </Suspense>
                  } />
                  
                  {/* 🔐 AUTHENTIFICATION */}
                  <Route path="/auth" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Auth />
                    </Suspense>
                  } />
                  
                  {/* 🎛️ INTERFACE ADMIN - NAVIGATION INSTANTANÉE */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  } />
                  <Route path="/products" element={
                    <ProtectedRoute>
                      <Products />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route path="/customers" element={
                    <ProtectedRoute>
                      <Customers />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/site-builder" element={
                    <ProtectedRoute>
                      <SiteBuilder />
                    </ProtectedRoute>
                  } />
                  <Route path="/integrations" element={
                    <ProtectedRoute>
                      <Integrations />
                    </ProtectedRoute>
                  } />
                  <Route path="/categories" element={
                    <ProtectedRoute>
                      <Categories />
                    </ProtectedRoute>
                  } />
                  <Route path="/store-config" element={
                    <ProtectedRoute>
                      <StoreConfig />
                    </ProtectedRoute>
                  } />
                  <Route path="/store-config/site-builder" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <SiteBuilder />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/store-config/site-builder/editor/:templateId" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedTemplateEditor />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/shipping" element={
                    <ProtectedRoute>
                      <Shipping />
                    </ProtectedRoute>
                  } />
                  <Route path="/payments" element={
                    <ProtectedRoute>
                      <Payments />
                    </ProtectedRoute>
                  } />
                  <Route path="/popups-reductions" element={
                    <ProtectedRoute>
                      <PopupsReductions />
                    </ProtectedRoute>
                  } />
                  <Route path="/themes" element={
                    <ProtectedRoute>
                      <Themes />
                    </ProtectedRoute>
                  } />
                  <Route path="/domains" element={
                    <ProtectedRoute>
                      <Domains />
                    </ProtectedRoute>
                  } />
                  <Route path="/testimonials-admin" element={
                    <ProtectedRoute>
                      <Testimonials />
                    </ProtectedRoute>
                  } />
                  
                  {/* 🔌 INTÉGRATIONS SPÉCIFIQUES */}
                  <Route path="/integrations/dsers" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <DsersIntegration />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/integrations/mailchimp" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <MailchimpIntegration />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/integrations/:integrationId" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <IntegrationDetailPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  {/* 🚀 ONBOARDING ET ÉDITEURS */}
                  <Route path="/onboarding" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OnboardingWizard />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/template-editor" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OptimizedTemplateEditor />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/template-preview" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <TemplatePreview />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                </Routes>
                
                <Toaster />
                <ConditionalCookieConsent />
              </Router>
            </StorageInitializer>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
