// 🚀 CACHE MULTI-NIVEAU AGRESSIF
// Date: 2025-01-28
// Objectif: Cache ultra-rapide pour éliminer le skeleton
// Intégré avec monitoring et cache intelligent

import { logger } from '@/utils/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

interface CacheConfig {
  memory: {
    maxSize: number;
    defaultTTL: number;
  };
  localStorage: {
    defaultTTL: number;
    compression: boolean;
  };
  sessionStorage: {
    defaultTTL: number;
  };
}

export class AggressiveCacheService {
  private static memoryCache = new Map<string, CacheEntry<any>>();
  private static config: CacheConfig = {
    memory: {
      maxSize: 100, // 100 entrées max en mémoire
      defaultTTL: 2 * 60 * 1000, // 2 minutes (réduit pour laisser Cloudflare travailler)
    },
    localStorage: {
      defaultTTL: 15 * 60 * 1000, // 15 minutes (réduit pour laisser Cloudflare travailler)
      compression: true,
    },
    sessionStorage: {
      defaultTTL: 5 * 60 * 1000, // 5 minutes (réduit pour laisser Cloudflare travailler)
    },
  };

  /**
   * Récupère une valeur du cache (mémoire → session → localStorage)
   * Avec monitoring intégré
   */
  static async get<T>(key: string): Promise<T | null> {
    // 1. Vérifier le cache mémoire (ultra-rapide)
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValid(memoryEntry)) {
      logger.debug('Cache HIT - Mémoire', { key }, 'aggressiveCacheService');
      return memoryEntry.data;
    }

    // 2. Vérifier le sessionStorage (rapide)
    try {
      const sessionData = sessionStorage.getItem(`cache_${key}`);
      if (sessionData) {
        const entry: CacheEntry<T> = JSON.parse(sessionData);
        if (this.isValid(entry)) {
          // Remettre en cache mémoire
          this.memoryCache.set(key, entry);
          logger.debug('Cache HIT - Session', { key }, 'aggressiveCacheService');
          return entry.data;
        }
      }
    } catch (error) {
      console.warn('Session cache error:', error);
    }

    // 3. Vérifier le localStorage (moyen)
    try {
      const localData = localStorage.getItem(`cache_${key}`);
      if (localData) {
        const entry: CacheEntry<T> = JSON.parse(localData);
        if (this.isValid(entry)) {
          // Remettre en cache mémoire et session
          this.memoryCache.set(key, entry);
          sessionStorage.setItem(`cache_${key}`, localData);
          logger.debug('Cache HIT - LocalStorage', { key }, 'aggressiveCacheService');
          return entry.data;
        }
      }
    } catch (error) {
      console.warn('LocalStorage cache error:', error);
    }

    logger.debug('Cache MISS', { key }, 'aggressiveCacheService');
    
    // Enregistrer le miss pour le monitoring
    try {
      const { CacheMonitoringService } = await import('./cacheMonitoringService');
      CacheMonitoringService.recordMiss(key, 0); // 0ms car pas de données
    } catch (error) {
      // Ignorer si le monitoring n'est pas disponible
    }
    
    return null;
  }

  /**
   * Stocke une valeur dans tous les niveaux de cache
   */
  static set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: ttl || this.config.memory.defaultTTL,
      version: '1.0',
    };

    // 1. Cache mémoire (ultra-rapide)
    this.memoryCache.set(key, entry);
    this.cleanupMemoryCache();

    // 2. SessionStorage (rapide)
    try {
      sessionStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Session cache write error:', error);
    }

    // 3. LocalStorage (persistant)
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('LocalStorage cache write error:', error);
    }

    logger.debug('Cache SET', { key, ttl }, 'aggressiveCacheService');
  }

  /**
   * Vérifie si une entrée de cache est valide
   */
  private static isValid(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Nettoie le cache mémoire si nécessaire
   */
  private static cleanupMemoryCache(): void {
    if (this.memoryCache.size > this.config.memory.maxSize) {
      // Supprimer les entrées les plus anciennes
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toDelete = entries.slice(0, this.memoryCache.size - this.config.memory.maxSize);
      toDelete.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  /**
   * Supprime une clé de tous les caches
   */
  static delete(key: string): void {
    this.memoryCache.delete(key);
    sessionStorage.removeItem(`cache_${key}`);
    localStorage.removeItem(`cache_${key}`);
    logger.debug('Cache DELETE', { key }, 'aggressiveCacheService');
  }

  /**
   * Vide tous les caches
   */
  static clear(): void {
    this.memoryCache.clear();
    
    // Nettoyer sessionStorage
    const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('cache_'));
    sessionKeys.forEach(key => sessionStorage.removeItem(key));
    
    // Nettoyer localStorage
    const localKeys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
    localKeys.forEach(key => localStorage.removeItem(key));
    
    logger.info('Cache CLEARED', undefined, 'aggressiveCacheService');
  }

  /**
   * Préchauffe le cache avec des données
   */
  static prewarm<T>(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
    console.log('🔥 Cache PREWARMED with', entries.length, 'entries');
  }

  /**
   * Récupère les statistiques du cache
   */
  static getStats(): {
    memory: { size: number; maxSize: number };
    session: { size: number };
    localStorage: { size: number };
  } {
    const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('cache_'));
    const localKeys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
    
    return {
      memory: {
        size: this.memoryCache.size,
        maxSize: this.config.memory.maxSize,
      },
      session: {
        size: sessionKeys.length,
      },
      localStorage: {
        size: localKeys.length,
      },
    };
  }
}

// Clés de cache prédéfinies
export const CACHE_KEYS = {
  STOREFRONT: (slug: string) => `storefront:${slug}`,
  STORE_DATA: (slug: string) => `store:${slug}`,
  TEMPLATE: (storeId: string) => `template:${storeId}`,
  PRODUCTS: (storeId: string) => `products:${storeId}`,
  BRANDING: (storeId: string) => `branding:${storeId}`,
} as const;

// Durées de cache agressives
export const CACHE_DURATIONS = {
  STOREFRONT: 10 * 60 * 1000, // 10 minutes
  STORE_DATA: 30 * 60 * 1000, // 30 minutes
  TEMPLATE: 60 * 60 * 1000, // 1 heure
  PRODUCTS: 5 * 60 * 1000, // 5 minutes
  BRANDING: 60 * 60 * 1000, // 1 heure
} as const;
