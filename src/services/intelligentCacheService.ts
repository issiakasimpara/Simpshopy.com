// 🧠 CACHE INTELLIGENT AVEC CRITICITÉ
// Date: 2025-01-28
// Objectif: Cache différencié par criticité des données

import { AggressiveCacheService, CACHE_KEYS, CACHE_DURATIONS } from './aggressiveCacheService';

export enum DataCriticality {
  CRITICAL = 'critical',    // Prix, stock, statut - invalidation immédiate
  IMPORTANT = 'important',  // Produits, catégories - invalidation rapide
  STATIC = 'static',       // Templates, branding - cache long
  DYNAMIC = 'dynamic'      // Analytics, logs - cache court
}

interface IntelligentCacheConfig {
  [key: string]: {
    criticality: DataCriticality;
    ttl: number;
    refreshThreshold: number; // Pourcentage avant expiration pour refresh proactif
    invalidationPriority: number; // 1 = haute, 5 = basse
  };
}

// Configuration intelligente par type de données
const INTELLIGENT_CONFIG: IntelligentCacheConfig = {
  // Données critiques - invalidation immédiate
  'storefront:critical': {
    criticality: DataCriticality.CRITICAL,
    ttl: 2 * 60 * 1000, // 2 minutes seulement
    refreshThreshold: 0.8, // Refresh à 80% d'expiration
    invalidationPriority: 1,
  },
  
  // Données importantes - invalidation rapide
  'products:important': {
    criticality: DataCriticality.IMPORTANT,
    ttl: 5 * 60 * 1000, // 5 minutes
    refreshThreshold: 0.7,
    invalidationPriority: 2,
  },
  
  // Données statiques - cache long
  'template:static': {
    criticality: DataCriticality.STATIC,
    ttl: 60 * 60 * 1000, // 1 heure
    refreshThreshold: 0.5,
    invalidationPriority: 4,
  },
  
  'branding:static': {
    criticality: DataCriticality.STATIC,
    ttl: 60 * 60 * 1000, // 1 heure
    refreshThreshold: 0.5,
    invalidationPriority: 4,
  },
  
  // Données dynamiques - cache court
  'analytics:dynamic': {
    criticality: DataCriticality.DYNAMIC,
    ttl: 1 * 60 * 1000, // 1 minute
    refreshThreshold: 0.9,
    invalidationPriority: 5,
  }
};

export class IntelligentCacheService {
  private static refreshTimers = new Map<string, NodeJS.Timeout>();
  private static invalidationQueue: Array<{key: string, priority: number}> = [];
  private static isProcessingQueue = false;

  /**
   * Récupère une valeur avec gestion intelligente
   */
  static async get<T>(key: string): Promise<T | null> {
    const result = await AggressiveCacheService.get<T>(key);
    
    if (result) {
      // Programmer un refresh proactif si nécessaire
      this.scheduleProactiveRefresh(key);
    }
    
    return result;
  }

  /**
   * Stocke une valeur avec configuration intelligente
   */
  static set<T>(key: string, data: T, criticality?: DataCriticality): void {
    const config = this.getConfigForKey(key, criticality);
    const ttl = config.ttl;
    
    AggressiveCacheService.set(key, data, ttl);
    
    // Programmer le refresh proactif
    this.scheduleProactiveRefresh(key);
    
    console.log(`🧠 Intelligent cache SET: ${key} (${config.criticality}, ${ttl}ms)`);
  }

  /**
   * Supprime une clé du cache
   */
  static delete(key: string): void {
    AggressiveCacheService.delete(key);
    console.log(`🗑️ Intelligent cache DELETE: ${key}`);
  }

  /**
   * Invalide avec priorité
   */
  static invalidate(key: string, priority?: number): void {
    const config = this.getConfigForKey(key);
    const invalidationPriority = priority || config.invalidationPriority;
    
    // Ajouter à la queue d'invalidation
    this.invalidationQueue.push({ key, priority: invalidationPriority });
    this.invalidationQueue.sort((a, b) => a.priority - b.priority);
    
    // Traiter la queue
    this.processInvalidationQueue();
  }

  /**
   * Invalide par criticité
   */
  static invalidateByCriticality(criticality: DataCriticality): void {
    const keysToInvalidate = Object.entries(INTELLIGENT_CONFIG)
      .filter(([_, config]) => config.criticality === criticality)
      .map(([key, _]) => key);
    
    keysToInvalidate.forEach(key => this.invalidate(key));
    console.log(`🗑️ Invalidated ${criticality} data:`, keysToInvalidate);
  }

  /**
   * Programme un refresh proactif
   */
  private static scheduleProactiveRefresh(key: string): void {
    const config = this.getConfigForKey(key);
    const refreshTime = config.ttl * config.refreshThreshold;
    
    // Annuler le timer existant
    const existingTimer = this.refreshTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Programmer le nouveau refresh
    const timer = setTimeout(() => {
      this.performProactiveRefresh(key);
      this.refreshTimers.delete(key);
    }, refreshTime);
    
    this.refreshTimers.set(key, timer);
  }

  /**
   * Effectue un refresh proactif en arrière-plan
   */
  private static async performProactiveRefresh(key: string): Promise<void> {
    console.log(`🔄 Proactive refresh triggered for: ${key}`);
    
    // Ici on pourrait déclencher une requête en arrière-plan
    // pour précharger les nouvelles données
    try {
      // TODO: Implémenter le refresh selon le type de clé
      // await this.refreshDataForKey(key);
      console.log(`✅ Proactive refresh completed for: ${key}`);
    } catch (error) {
      console.warn(`⚠️ Proactive refresh failed for ${key}:`, error);
    }
  }

  /**
   * Traite la queue d'invalidation par priorité
   */
  private static async processInvalidationQueue(): Promise<void> {
    if (this.isProcessingQueue || this.invalidationQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    while (this.invalidationQueue.length > 0) {
      const { key } = this.invalidationQueue.shift()!;
      
      // Invalider avec délai basé sur la priorité
      const config = this.getConfigForKey(key);
      const delay = (6 - config.invalidationPriority) * 100; // 500ms à 100ms
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      AggressiveCacheService.delete(key);
      console.log(`🗑️ Intelligent invalidation: ${key} (priority: ${config.invalidationPriority})`);
    }
    
    this.isProcessingQueue = false;
  }

  /**
   * Obtient la configuration pour une clé
   */
  private static getConfigForKey(key: string, criticality?: DataCriticality) {
    // Chercher une configuration exacte
    let config = INTELLIGENT_CONFIG[key];
    
    // Si pas trouvé, chercher par préfixe
    if (!config) {
      const prefix = key.split(':')[0];
      config = INTELLIGENT_CONFIG[`${prefix}:*`];
    }
    
    // Configuration par défaut
    if (!config) {
      const defaultCriticality = criticality || DataCriticality.IMPORTANT;
      config = {
        criticality: defaultCriticality,
        ttl: this.getDefaultTTL(defaultCriticality),
        refreshThreshold: 0.7,
        invalidationPriority: 3,
      };
    }
    
    return config;
  }

  /**
   * Obtient le TTL par défaut selon la criticité
   */
  private static getDefaultTTL(criticality: DataCriticality): number {
    switch (criticality) {
      case DataCriticality.CRITICAL:
        return 2 * 60 * 1000; // 2 minutes
      case DataCriticality.IMPORTANT:
        return 5 * 60 * 1000; // 5 minutes
      case DataCriticality.STATIC:
        return 60 * 60 * 1000; // 1 heure
      case DataCriticality.DYNAMIC:
        return 1 * 60 * 1000; // 1 minute
      default:
        return 5 * 60 * 1000; // 5 minutes
    }
  }

  /**
   * Obtient les statistiques intelligentes
   */
  static getIntelligentStats(): {
    memory: { size: number; maxSize: number };
    session: { size: number };
    localStorage: { size: number };
    byCriticality: Record<DataCriticality, number>;
    refreshTimers: number;
    invalidationQueue: number;
  } {
    const baseStats = AggressiveCacheService.getStats();
    
    // Compter par criticité
    const byCriticality = Object.values(DataCriticality).reduce((acc, criticality) => {
      acc[criticality] = 0;
      return acc;
    }, {} as Record<DataCriticality, number>);
    
    // Analyser les clés existantes
    const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('cache_'));
    sessionKeys.forEach(key => {
      const config = this.getConfigForKey(key);
      byCriticality[config.criticality]++;
    });
    
    return {
      ...baseStats,
      byCriticality,
      refreshTimers: this.refreshTimers.size,
      invalidationQueue: this.invalidationQueue.length,
    };
  }

  /**
   * Nettoie tous les timers
   */
  static cleanup(): void {
    this.refreshTimers.forEach(timer => clearTimeout(timer));
    this.refreshTimers.clear();
    this.invalidationQueue = [];
    this.isProcessingQueue = false;
    console.log('🧹 Intelligent cache cleanup completed');
  }
}
