
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, AlertTriangle, Eye, Moon, Zap } from "lucide-react";
import { useStoreCurrency } from "@/hooks/useStoreCurrency";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useStores } from "@/hooks/useStores";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAbandonedCarts } from "@/hooks/useAbandonedCarts";
import { useSmartVisitorTracking, TrackingState } from "@/hooks/useSmartVisitorTracking";


const DashboardStats = () => {
  const { store } = useStores();
  const { formatConvertedPrice } = useStoreCurrency(store?.id);
  const { stats, isLoadingStats } = useOrders();
  const { products, isLoading: isLoadingProducts } = useProducts(store?.id, 'active');
  const { analytics, isLoading: analyticsLoading } = useAnalytics();
  const { stats: abandonedStats, isLoading: abandonedLoading } = useAbandonedCarts(store?.id);
  const { stats: visitorStats, isLoading: visitorLoading, trackingState } = useSmartVisitorTracking(store?.id);

  // Utiliser les analytics pour les statistiques
  const revenue = analytics?.totalRevenue || stats?.totalRevenue || 0;
  const totalOrders = analytics?.totalOrders || stats?.totalOrders || 0;
  const todayOrders = stats?.todayOrders || 0;
  const todayRevenue = stats?.todayRevenue || 0;
  const productCount = products?.length || 0;
  const totalCustomers = analytics?.totalCustomers || 0;

  const mainCards = [
    {
      title: "Revenus totaux",
      value: formatConvertedPrice(revenue, 'XOF'),
      change: todayRevenue > 0 ? `+${formatConvertedPrice(todayRevenue, 'XOF')} aujourd'hui` : "Aucune vente aujourd'hui",
      icon: DollarSign,
      trend: todayRevenue > 0 ? "up" : "neutral" as const,
    },
    {
      title: "Commandes",
      value: totalOrders.toString(),
      change: todayOrders > 0 ? `+${todayOrders} aujourd'hui` : "Aucune commande aujourd'hui",
      icon: ShoppingCart,
      trend: todayOrders > 0 ? "up" : "neutral" as const,
    },
    {
      title: "Clients",
      value: totalCustomers.toString(),
      change: "Clients uniques",
      icon: Users,
      trend: "neutral" as const,
    },
    {
      title: "Produits",
      value: productCount.toString(),
      change: "Produits actifs",
      icon: Package,
      trend: "neutral" as const,
    },
    {
      title: "Paniers abandonnés",
      value: abandonedLoading ? "..." : (abandonedStats?.totalAbandoned || 0).toString(),
      change: abandonedLoading ? "Chargement..." : `Valeur perdue: ${formatConvertedPrice(abandonedStats?.totalValue || 0, 'XOF')}`,
      icon: AlertTriangle,
      trend: "neutral" as const,
    },
  ];

  // Déterminer l'icône et le texte selon l'état du tracking
  const getTrackingStatus = () => {
    switch (trackingState) {
      case TrackingState.ACTIVE:
        return {
          icon: Zap,
          statusText: "Mode actif",
          statusClass: "text-green-500",
          indicatorClass: "bg-green-500"
        };
      case TrackingState.SLEEP:
        return {
          icon: Moon,
          statusText: "Mode veille",
          statusClass: "text-gray-500",
          indicatorClass: "bg-gray-400"
        };
      case TrackingState.TRANSITIONING:
        return {
          icon: Eye,
          statusText: "Transition...",
          statusClass: "text-yellow-500",
          indicatorClass: "bg-yellow-500 animate-pulse"
        };
      default:
        return {
          icon: Eye,
          statusText: "Inconnu",
          statusClass: "text-gray-500",
          indicatorClass: "bg-gray-400"
        };
    }
  };

  const trackingStatus = getTrackingStatus();

  const visitorCard = {
    title: "Visiteurs en ligne",
    value: visitorLoading ? "..." : (visitorStats?.totalVisitors || 0).toString(),
    change: visitorLoading ? "En temps réel..." : `${visitorStats?.uniqueVisitors || 0} visiteurs uniques`,
    icon: Eye,
    trend: "neutral" as const,
    status: trackingStatus
  };

  return (
    <div className="space-y-3 sm:space-y-4 w-full">
      {/* Cartes principales - Responsive sur mobile */}
      <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full">
        {mainCards.map((card) => (
          <Card key={card.title} className="hover:shadow-lg transition-shadow w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-2 sm:px-3 lg:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium truncate">{card.title}</CardTitle>
              <card.icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-2 sm:px-3 lg:px-6">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{card.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {card.trend === "up" && <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 mr-1 text-green-500 flex-shrink-0" />}
                {card.trend === "down" && <TrendingDown className="h-2 w-2 sm:h-3 sm:w-3 mr-1 text-red-500 flex-shrink-0" />}
                <span className="truncate">{card.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Carte visiteurs en ligne - Pleine largeur */}
      <div className="w-full">
        <Card className="hover:shadow-lg transition-shadow relative w-full">
          {/* Indicateur en ligne animé avec état du tracking */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center space-x-1 sm:space-x-2">
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${visitorCard.status.indicatorClass}`}></div>
            <span className={`text-xs font-medium ${visitorCard.status.statusClass} hidden sm:inline`}>
              {visitorCard.status.statusText}
            </span>
          </div>
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-2 sm:px-3 lg:px-6 pt-6 sm:pt-8">
            <CardTitle className="text-xs sm:text-sm lg:text-base font-medium truncate">{visitorCard.title}</CardTitle>
            <visitorCard.icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-2 sm:px-3 lg:px-6">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{visitorCard.value}</div>
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              {visitorCard.trend === "up" && <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-green-500 flex-shrink-0" />}
              {visitorCard.trend === "down" && <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-red-500 flex-shrink-0" />}
              <span className="truncate">{visitorCard.change}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;
