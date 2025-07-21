
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Palette } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import CreateStoreDialog from '@/components/CreateStoreDialog';
import { useStores } from '@/hooks/useStores';
import { useAuth } from '@/hooks/useAuth';
import { preBuiltTemplates } from '@/data/preBuiltTemplates';
import StoreHeader from '@/components/store-config/StoreHeader';
import StoreActions from '@/components/store-config/StoreActions';
import StoreStatusCard from '@/components/store-config/StoreStatusCard';
import StoreConfigForm from '@/components/store-config/StoreConfigForm';
import StorePreview from '@/components/store-config/StorePreview';
import NoStoreSelectedState from '@/components/store-config/NoStoreSelectedState';

const StoreConfig = () => {
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [viewMode, setViewMode] = useState<'template' | 'config'>('template');
  const { store, hasStore, updateStore, isUpdating, isLoading, refetchStores } = useStores();
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  
  // Form data for the single store
  const [formData, setFormData] = useState({
    name: store?.name || '',
    description: store?.description || '',
    domain: store?.domain || '',
    status: (store?.status || 'draft') as 'draft' | 'active' | 'suspended',
  });

  // Rafraîchir les données quand l'utilisateur change ou quand on arrive sur la page
  useEffect(() => {
    if (user && !authLoading) {
      console.log('User changed or page loaded, refreshing stores...');
      refetchStores();
    }
  }, [user, authLoading, refetchStores]);

  // Update form data when store changes
  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        description: store.description || '',
        domain: store.domain || '',
        status: store.status,
      });
    }
  }, [store]);

  // Get template for the store (for demo, we'll use the first template)
  const storeTemplate = store ? preBuiltTemplates[0] : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    
    updateStore({
      id: store.id,
      name: formData.name,
      description: formData.description || null,
      domain: formData.domain || null,
      status: formData.status,
    });
  };

  const handleDomainSubmit = (domainData: any) => {
    if (!store) return;
    
    updateStore({
      id: store.id,
      name: store.name,
      description: store.description || null,
      domain: domainData.domain || null,
      status: store.status,
    });
  };

  // Determine current tab from URL
  const getCurrentTab = () => {
    if (location.pathname === '/store-config/site-builder') return 'site-builder';
    return 'config';
  };

  const currentTab = getCurrentTab();
  const isInSiteBuilder = location.pathname.includes('/store-config/site-builder');

  const handleStoreCreated = () => {
    setViewMode('template');
    // Rafraîchir les données après création
    setTimeout(() => {
      refetchStores();
    }, 1000);
  };

  // Afficher un état de chargement pendant que l'authentification se charge
  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Chargement de vos données...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20 pointer-events-none rounded-3xl" />
        
        <div className="relative space-y-8 p-1">
          <StoreHeader 
            isInSiteBuilder={isInSiteBuilder}
            store={store}
            hasStore={hasStore}
            onCreateStore={() => setShowCreateStore(true)}
          />

          {/* Template Preview or Configuration */}
          {store ? (
            <div className="space-y-8">
              {/* Template Actions */}
              <StoreActions 
                selectedStore={store}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                storeTemplateId={storeTemplate?.id}
              />

              {viewMode === 'template' && storeTemplate ? (
                <div className="bg-gradient-to-br from-background/95 via-background to-muted/5 backdrop-blur-sm rounded-3xl border border-border/50 shadow-xl p-8">
                  <StorePreview 
                    selectedStore={store}
                    onViewModeChange={setViewMode}
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-background/95 via-background to-muted/5 backdrop-blur-sm rounded-3xl border border-border/50 shadow-xl p-8">
                  <Tabs value={currentTab} className="space-y-8">
                    {!isInSiteBuilder && (
                      <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 border border-border/30 shadow-lg rounded-2xl p-2 h-16">
                        <TabsTrigger value="config" asChild className="flex items-center gap-3 h-12 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-muted/50">
                          <Link to="/store-config">
                            <div className="p-1.5 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-lg data-[state=active]:bg-white/20">
                              <Settings className="h-4 w-4" />
                            </div>
                            <span className="font-semibold">Configuration</span>
                          </Link>
                        </TabsTrigger>
                        <TabsTrigger value="site-builder" asChild className="flex items-center gap-3 h-12 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-muted/50">
                          <Link to="/store-config/site-builder/editor/fashion-modern">
                            <div className="p-1.5 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-lg data-[state=active]:bg-white/20">
                              <Palette className="h-4 w-4" />
                            </div>
                            <span className="font-semibold">Créateur de Site</span>
                          </Link>
                        </TabsTrigger>
                      </TabsList>
                    )}

                    <TabsContent value="config" className="mt-8">
                      <div className="grid gap-8">
                        <StoreStatusCard 
                          selectedStore={store}
                          onViewModeChange={setViewMode}
                        />

                        <StoreConfigForm 
                          selectedStore={store}
                          formData={formData}
                          onFormDataChange={setFormData}
                          onSubmit={handleSubmit}
                          isUpdating={isUpdating}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-background/95 via-background to-muted/5 backdrop-blur-sm rounded-3xl border border-border/50 shadow-xl p-8">
              <NoStoreSelectedState onCreateStore={() => setShowCreateStore(true)} />
            </div>
          )}
        </div>
      </div>

      <CreateStoreDialog 
        open={showCreateStore} 
        onOpenChange={setShowCreateStore}
        onStoreCreated={handleStoreCreated}
        hasExistingStore={hasStore}
      />
    </DashboardLayout>
  );
};

export default StoreConfig;
