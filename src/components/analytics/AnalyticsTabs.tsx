
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStoreCurrency } from "@/hooks/useStoreCurrency";
import { useStores } from "@/hooks/useStores";
import KPICards from "./KPICards";
import TopProductsChart from "./TopProductsChart";
import SalesChart from "./SalesChart";
import PerformanceMetrics from "./PerformanceMetrics";
import CustomerInsights from "./CustomerInsights";

const AnalyticsTabs = () => {
  const { store } = useStores();
  const { formatConvertedPrice } = useStoreCurrency(store?.id);

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
        <TabsTrigger value="products">Produits</TabsTrigger>
        <TabsTrigger value="sales">Ventes</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* KPIs principaux */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Indicateurs clés</h3>
          <KPICards />
        </div>
        
        {/* Métriques de performance */}
        <PerformanceMetrics />
        
        {/* Graphiques */}
        <div className="grid gap-6 md:grid-cols-2">
          <TopProductsChart />
          <SalesChart />
        </div>
        
        {/* Insights clients */}
        <CustomerInsights />
      </TabsContent>

      <TabsContent value="products" className="space-y-6">
        <TopProductsChart />
      </TabsContent>

      <TabsContent value="sales" className="space-y-6">
        <SalesChart />
      </TabsContent>
    </Tabs>
  );
};

export default AnalyticsTabs;
