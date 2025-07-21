
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/orderUtils";

const SalesChart = () => {
  const { salesData, isLoading } = useAnalytics();

  const chartConfig = {
    sales: {
      label: "Ventes (CFA)",
      color: "#3b82f6",
    },
    orders: {
      label: "Commandes",
      color: "#10b981",
    },
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Évolution des ventes</CardTitle>
          <CardDescription>
            Suivi mensuel du chiffre d'affaires et des commandes
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

  if (!salesData || salesData.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Évolution des ventes</CardTitle>
          <CardDescription>
            Suivi mensuel du chiffre d'affaires et des commandes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Aucune donnée de vente disponible</p>
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
        <CardTitle className="text-lg font-semibold">Évolution des ventes</CardTitle>
        <CardDescription>
          Suivi mensuel du chiffre d'affaires et des commandes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke={chartConfig.sales.color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
