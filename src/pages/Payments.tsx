
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStores } from '@/hooks/useStores';
import { usePaymentConfigurations } from '@/hooks/usePaymentConfigurations';
import PaymentProviderCard from '@/components/payments/PaymentProviderCard';
import { 
  CreditCard, 
  Settings,
  CheckCircle, 
  XCircle,
  Zap,
  Shield
} from 'lucide-react';

const Payments = () => {
  const navigate = useNavigate();
  const { stores, store: currentStore } = useStores();
  
  const {
    providers,
    loading,
    configuredProviders,
    enabledProviders
  } = usePaymentConfigurations(currentStore?.id);

  if (!currentStore) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune boutique sélectionnée</h3>
            <p className="text-muted-foreground mb-4">
              {stores.length > 0 
                ? "Sélectionnez une boutique pour configurer les paiements"
                : "Vous n'avez pas encore créé de boutique"
              }
            </p>
            {stores.length === 0 && (
              <Button onClick={() => navigate('/dashboard')}>
                Créer une boutique
              </Button>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Chargement des configurations...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Moyens de Paiement</h1>
            <p className="text-muted-foreground">
              Configurez les méthodes de paiement pour {currentStore.name}
            </p>
          </div>
        </div>

        {/* Alert d'information */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Approche sécurisée :</strong> Vos clés API restent dans votre base de données. 
            Nous n'avons jamais accès à vos fonds. En cas de problème, contactez directement votre fournisseur de paiement.
          </AlertDescription>
        </Alert>

        {/* Statut global - GARDÉ INTACT */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fournisseurs configurés</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{configuredProviders.length}</div>
              <p className="text-xs text-muted-foreground">
                sur {providers.length} disponibles
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fournisseurs actifs</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enabledProviders.length}</div>
              <p className="text-xs text-muted-foreground">
                prêts à accepter les paiements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Statut</CardTitle>
              {enabledProviders.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {enabledProviders.length > 0 ? 'Actif' : 'Inactif'}
              </div>
              <p className="text-xs text-muted-foreground">
                {enabledProviders.length > 0 
                  ? 'Paiements acceptés' 
                  : 'Aucun moyen de paiement configuré'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Configuration des fournisseurs - REMPLACÉ PAR DES CARTES */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Tous les fournisseurs</TabsTrigger>
            <TabsTrigger value="configured">Configurés</TabsTrigger>
            <TabsTrigger value="active">Actifs</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <PaymentProviderCard
                  key={provider.id}
                  provider={provider}
                  isConfigured={provider.isConfigured}
                  isEnabled={provider.isEnabled}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="configured" className="space-y-4">
            {configuredProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {configuredProviders.map((provider) => (
                  <PaymentProviderCard
                    key={provider.id}
                    provider={provider}
                    isConfigured={true}
                    isEnabled={provider.isEnabled}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun fournisseur configuré</h3>
                    <p className="text-muted-foreground">
                      Configurez au moins un fournisseur de paiement pour commencer.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {enabledProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enabledProviders.map((provider) => (
                  <PaymentProviderCard
                    key={provider.id}
                    provider={provider}
                    isConfigured={provider.isConfigured}
                    isEnabled={true}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun fournisseur actif</h3>
                    <p className="text-muted-foreground">
                      Activez au moins un fournisseur de paiement pour accepter les paiements.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
