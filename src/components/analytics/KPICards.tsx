
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, Package, Loader2 } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatCurrency } from "@/utils/orderUtils";

const KPICards = () => {
  const { analytics, isLoading } = useAnalytics();

  const kpiData = [
    {
      title: "Chiffre d'affaires total",
      value: isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatCurrency(analytics?.totalRevenue || 0),
      change: isLoading ? "..." : analytics?.revenueGrowth ? `${analytics.revenueGrowth >= 0 ? '+' : ''}${analytics.revenueGrowth.toFixed(1)}%` : "Aucune donnée",
      icon: DollarSign,
      period: "Ce mois",
      trend: (analytics?.revenueGrowth || 0) >= 0 ? "up" : "down",
      color: "blue"
    },
    {
      title: "Commandes",
      value: isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (analytics?.totalOrders || 0).toString(),
      change: isLoading ? "..." : analytics?.ordersGrowth ? `${analytics.ordersGrowth >= 0 ? '+' : ''}${analytics.ordersGrowth.toFixed(1)}%` : "Aucune donnée",
      icon: ShoppingCart,
      period: "Ce mois",
      trend: (analytics?.ordersGrowth || 0) >= 0 ? "up" : "down",
      color: "green"
    },
    {
      title: "Nouveaux clients",
      value: isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (analytics?.totalCustomers || 0).toString(),
      change: isLoading ? "..." : analytics?.customersGrowth ? `${analytics.customersGrowth >= 0 ? '+' : ''}${analytics.customersGrowth.toFixed(1)}%` : "Aucune donnée",
      icon: Users,
      period: "Ce mois",
      trend: (analytics?.customersGrowth || 0) >= 0 ? "up" : "down",
      color: "purple"
    },
    {
      title: "Panier moyen",
      value: isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatCurrency(analytics?.averageOrderValue || 0),
      change: "Valeur moyenne",
      icon: Package,
      period: "Toutes commandes",
      trend: "up",
      color: "orange"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "from-blue-100 to-emerald-100 dark:from-blue-900/40 dark:to-emerald-900/40",
        icon: "text-blue-600 dark:text-blue-400",
        text: "text-blue-600",
        gradient: "from-blue-500/20 via-emerald-500/20 to-purple-500/20",
        border: "from-blue-500 via-emerald-500 to-purple-500"
      },
      green: {
        bg: "from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40",
        icon: "text-green-600 dark:text-green-400",
        text: "text-green-600",
        gradient: "from-green-500/20 via-emerald-500/20 to-teal-500/20",
        border: "from-green-500 via-emerald-500 to-teal-500"
      },
      purple: {
        bg: "from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40",
        icon: "text-purple-600 dark:text-purple-400",
        text: "text-purple-600",
        gradient: "from-purple-500/20 via-indigo-500/20 to-blue-500/20",
        border: "from-purple-500 via-indigo-500 to-blue-500"
      },
      orange: {
        bg: "from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40",
        icon: "text-orange-600 dark:text-orange-400",
        text: "text-orange-600",
        gradient: "from-orange-500/20 via-amber-500/20 to-yellow-500/20",
        border: "from-orange-500 via-amber-500 to-yellow-500"
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/10 rounded-2xl border border-border/50 shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
          const colorClasses = getColorClasses(kpi.color);
          return (
            <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 bg-gradient-to-br from-background via-background to-muted/10">
              <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg`} />
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorClasses.border} opacity-60`} />
              
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium text-muted-foreground group-hover:${colorClasses.text} transition-colors`}>
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 bg-gradient-to-br ${colorClasses.bg} rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
                  <kpi.icon className={`h-5 w-5 ${colorClasses.icon}`} />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className={`text-2xl font-bold text-foreground group-hover:${colorClasses.text} transition-colors`}>{kpi.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  <p className="text-xs text-muted-foreground font-medium">{kpi.change}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.period}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default KPICards;
