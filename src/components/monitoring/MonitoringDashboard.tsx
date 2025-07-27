import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Memory, 
  Zap,
  RefreshCw,
  Download,
  Trash2
} from 'lucide-react';
import { useMonitoring } from '@/utils/monitoring';

interface MonitoringDashboardProps {
  className?: string;
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ className }) => {
  const { getMetrics, generateReport, clearEvents } = useMonitoring();
  const [metrics, setMetrics] = useState(getMetrics());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Rafraîchir les métriques toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, [getMetrics]);

  const refreshMetrics = () => {
    setIsRefreshing(true);
    setMetrics(getMetrics());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const downloadReport = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitoring-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPerformanceStatus = () => {
    const { performance } = metrics;
    if (performance.errorCount > 10 || performance.pageLoadTime > 5000) return 'critical';
    if (performance.errorCount > 5 || performance.pageLoadTime > 3000) return 'warning';
    return 'good';
  };

  const getSecurityStatus = () => {
    const { security } = metrics;
    if (security.suspiciousRequests > 0 || security.xssAttempts > 0) return 'critical';
    if (security.failedLogins > 5) return 'warning';
    return 'good';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Tableau de Bord Monitoring
          </h2>
          <p className="text-muted-foreground">
            Surveillance en temps réel de la performance et sécurité
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshMetrics}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={downloadReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Rapport
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearEvents}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Effacer
          </Button>
        </div>
      </div>

      {/* Cartes de statut global */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getPerformanceStatus() === 'critical' && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              {getPerformanceStatus() === 'warning' && (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              {getPerformanceStatus() === 'good' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span className="text-2xl font-bold">
                {getPerformanceStatus() === 'critical' ? 'Critique' :
                 getPerformanceStatus() === 'warning' ? 'Attention' : 'Bon'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.performance.errorCount} erreurs, {metrics.performance.pageLoadTime.toFixed(0)}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sécurité</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getSecurityStatus() === 'critical' && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              {getSecurityStatus() === 'warning' && (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              {getSecurityStatus() === 'good' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span className="text-2xl font-bold">
                {getSecurityStatus() === 'critical' ? 'Critique' :
                 getSecurityStatus() === 'warning' ? 'Attention' : 'Sécurisé'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.security.suspiciousRequests} requêtes suspectes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mémoire</CardTitle>
            <Memory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardHeader>
            <div className="text-2xl font-bold">
              {(metrics.performance.memoryUsage / 1024 / 1024).toFixed(1)} MB
            </div>
            <p className="text-xs text-muted-foreground">
              Utilisation actuelle
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Onglets détaillés */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Temps de Chargement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {metrics.performance.pageLoadTime.toFixed(0)}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.performance.pageLoadTime > 3000 ? '⚠️ Temps élevé' : '✅ Normal'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Temps de Réponse API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {metrics.performance.apiResponseTime.toFixed(0)}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.performance.apiResponseTime > 5000 ? '⚠️ Temps élevé' : '✅ Normal'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Re-renders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {metrics.performance.renderCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.performance.renderCount > 100 ? '⚠️ Nombre élevé' : '✅ Normal'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Erreurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">
                  {metrics.performance.errorCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.performance.errorCount > 10 ? '🚨 Trop d\'erreurs' : '✅ Acceptable'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Tentatives de Connexion Échouées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">
                  {metrics.security.failedLogins}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.security.failedLogins > 5 ? '⚠️ Possible attaque' : '✅ Normal'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Requêtes Suspectes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">
                  {metrics.security.suspiciousRequests}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.security.suspiciousRequests > 0 ? '🚨 Attention requise' : '✅ Aucune détectée'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Violations CSRF
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">
                  {metrics.security.csrfViolations}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.security.csrfViolations > 0 ? '🚨 Sécurité compromise' : '✅ Aucune violation'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Tentatives XSS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">
                  {metrics.security.xssAttempts}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.security.xssAttempts > 0 ? '🚨 Attaque détectée' : '✅ Aucune tentative'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Événements Récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {metrics.events.slice(-20).reverse().map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={getSeverityColor(event.severity)}
                      >
                        {event.severity}
                      </Badge>
                      <span className="text-sm font-medium">{event.type}</span>
                      <span className="text-sm text-muted-foreground">{event.message}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
                {metrics.events.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Aucun événement enregistré
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard; 