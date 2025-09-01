
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStores } from '@/hooks/useStores';
import { usePaymentConfigurations } from '@/hooks/usePaymentConfigurations';
import { 
  CreditCard, 
  Settings,
  CheckCircle, 
  XCircle,
  ExternalLink,
  Eye,
  EyeOff,
  TestTube,
  Shield,
  Zap
} from 'lucide-react';

const Payments = () => {
  const navigate = useNavigate();
  const { stores, store: currentStore } = useStores();
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  
  const {
    providers,
    loading,
    saving,
    testing,
    configuredProviders,
    enabledProviders,
    saveConfiguration,
    testProvider,
    toggleProvider,
    updateProvider
  } = usePaymentConfigurations(currentStore?.id);

  const toggleSecretVisibility = (providerId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

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

        {/* Statut global */}
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

        {/* Configuration des fournisseurs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Tous les fournisseurs</TabsTrigger>
            <TabsTrigger value="configured">Configurés</TabsTrigger>
            <TabsTrigger value="active">Actifs</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {providers.map((provider) => (
              <Card key={provider.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${provider.color}`}>
                        <span className="text-lg">{provider.icon}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {provider.isConfigured && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Configuré
                        </Badge>
                      )}
                      <Switch
                        checked={provider.isEnabled}
                        onCheckedChange={(enabled) => toggleProvider(provider.id, enabled)}
                        disabled={!provider.isConfigured}
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Informations du fournisseur */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="font-medium">Frais</Label>
                      <p className="text-muted-foreground">{provider.fees}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Devises supportées</Label>
                      <p className="text-muted-foreground">{provider.supportedCurrencies.join(', ')}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Mode</Label>
                      <p className="text-muted-foreground">
                        {provider.isTestMode ? 'Test' : 'Production'}
                      </p>
                    </div>
                  </div>

                  {/* Configuration */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">Configuration API</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testProvider(provider.id)}
                          disabled={!provider.apiKey || testing === provider.id}
                        >
                          <TestTube className="w-4 h-4 mr-2" />
                          {testing === provider.id ? 'Test en cours...' : 'Tester'}
                        </Button>
                        {provider.setupUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(provider.setupUrl, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Setup
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${provider.id}-api-key`}>
                          Clé API {provider.isTestMode ? '(Test)' : '(Production)'}
                        </Label>
                        <div className="relative">
                          <Input
                            id={`${provider.id}-api-key`}
                            type={showSecrets[provider.id] ? 'text' : 'password'}
                            value={provider.apiKey}
                            onChange={(e) => {
                              updateProvider(provider.id, { apiKey: e.target.value });
                            }}
                            placeholder="pk_test_... ou pk_live_..."
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => toggleSecretVisibility(provider.id)}
                          >
                            {showSecrets[provider.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {provider.secretKey !== undefined && (
                        <div className="space-y-2">
                          <Label htmlFor={`${provider.id}-secret-key`}>
                            Clé secrète {provider.isTestMode ? '(Test)' : '(Production)'}
                          </Label>
                          <div className="relative">
                            <Input
                              id={`${provider.id}-secret-key`}
                              type={showSecrets[provider.id] ? 'text' : 'password'}
                              value={provider.secretKey || ''}
                              onChange={(e) => {
                                updateProvider(provider.id, { secretKey: e.target.value });
                              }}
                              placeholder="sk_test_... ou sk_live_..."
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => toggleSecretVisibility(provider.id)}
                            >
                              {showSecrets[provider.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${provider.id}-webhook`}>
                        URL Webhook (optionnel)
                      </Label>
                      <Input
                        id={`${provider.id}-webhook`}
                        value={provider.webhookUrl || ''}
                        onChange={(e) => {
                          updateProvider(provider.id, { webhookUrl: e.target.value });
                        }}
                        placeholder="https://votre-domaine.com/webhook/paiement"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={provider.isTestMode}
                          onCheckedChange={(testMode) => {
                            updateProvider(provider.id, { isTestMode: testMode });
                          }}
                        />
                        <Label>Mode test</Label>
                      </div>
                      
                      <Button
                        onClick={() => saveConfiguration(provider.id, provider)}
                        disabled={saving || !provider.apiKey}
                      >
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="configured" className="space-y-4">
            {configuredProviders.length > 0 ? (
              configuredProviders.map((provider) => (
                <Card key={provider.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${provider.color}`}>
                          <span className="text-lg">{provider.icon}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{provider.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{provider.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Configuré
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))
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
              enabledProviders.map((provider) => (
                <Card key={provider.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${provider.color}`}>
                          <span className="text-lg">{provider.icon}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{provider.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{provider.description}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <Zap className="w-3 h-3 mr-1" />
                        Actif
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))
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
