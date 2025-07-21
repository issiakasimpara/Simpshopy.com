import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Copy, 
  Trash2,
  Shield,
  ExternalLink,
  Info
} from 'lucide-react';
import { useCustomDomains } from '@/hooks/useCustomDomains';
import { toast } from 'sonner';

interface CustomDomainManagerProps {
  storeId: string;
  storeName: string;
}

const CustomDomainManager = ({ storeId, storeName }: CustomDomainManagerProps) => {
  const { domains, loading, verifying, addDomain, verifyDomain, deleteDomain } = useCustomDomains(storeId);
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      toast.error('Veuillez entrer un nom de domaine');
      return;
    }

    // Validation basique du domaine
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(newDomain)) {
      toast.error('Format de domaine invalide');
      return;
    }

    setIsAdding(true);
    const result = await addDomain(newDomain);
    if (result) {
      setNewDomain('');
    }
    setIsAdding(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papiers');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Domaines personnalisés</h2>
          <p className="text-muted-foreground">
            Connectez votre propre nom de domaine à votre boutique {storeName}
          </p>
        </div>
      </div>

      {/* Add new domain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter un domaine personnalisé
          </CardTitle>
          <CardDescription>
            Connectez votre propre nom de domaine (ex: www.ma-boutique.com)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="www.ma-boutique.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
              disabled={isAdding}
            />
            <Button 
              onClick={handleAddDomain} 
              disabled={isAdding || !newDomain.trim()}
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Ajouter
            </Button>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Important :</strong> Vous devez d'abord acheter votre nom de domaine 
              chez un registraire (OVH, Gandi, Namecheap, etc.) avant de pouvoir le connecter ici.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Domain list */}
      <div className="space-y-4">
        {loading && domains.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Chargement des domaines...</span>
            </CardContent>
          </Card>
        ) : domains.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun domaine personnalisé</h3>
              <p className="text-muted-foreground">
                Ajoutez votre premier domaine personnalisé pour commencer.
              </p>
            </CardContent>
          </Card>
        ) : (
          domains.map((domain) => (
            <Card key={domain.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-lg">{domain.custom_domain}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {domain.verified ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Vérifié
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            En attente
                          </Badge>
                        )}
                        {domain.ssl_enabled && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            <Shield className="h-3 w-3 mr-1" />
                            SSL actif
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {domain.verified && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://${domain.custom_domain}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Visiter
                        </a>
                      </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteDomain(domain.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!domain.verified && (
                  <>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Configuration DNS requise :</strong> Ajoutez l'enregistrement CNAME suivant 
                        dans votre gestionnaire DNS :
                      </AlertDescription>
                    </Alert>

                    <div className="bg-muted p-4 rounded-lg space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <label className="font-medium text-muted-foreground">Type</label>
                          <div className="flex items-center justify-between bg-background p-2 rounded border">
                            <span className="font-mono">CNAME</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard('CNAME')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="font-medium text-muted-foreground">Nom</label>
                          <div className="flex items-center justify-between bg-background p-2 rounded border">
                            <span className="font-mono text-xs">{domain.custom_domain}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(domain.custom_domain)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="font-medium text-muted-foreground">Valeur</label>
                          <div className="flex items-center justify-between bg-background p-2 rounded border">
                            <span className="font-mono text-xs">malibashopy.com</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard('malibashopy.com')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="text-sm text-muted-foreground">
                        <p><strong>Alternative :</strong> Enregistrement TXT pour vérification</p>
                        <div className="flex items-center justify-between bg-background p-2 rounded border mt-2">
                          <span className="font-mono text-xs">{domain.verification_token}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(domain.verification_token)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => verifyDomain(domain.id)}
                      disabled={verifying === domain.id}
                      className="w-full"
                    >
                      {verifying === domain.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Vérifier la configuration DNS
                    </Button>
                  </>
                )}

                {domain.verified && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Configuration terminée !</strong> Votre domaine est vérifié et accessible. 
                      Le certificat SSL a été automatiquement activé via Cloudflare.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomDomainManager;