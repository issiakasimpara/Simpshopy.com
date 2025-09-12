// 🧠 SERVICE D'INVALIDATION INTELLIGENTE
// Date: 2025-01-28
// Objectif: Invalider le cache client via polling intelligent

import { AggressiveCacheService, CACHE_KEYS } from './aggressiveCacheService';
import { IntelligentCacheService } from './intelligentCacheService';

interface InvalidationCheck {
  table: string;
  lastModified: string;
  storeId?: string;
}

export class SmartCacheInvalidation {
  private static checkInterval: NodeJS.Timeout | null = null;
  private static isActive = false;
  private static currentStoreSlug: string | null = null;
  private static lastChecks = new Map<string, string>();

  /**
   * Active l'invalidation intelligente pour une boutique
   */
  static startForStore(storeSlug: string): void {
    this.currentStoreSlug = storeSlug;
    
    if (this.isActive) {
      return; // Déjà actif
    }

    this.isActive = true;
    console.log('🧠 Invalidation intelligente activée pour:', storeSlug);

    // Vérifier toutes les 2 secondes
    this.checkInterval = setInterval(() => {
      this.checkForInvalidations();
    }, 2000);

    // Configurer la gestion de la visibilité
    this.setupVisibilityHandling();
  }

  /**
   * Arrête l'invalidation intelligente
   */
  static stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isActive = false;
    this.currentStoreSlug = null;
    console.log('🧠 Invalidation intelligente arrêtée');
  }

  /**
   * Gère la visibilité de l'onglet pour optimiser la batterie
   */
  private static setupVisibilityHandling(): void {
    // Arrêter le polling quand l'onglet n'est pas visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('👁️ Onglet caché - Polling ralenti');
        this.adjustPollingInterval(10000); // 10 secondes
      } else {
        console.log('👁️ Onglet visible - Polling normal');
        this.adjustPollingInterval(2000); // 2 secondes
      }
    });

    // Arrêter le polling quand la page est fermée
    window.addEventListener('beforeunload', () => {
      this.stop();
    });
  }

  /**
   * Ajuste l'intervalle de polling
   */
  private static adjustPollingInterval(interval: number): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = setInterval(() => {
        this.checkForInvalidations();
      }, interval);
    }
  }

  /**
   * Vérifie les changements avec la fonction SQL optimisée
   */
  private static async checkForInvalidations(): Promise<void> {
    if (!this.currentStoreSlug) {
      return;
    }

    try {
      // Appel à la fonction SQL ultra-rapide
      const { data, error } = await supabase.rpc('check_storefront_last_modified', {
        store_slug: this.currentStoreSlug
      });

      if (error) {
        console.warn('Erreur vérification modifications:', error);
        return;
      }

      if (data) {
        const lastModified = data;
        const lastCheck = this.lastChecks.get('storefront');

        if (lastCheck && lastModified > lastCheck) {
          console.log(`🔥 Changement détecté pour ${this.currentStoreSlug}:`, lastModified);
          this.invalidateStorefront();
        }

        this.lastChecks.set('storefront', lastModified);
      }

    } catch (error) {
      console.warn('Erreur vérification modifications:', error);
    }
  }

  /**
   * Invalide le storefront complet
   */
  private static invalidateStorefront(): void {
    if (!this.currentStoreSlug) {
      return;
    }

    console.log(`🗑️ Invalidation complète du storefront: ${this.currentStoreSlug}`);

    // Invalider toutes les clés de cache liées à ce storefront
    const keysToInvalidate = [
      CACHE_KEYS.STOREFRONT(this.currentStoreSlug),
      CACHE_KEYS.STORE_DATA(this.currentStoreSlug),
      CACHE_KEYS.TEMPLATE(this.currentStoreSlug),
      CACHE_KEYS.PRODUCTS(this.currentStoreSlug),
      CACHE_KEYS.BRANDING(this.currentStoreSlug)
    ];

    keysToInvalidate.forEach(key => {
      AggressiveCacheService.delete(key);
      IntelligentCacheService.delete(key);
      console.log(`🗑️ Cache invalidé: ${key}`);
    });

    // Déclencher un refresh des données
    this.triggerDataRefresh();
  }

  /**
   * Déclenche un refresh des données
   */
  private static triggerDataRefresh(): void {
    // Émettre un événement personnalisé pour notifier les composants
    const event = new CustomEvent('cache-invalidated', {
      detail: { storeSlug: this.currentStoreSlug }
    });
    window.dispatchEvent(event);
  }

  /**
   * Vérifie si l'invalidation est active
   */
  static isActiveForStore(storeSlug: string): boolean {
    return this.isActive && this.currentStoreSlug === storeSlug;
  }
}

import { supabase } from '@/integrations/supabase/client';
