/**
 * ⏱️ Gestionnaire de TTL Dynamiques pour le Cache
 * Optimise automatiquement les durées de cache selon l'usage et les patterns
 */

interface CacheUsagePattern {
  key: string;
  accessCount: number;
  lastAccess: number;
  averageInterval: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dataType: 'static' | 'dynamic' | 'user' | 'session';
  size: number;
}

interface TTLConfig {
  base: number; // TTL de base en millisecondes
  min: number;  // TTL minimum
  max: number;  // TTL maximum
  multiplier: number; // Multiplicateur selon l'usage
}

interface CacheMetrics {
  hitRatio: number;
  missRatio: number;
  evictionRate: number;
  averageAccessInterval: number;
  totalAccesses: number;
}

class DynamicCacheTTLManager {
  private usagePatterns: Map<string, CacheUsagePattern> = new Map();
  private ttlConfigs: Map<string, TTLConfig> = new Map();
  private metrics: CacheMetrics = {
    hitRatio: 0,
    missRatio: 0,
    evictionRate: 0,
    averageAccessInterval: 0,
    totalAccesses: 0
  };

  // Configuration par défaut des TTL
  private defaultTTLConfigs: Record<string, TTLConfig> = {
    'static': {
      base: 24 * 60 * 60 * 1000, // 24 heures
      min: 60 * 60 * 1000,       // 1 heure
      max: 7 * 24 * 60 * 60 * 1000, // 7 jours
      multiplier: 1.5
    },
    'dynamic': {
      base: 5 * 60 * 1000,       // 5 minutes
      min: 30 * 1000,            // 30 secondes
      max: 60 * 60 * 1000,       // 1 heure
      multiplier: 2.0
    },
    'user': {
      base: 15 * 60 * 1000,      // 15 minutes
      min: 2 * 60 * 1000,        // 2 minutes
      max: 4 * 60 * 60 * 1000,   // 4 heures
      multiplier: 1.8
    },
    'session': {
      base: 30 * 60 * 1000,      // 30 minutes
      min: 5 * 60 * 1000,        // 5 minutes
      max: 8 * 60 * 60 * 1000,   // 8 heures
      multiplier: 1.2
    }
  };

  constructor() {
    this.initializeDefaultConfigs();
    this.startPeriodicOptimization();
  }

  /**
   * 🔧 Initialiser les configurations par défaut
   */
  private initializeDefaultConfigs(): void {
    Object.entries(this.defaultTTLConfigs).forEach(([type, config]) => {
      this.ttlConfigs.set(type, { ...config });
    });
  }

  /**
   * 📊 Enregistrer un accès au cache
   */
  public recordAccess(key: string, dataType: string, size: number = 0): void {
    const now = Date.now();
    const existing = this.usagePatterns.get(key);

    if (existing) {
      // Mettre à jour le pattern existant
      const interval = now - existing.lastAccess;
      existing.accessCount++;
      existing.averageInterval = (existing.averageInterval * (existing.accessCount - 1) + interval) / existing.accessCount;
      existing.lastAccess = now;
      existing.size = size;
    } else {
      // Créer un nouveau pattern
      this.usagePatterns.set(key, {
        key,
        accessCount: 1,
        lastAccess: now,
        averageInterval: 0,
        priority: this.calculatePriority(dataType, 1, 0),
        dataType: dataType as any,
        size
      });
    }

    this.updateMetrics();
  }

  /**
   * 🎯 Calculer la priorité d'un élément
   */
  private calculatePriority(dataType: string, accessCount: number, averageInterval: number): 'low' | 'medium' | 'high' | 'critical' {
    const priorityMap: Record<string, number> = {
      'static': 1,
      'dynamic': 2,
      'user': 3,
      'session': 4
    };

    const basePriority = priorityMap[dataType] || 2;
    const accessBonus = Math.min(accessCount / 10, 2); // Bonus pour les accès fréquents
    const intervalBonus = averageInterval > 0 ? Math.max(0, 2 - (averageInterval / (60 * 1000))) : 0; // Bonus pour les accès récents

    const totalScore = basePriority + accessBonus + intervalBonus;

    if (totalScore >= 6) return 'critical';
    if (totalScore >= 4) return 'high';
    if (totalScore >= 2) return 'medium';
    return 'low';
  }

  /**
   * ⏱️ Calculer le TTL optimal pour une clé
   */
  public calculateOptimalTTL(key: string, dataType: string): number {
    const pattern = this.usagePatterns.get(key);
    const config = this.ttlConfigs.get(dataType) || this.defaultTTLConfigs['dynamic'];

    if (!pattern) {
      // Pas de pattern, utiliser le TTL de base
      return config.base;
    }

    // Calculer le TTL basé sur l'usage
    let ttl = config.base;

    // Ajuster selon la fréquence d'accès
    if (pattern.accessCount > 10) {
      ttl *= config.multiplier;
    } else if (pattern.accessCount < 3) {
      ttl *= 0.5;
    }

    // Ajuster selon l'intervalle moyen
    if (pattern.averageInterval > 0) {
      const intervalMinutes = pattern.averageInterval / (60 * 1000);
      if (intervalMinutes < 5) {
        ttl *= 1.5; // Accès très fréquents
      } else if (intervalMinutes > 60) {
        ttl *= 0.7; // Accès peu fréquents
      }
    }

    // Ajuster selon la priorité
    const priorityMultipliers = {
      'critical': 2.0,
      'high': 1.5,
      'medium': 1.0,
      'low': 0.7
    };
    ttl *= priorityMultipliers[pattern.priority];

    // Ajuster selon la taille des données
    if (pattern.size > 1024 * 1024) { // > 1MB
      ttl *= 0.8; // Réduire le TTL pour les grosses données
    } else if (pattern.size < 1024) { // < 1KB
      ttl *= 1.2; // Augmenter le TTL pour les petites données
    }

    // Appliquer les limites min/max
    return Math.max(config.min, Math.min(config.max, ttl));
  }

  /**
   * 📈 Mettre à jour les métriques globales
   */
  private updateMetrics(): void {
    const patterns = Array.from(this.usagePatterns.values());
    
    if (patterns.length === 0) return;

    this.metrics.totalAccesses = patterns.reduce((sum, p) => sum + p.accessCount, 0);
    
    const totalIntervals = patterns
      .filter(p => p.averageInterval > 0)
      .reduce((sum, p) => sum + p.averageInterval, 0);
    
    const validPatterns = patterns.filter(p => p.averageInterval > 0);
    this.metrics.averageAccessInterval = validPatterns.length > 0 
      ? totalIntervals / validPatterns.length 
      : 0;

    // Calculer le hit ratio (simulation basée sur les patterns)
    const highPriorityPatterns = patterns.filter(p => p.priority === 'high' || p.priority === 'critical');
    this.metrics.hitRatio = highPriorityPatterns.length / patterns.length;
    this.metrics.missRatio = 1 - this.metrics.hitRatio;
  }

  /**
   * 🔄 Optimiser les TTL périodiquement
   */
  private startPeriodicOptimization(): void {
    setInterval(() => {
      this.optimizeTTLConfigs();
      this.cleanupOldPatterns();
    }, 5 * 60 * 1000); // Toutes les 5 minutes
  }

  /**
   * 🎯 Optimiser les configurations TTL
   */
  private optimizeTTLConfigs(): void {
    const patterns = Array.from(this.usagePatterns.values());
    
    // Grouper par type de données
    const patternsByType = patterns.reduce((acc, pattern) => {
      if (!acc[pattern.dataType]) acc[pattern.dataType] = [];
      acc[pattern.dataType].push(pattern);
      return acc;
    }, {} as Record<string, CacheUsagePattern[]>);

    // Optimiser chaque type
    Object.entries(patternsByType).forEach(([dataType, typePatterns]) => {
      const config = this.ttlConfigs.get(dataType);
      if (!config) return;

      const avgAccessCount = typePatterns.reduce((sum, p) => sum + p.accessCount, 0) / typePatterns.length;
      const avgInterval = typePatterns
        .filter(p => p.averageInterval > 0)
        .reduce((sum, p) => sum + p.averageInterval, 0) / typePatterns.length;

      // Ajuster le multiplicateur selon l'usage
      if (avgAccessCount > 5 && avgInterval < 5 * 60 * 1000) {
        config.multiplier = Math.min(config.multiplier * 1.1, 3.0);
      } else if (avgAccessCount < 2 || avgInterval > 30 * 60 * 1000) {
        config.multiplier = Math.max(config.multiplier * 0.9, 0.5);
      }

      // Ajuster le TTL de base
      const currentHitRatio = this.metrics.hitRatio;
      if (currentHitRatio < 0.7) {
        config.base = Math.min(config.base * 1.1, config.max);
      } else if (currentHitRatio > 0.9) {
        config.base = Math.max(config.base * 0.95, config.min);
      }

      this.ttlConfigs.set(dataType, config);
    });
  }

  /**
   * 🧹 Nettoyer les anciens patterns
   */
  private cleanupOldPatterns(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 heures

    for (const [key, pattern] of this.usagePatterns.entries()) {
      if (now - pattern.lastAccess > maxAge) {
        this.usagePatterns.delete(key);
      }
    }
  }

  /**
   * 📊 Obtenir les statistiques d'usage
   */
  public getUsageStats(): {
    totalKeys: number;
    patternsByType: Record<string, number>;
    patternsByPriority: Record<string, number>;
    averageTTL: number;
    recommendations: string[];
  } {
    const patterns = Array.from(this.usagePatterns.values());
    
    const patternsByType = patterns.reduce((acc, p) => {
      acc[p.dataType] = (acc[p.dataType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const patternsByPriority = patterns.reduce((acc, p) => {
      acc[p.priority] = (acc[p.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageTTL = patterns.length > 0 
      ? patterns.reduce((sum, p) => sum + this.calculateOptimalTTL(p.key, p.dataType), 0) / patterns.length
      : 0;

    // Générer des recommandations
    const recommendations: string[] = [];
    
    if (this.metrics.hitRatio < 0.7) {
      recommendations.push('Hit ratio faible - considérer augmenter les TTL');
    }
    
    if (this.metrics.averageAccessInterval > 30 * 60 * 1000) {
      recommendations.push('Accès peu fréquents - considérer réduire les TTL');
    }
    
    const highPriorityCount = patternsByPriority['high'] + patternsByPriority['critical'];
    if (highPriorityCount / patterns.length > 0.3) {
      recommendations.push('Beaucoup d\'éléments haute priorité - optimiser la stratégie de cache');
    }

    return {
      totalKeys: patterns.length,
      patternsByType,
      patternsByPriority,
      averageTTL,
      recommendations
    };
  }

  /**
   * 🎯 Obtenir le TTL recommandé pour une nouvelle clé
   */
  public getRecommendedTTL(dataType: string, expectedUsage?: 'low' | 'medium' | 'high'): number {
    const config = this.ttlConfigs.get(dataType) || this.defaultTTLConfigs['dynamic'];
    
    if (expectedUsage) {
      const usageMultipliers = {
        'low': 0.5,
        'medium': 1.0,
        'high': 1.5
      };
      return config.base * usageMultipliers[expectedUsage];
    }

    return config.base;
  }

  /**
   * 📈 Obtenir les métriques de performance
   */
  public getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * 🔄 Réinitialiser les patterns
   */
  public reset(): void {
    this.usagePatterns.clear();
    this.initializeDefaultConfigs();
    this.metrics = {
      hitRatio: 0,
      missRatio: 0,
      evictionRate: 0,
      averageAccessInterval: 0,
      totalAccesses: 0
    };
  }

  /**
   * 📊 Exporter les données pour analyse
   */
  public exportData(): {
    patterns: CacheUsagePattern[];
    configs: Record<string, TTLConfig>;
    metrics: CacheMetrics;
    stats: ReturnType<typeof this.getUsageStats>;
  } {
    return {
      patterns: Array.from(this.usagePatterns.values()),
      configs: Object.fromEntries(this.ttlConfigs),
      metrics: this.metrics,
      stats: this.getUsageStats()
    };
  }
}

// Instance globale
export const dynamicTTLManager = new DynamicCacheTTLManager();

/**
 * 🔍 Hook React pour utiliser le gestionnaire TTL
 */
export const useDynamicTTL = () => {
  const [stats, setStats] = React.useState(dynamicTTLManager.getUsageStats());
  const [metrics, setMetrics] = React.useState(dynamicTTLManager.getMetrics());

  React.useEffect(() => {
    const updateStats = () => {
      setStats(dynamicTTLManager.getUsageStats());
      setMetrics(dynamicTTLManager.getMetrics());
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Mise à jour toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  const recordAccess = (key: string, dataType: string, size?: number) => {
    dynamicTTLManager.recordAccess(key, dataType, size);
  };

  const getOptimalTTL = (key: string, dataType: string) => {
    return dynamicTTLManager.calculateOptimalTTL(key, dataType);
  };

  const getRecommendedTTL = (dataType: string, expectedUsage?: 'low' | 'medium' | 'high') => {
    return dynamicTTLManager.getRecommendedTTL(dataType, expectedUsage);
  };

  return {
    stats,
    metrics,
    recordAccess,
    getOptimalTTL,
    getRecommendedTTL,
    exportData: () => dynamicTTLManager.exportData()
  };
};
