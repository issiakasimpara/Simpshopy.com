import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Zap,
  Info
} from 'lucide-react';
import { useStores } from '@/hooks/useStores';
import { usePaymentConfigurations } from '@/hooks/usePaymentConfigurations';
import { useToast } from '@/hooks/use-toast';
import { supabase as supabaseClient } from '@/integrations/supabase/client';

const MonerooPayment = () => {
  const navigate = useNavigate();
  const { store: currentStore } = useStores();
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const {
    providers,
    loading,
    saving,
    saveConfiguration,
    toggleProvider,
    updateProvider
  } = usePaymentConfigurations(currentStore?.id);

  const monerooProvider = providers.find(p => p.id === 'moneroo');

  const toggleApiKeyVisibility = () => {
    if (!showApiKey) {
      // Si on veut afficher la clé API, demander le mot de passe
      setShowPasswordPrompt(true);
    } else {
      // Si on veut masquer, le faire directement
      setShowApiKey(false);
    }
  };

  const verifyPassword = async () => {
    try {
      setPasswordError('');
      
      // Récupérer l'utilisateur actuellement connecté
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError || !user) {
        setPasswordError('Vous devez être connecté pour accéder à cette fonctionnalité');
        return;
      }

      // Vérifier le mot de passe avec l'email de l'utilisateur connecté
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: user.email || '',
        password: password
      });

      if (error) {
        console.error('Erreur de connexion:', error);
        setPasswordError('Mot de passe incorrect');
        return;
      }

      // Mot de passe correct, afficher la clé API
      setShowApiKey(true);
      setShowPasswordPrompt(false);
      setPassword('');
      
      toast({
        title: "Accès autorisé",
        description: "Clé API affichée avec succès",
      });
    } catch (error) {
      console.error('Erreur de vérification:', error);
      setPasswordError('Erreur de vérification');
    }
  };

  const cancelPasswordPrompt = () => {
    setShowPasswordPrompt(false);
    setPassword('');
    setPasswordError('');
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
              <img 
                src="/moneroo-logo.svg" 
                alt="Moneroo Logo" 
                className="w-36 h-36 object-contain"
              />
              <div>
                <CardTitle className="text-xl">Configuration</CardTitle>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-medium">Frais</Label>
                <p className="text-muted-foreground">1.5% par transaction</p>
              </div>
              <div>
                <Label className="font-medium">Devises supportées</Label>
                <p className="text-muted-foreground">XOF, XAF, NGN</p>
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="moneroo-api-key">
                  Clé API
                </Label>
                <div className="relative">
                  <Input
                    id="moneroo-api-key"
                    type={showApiKey ? 'text' : 'password'}
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
                    onClick={toggleApiKeyVisibility}
                  >
                    {showApiKey ? (
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


            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://moneroo.io/', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Moneroo
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
            <strong>Important :</strong> Moneroo est une plateforme d’orchestration de paiements qui permet aux entreprises d’accepter et d’envoyer de l’argen via une intégration unique, sécurisée et simple. 
            Assurez-vous que vos clés API sont correctes avant d'activer le service.
          </AlertDescription>
        </Alert>
      </div>

      {/* Dialog de vérification du mot de passe */}
      <Dialog open={showPasswordPrompt} onOpenChange={setShowPasswordPrompt}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Vérification de sécurité</DialogTitle>
            <DialogDescription>
              Veuillez entrer votre mot de passe pour afficher la clé API Moneroo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                placeholder="Votre mot de passe"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    verifyPassword();
                  }
                }}
              />
            </div>
            {passwordError && (
              <div className="text-sm text-red-600 col-span-4">
                {passwordError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelPasswordPrompt}>
              Annuler
            </Button>
            <Button onClick={verifyPassword} disabled={!password}>
              Vérifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MonerooPayment;
