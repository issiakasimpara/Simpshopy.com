// 📊 DASHBOARD DE MONITORING DU CACHE
// Date: 2025-01-28
// Objectif: Interface pour surveiller les performances du cache

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Trash2
} from 'lucide-react';
import { useCacheMetrics, useIntelligentCacheInvalidation } from '@/hooks/useIntelligentAggressiveStorefront';
import { DataCriticality } from '@/services/intelligentCacheService';

const CacheMonitoringDashboard: React.FC = () => {
  const { metrics, alerts, refresh } = useCacheMetrics();
  const { invalidateByCriticality, getCacheStats } = useIntelligentCacheInvalidation();
  const [stats, setStats] = useState<any>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d'>('1h');

  useEffect(() => {
    const loadStats = () => {
      const cacheStats = getCacheStats();
      setStats(cacheStats);
    };

    loadStats();
    const interval = setInterval(loadStats, 5000); // Mise à jour toutes les 5 secondes
    
    return () => clearInterval(interval);
  }, [getCacheStats]);

  const getHitRateColor = (rate: number) => {
    if (rate >= 0.8) return 'text-green-600';
    if (rate >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getCriticalityColor = (criticality: DataCriticality) => {
    switch (criticality) {
      case DataCriticality.CRITICAL: return 'bg-red-100 text-red-800';
      case DataCriticality.IMPORTANT: return 'bg-orange-100 text-orange-800';
      case DataCriticality.STATIC: return 'bg-blue-100 text-blue-800';
      case DataCriticality.DYNAMIC: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!metrics || !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Chargement des métriques...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cache Monitoring</h1>
          <p className="text-gray-600">Surveillance des performances du cache intelligent</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button 
            onClick={() => invalidateByCriticality(DataCriticality.CRITICAL)} 
            variant="destructive" 
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Vider Cache Critique
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHitRateColor(metrics.globalHitRate)}`}>
              {(metrics.globalHitRate * 100).toFixed(1)}%
            </div>
            <Progress value={metrics.globalHitRate * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalHits} hits / {metrics.totalRequests} requêtes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Réponse</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.averageResponseTime.toFixed(0)}ms
            </div>
            <div className="flex items-center mt-2">
              {metrics.averageResponseTime < 100 ? (
                <Zap className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className="text-xs text-muted-foreground">
                {metrics.averageResponseTime < 100 ? 'Excellent' : 'À améliorer'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.activeAlerts}
            </div>
            <div className="flex items-center mt-2">
              {metrics.criticalAlerts > 0 ? (
                <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              )}
              <span className="text-xs text-muted-foreground">
                {metrics.criticalAlerts} critiques
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Intelligent</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.intelligent?.memory?.size || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.intelligent?.refreshTimers || 0} timers actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour détails */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="criticality">Par Criticité</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="top-keys">Top Clés</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribution par Criticité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(stats.intelligent?.byCriticality || {}).map(([criticality, count]) => (
                  <div key={criticality} className="flex items-center justify-between">
                    <Badge className={getCriticalityColor(criticality as DataCriticality)}>
                      {criticality}
                    </Badge>
                    <span className="font-medium">{count as number} entrées</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance par Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Mémoire</span>
                    <span className="font-medium">
                      {stats.intelligent?.memory?.size || 0} / {stats.intelligent?.memory?.maxSize || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Session</span>
                    <span className="font-medium">{stats.intelligent?.session?.size || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LocalStorage</span>
                    <span className="font-medium">{stats.intelligent?.localStorage?.size || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertes Récentes</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Aucune alerte active</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.slice(0, 10).map((alert, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      {getAlertIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {alert.type}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Clés de Cache</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.topKeys.map((keyData, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <code className="text-sm font-mono">{keyData.key}</code>
                      <div className="text-xs text-gray-500">
                        Hit Rate: {(keyData.hitRate * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{keyData.requests}</div>
                      <div className="text-xs text-gray-500">requêtes</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CacheMonitoringDashboard;
