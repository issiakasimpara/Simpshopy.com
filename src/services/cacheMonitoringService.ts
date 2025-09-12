// 📊 SERVICE DE MONITORING DU CACHE
// Date: 2025-01-28
// Objectif: Métriques avancées et alertes sur les performances du cache

interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  averageResponseTime: number;
  staleDataCount: number;
  invalidationCount: number;
  lastInvalidation: number;
}

interface CacheAlert {
  type: 'low_hit_rate' | 'high_response_time' | 'stale_data' | 'memory_usage';
  severity: 'warning' | 'error' | 'critical';
  message: string;
  timestamp: number;
  data?: any;
}

export class CacheMonitoringService {
  private static metrics: Map<string, CacheMetrics> = new Map();
  private static alerts: CacheAlert[] = [];
  private static responseTimes: Map<string, number[]> = new Map();
  private static readonly MAX_ALERTS = 100;
  private static readonly MAX_RESPONSE_TIMES = 50;

  // Seuils d'alerte
  private static readonly ALERT_THRESHOLDS = {
    MIN_HIT_RATE: 0.7, // 70%
    MAX_RESPONSE_TIME: 1000, // 1 seconde
    MAX_STALE_DATA_AGE: 30 * 60 * 1000, // 30 minutes
    MAX_MEMORY_USAGE: 0.8, // 80%
  };

  /**
   * Enregistre un cache hit
   */
  static recordHit(key: string, responseTime: number): void {
    this.updateMetrics(key, 'hit', responseTime);
    this.recordResponseTime(key, responseTime);
  }

  /**
   * Enregistre un cache miss
   */
  static recordMiss(key: string, responseTime: number): void {
    this.updateMetrics(key, 'miss', responseTime);
    this.recordResponseTime(key, responseTime);
  }

  /**
   * Enregistre une invalidation
   */
  static recordInvalidation(key: string): void {
    const metrics = this.getMetrics(key);
    metrics.invalidationCount++;
    metrics.lastInvalidation = Date.now();
    this.metrics.set(key, metrics);
    
    console.log(`📊 Cache invalidation recorded: ${key}`);
  }

  /**
   * Met à jour les métriques
   */
  private static updateMetrics(key: string, type: 'hit' | 'miss', responseTime: number): void {
    const metrics = this.getMetrics(key);
    
    if (type === 'hit') {
      metrics.hits++;
    } else {
      metrics.misses++;
    }
    
    metrics.totalRequests++;
    metrics.hitRate = metrics.hits / metrics.totalRequests;
    metrics.averageResponseTime = this.calculateAverageResponseTime(key, responseTime);
    
    this.metrics.set(key, metrics);
    
    // Vérifier les alertes
    this.checkAlerts(key, metrics);
  }

  /**
   * Enregistre un temps de réponse
   */
  private static recordResponseTime(key: string, responseTime: number): void {
    const times = this.responseTimes.get(key) || [];
    times.push(responseTime);
    
    // Garder seulement les N derniers temps
    if (times.length > this.MAX_RESPONSE_TIMES) {
      times.shift();
    }
    
    this.responseTimes.set(key, times);
  }

  /**
   * Calcule le temps de réponse moyen
   */
  private static calculateAverageResponseTime(key: string, newTime: number): number {
    const times = this.responseTimes.get(key) || [];
    const allTimes = [...times, newTime];
    return allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length;
  }

  /**
   * Vérifie les alertes
   */
  private static checkAlerts(key: string, metrics: CacheMetrics): void {
    const now = Date.now();
    
    // Alerte: Taux de hit trop bas
    if (metrics.totalRequests >= 10 && metrics.hitRate < this.ALERT_THRESHOLDS.MIN_HIT_RATE) {
      this.addAlert({
        type: 'low_hit_rate',
        severity: metrics.hitRate < 0.5 ? 'critical' : 'warning',
        message: `Low cache hit rate for ${key}: ${(metrics.hitRate * 100).toFixed(1)}%`,
        timestamp: now,
        data: { key, hitRate: metrics.hitRate, totalRequests: metrics.totalRequests }
      });
    }
    
    // Alerte: Temps de réponse trop élevé
    if (metrics.averageResponseTime > this.ALERT_THRESHOLDS.MAX_RESPONSE_TIME) {
      this.addAlert({
        type: 'high_response_time',
        severity: 'warning',
        message: `High cache response time for ${key}: ${metrics.averageResponseTime.toFixed(0)}ms`,
        timestamp: now,
        data: { key, responseTime: metrics.averageResponseTime }
      });
    }
    
    // Alerte: Données obsolètes
    if (metrics.lastInvalidation && (now - metrics.lastInvalidation) > this.ALERT_THRESHOLDS.MAX_STALE_DATA_AGE) {
      this.addAlert({
        type: 'stale_data',
        severity: 'warning',
        message: `Stale data detected for ${key}: ${Math.round((now - metrics.lastInvalidation) / 60000)} minutes old`,
        timestamp: now,
        data: { key, age: now - metrics.lastInvalidation }
      });
    }
  }

  /**
   * Ajoute une alerte
   */
  private static addAlert(alert: CacheAlert): void {
    // Éviter les doublons récents
    const recentAlert = this.alerts.find(a => 
      a.type === alert.type && 
      a.data?.key === alert.data?.key &&
      (alert.timestamp - a.timestamp) < 60000 // 1 minute
    );
    
    if (recentAlert) {
      return;
    }
    
    this.alerts.unshift(alert);
    
    // Limiter le nombre d'alertes
    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts = this.alerts.slice(0, this.MAX_ALERTS);
    }
    
    // Log selon la sévérité
    const logLevel = alert.severity === 'critical' ? 'error' : 'warn';
    console[logLevel](`🚨 Cache Alert [${alert.severity.toUpperCase()}]: ${alert.message}`);
  }

  /**
   * Obtient les métriques pour une clé
   */
  private static getMetrics(key: string): CacheMetrics {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalRequests: 0,
        averageResponseTime: 0,
        staleDataCount: 0,
        invalidationCount: 0,
        lastInvalidation: 0,
      });
    }
    return this.metrics.get(key)!;
  }

  /**
   * Obtient toutes les métriques
   */
  static getAllMetrics(): Record<string, CacheMetrics> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Obtient les alertes
   */
  static getAlerts(severity?: CacheAlert['severity']): CacheAlert[] {
    if (severity) {
      return this.alerts.filter(alert => alert.severity === severity);
    }
    return [...this.alerts];
  }

  /**
   * Obtient les statistiques globales
   */
  static getGlobalStats(): {
    totalHits: number;
    totalMisses: number;
    globalHitRate: number;
    totalRequests: number;
    averageResponseTime: number;
    activeAlerts: number;
    criticalAlerts: number;
    topKeys: Array<{key: string, hitRate: number, requests: number}>;
  } {
    let totalHits = 0;
    let totalMisses = 0;
    let totalRequests = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    
    const keyStats: Array<{key: string, hitRate: number, requests: number}> = [];
    
    this.metrics.forEach((metrics, key) => {
      totalHits += metrics.hits;
      totalMisses += metrics.misses;
      totalRequests += metrics.totalRequests;
      
      if (metrics.averageResponseTime > 0) {
        totalResponseTime += metrics.averageResponseTime * metrics.totalRequests;
        responseTimeCount += metrics.totalRequests;
      }
      
      keyStats.push({
        key,
        hitRate: metrics.hitRate,
        requests: metrics.totalRequests
      });
    });
    
    const globalHitRate = totalRequests > 0 ? totalHits / totalRequests : 0;
    const averageResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
    
    const activeAlerts = this.alerts.length;
    const criticalAlerts = this.alerts.filter(a => a.severity === 'critical').length;
    
    // Top 10 des clés par nombre de requêtes
    const topKeys = keyStats
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);
    
    return {
      totalHits,
      totalMisses,
      globalHitRate,
      totalRequests,
      averageResponseTime,
      activeAlerts,
      criticalAlerts,
      topKeys,
    };
  }

  /**
   * Nettoie les métriques anciennes
   */
  static cleanup(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 heures
    
    // Nettoyer les métriques sans activité récente
    this.metrics.forEach((metrics, key) => {
      if (metrics.totalRequests === 0 || metrics.lastInvalidation < cutoff) {
        this.metrics.delete(key);
        this.responseTimes.delete(key);
      }
    });
    
    // Nettoyer les alertes anciennes
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
    
    console.log('📊 Cache monitoring cleanup completed');
  }

  /**
   * Exporte les métriques pour analyse
   */
  static exportMetrics(): string {
    const stats = this.getGlobalStats();
    const metrics = this.getAllMetrics();
    const alerts = this.getAlerts();
    
    return JSON.stringify({
      timestamp: Date.now(),
      globalStats: stats,
      detailedMetrics: metrics,
      alerts: alerts.slice(0, 20), // 20 dernières alertes
    }, null, 2);
  }
}
