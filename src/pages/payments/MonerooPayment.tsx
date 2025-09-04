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
  ExternalLink,
  Eye,
  EyeOff,
  TestTube,
  Zap,
  Info
} from 'lucide-react';
import { useStores } from '@/hooks/useStores';
import { usePaymentConfigurations } from '@/hooks/usePaymentConfigurations';
import { useToast } from '@/hooks/use-toast';

const MonerooPayment = () => {
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

  const monerooProvider = providers.find(p => p.id === 'moneroo');

  const toggleSecretVisibility = () => {
    setShowSecrets(prev => !prev);
  };

  const handleSave = async () => {
    if (!monerooProvider) return;
    
    try {
      await saveConfiguration('moneroo', monerooProvider);
      toast({
        title: "Succès",
        description: "Configuration Moneroo sauvegardée avec succès",
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
    if (!monerooProvider) return;
    
    try {
      await testProvider('moneroo');
      toast({
        title: "Test réussi",
        description: "Configuration Moneroo testée avec succès",
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

  if (loading || !monerooProvider) {
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
            <h1 className="text-3xl font-bold tracking-tight">Configuration Moneroo</h1>
            <p className="text-muted-foreground">
              Configurez Moneroo pour les paiements mobiles en Afrique de l'Ouest
            </p>
          </div>
        </div>

        {/* Informations du fournisseur */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-gray-200">
                <img 
                  src="/logomoneroo.png" 
                  alt="Moneroo Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <CardTitle className="text-xl">Moneroo</CardTitle>
                <p className="text-muted-foreground">Paiements mobiles en Afrique de l'Ouest</p>
              </div>
              <div className="ml-auto">
                <Badge variant={monerooProvider.isEnabled ? "default" : "secondary"}>
                  {monerooProvider.isEnabled ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="font-medium">Frais</Label>
                <p className="text-muted-foreground">1.5% par transaction</p>
              </div>
              <div>
                <Label className="font-medium">Devises supportées</Label>
                <p className="text-muted-foreground">XOF, XAF, NGN</p>
              </div>
              <div>
                <Label className="font-medium">Mode</Label>
                <p className="text-muted-foreground">
                  {monerooProvider.isTestMode ? 'Test' : 'Production'}
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
                <Label htmlFor="moneroo-api-key">
                  Clé API {monerooProvider.isTestMode ? '(Test)' : '(Production)'}
                </Label>
                <div className="relative">
                  <Input
                    id="moneroo-api-key"
                    type={showSecrets ? 'text' : 'password'}
                    value={monerooProvider.apiKey}
                    onChange={(e) => {
                      updateProvider('moneroo', { apiKey: e.target.value });
                    }}
                    placeholder="Clé API Moneroo..."
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
                <Label htmlFor="moneroo-secret-key">
                  Clé secrète {monerooProvider.isTestMode ? '(Test)' : '(Production)'}
                </Label>
                <div className="relative">
                  <Input
                    id="moneroo-secret-key"
                    type={showSecrets ? 'text' : 'password'}
                    value={monerooProvider.secretKey || ''}
                    onChange={(e) => {
                      updateProvider('moneroo', { secretKey: e.target.value });
                    }}
                    placeholder="Clé secrète Moneroo..."
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
              <Label htmlFor="moneroo-webhook">
                URL Webhook (optionnel)
              </Label>
              <Input
                id="moneroo-webhook"
                value={monerooProvider.webhookUrl || ''}
                onChange={(e) => {
                  updateProvider('moneroo', { webhookUrl: e.target.value });
                }}
                placeholder="https://votre-domaine.com/webhook/paiement"
              />
            </div>

            {/* Mode test */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={monerooProvider.isTestMode}
                  onCheckedChange={(testMode) => {
                    updateProvider('moneroo', { isTestMode: testMode });
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
                  disabled={!monerooProvider.apiKey || testing === 'moneroo'}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {testing === 'moneroo' ? 'Test en cours...' : 'Tester'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://dashboard.moneroo.com/', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Dashboard Moneroo
                </Button>
              </div>
              
              <Button
                onClick={handleSave}
                disabled={saving || !monerooProvider.apiKey}
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
                <p className="font-medium">Activer Moneroo</p>
                <p className="text-sm text-muted-foreground">
                  Activez ce fournisseur pour accepter les paiements
                </p>
              </div>
              <Switch
                checked={monerooProvider.isEnabled}
                onCheckedChange={(enabled) => toggleProvider('moneroo', enabled)}
                disabled={!monerooProvider.isConfigured}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informations */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Important :</strong> Moneroo est spécialisé dans les paiements mobiles en Afrique de l'Ouest. 
            Assurez-vous que vos clés API sont correctes avant d'activer le service.
          </AlertDescription>
        </Alert>
      </div>
    </DashboardLayout>
  );
};

export default MonerooPayment;
