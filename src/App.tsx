
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
import SubdomainRouter from './components/SubdomainRouter';

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
const OptimizedTemplateEditor = lazy(() => import('./components/site-builder/OptimizedTemplateEditor'));
const TemplatePreview = lazy(() => import('./components/site-builder/TemplatePreview'));

// Pages publiques SEO optimisées (chargement synchrone)
import Home from './pages/Home'; // Main homepage - IMPORT SYNCHRONE pour performance
const Features = lazy(() => import('./pages/Features'));
const Pricing = lazy(() => import('./pages/Pricing'));
const TestimonialsPublic = lazy(() => import('./pages/Testimonials'));
const WhyChooseUs = lazy(() => import('./pages/WhyChooseUs'));
const Support = lazy(() => import('./pages/Support'));
const About = lazy(() => import('./pages/About'));

// Pages légales
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
            <Router>
              <GlobalOptimizations />
              <ConditionalPreloading />
              
              {/* 🌐 SUBDOMAIN ROUTER - Sépare admin et storefront */}
              <SubdomainRouter>
                {/* 🏢 INTERFACE ADMIN - simpshopy.com */}
                <Routes>
                  {/* ⚡ ROUTES E-COMMERCE SYNCHRONES (rapides comme Shopify) */}
                  <Route path="/store/:storeSlug" element={<Storefront />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/store/:storeSlug/cart" element={<Cart />} />
                  <Route path="/store/:storeSlug/checkout" element={<Checkout />} />
                  <Route path="/product/:productId" element={<Storefront />} />
                  
                  {/* Pages critiques - CHARGEMENT SYNCHRONE */}
                  {/* Page d'accueil principale */}
                  <Route path="/" element={<Suspense fallback={<LoadingFallback />}><Home /></Suspense>} />
                  <Route path="/index" element={<Index />} />
                  
                  {/* Pages publiques SEO optimisées */}
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
                  
                  {/* Pages légales */}
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
                  
                  {/* 🛠️ PAGES ADMIN - Lazy loading pour performance */}
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
                  <Route path="/settings" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Settings />
                    </Suspense>
                  } />
                  <Route path="/site-builder" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SiteBuilder />
                    </Suspense>
                  } />
                  <Route path="/integrations" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Integrations />
                    </Suspense>
                  } />
                  <Route path="/categories" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Categories />
                    </Suspense>
                  } />
                  <Route path="/store-config" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <StoreConfig />
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
                  <Route path="/testimonials-admin" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Testimonials />
                    </Suspense>
                  } />
                  
                  {/* Intégrations spécifiques */}
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
                  <Route path="/integrations/:integrationId" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <IntegrationDetailPage />
                    </Suspense>
                  } />
                  
                  {/* Onboarding et éditeurs */}
                  <Route path="/onboarding" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <OnboardingWizard />
                    </Suspense>
                  } />
                  <Route path="/template-editor" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <OptimizedTemplateEditor />
                    </Suspense>
                  } />
                  <Route path="/template-preview" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <TemplatePreview />
                    </Suspense>
                  } />
                </Routes>
              </SubdomainRouter>
              
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
