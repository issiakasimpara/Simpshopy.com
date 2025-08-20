
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

// Lazy loading des composants
const Index = lazy(() => import('./pages/Index'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Auth = lazy(() => import('./pages/Auth'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Products = lazy(() => import('./pages/Products'));
const Orders = lazy(() => import('./pages/Orders'));
const Customers = lazy(() => import('./pages/Customers'));
const Settings = lazy(() => import('./pages/Settings'));
const SiteBuilder = lazy(() => import('./pages/SiteBuilder'));
const Storefront = lazy(() => import('./pages/Storefront'));
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
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const Demo = lazy(() => import('./pages/Demo'));
const TestLogo = lazy(() => import('./pages/TestLogoPlacement'));
const OptimizedTemplateEditor = lazy(() => import('./components/site-builder/OptimizedTemplateEditor'));
const TemplatePreview = lazy(() => import('./components/site-builder/TemplatePreview'));

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
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                </div>
              }>
              <Routes>
              <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/themes" element={<Themes />} />
                  <Route path="/domains" element={<Domains />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/store-config" element={<StoreConfig />} />
                  <Route path="/integrations/dsers" element={<DsersIntegration />} />
                  <Route path="/integrations/mailchimp" element={<MailchimpIntegration />} />
                  <Route path="/integrations/:id" element={<IntegrationDetailPage />} />
                  <Route path="/site-builder" element={<SiteBuilder />} />
                  <Route path="/storefront" element={<Storefront />} />
                  <Route path="/store/:storeSlug" element={<Storefront />} />
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="/testimonials" element={<Testimonials />} />
                  <Route path="/admin/testimonials" element={<Testimonials />} />
                  <Route path="/onboarding" element={<OnboardingWizard />} />
                  
                  {/* Routes E-commerce CRITIQUES */}
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  
                  {/* Routes de démonstration */}
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/test-logo" element={<TestLogo />} />
                  
                  {/* Routes d'éditeur de template */}
                  <Route path="/store-config/site-builder/editor/:templateId" element={<OptimizedTemplateEditor />} />
                  <Route path="/store-config/site-builder/preview/:templateId" element={<TemplatePreview />} />
                  
                  {/* Routes de boutique spécifique */}
                  <Route path="/store/:storeSlug/cart" element={<Cart />} />
                  <Route path="/store/:storeSlug/checkout" element={<Checkout />} />
                  
                  {/* Routes de produits */}
                  <Route path="/product/:productId" element={<Storefront />} />
                </Routes>
                    </Suspense>
              <Toaster />
            </Router>
      </CartProvider>
    </AuthProvider>
      </ThemeProvider>
  </QueryClientProvider>
  );
}

export default App;
