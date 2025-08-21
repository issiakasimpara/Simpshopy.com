
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import { useGlobalRealtimeCleanup } from './hooks/useOptimizedRealtime';
import { useGlobalSessionCleanup } from './hooks/useSessionOptimizer';
import { useCartSessionsCleanup } from './hooks/useOptimizedCartSessions';
import { useSessionOptimizer } from './hooks/useSessionOptimizer';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from './components/ui/toaster';
import CookieConsent from './components/CookieConsent';
import ConditionalPreloading from './components/ConditionalPreloading';
import LoadingFallback from './components/LoadingFallback';

// ⚡ IMPORT SYNCHRONE pour la boutique publique (rapide comme Shopify)
import Storefront from './pages/Storefront';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import Index from './pages/Index';

// Lazy loading UNIQUEMENT pour les pages admin (pas critiques)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Auth = lazy(() => import('./pages/Auth'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Products = lazy(() => import('./pages/Products'));
const Orders = lazy(() => import('./pages/Orders'));
const Customers = lazy(() => import('./pages/Customers'));
const Settings = lazy(() => import('./pages/Settings'));
const SiteBuilder = lazy(() => import('./pages/SiteBuilder'));
const Integrations = lazy(() => import('./pages/Integrations'));
const Testimonials = lazy(() => import('./pages/admin/TestimonialsPage'));
const Categories = lazy(() => import('./pages/Categories'));
const StoreConfig = lazy(() => import('./pages/StoreConfig'));
const Shipping = lazy(() => import('./pages/MarketsShipping'));
const Payments = lazy(() => import('./pages/Payments'));
const Themes = lazy(() => import('./pages/Themes'));
const Domains = lazy(() => import('./pages/Domains'));
const DsersIntegration = lazy(() => import('./pages/integrations/DsersIntegration'));
const MailchimpIntegration = lazy(() => import('./pages/integrations/MailchimpIntegration'));
const IntegrationDetailPage = lazy(() => import('./pages/IntegrationDetailPage'));
const OnboardingWizard = lazy(() => import('./components/onboarding/OnboardingWizard'));
const Demo = lazy(() => import('./pages/Demo'));
const TestLogo = lazy(() => import('./pages/TestLogoPlacement'));
const OptimizedTemplateEditor = lazy(() => import('./components/site-builder/OptimizedTemplateEditor'));
const TemplatePreview = lazy(() => import('./components/site-builder/TemplatePreview'));
const PreloadingDemo = lazy(() => import('./components/PreloadingDemo'));

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
  
  // Configuration de session optimisée au démarrage
  React.useEffect(() => {
    configureSession({
      searchPath: 'public',
      role: 'authenticated'
    });
  }, [configureSession]);

  return null;
}

function App() {
  return (
      <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <GlobalOptimizations />
              <ConditionalPreloading />
              
              {/* ⚡ ROUTES E-COMMERCE SYNCHRONES (rapides comme Shopify) */}
              <Routes>
                {/* Boutique publique - CHARGEMENT SYNCHRONE */}
                <Route path="/store/:storeSlug" element={<Storefront />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/store/:storeSlug/cart" element={<Cart />} />
                <Route path="/store/:storeSlug/checkout" element={<Checkout />} />
                <Route path="/product/:productId" element={<Storefront />} />
                
                {/* Pages critiques - CHARGEMENT SYNCHRONE */}
                <Route path="/" element={<Index />} />
                
                {/* Pages admin - LAZY LOADING (pas critiques) */}
                <Route path="/dashboard" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Dashboard />
                  </Suspense>
                } />
                <Route path="/auth" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Auth />
                  </Suspense>
                } />
                <Route path="/analytics" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Analytics />
                  </Suspense>
                } />
                <Route path="/products" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Products />
                  </Suspense>
                } />
                <Route path="/categories" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Categories />
                  </Suspense>
                } />
                <Route path="/orders" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Orders />
                  </Suspense>
                } />
                <Route path="/customers" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Customers />
                  </Suspense>
                } />
                <Route path="/shipping" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Shipping />
                  </Suspense>
                } />
                <Route path="/payments" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Payments />
                  </Suspense>
                } />
                <Route path="/themes" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Themes />
                  </Suspense>
                } />
                <Route path="/domains" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Domains />
                  </Suspense>
                } />
                <Route path="/settings" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Settings />
                  </Suspense>
                } />
                <Route path="/store-config" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <StoreConfig />
                  </Suspense>
                } />
                <Route path="/integrations/dsers" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <DsersIntegration />
                  </Suspense>
                } />
                <Route path="/integrations/mailchimp" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <MailchimpIntegration />
                  </Suspense>
                } />
                <Route path="/integrations/:id" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <IntegrationDetailPage />
                  </Suspense>
                } />
                <Route path="/site-builder" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <SiteBuilder />
                  </Suspense>
                } />
                <Route path="/storefront" element={<Storefront />} />
                <Route path="/integrations" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Integrations />
                  </Suspense>
                } />
                <Route path="/testimonials" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Testimonials />
                  </Suspense>
                } />
                <Route path="/admin/testimonials" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Testimonials />
                  </Suspense>
                } />
                <Route path="/onboarding" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <OnboardingWizard />
                  </Suspense>
                } />
                
                {/* Routes de démonstration */}
                <Route path="/demo" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Demo />
                  </Suspense>
                } />
                <Route path="/test-logo" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <TestLogo />
                  </Suspense>
                } />
                <Route path="/preloading-demo" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <PreloadingDemo />
                  </Suspense>
                } />
                
                {/* Routes d'éditeur de template */}
                <Route path="/store-config/site-builder/editor/:templateId" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <OptimizedTemplateEditor />
                  </Suspense>
                } />
                <Route path="/store-config/site-builder/preview/:templateId" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <TemplatePreview />
                  </Suspense>
                } />
              </Routes>
              
              <Toaster />
              <CookieConsent />
            </Router>
      </CartProvider>
    </AuthProvider>
      </ThemeProvider>
  </QueryClientProvider>
  );
}

export default App;
