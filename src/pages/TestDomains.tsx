import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Info,
  Settings,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const TestDomains = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentDomain, setCurrentDomain] = useState('');
  const [domainInfo, setDomainInfo] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    setCurrentDomain(window.location.hostname);
    fetchStores();
  }, []);

  const fetchStores = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const checkDomainResolution = async (domain: string) => {
    setIsChecking(true);
    try {
      // Test DNS resolution
      const response = await fetch(`https://${domain}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      const isResolved = response.ok;
      
      // Get domain info from database
      const { data: domainData, error: domainError } = await supabase
        .from('custom_domains')
        .select('*, stores(*)')
        .eq('custom_domain', domain)
        .single();

      setDomainInfo({
        domain,
        isResolved,
        isInDatabase: !domainError && domainData,
        domainData: domainData || null,
        responseStatus: response.status,
        responseOk: response.ok
      });

      toast({
        title: isResolved ? "✅ Domaine accessible" : "❌ Domaine non accessible",
        description: isResolved 
          ? `${domain} pointe correctement vers Simpshopy`
          : `${domain} ne pointe pas vers Simpshopy`,
        variant: isResolved ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Error checking domain:', error);
      setDomainInfo({
        domain,
        isResolved: false,
        isInDatabase: false,
        domainData: null,
        error: error.message
      });
      
      toast({
        title: "❌ Erreur de vérification",
        description: "Impossible de vérifier le domaine",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const testSubdomain = async (storeSlug: string) => {
    const subdomain = `${storeSlug}.simpshopy.com`;
    await checkDomainResolution(subdomain);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Test des Domaines</h1>
      </div>

      {/* Current Domain Info */}
      <Card>
        <CardHeader>
          <CardTitle>Domaine actuel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span className="font-mono">{currentDomain}</span>
              <Badge variant="outline">
                {currentDomain === 'localhost' ? 'Développement' : 'Production'}
              </Badge>
            </div>
            
            <Button 
              onClick={() => checkDomainResolution(currentDomain)}
              disabled={isChecking}
            >
              {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Vérifier ce domaine
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Domain Test Results */}
      {domainInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats de la vérification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Domaine testé</p>
                  <p className="font-mono">{domainInfo.domain}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Statut DNS</p>
                  <Badge variant={domainInfo.isResolved ? "default" : "destructive"}>
                    {domainInfo.isResolved ? "✅ Résolu" : "❌ Non résolu"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">En base de données</p>
                  <Badge variant={domainInfo.isInDatabase ? "default" : "secondary"}>
                    {domainInfo.isInDatabase ? "✅ Oui" : "❌ Non"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Statut HTTP</p>
                  <Badge variant={domainInfo.responseOk ? "default" : "destructive"}>
                    {domainInfo.responseStatus || "N/A"}
                  </Badge>
                </div>
              </div>

              {domainInfo.domainData && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Boutique associée :</strong> {domainInfo.domainData.stores?.name}
                    <br />
                    <strong>Statut :</strong> {domainInfo.domainData.verified ? "Vérifié" : "Non vérifié"}
                    <br />
                    <strong>SSL :</strong> {domainInfo.domainData.ssl_enabled ? "Activé" : "Désactivé"}
                  </AlertDescription>
                </Alert>
              )}

              {domainInfo.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Erreur : {domainInfo.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Custom Domain */}
      <Card>
        <CardHeader>
          <CardTitle>Tester un domaine personnalisé</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="exemple.com"
                id="test-domain"
                onKeyPress={(e) => e.key === 'Enter' && checkDomainResolution(e.currentTarget.value)}
              />
              <Button 
                onClick={() => {
                  const domain = (document.getElementById('test-domain') as HTMLInputElement).value;
                  if (domain) checkDomainResolution(domain);
                }}
                disabled={isChecking}
              >
                {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                Tester
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Entrez un nom de domaine pour vérifier s'il pointe vers Simpshopy
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Subdomains */}
      {stores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test des sous-domaines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Testez vos sous-domaines Simpshopy
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {stores.map((store) => (
                  <Button
                    key={store.id}
                    variant="outline"
                    onClick={() => testSubdomain(store.slug)}
                    disabled={isChecking}
                  >
                    {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                    {store.slug}.simpshopy.com
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions de configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <strong>Pour configurer un domaine personnalisé :</strong>
                <br />
                1. Ajoutez votre domaine dans l'onglet "Configuration" → "Domaines"
                <br />
                2. Configurez vos DNS pour pointer vers simpshopy.com
                <br />
                3. Utilisez cette page pour vérifier la configuration
                <br />
                4. Vérifiez le domaine dans l'interface d'administration
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Enregistrements DNS requis :</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Type : CNAME</span>
                    <span className="font-mono">simpshopy.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type : A</span>
                    <span className="font-mono">76.76.19.34</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type : TXT</span>
                    <span className="font-mono">simpshopy-verification</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Sous-domaines automatiques :</h4>
                <p className="text-sm text-muted-foreground">
                  Vos boutiques sont automatiquement disponibles sur :
                  <br />
                  <code className="bg-muted px-1 rounded">votre-slug.simpshopy.com</code>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDomains; 