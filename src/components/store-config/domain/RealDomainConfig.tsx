
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Globe, Shield, CheckCircle, Clock, AlertCircle, RefreshCw, Trash2, ExternalLink, Plus } from 'lucide-react';
import { useStoreDomains } from '@/hooks/useDomains';
import DomainConfigurationSteps from './DomainConfigurationSteps';
import DomainSetupGuide from './DomainSetupGuide';

interface RealDomainConfigProps {
  selectedStore: any;
}

const RealDomainConfig = ({ selectedStore }: RealDomainConfigProps) => {
  const [newDomain, setNewDomain] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const { 
    domains, 
    isLoading, 
    configureDomain, 
    verifyDomain, 
    removeDomain,
    isConfiguring,
    isVerifying,
    isRemoving
  } = useStoreDomains(selectedStore?.id);

  const validateDomain = (domain: string) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDomain = newDomain.trim().toLowerCase();
    
    if (!cleanDomain || !selectedStore?.id) return;
    
    if (!validateDomain(cleanDomain)) {
      alert('Veuillez entrer un nom de domaine valide (ex: mon-site.com)');
      return;
    }

    try {
      await configureDomain({ 
        domainName: cleanDomain,
        storeId: selectedStore.id 
      });
      setNewDomain('');
    } catch (error) {
      console.error('Error configuring domain:', error);
    }
  };

  const handleVerifyDomain = async (domainName: string) => {
    try {
      await verifyDomain(domainName);
    } catch (error) {
      console.error('Error verifying domain:', error);
    }
  };

  const handleRemoveDomain = async (domainName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${domainName} ? Cette action est irréversible.`)) return;
    
    try {
      await removeDomain(domainName);
    } catch (error) {
      console.error('Error removing domain:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Actif
          </Badge>
        );
      case 'verifying':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Configuration
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Erreur
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-600">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Formulaire d'ajout */}
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30 w-full">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-blue-900 text-base sm:text-lg">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            Ajouter un domaine personnalisé
          </CardTitle>
          <CardDescription className="text-blue-700 text-xs sm:text-sm">
            Connectez automatiquement votre domaine via Cloudflare - DNS, SSL et CDN inclus
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
          <form onSubmit={handleAddDomain} className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain" className="text-xs sm:text-sm font-medium">
                Nom de domaine
              </Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="domain"
                  type="text"
                  placeholder="mon-site.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="font-mono text-xs sm:text-sm"
                />
                <Button 
                  type="submit" 
                  disabled={!newDomain.trim() || isConfiguring}
                  className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm w-full sm:w-auto"
                >
                  {isConfiguring ? (
                    <>
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                      Configuration...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Configurer
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Entrez votre nom de domaine sans "www" (ex: ma-boutique.com)
              </p>
            </div>
          </form>

          <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-xs sm:text-sm">
              <strong>Configuration automatique :</strong> Notre système configure automatiquement 
              DNS, SSL et CDN via Cloudflare. Vous devrez juste pointer vos serveurs de noms.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Liste des domaines */}
      {domains.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <h3 className="text-base sm:text-lg font-semibold">Vos domaines configurés</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              {showGuide ? 'Masquer' : 'Afficher'} le guide
            </Button>
          </div>

          {domains.map((domain) => (
            <div key={domain.id} className="space-y-3 sm:space-y-4">
              <Card className="border-l-4 border-l-blue-500 w-full">
                <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-base sm:text-lg">{domain.domain_name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Configuré le {new Date(domain.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(domain.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
                  {/* Actions rapides */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 py-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyDomain(domain.domain_name)}
                      disabled={isVerifying}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs sm:text-sm w-full sm:w-auto"
                    >
                      {isVerifying ? (
                        <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      )}
                      Vérifier
                    </Button>

                    {domain.status === 'active' && (
                      <Button variant="outline" size="sm" asChild className="w-full sm:w-auto text-xs sm:text-sm">
                        <a href={`https://${domain.domain_name}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Visiter le site
                        </a>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveDomain(domain.domain_name)}
                      disabled={isRemoving}
                      className="text-red-600 border-red-200 hover:bg-red-50 text-xs sm:text-sm w-full sm:w-auto"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Supprimer
                    </Button>
                  </div>

                  {/* Message d'erreur */}
                  {domain.error_message && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{domain.error_message}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Étapes de configuration */}
              <DomainConfigurationSteps 
                domain={domain} 
                onRetry={() => handleVerifyDomain(domain.domain_name)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Guide d'aide */}
      {showGuide && <DomainSetupGuide />}

      {/* Message si aucun domaine */}
      {domains.length === 0 && !isLoading && (
        <Card className="text-center py-8">
          <CardContent>
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun domaine configuré
            </h3>
            <p className="text-gray-500 mb-4">
              Ajoutez votre premier domaine personnalisé pour commencer
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealDomainConfig;
