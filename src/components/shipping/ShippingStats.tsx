import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Truck,
  Globe,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { ShippingStats as ShippingStatsType } from '@/types/shipping';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ShippingStatsProps {
  stats?: ShippingStatsType;
  isLoading: boolean;
}

const ShippingStats = ({ stats, isLoading }: ShippingStatsProps) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune statistique disponible.</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Méthodes de livraison',
      value: stats.totalMethods,
      subtitle: `${stats.activeMethods} actives`,
      icon: Truck,
      color: 'blue',
      progress: stats.totalMethods > 0 ? (stats.activeMethods / stats.totalMethods) * 100 : 0
    },
    {
      title: 'Zones de livraison',
      value: stats.totalZones,
      subtitle: `${stats.activeZones} actives`,
      icon: Globe,
      color: 'green',
      progress: stats.totalZones > 0 ? (stats.activeZones / stats.totalZones) * 100 : 0
    },
    {
      title: 'Coût moyen de livraison',
      value: `${stats.averageShippingCost.toFixed(0)} CFA`,
      subtitle: 'Par commande',
      icon: DollarSign,
      color: 'purple',
      progress: 75 // Exemple de progression
    },
    {
      title: 'Livraisons gratuites',
      value: stats.freeShippingOrders,
      subtitle: 'Ce mois-ci',
      icon: Package,
      color: 'orange',
      progress: 60 // Exemple de progression
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200',
        progress: 'bg-blue-500'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200',
        progress: 'bg-green-500'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200',
        progress: 'bg-purple-500'
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        border: 'border-orange-200',
        progress: 'bg-orange-500'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          const Icon = stat.icon;
          
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border}`}>
                    {stat.progress.toFixed(0)}%
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </h3>
                  <p className="text-2xl font-bold">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {stat.subtitle}
                  </p>
                  
                  {/* Barre de progression */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div 
                      className={`h-2 rounded-full ${colors.progress} transition-all duration-300`}
                      style={{ width: `${stat.progress}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cartes d'informations détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenus de livraison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Revenus de livraison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total ce mois</span>
                <span className="text-2xl font-bold text-green-600">
                  {stats.totalShippingRevenue.toFixed(0)} CFA
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Commandes payantes</span>
                <span className="font-semibold">
                  {stats.totalMethods - stats.freeShippingOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Livraisons gratuites</span>
                <span className="font-semibold text-orange-600">
                  {stats.freeShippingOrders}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance des méthodes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Performance des méthodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taux d'activation</span>
                <span className="text-2xl font-bold text-blue-600">
                  {stats.totalMethods > 0 ? ((stats.activeMethods / stats.totalMethods) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Méthodes configurées</span>
                <span className="font-semibold">
                  {stats.totalMethods}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Zones configurées</span>
                <span className="font-semibold">
                  {stats.totalZones}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.totalMethods === 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Truck className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Créez votre première méthode de livraison pour commencer à vendre.
                </span>
              </div>
            )}
            
            {stats.totalZones === 0 && stats.totalMethods > 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <Globe className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Créez des zones de livraison pour mieux organiser vos méthodes par région.
                </span>
              </div>
            )}
            
            {stats.activeMethods < stats.totalMethods && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-800">
                  Vous avez {stats.totalMethods - stats.activeMethods} méthode(s) inactive(s). 
                  Activez-les pour offrir plus d'options à vos clients.
                </span>
              </div>
            )}
            
            {stats.averageShippingCost === 0 && stats.totalMethods > 0 && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-800">
                  Toutes vos livraisons sont gratuites. Considérez ajouter des frais pour certaines méthodes.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingStats;
