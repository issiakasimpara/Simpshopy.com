/**
 * 📊 Service de Métriques de Cache Avancées
 * Collecte et analyse des métriques de performance du cache
 */

interface CacheMetric {
  timestamp: number;
  type: 'hit' | 'miss' | 'eviction' | 'error';
  source: 'localStorage' | 'sessionStorage' | 'serviceWorker' | 'cdn' | 'api';
  key?: string;
  size?: number;
  responseTime?: number;
  error?: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  errors: number;
  totalSize: number;
  averageResponseTime: number;
  hitRatio: number;
  lastUpdated: number;
}

interface CacheAlert {
  id: string;
  type: 'performance' | 'error' | 'capacity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  resolved: boolean;
}

class CacheMetricsService {
  private metrics: CacheMetric[] = [];
  private stats: Map<string, CacheStats> = new Map();
  private alerts: CacheAlert[] = [];
  private maxMetrics = 1000; // Limite des métriques en mémoire
  private alertThresholds = {
    hitRatio: { warning: 0.7, critical: 0.5 },
    responseTime: { warning: 200, critical: 500 },
    errorRate: { warning: 0.05, critical: 0.1 },
    cacheSize: { warning: 50 * 1024 * 1024, critical: 100 * 1024 * 1024 } // 50MB, 100MB
  };

  constructor() {
    this.initializeStats();
    this.startPeriodicCleanup();
  }

  /**
   * 🔍 Initialiser les statistiques pour chaque source
   */
  private initializeStats(): void {
    const sources = ['localStorage', 'sessionStorage', 'serviceWorker', 'cdn', 'api'];
    sources.forEach(source => {
      this.stats.set(source, {
        hits: 0,
        misses: 0,
        evictions: 0,
        errors: 0,
        totalSize: 0,
        averageResponseTime: 0,
        hitRatio: 0,
        lastUpdated: Date.now()
      });
    });
  }

  /**
   * 📊 Enregistrer une métrique
   */
  public recordMetric(metric: Omit<CacheMetric, 'timestamp'>): void {
    const fullMetric: CacheMetric = {
      ...metric,
      timestamp: Date.now()
    };

    this.metrics.push(fullMetric);
    this.updateStats(fullMetric);
    this.checkAlerts(fullMetric);

    // Limiter le nombre de métriques en mémoire
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * 📈 Mettre à jour les statistiques
   */
  private updateStats(metric: CacheMetric): void {
    const stats = this.stats.get(metric.source);
    if (!stats) return;

    switch (metric.type) {
      case 'hit':
        stats.hits++;
        break;
      case 'miss':
        stats.misses++;
        break;
      case 'eviction':
        stats.evictions++;
        break;
      case 'error':
        stats.errors++;
        break;
    }

    if (metric.size) {
      stats.totalSize += metric.size;
    }

    if (metric.responseTime) {
      const totalRequests = stats.hits + stats.misses;
      stats.averageResponseTime = 
        (stats.averageResponseTime * (totalRequests - 1) + metric.responseTime) / totalRequests;
    }

    stats.hitRatio = stats.hits / (stats.hits + stats.misses) || 0;
    stats.lastUpdated = Date.now();

    this.stats.set(metric.source, stats);
  }

  /**
   * 🚨 Vérifier les alertes
   */
  private checkAlerts(metric: CacheMetric): void {
    const stats = this.stats.get(metric.source);
    if (!stats) return;

    // Vérifier le hit ratio
    if (stats.hitRatio < this.alertThresholds.hitRatio.critical) {
      this.createAlert({
        type: 'performance',
        severity: 'critical',
        message: `Hit ratio critique pour ${metric.source}: ${(stats.hitRatio * 100).toFixed(1)}%`
      });
    } else if (stats.hitRatio < this.alertThresholds.hitRatio.warning) {
      this.createAlert({
        type: 'performance',
        severity: 'medium',
        message: `Hit ratio faible pour ${metric.source}: ${(stats.hitRatio * 100).toFixed(1)}%`
      });
    }

    // Vérifier le temps de réponse
    if (stats.averageResponseTime > this.alertThresholds.responseTime.critical) {
      this.createAlert({
        type: 'performance',
        severity: 'high',
        message: `Temps de réponse élevé pour ${metric.source}: ${stats.averageResponseTime.toFixed(0)}ms`
      });
    }

    // Vérifier la taille du cache
    if (stats.totalSize > this.alertThresholds.cacheSize.critical) {
      this.createAlert({
        type: 'capacity',
        severity: 'high',
        message: `Cache ${metric.source} proche de la limite: ${(stats.totalSize / 1024 / 1024).toFixed(1)}MB`
      });
    }

    // Vérifier le taux d'erreur
    const totalRequests = stats.hits + stats.misses + stats.errors;
    const errorRate = stats.errors / totalRequests;
    if (errorRate > this.alertThresholds.errorRate.critical) {
      this.createAlert({
        type: 'error',
        severity: 'critical',
        message: `Taux d'erreur élevé pour ${metric.source}: ${(errorRate * 100).toFixed(1)}%`
      });
    }
  }

  /**
   * 🚨 Créer une alerte
   */
  private createAlert(alert: Omit<CacheAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const newAlert: CacheAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      resolved: false
    };

    // Éviter les doublons d'alertes récentes
    const recentAlert = this.alerts.find(a => 
      a.type === newAlert.type && 
      a.severity === newAlert.severity &&
      a.message === newAlert.message &&
      Date.now() - a.timestamp < 300000 // 5 minutes
    );

    if (!recentAlert) {
      this.alerts.push(newAlert);
      
      // Limiter le nombre d'alertes
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(-100);
      }

      // Log de l'alerte
      console.warn(`🚨 Cache Alert [${newAlert.severity.toUpperCase()}]: ${newAlert.message}`);
    }
  }

  /**
   * 📊 Obtenir les statistiques
   */
  public getStats(source?: string): CacheStats | Map<string, CacheStats> {
    if (source) {
      return this.stats.get(source) || this.initializeStatsForSource(source);
    }
    return this.stats;
  }

  /**
   * 📊 Initialiser les stats pour une nouvelle source
   */
  private initializeStatsForSource(source: string): CacheStats {
    const stats: CacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      errors: 0,
      totalSize: 0,
      averageResponseTime: 0,
      hitRatio: 0,
      lastUpdated: Date.now()
    };
    this.stats.set(source, stats);
    return stats;
  }

  /**
   * 🚨 Obtenir les alertes
   */
  public getAlerts(resolved?: boolean): CacheAlert[] {
    if (resolved !== undefined) {
      return this.alerts.filter(alert => alert.resolved === resolved);
    }
    return this.alerts;
  }

  /**
   * ✅ Résoudre une alerte
   */
  public resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  /**
   * 📊 Obtenir les métriques récentes
   */
  public getRecentMetrics(minutes: number = 60): CacheMetric[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.metrics.filter(metric => metric.timestamp > cutoff);
  }

  /**
   * 📈 Calculer les tendances
   */
  public getTrends(minutes: number = 60): {
    hitRatio: number;
    responseTime: number;
    errorRate: number;
    cacheSize: number;
  } {
    const recentMetrics = this.getRecentMetrics(minutes);
    const olderMetrics = this.getRecentMetrics(minutes * 2).filter(
      m => m.timestamp < Date.now() - (minutes * 60 * 1000)
    );

    const recentStats = this.calculateStatsFromMetrics(recentMetrics);
    const olderStats = this.calculateStatsFromMetrics(olderMetrics);

    return {
      hitRatio: recentStats.hitRatio - olderStats.hitRatio,
      responseTime: recentStats.averageResponseTime - olderStats.averageResponseTime,
      errorRate: recentStats.errorRate - olderStats.errorRate,
      cacheSize: recentStats.totalSize - olderStats.totalSize
    };
  }

  /**
   * 📊 Calculer les stats à partir des métriques
   */
  private calculateStatsFromMetrics(metrics: CacheMetric[]): {
    hitRatio: number;
    averageResponseTime: number;
    errorRate: number;
    totalSize: number;
  } {
    const hits = metrics.filter(m => m.type === 'hit').length;
    const misses = metrics.filter(m => m.type === 'miss').length;
    const errors = metrics.filter(m => m.type === 'error').length;
    const totalRequests = hits + misses + errors;
    
    const responseTimes = metrics
      .filter(m => m.responseTime)
      .map(m => m.responseTime!);
    
    const totalSize = metrics
      .filter(m => m.size)
      .reduce((sum, m) => sum + m.size!, 0);

    return {
      hitRatio: totalRequests > 0 ? hits / totalRequests : 0,
      averageResponseTime: responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 0,
      errorRate: totalRequests > 0 ? errors / totalRequests : 0,
      totalSize
    };
  }

  /**
   * 🧹 Nettoyage périodique
   */
  private startPeriodicCleanup(): void {
    setInterval(() => {
      // Nettoyer les métriques anciennes (plus de 24h)
      const cutoff = Date.now() - (24 * 60 * 60 * 1000);
      this.metrics = this.metrics.filter(metric => metric.timestamp > cutoff);

      // Nettoyer les alertes résolues anciennes (plus de 7 jours)
      const alertCutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
      this.alerts = this.alerts.filter(alert => 
        !alert.resolved || alert.timestamp > alertCutoff
      );
    }, 60 * 60 * 1000); // Toutes les heures
  }

  /**
   * 📊 Exporter les données pour analyse
   */
  public exportData(): {
    metrics: CacheMetric[];
    stats: Record<string, CacheStats>;
    alerts: CacheAlert[];
    trends: ReturnType<typeof this.getTrends>;
  } {
    return {
      metrics: this.metrics,
      stats: Object.fromEntries(this.stats),
      alerts: this.alerts,
      trends: this.getTrends()
    };
  }

  /**
   * 🔄 Réinitialiser les métriques
   */
  public reset(): void {
    this.metrics = [];
    this.initializeStats();
    this.alerts = [];
  }
}

// Instance globale
export const cacheMetricsService = new CacheMetricsService();

/**
 * 🔍 Hook React pour utiliser le service de métriques
 */
export const useCacheMetrics = () => {
  const [stats, setStats] = React.useState<Map<string, CacheStats>>(new Map());
  const [alerts, setAlerts] = React.useState<CacheAlert[]>([]);

  React.useEffect(() => {
    const updateMetrics = () => {
      setStats(cacheMetricsService.getStats() as Map<string, CacheStats>);
      setAlerts(cacheMetricsService.getAlerts());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Mise à jour toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  const recordMetric = (metric: Omit<CacheMetric, 'timestamp'>) => {
    cacheMetricsService.recordMetric(metric);
  };

  const resolveAlert = (alertId: string) => {
    cacheMetricsService.resolveAlert(alertId);
  };

  const getTrends = (minutes?: number) => {
    return cacheMetricsService.getTrends(minutes);
  };

  return {
    stats,
    alerts,
    recordMetric,
    resolveAlert,
    getTrends,
    exportData: () => cacheMetricsService.exportData()
  };
};
