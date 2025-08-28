
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, AlertTriangle } from "lucide-react";
import { useStoreCurrency } from "@/hooks/useStoreCurrency";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useStores } from "@/hooks/useStores";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAbandonedCarts } from "@/hooks/useAbandonedCarts";

const DashboardStats = () => {
  const { store } = useStores();
  const { formatConvertedPrice } = useStoreCurrency(store?.id);
  const { stats, isLoadingStats } = useOrders();
  const { products, isLoading: isLoadingProducts } = useProducts(store?.id, 'active');
  const { analytics, isLoading: analyticsLoading } = useAnalytics();
  const { stats: abandonedStats, isLoading: abandonedLoading } = useAbandonedCarts(store?.id);

  // Utiliser les analytics pour les statistiques
  const revenue = analytics?.totalRevenue || stats?.totalRevenue || 0;
  const totalOrders = analytics?.totalOrders || stats?.totalOrders || 0;
  const todayOrders = stats?.todayOrders || 0;
  const todayRevenue = stats?.todayRevenue || 0;
  const productCount = products?.length || 0;
  const totalCustomers = analytics?.totalCustomers || 0;

  const cards = [
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

  return (
    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">{card.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {card.trend === "up" && <TrendingUp className="h-3 w-3 mr-1 text-green-500" />}
              {card.trend === "down" && <TrendingDown className="h-3 w-3 mr-1 text-red-500" />}
              <span className="truncate">{card.change}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
