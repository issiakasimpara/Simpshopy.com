
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/hooks/useAuth";
import CartWidget from "@/components/site-builder/blocks/CartWidget";
import ErrorBoundary from "@/components/ErrorBoundary";
import DomainRouter from "@/components/DomainRouter";

// ⚡ ÉTAPE 2: LAZY LOADING PROGRESSIF
import { lazy, Suspense } from 'react';

// Pages critiques (chargement immédiat)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";

// Pages importantes (chargement immédiat)
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Storefront from "./pages/Storefront";

// ÉTAPE 2A: Pages moins critiques (lazy loading)
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const TestPage = lazy(() => import("./pages/TestPage"));
const TestSave = lazy(() => import("./pages/TestSave"));
const TestMarkets = lazy(() => import("./pages/TestMarkets"));

// const MonerooTest = lazy(() => import("./pages/MonerooTest")); // Supprimé

// ÉTAPE 2B: Pages de configuration (lazy loading)
const Categories = lazy(() => import("./pages/Categories"));
const Customers = lazy(() => import("./pages/Customers"));
const StoreConfig = lazy(() => import("./pages/StoreConfig"));
const Themes = lazy(() => import("./pages/Themes")); // 🎨 NOUVEAU: Page dédiée aux thèmes
const Domains = lazy(() => import("./pages/Domains"));
const CustomDomains = lazy(() => import("./pages/CustomDomains"));
const Payments = lazy(() => import("./pages/Payments"));
const MarketsShipping = lazy(() => import("./pages/MarketsShipping"));

// ÉTAPE 2C: Pages complexes (lazy loading)
const SiteBuilder = lazy(() => import("./pages/SiteBuilder"));
const TemplateEditor = lazy(() => import("./pages/TemplateEditor"));
const TemplatePreview = lazy(() => import("./components/site-builder/TemplatePreview"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const CustomerOrders = lazy(() => import("./pages/CustomerOrders"));
const TestStoreUrls = lazy(() => import("./pages/TestStoreUrls"));
const TestLogo = lazy(() => import("./pages/TestLogo"));
const TestLogoPlacement = lazy(() => import("./pages/TestLogoPlacement"));
const TestDomains = lazy(() => import("./pages/TestDomains"));
const Monitoring = lazy(() => import("./pages/Monitoring"));
import ProtectedRoute from "./components/ProtectedRoute";

// ⚡ ÉTAPE 3: Monitoring en temps réel (dev uniquement)
import React, { useState } from 'react';
import PerformanceMonitor from './components/PerformanceMonitor';
import SystemDiagnosticPanel from './components/SystemDiagnosticPanel';

// Ajouter l'import pour la page Integrations
const Integrations = lazy(() => import("./pages/Integrations"));
const IntegrationDetailPage = lazy(() => import("./pages/IntegrationDetailPage"));
const MailchimpIntegration = lazy(() => import("./pages/integrations/MailchimpIntegration"));
const MailchimpDashboard = lazy(() => import("./pages/integrations/MailchimpDashboard"));
const MailchimpCallback = lazy(() => import("./pages/api/oauth/mailchimp/callback"));

const queryClient = new QueryClient();

const CartWidgetConditional = () => {
  const location = useLocation();

  // Liste des routes où le panier ne doit PAS apparaître
  const excludedRoutes = [
    // Routes admin/marchands
    '/dashboard',
    '/products',
    '/categories',
    '/orders',
    '/customers',
    '/shipping',
    '/analytics',
    '/settings',
    '/store-config',
    '/domains',
    '/testimonials',
    '/payments',
    '/auth',
    '/site-builder',
    '/template-editor',
    // Pages où le panier est déjà intégré ou non pertinent
    '/cart',
    '/checkout',
    '/payment-success',
    '/mes-commandes'
  ];

  // Vérifier si la route actuelle doit exclure le panier
  const shouldExclude = excludedRoutes.some(route => location.pathname.startsWith(route));

  // Vérifier si nous sommes sur la page d'accueil principale (pas une boutique)
  const isMainHomePage = location.pathname === '/';

  // Afficher le panier seulement sur les pages de boutiques publiques
  if (shouldExclude || isMainHomePage) {
    return null;
  }

  return <CartWidget />;
};



const App = () => {
  // ⚡ ÉTAPE 3: État du moniteur de performance
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(
    import.meta.env.DEV && localStorage.getItem('showPerformanceMonitor') === 'true'
  );

  // Raccourci clavier pour toggle le moniteur (Ctrl+Shift+P)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P' && import.meta.env.DEV) {
        setShowPerformanceMonitor(prev => {
          const newValue = !prev;
          localStorage.setItem('showPerformanceMonitor', String(newValue));
          return newValue;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
            <ErrorBoundary>
              <Routes>
                {/* Route de test */}
                <Route path="/test" element={
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                    <TestPage />
                  </Suspense>
                } />

                {/* Route de test sauvegarde */}
                <Route path="/test-save" element={
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                    <TestSave />
                  </Suspense>
                } />

                {/* Route de test markets */}
                <Route path="/test-markets" element={
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                    <TestMarkets />
                  </Suspense>
                } />

                {/* Route de test URLs boutiques */}
                <Route path="/test-store-urls" element={
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                    <TestStoreUrls />
                  </Suspense>
                } />

                {/* Route de test logo */}
                <Route path="/test-logo" element={
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                    <TestLogo />
                  </Suspense>
                } />

                {/* Route de test placement logo */}
                <Route path="/test-logo-placement" element={
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                    <TestLogoPlacement />
                  </Suspense>
                } />

              {/* Routes publiques/clients */}
              <Route path="/" element={<Index />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment-success" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                  <PaymentSuccess />
                </Suspense>
              } />
              <Route path="/mes-commandes" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                  <CustomerOrders />
                </Suspense>
              } />

              {/* Routes des boutiques publiques */}
              <Route path="/store/:storeSlug" element={<Storefront />} />
              <Route path="/store/:storeSlug/cart" element={<Cart />} />
              <Route path="/store/:storeSlug/checkout" element={<Checkout />} />
              <Route path="/store/:storeSlug/payment-success" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                  <PaymentSuccess />
                </Suspense>
              } />
              
              {/* Route globale de succès de paiement */}
              <Route path="/payment-success" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                  <PaymentSuccess />
                </Suspense>
              } />
              
              {/* Routes d'authentification */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Routes marchands/admin (protégées) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <Categories />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <Customers />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shipping"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <MarketsShipping />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <Analytics />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <Settings />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/store-config"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <StoreConfig />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* 🎨 NOUVEAU: Route pour la galerie de thèmes SEULEMENT */}
              <Route
                path="/themes"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <Themes />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* 🎨 Route pour la galerie de sélection de thèmes (depuis onglet Thèmes) */}
              <Route
                path="/themes/gallery"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <SiteBuilder />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/domains"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <CustomDomains />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* 🏪 Site Builder reste dans store-config */}
              <Route
                path="/store-config/site-builder"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <SiteBuilder />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/store-config/site-builder/editor/:templateId"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <TemplateEditor />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* 👁️ Route pour l'aperçu des thèmes */}
              <Route
                path="/store-config/site-builder/preview/:templateId"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <TemplatePreview />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/testimonials"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <Testimonials />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <Payments />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/monitoring"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <Monitoring />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/test-domains"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <TestDomains />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/integrations"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <Integrations />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/integrations/:id"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <IntegrationDetailPage />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/integrations/mailchimp"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <MailchimpIntegration />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/integrations/mailchimp/dashboard"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                      <MailchimpDashboard integration={null} />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/api/oauth/mailchimp/callback"
                element={
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                    <MailchimpCallback />
                  </Suspense>
                }
              />
              

              
              <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
            <CartWidgetConditional />
            


            {/* ⚡ ÉTAPE 3: Moniteur de performance (dev uniquement) */}
            {import.meta.env.DEV && (
              <PerformanceMonitor
                isVisible={showPerformanceMonitor}
                onClose={() => {
                  setShowPerformanceMonitor(false);
                  localStorage.setItem('showPerformanceMonitor', 'false');
                }}
              />
            )}

            {/* 🔍 Panneau de diagnostic système (dev uniquement) */}
            {import.meta.env.DEV && <SystemDiagnosticPanel />}
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
