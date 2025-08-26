
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
// Imports optimisés - hooks de nettoyage supprimés pour réduire la taille du bundle
import { useSessionOptimizer } from './hooks/useSessionOptimizer';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from './components/ui/toaster';
import CookieConsent from './components/CookieConsent';
import ConditionalPreloading from './components/ConditionalPreloading';
import LoadingFallback from './components/LoadingFallback';
import DomainBasedRouter from './components/DomainBasedRouter';
import AdminRouteGuard from './components/AdminRouteGuard';
import PublicRouteGuard from './components/PublicRouteGuard';
import ConditionalCookieConsent from './components/ConditionalCookieConsent';
import StorageInitializer from './components/StorageInitializer';

// ⚡ IMPORT SYNCHRONE pour la boutique publique (rapide comme Shopify)
import Storefront from './pages/Storefront';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import Index from './pages/Index';

// Lazy loading UNIQUEMENT pour les pages admin (pas critiques)
const Dashboard = lazy(() => import('./pages/Dashboard'));
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
const OptimizedTemplateEditor = lazy(() => import('./components/site-builder/OptimizedTemplateEditor'));
const TemplatePreview = lazy(() => import('./components/site-builder/TemplatePreview'));

// Pages publiques SEO optimisées (chargement synchrone)
import Home from './pages/Home'; // Main homepage - IMPORT SYNCHRONE pour performance
import Features from './pages/Features'; // Page importante - IMPORT SYNCHRONE
import Pricing from './pages/Pricing'; // Page importante - IMPORT SYNCHRONE
import About from './pages/About'; // Page importante - IMPORT SYNCHRONE
import TestimonialsPublic from './pages/Testimonials'; // Page importante - IMPORT SYNCHRONE
import WhyChooseUs from './pages/WhyChooseUs'; // Page importante - IMPORT SYNCHRONE
import Support from './pages/Support'; // Page importante - IMPORT SYNCHRONE
import Auth from './pages/Auth'; // Page critique - IMPORT SYNCHRONE pour conversion

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
            <StorageInitializer>
              <Router>
                <GlobalOptimizations />
                
                {/* 🌐 DOMAIN BASED ROUTER - Gère le routage basé sur les domaines */}
                <DomainBasedRouter>
                  {/* 🏢 INTERFACE ADMIN - simpshopy.com */}
                  <Routes>
                    {/* ⚡ ROUTES E-COMMERCE PUBLIQUES - Accessibles sur simpshopy.com uniquement */}
                    <Route path="/store/:storeSlug" element={
                      <PublicRouteGuard>
                        <Storefront />
                      </PublicRouteGuard>
                    } />
                    <Route path="/cart" element={
                      <PublicRouteGuard>
                        <Cart />
                      </PublicRouteGuard>
                    } />
                    <Route path="/checkout" element={
                      <PublicRouteGuard>
                        <Checkout />
                      </PublicRouteGuard>
                    } />
                    <Route path="/payment-success" element={
                      <PublicRouteGuard>
                        <PaymentSuccess />
                      </PublicRouteGuard>
                    } />
                    <Route path="/store/:storeSlug/cart" element={
                      <PublicRouteGuard>
                        <Cart />
                      </PublicRouteGuard>
                    } />
                    <Route path="/store/:storeSlug/checkout" element={
                      <PublicRouteGuard>
                        <Checkout />
                      </PublicRouteGuard>
                    } />
                    <Route path="/product/:productId" element={
                      <PublicRouteGuard>
                        <Storefront />
                      </PublicRouteGuard>
                    } />
                    
                    {/* Pages critiques - CHARGEMENT SYNCHRONE */}
                    {/* Page d'accueil principale */}
                    <Route path="/" element={
                      <PublicRouteGuard>
                        <Home />
                      </PublicRouteGuard>
                    } />
                    <Route path="/index" element={
                      <PublicRouteGuard>
                        <Index />
                      </PublicRouteGuard>
                    } />
                    
                    {/* Pages publiques SEO optimisées */}
                    <Route path="/features" element={
                      <PublicRouteGuard>
                        <Features />
                      </PublicRouteGuard>
                    } />
                    <Route path="/pricing" element={
                      <PublicRouteGuard>
                        <Pricing />
                      </PublicRouteGuard>
                    } />
                    <Route path="/testimonials" element={
                      <PublicRouteGuard>
                        <TestimonialsPublic />
                      </PublicRouteGuard>
                    } />
                    <Route path="/why-choose-us" element={
                      <PublicRouteGuard>
                        <WhyChooseUs />
                      </PublicRouteGuard>
                    } />
                    <Route path="/support" element={
                      <PublicRouteGuard>
                        <Support />
                      </PublicRouteGuard>
                    } />
                    <Route path="/about" element={
                      <PublicRouteGuard>
                        <About />
                      </PublicRouteGuard>
                    } />
                    
                    {/* Pages légales */}
                    <Route path="/legal" element={
                      <PublicRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <Legal />
                        </Suspense>
                      </PublicRouteGuard>
                    } />
                    <Route path="/privacy" element={
                      <PublicRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <Privacy />
                        </Suspense>
                      </PublicRouteGuard>
                    } />
                    <Route path="/terms" element={
                      <PublicRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <Terms />
                        </Suspense>
                      </PublicRouteGuard>
                    } />
                    
                    {/* �� AUTHENTIFICATION - Accessible sur les deux domaines */}
                    <Route path="/auth" element={
                      <Auth />
                    } />
                    <Route path="/dashboard" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <Dashboard />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/analytics" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <Analytics />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/products" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <Products />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/orders" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <Orders />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/customers" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <Customers />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/settings" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <Settings />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/site-builder" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <SiteBuilder />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/integrations" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <Integrations />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/categories" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <Categories />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/store-config" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <StoreConfig />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/store-config/site-builder" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <SiteBuilder />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/store-config/site-builder/editor/:templateId" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <OptimizedTemplateEditor />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/shipping" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <Shipping />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/payments" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <Payments />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/themes" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <Themes />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/domains" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <Domains />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/testimonials-admin" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <Testimonials />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    
                    {/* Intégrations spécifiques */}
                    <Route path="/integrations/dsers" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <DsersIntegration />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/integrations/mailchimp" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <MailchimpIntegration />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/integrations/:integrationId" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <IntegrationDetailPage />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    
                    {/* Onboarding et éditeurs */}
                    <Route path="/onboarding" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <OnboardingWizard />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/template-editor" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <OptimizedTemplateEditor />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                    <Route path="/template-preview" element={
                      <AdminRouteGuard>
                        <Suspense fallback={<LoadingFallback />}>
                          <TemplatePreview />
                        </Suspense>
                      </AdminRouteGuard>
                    } />
                  </Routes>
                </DomainBasedRouter>
                
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
