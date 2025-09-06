import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Settings, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useStores } from '@/hooks/useStores';

interface MailzeetConfig {
  id?: string;
  store_id: string;
  api_key: string;
  server_name: string;
  from_email: string;
  from_name: string;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

const MailzeetConfig: React.FC = () => {
  const { currentStore } = useStores();
  const { toast } = useToast();
  
  const [config, setConfig] = useState<MailzeetConfig>({
    store_id: currentStore?.id || '',
    api_key: '',
    server_name: '',
    from_email: 'noreply@simpshopy.com',
    from_name: 'Simpshopy',
    enabled: false
  });
  
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Charger la configuration existante
  useEffect(() => {
    if (currentStore?.id) {
      loadConfiguration();
    }
  }, [currentStore?.id]);

  const loadConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from('mailzeet_configurations')
        .select('*')
        .eq('store_id', currentStore?.id)
        .single();

      if (data && !error) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    }
  };

  const handleSave = async () => {
    if (!currentStore?.id) {
      toast({
        title: "Erreur",
        description: "Aucune boutique sélectionnée",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const configData = {
        ...config,
        store_id: currentStore.id,
        updated_at: new Date().toISOString()
      };

      if (config.id) {
        // Mise à jour
        const { error } = await supabase
          .from('mailzeet_configurations')
          .update(configData)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Création
        const { error } = await supabase
          .from('mailzeet_configurations')
          .insert([configData]);

        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: "Configuration Mailzeet sauvegardée avec succès"
      });

      // Recharger la configuration
      await loadConfiguration();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!config.api_key || !config.server_name) {
      toast({
        title: "Erreur",
        description: "Veuillez configurer la clé API et le nom du serveur",
        variant: "destructive"
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Tester la configuration via l'Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-mailzeet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          apiKey: config.api_key,
          serverName: config.server_name,
          fromEmail: config.from_email,
          fromName: config.from_name
        })
      });

      const result = await response.json();

      if (response.ok) {
        setTestResult({ success: true, message: 'Test réussi ! Email envoyé avec succès.' });
        toast({
          title: "Test réussi",
          description: "La configuration Mailzeet fonctionne correctement"
        });
      } else {
        setTestResult({ success: false, message: result.error || 'Erreur lors du test' });
        toast({
          title: "Test échoué",
          description: result.error || 'Erreur lors du test',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors du test:', error);
      setTestResult({ success: false, message: 'Erreur de connexion' });
      toast({
        title: "Erreur",
        description: "Impossible de tester la configuration",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration Mailzeet</h1>
          <p className="text-gray-600 mt-1">
            Configurez Mailzeet pour l'envoi d'emails transactionnels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={config.enabled ? "default" : "secondary"}>
            {config.enabled ? "Activé" : "Désactivé"}
          </Badge>
        </div>
      </div>

      {/* Configuration principale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration SMTP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Clé API */}
          <div className="space-y-2">
            <Label htmlFor="api_key">Clé API Mailzeet</Label>
            <div className="flex gap-2">
              <Input
                id="api_key"
                type={showApiKey ? "text" : "password"}
                value={config.api_key}
                onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                placeholder="Votre clé API Mailzeet"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Obtenez votre clé API depuis le dashboard Mailzeet
            </p>
          </div>

          {/* Nom du serveur */}
          <div className="space-y-2">
            <Label htmlFor="server_name">Nom du serveur SMTP</Label>
            <Input
              id="server_name"
              value={config.server_name}
              onChange={(e) => setConfig({ ...config, server_name: e.target.value })}
              placeholder="ex: business"
            />
            <p className="text-sm text-gray-500">
              Nom du serveur SMTP configuré dans Mailzeet
            </p>
          </div>

          <Separator />

          {/* Configuration expéditeur */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuration expéditeur</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_email">Email expéditeur</Label>
                <Input
                  id="from_email"
                  type="email"
                  value={config.from_email}
                  onChange={(e) => setConfig({ ...config, from_email: e.target.value })}
                  placeholder="noreply@simpshopy.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="from_name">Nom expéditeur</Label>
                <Input
                  id="from_name"
                  value={config.from_name}
                  onChange={(e) => setConfig({ ...config, from_name: e.target.value })}
                  placeholder="Simpshopy"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Activation */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enabled">Activer Mailzeet</Label>
              <p className="text-sm text-gray-500">
                Activez l'envoi d'emails via Mailzeet pour cette boutique
              </p>
            </div>
            <Switch
              id="enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Test de configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test de configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Testez votre configuration en envoyant un email de test
          </p>
          
          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleTest}
              disabled={testing || !config.api_key || !config.server_name}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {testing ? "Test en cours..." : "Tester la configuration"}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.open('https://mailzeet.com/dashboard', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Dashboard Mailzeet
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Informations importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600 space-y-2">
            <p>• <strong>Clé API :</strong> Obtenez votre clé API depuis le dashboard Mailzeet</p>
            <p>• <strong>Serveur SMTP :</strong> Configurez d'abord un serveur SMTP dans Mailzeet</p>
            <p>• <strong>Domaine :</strong> Assurez-vous que votre domaine est vérifié dans Mailzeet</p>
            <p>• <strong>Limites :</strong> Respectez les limites d'envoi de votre plan Mailzeet</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          {loading ? "Sauvegarde..." : "Sauvegarder la configuration"}
        </Button>
      </div>
    </div>
  );
};

export default MailzeetConfig;
