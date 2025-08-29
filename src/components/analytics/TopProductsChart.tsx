
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as ChartTooltip, CartesianGrid } from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useStoreCurrency } from "@/hooks/useStoreCurrency";
import { useStores } from "@/hooks/useStores";
import { Package, TrendingUp } from "lucide-react";

const TopProductsChart = () => {
  const { topProducts, isLoading } = useAnalytics();
  const { store } = useStores();
  const { formatConvertedPrice } = useStoreCurrency(store?.id);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">Produits les plus vendus</CardTitle>
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Chargement...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!topProducts || topProducts.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">Produits les plus vendus</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-gray-300"></div>
              <span className="text-sm text-gray-500">Aucune donnée</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-muted-foreground">Aucun produit vendu pour le moment</p>
              <p className="text-xs text-gray-400 mt-2">Les produits apparaîtront ici une fois vendus</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Formater les données pour l'affichage
  const data = topProducts.slice(0, 5).map((product, index) => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    sales: Math.round(product.sales || 0),
    quantity: product.quantity || 0,
    rank: index + 1
  }));

  // Calculer le total des ventes pour les pourcentages
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">Produits les plus vendus</CardTitle>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-500">Top 5</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b' }}
              tickFormatter={(value) => formatConvertedPrice(value, 'XOF')}
            />
            <ChartTooltip
              content={<CustomTooltip formatConvertedPrice={formatConvertedPrice} totalSales={totalSales} />}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Bar 
              dataKey="sales" 
              radius={[4, 4, 0, 0]} 
              className="fill-blue-500"
              fill="url(#barGradient)"
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#1D4ED8" stopOpacity={1}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const CustomTooltip = ({ active, payload, label, formatConvertedPrice, totalSales }: any) => {
  if (active && payload && payload.length) {
    const sales = payload[0].value;
    const percentage = totalSales > 0 ? (sales / totalSales) * 100 : 0;
    
    return (
      <div className="rounded-xl border-0 bg-white/95 backdrop-blur-sm p-4 shadow-xl">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <p className="text-sm font-medium text-gray-900">{label}</p>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-gray-900">
              {formatConvertedPrice(sales, 'XOF')}
            </p>
            <p className="text-xs text-gray-500">
              {percentage.toFixed(1)}% du total des ventes
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default TopProductsChart;
