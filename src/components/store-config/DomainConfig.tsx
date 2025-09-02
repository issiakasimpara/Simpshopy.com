
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DefaultDomainCard from './domain/DefaultDomainCard';
import RealDomainConfig from './domain/RealDomainConfig';
import SslInfoCard from './domain/SslInfoCard';
import HelpResourcesCard from './domain/HelpResourcesCard';
import StoreUrlDisplay from './StoreUrlDisplay';
import { generateSimpshopySubdomain } from '@/utils/domainUtils';

interface DomainConfigProps {
  selectedStore: any;
}

const DomainConfig = ({ selectedStore }: DomainConfigProps) => {
  const defaultDomain = generateSimpshopySubdomain(selectedStore?.name || 'Ma Boutique');

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* URL actuelle de la boutique */}
      <StoreUrlDisplay storeName={selectedStore?.name || 'Ma Boutique'} isTemporary={true} />

      {/* Domaine par défaut (pour référence) */}
      <DefaultDomainCard defaultDomain={defaultDomain} />

      {/* Configuration avec Cloudflare */}
      <Card className="w-full">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              Domaines personnalisés
            </div>
            <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 w-fit">
              Système automatique
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Connectez votre propre nom de domaine avec configuration automatique complète
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <Alert className="mb-4 sm:mb-6">
            <Info className="h-3 w-3 sm:h-4 sm:w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              <strong>Système professionnel :</strong> Utilise Cloudflare pour gérer automatiquement 
              DNS, SSL, CDN et proxy vers votre site. Configuration en quelques clics.
            </AlertDescription>
          </Alert>
          
          <RealDomainConfig selectedStore={selectedStore} />
        </CardContent>
      </Card>

      {/* SSL Information */}
      <SslInfoCard />

      {/* Aide et ressources */}
      <HelpResourcesCard />
    </div>
  );
};

export default DomainConfig;
