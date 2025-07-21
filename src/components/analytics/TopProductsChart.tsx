
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/orderUtils";

const TopProductsChart = () => {
  const { topProducts, isLoading } = useAnalytics();

  const chartConfig = {
    sales: {
      label: "Ventes",
      color: "#f59e0b",
    },
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top produits</CardTitle>
          <CardDescription>
            Produits les plus vendus ce mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!topProducts || topProducts.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top produits</CardTitle>
          <CardDescription>
            Produits les plus vendus ce mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Aucun produit vendu</p>
              <p className="text-xs mt-1">Les données apparaîtront ici une fois que vous aurez des ventes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top produits</CardTitle>
        <CardDescription>
          Produits les plus vendus ce mois
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={100}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [formatCurrency(value as number), "Ventes"]}
              />
              <Bar
                dataKey="sales"
                fill={chartConfig.sales.color}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TopProductsChart;
