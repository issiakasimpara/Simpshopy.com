import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  CreditCard, 
  Settings,
  CheckCircle, 
  XCircle,
  ExternalLink,
  Eye,
  EyeOff,
  TestTube,
  Shield,
  Zap,
  Info
} from 'lucide-react';
import { useStores } from '@/hooks/useStores';
import { usePaymentConfigurations } from '@/hooks/usePaymentConfigurations';
import { useToast } from '@/hooks/use-toast';

const StripePayment = () => {
  const navigate = useNavigate();
  const { store: currentStore } = useStores();
  const { toast } = useToast();
  const [showSecrets, setShowSecrets] = useState(false);
  
  const {
    providers,
    loading,
    saving,
    testing,
    saveConfiguration,
    testProvider,
    toggleProvider,
    updateProvider
  } = usePaymentConfigurations(currentStore?.id);

  const stripeProvider = providers.find(p => p.id === 'stripe');

  const toggleSecretVisibility = () => {
    setShowSecrets(prev => !prev);
  };

  const handleSave = async () => {
    if (!stripeProvider) return;
    
    try {
      await saveConfiguration('stripe', stripeProvider);
      toast({
        title: "Succès",
        description: "Configuration Stripe sauvegardée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde",
        variant: "destructive",
      });
    }
  };

  const handleTest = async () => {
    if (!stripeProvider) return;
    
    try {
      await testProvider('stripe');
      toast({
        title: "Test réussi",
        description: "Configuration Stripe testée avec succès",
      });
    } catch (error) {
      toast({
        title: "Test échoué",
        description: "Erreur lors du test de la configuration",
        variant: "destructive",
      });
    }
  };

  if (!currentStore) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune boutique sélectionnée</h3>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading || !stripeProvider) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Chargement...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header avec retour */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/payments')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuration Stripe</h1>
            <p className="text-muted-foreground">
              Configurez Stripe pour accepter les paiements par carte bancaire
            </p>
          </div>
        </div>

        {/* Informations du fournisseur */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                <img 
                  src="/Stripe_Logo,_revised_2016.svg.png" 
                  alt="Stripe Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <CardTitle className="text-xl">Configuration</CardTitle>
                <p className="text-muted-foreground">Paiements par carte bancaire, Apple Pay, Google Pay</p>
              </div>
              <div className="ml-auto">
                <Badge variant={stripeProvider.isEnabled ? "default" : "secondary"}>
                  {stripeProvider.isEnabled ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="font-medium">Frais</Label>
                <p className="text-muted-foreground">2.9% + 0.30€ par transaction</p>
              </div>
              <div>
                <Label className="font-medium">Devises supportées</Label>
                <p className="text-muted-foreground">EUR, USD, GBP, XOF</p>
              </div>
              <div>
                <Label className="font-medium">Mode</Label>
                <p className="text-muted-foreground">
                  {stripeProvider.isTestMode ? 'Test' : 'Production'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Clés API */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-api-key">
                  Clé API {stripeProvider.isTestMode ? '(Test)' : '(Production)'}
                </Label>
                <div className="relative">
                  <Input
                    id="stripe-api-key"
                    type={showSecrets ? 'text' : 'password'}
                    value={stripeProvider.apiKey}
                    onChange={(e) => {
                      updateProvider('stripe', { apiKey: e.target.value });
                    }}
                    placeholder="pk_test_... ou pk_live_..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={toggleSecretVisibility}
                  >
                    {showSecrets ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripe-secret-key">
                  Clé secrète {stripeProvider.isTestMode ? '(Test)' : '(Production)'}
                </Label>
                <div className="relative">
                  <Input
                    id="stripe-secret-key"
                    type={showSecrets ? 'text' : 'password'}
                    value={stripeProvider.secretKey || ''}
                    onChange={(e) => {
                      updateProvider('stripe', { secretKey: e.target.value });
                    }}
                    placeholder="sk_test_... ou sk_live_..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={toggleSecretVisibility}
                  >
                    {showSecrets ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Webhook */}
            <div className="space-y-2">
              <Label htmlFor="stripe-webhook">
                URL Webhook (optionnel)
              </Label>
              <Input
                id="stripe-webhook"
                value={stripeProvider.webhookUrl || ''}
                onChange={(e) => {
                  updateProvider('stripe', { webhookUrl: e.target.value });
                }}
                placeholder="https://votre-domaine.com/webhook/paiement"
              />
            </div>

            {/* Mode test */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={stripeProvider.isTestMode}
                  onCheckedChange={(testMode) => {
                    updateProvider('stripe', { isTestMode: testMode });
                  }}
                />
                <Label>Mode test</Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                  disabled={!stripeProvider.apiKey || testing === 'stripe'}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {testing === 'stripe' ? 'Test en cours...' : 'Tester'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://dashboard.stripe.com/apikeys', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Dashboard Stripe
                </Button>
              </div>
              
              <Button
                onClick={handleSave}
                disabled={saving || !stripeProvider.apiKey}
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Activation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Activer Stripe</p>
                <p className="text-sm text-muted-foreground">
                  Activez ce fournisseur pour accepter les paiements
                </p>
              </div>
              <Switch
                checked={stripeProvider.isEnabled}
                onCheckedChange={(enabled) => toggleProvider('stripe', enabled)}
                disabled={!stripeProvider.isConfigured}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informations */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Important :</strong> Assurez-vous que vos clés API sont correctes avant d'activer Stripe. 
            En mode test, utilisez les clés de test. En mode production, utilisez les clés live.
          </AlertDescription>
        </Alert>
      </div>
    </DashboardLayout>
  );
};

export default StripePayment;
