
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip as ChartTooltip, CartesianGrid, Area, AreaChart } from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useStoreCurrency } from "@/hooks/useStoreCurrency";
import { useStores } from "@/hooks/useStores";
import { TrendingUp, TrendingDown } from "lucide-react";

const SalesChart = () => {
  const { salesData, isLoading } = useAnalytics();
  const { store } = useStores();
  const { formatConvertedPrice } = useStoreCurrency(store?.id);

  // Calculer la tendance
  const calculateTrend = () => {
    if (!salesData || salesData.length < 2) return { trend: 'neutral', percentage: 0 };
    
    const firstValue = salesData[0]?.sales || 0;
    const lastValue = salesData[salesData.length - 1]?.sales || 0;
    
    if (firstValue === 0) return { trend: 'neutral', percentage: 0 };
    
    const percentage = ((lastValue - firstValue) / firstValue) * 100;
    return {
      trend: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral',
      percentage: Math.abs(percentage)
    };
  };

  const trend = calculateTrend();

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">Évolution des ventes</CardTitle>
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

  if (!salesData || salesData.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">Évolution des ventes</CardTitle>
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
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-muted-foreground">Aucune donnée de vente disponible</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Formater les données pour l'affichage
  const formattedData = salesData.map((item, index) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    }),
    sales: Math.round(item.sales)
  }));

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">Évolution des ventes</CardTitle>
          <div className="flex items-center space-x-2">
            {trend.trend !== 'neutral' && (
              <>
                {trend.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  trend.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend.percentage.toFixed(1)}%
                </span>
              </>
            )}
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-500">7 derniers jours</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
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
              content={<CustomTooltip formatConvertedPrice={formatConvertedPrice} />}
              cursor={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '5 5' }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#salesGradient)"
              fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const CustomTooltip = ({ active, payload, label, formatConvertedPrice }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border-0 bg-white/95 backdrop-blur-sm p-4 shadow-xl">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-lg font-bold text-gray-900">
              {formatConvertedPrice(payload[0].value, 'XOF')}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default SalesChart;
