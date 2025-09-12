// 🔥 SERVICE D'INVALIDATION CACHE TEMPS RÉEL
// Date: 2025-01-28
// Objectif: Invalider le cache client en temps réel via WebSocket/SSE

import { AggressiveCacheService, CACHE_KEYS } from './aggressiveCacheService';
import { IntelligentCacheService } from './intelligentCacheService';

export class RealtimeCacheInvalidation {
  private static eventSource: EventSource | null = null;
  private static isConnected = false;
  private static reconnectAttempts = 0;
  private static maxReconnectAttempts = 5;
  private static reconnectDelay = 1000; // 1 seconde

  /**
   * Initialise la connexion temps réel
   */
  static async initialize(): Promise<void> {
    if (this.eventSource) {
      return; // Déjà initialisé
    }

    try {
      // Utiliser Server-Sent Events (SSE) pour la simplicité
      const sseUrl = 'https://grutldacuowplosarucp.supabase.co/functions/v1/cache-invalidation-events';
      
      this.eventSource = new EventSource(sseUrl, {
        withCredentials: false
      });

      this.eventSource.onopen = () => {
        console.log('🔗 Connexion temps réel établie');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleInvalidationEvent(data);
        } catch (error) {
          console.warn('Erreur parsing événement:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.warn('❌ Erreur connexion temps réel:', error);
        this.isConnected = false;
        this.handleReconnection();
      };

    } catch (error) {
      console.error('❌ Erreur initialisation temps réel:', error);
    }
  }

  /**
   * Traite un événement d'invalidation
   */
  private static handleInvalidationEvent(data: any): void {
    const { table, operation, id, criticality, keys } = data;

    console.log('🔥 Invalidation temps réel reçue:', data);

    if (keys && Array.isArray(keys)) {
      // Invalider les clés spécifiques
      keys.forEach((key: string) => {
        this.invalidateKey(key, criticality);
      });
    } else {
      // Générer les clés basées sur la table
      this.invalidateByTable(table, id, criticality);
    }
  }

  /**
   * Invalide une clé spécifique
   */
  private static invalidateKey(key: string, criticality?: string): void {
    try {
      // Invalider dans tous les caches
      AggressiveCacheService.delete(key);
      IntelligentCacheService.delete(key);

      console.log(`🗑️ Clé invalidée temps réel: ${key}`);
    } catch (error) {
      console.warn('Erreur invalidation clé:', key, error);
    }
  }

  /**
   * Invalide par table
   */
  private static invalidateByTable(table: string, id: string, criticality?: string): void {
    let keysToInvalidate: string[] = [];

    switch (table) {
      case 'stores':
        keysToInvalidate = [
          CACHE_KEYS.STOREFRONT(id),
          CACHE_KEYS.STORE_DATA(id),
          CACHE_KEYS.BRANDING(id)
        ];
        break;
      
      case 'products':
        keysToInvalidate = [
          CACHE_KEYS.PRODUCTS(id),
          CACHE_KEYS.STOREFRONT(id) // Car les produits affectent le storefront
        ];
        break;
      
      case 'site_templates':
        keysToInvalidate = [
          CACHE_KEYS.TEMPLATE(id),
          CACHE_KEYS.STOREFRONT(id)
        ];
        break;
      
      case 'categories':
        keysToInvalidate = [
          CACHE_KEYS.PRODUCTS(id),
          CACHE_KEYS.STOREFRONT(id)
        ];
        break;
    }

    keysToInvalidate.forEach(key => {
      this.invalidateKey(key, criticality);
    });
  }

  /**
   * Gère la reconnexion automatique
   */
  private static handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('⚠️ Nombre max de tentatives de reconnexion atteint');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Backoff exponentiel

    console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${delay}ms`);

    setTimeout(() => {
      this.cleanup();
      this.initialize();
    }, delay);
  }

  /**
   * Nettoie la connexion
   */
  static cleanup(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
  }

  /**
   * Vérifie si la connexion est active
   */
  static isActive(): boolean {
    return this.isConnected && this.eventSource?.readyState === EventSource.OPEN;
  }

  /**
   * Force une invalidation (pour les tests)
   */
  static forceInvalidation(table: string, id: string, criticality = 'CRITICAL'): void {
    console.log('🧪 Invalidation forcée:', { table, id, criticality });
    this.invalidateByTable(table, id, criticality);
  }
}
