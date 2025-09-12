// 🚀 SERVICE DE PRÉCHARGEMENT AGRESSIF
// Date: 2025-01-28
// Objectif: Précharger les données critiques avant même la navigation

import { OptimizedStorefrontService } from './optimizedStorefrontService';
import { AggressiveCacheService, CACHE_KEYS, CACHE_DURATIONS } from './aggressiveCacheService';

export class PreloadService {
  private static preloadQueue = new Set<string>();
  private static isPreloading = false;

  /**
   * Précharge une boutique en arrière-plan
   */
  static async preloadStorefront(storeSlug: string): Promise<void> {
    if (this.preloadQueue.has(storeSlug) || this.isPreloading) {
      return;
    }

    this.preloadQueue.add(storeSlug);
    this.isPreloading = true;

    try {
      console.log('🚀 Préchargement de la boutique:', storeSlug);
      
      // Vérifier si déjà en cache
      const cacheKey = CACHE_KEYS.STOREFRONT(storeSlug);
      const cached = await AggressiveCacheService.get(cacheKey);
      
      if (cached) {
        console.log('⚡ Boutique déjà en cache:', storeSlug);
        return;
      }

      // Précharger en arrière-plan
      const startTime = performance.now();
      const storefrontData = await OptimizedStorefrontService.getStorefrontBySlug(storeSlug);
      const loadTime = performance.now() - startTime;

      if (storefrontData) {
        // Mettre en cache agressif
        AggressiveCacheService.set(cacheKey, storefrontData, CACHE_DURATIONS.STOREFRONT);
        console.log(`✅ Boutique préchargée en ${loadTime.toFixed(0)}ms:`, storeSlug);
      }
    } catch (error) {
      console.warn('⚠️ Erreur préchargement:', storeSlug, error);
    } finally {
      this.preloadQueue.delete(storeSlug);
      this.isPreloading = false;
    }
  }

  /**
   * Précharge plusieurs boutiques populaires
   */
  static async preloadPopularStorefronts(storeSlugs: string[]): Promise<void> {
    console.log('🚀 Préchargement de boutiques populaires:', storeSlugs);
    
    // Précharger en parallèle (max 3 à la fois)
    const chunks = [];
    for (let i = 0; i < storeSlugs.length; i += 3) {
      chunks.push(storeSlugs.slice(i, i + 3));
    }

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(slug => this.preloadStorefront(slug))
      );
      // Petit délai entre les chunks pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Précharge basé sur les liens hover
   */
  static setupHoverPreloading(): void {
    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href*="/"]') as HTMLAnchorElement;
      
      if (link && link.href) {
        const url = new URL(link.href);
        const pathParts = url.pathname.split('/').filter(Boolean);
        
        // Détecter les liens vers des boutiques
        if (pathParts.length === 1 && pathParts[0] !== 'admin' && pathParts[0] !== 'dashboard') {
          const storeSlug = pathParts[0];
          this.preloadStorefront(storeSlug);
        }
      }
    });
  }

  /**
   * Précharge intelligent basé sur l'historique
   */
  static setupSmartPreloading(): void {
    // Récupérer l'historique de navigation
    const navigationHistory = this.getNavigationHistory();
    
    if (navigationHistory.length > 0) {
      // Précharger les boutiques les plus visitées
      const popularStores = navigationHistory
        .slice(0, 5) // Top 5
        .map(entry => entry.storeSlug);
      
      this.preloadPopularStorefronts(popularStores);
    }

    // Précharger au hover
    this.setupHoverPreloading();
  }

  /**
   * Récupère l'historique de navigation
   */
  private static getNavigationHistory(): Array<{storeSlug: string, timestamp: number}> {
    try {
      const history = localStorage.getItem('navigation-history');
      if (history) {
        const parsed = JSON.parse(history);
        return parsed.sort((a: any, b: any) => b.timestamp - a.timestamp);
      }
    } catch (error) {
      console.warn('Erreur lecture historique:', error);
    }
    return [];
  }

  /**
   * Enregistre une visite de boutique
   */
  static recordVisit(storeSlug: string): void {
    try {
      const history = this.getNavigationHistory();
      
      // Ajouter la nouvelle visite
      history.unshift({
        storeSlug,
        timestamp: Date.now()
      });
      
      // Garder seulement les 20 dernières
      const limitedHistory = history.slice(0, 20);
      
      localStorage.setItem('navigation-history', JSON.stringify(limitedHistory));
    } catch (error) {
      console.warn('Erreur enregistrement visite:', error);
    }
  }
}
