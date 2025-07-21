
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Package, Eye, Target, Clock } from "lucide-react";
import SalesChart from "./SalesChart";
import RevenueChart from "./RevenueChart";
import TopProductsChart from "./TopProductsChart";
import PerformanceMetrics from "./PerformanceMetrics";
import CustomerInsights from "./CustomerInsights";

const AnalyticsTabs = () => {
  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/10 rounded-2xl border border-border/50 shadow-lg p-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/30 rounded-xl p-1">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="sales" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300">Ventes</TabsTrigger>
          <TabsTrigger value="customers" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300">Clients</TabsTrigger>
          <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300">Produits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <SalesChart />
            <RevenueChart />
          </div>
          <TopProductsChart />
          <PerformanceMetrics />
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <SalesChart />
            <RevenueChart />
          </div>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background via-background to-muted/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/40 dark:to-blue-900/40 rounded-lg shadow-md">
                  <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Analyses des ventes détaillées</CardTitle>
                  <CardDescription className="font-medium">Performance de vos ventes par période</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200/30 dark:border-green-800/30">
                  <h3 className="font-semibold text-green-700 dark:text-green-400">Ventes aujourd'hui</h3>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-300">0 CFA</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/30 dark:border-blue-800/30">
                  <h3 className="font-semibold text-blue-700 dark:text-blue-400">Ventes cette semaine</h3>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">0 CFA</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl border border-purple-200/30 dark:border-purple-800/30">
                  <h3 className="font-semibold text-purple-700 dark:text-purple-400">Ventes ce mois</h3>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">0 CFA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomerInsights />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <TopProductsChart />
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background via-background to-muted/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 rounded-lg shadow-md">
                    <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Performance produits</CardTitle>
                    <CardDescription className="font-medium">Statistiques de vos produits</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg">
                    <span className="font-medium">Produits les plus vus</span>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="font-bold">0 vues</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg">
                    <span className="font-medium">Taux de conversion moyen</span>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="font-bold">0%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg">
                    <span className="font-medium">Temps moyen de consultation</span>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-bold">0m 0s</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsTabs;
