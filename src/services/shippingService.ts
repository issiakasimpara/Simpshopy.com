import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import type {
  ShippingZone,
  ShippingZoneInsert,
  ShippingZoneUpdate,
  ShippingMethod,
  ShippingMethodInsert,
  ShippingMethodUpdate,
  ShippingCalculation,
  ShippingCalculationRequest,
  ShippingStats
} from '@/types/shipping';

/**
 * Service pour gérer les zones et méthodes de livraison
 */
class ShippingService {
  
  // ==================== ZONES DE LIVRAISON ====================
  
  /**
   * Récupérer toutes les zones de livraison d'une boutique
   */
  async getShippingZones(storeId: string): Promise<ShippingZone[]> {
    try {
      logger.debug('Récupération zones de livraison pour boutique', { storeId }, 'shippingService');

      const { data, error } = await supabase
        .from('shipping_zones' as any)
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('⚠️ Tables shipping pas encore créées ou erreur:', error.message);
        return []; // Retourner un tableau vide au lieu de planter
      }

      logger.debug('Zones récupérées', { count: data?.length || 0, storeId }, 'shippingService');
      return data || [];
    } catch (error) {
      console.warn('⚠️ Erreur service getShippingZones (normal si tables pas créées):', error);
      return []; // Retourner un tableau vide au lieu de planter
    }
  }

  /**
   * Créer une nouvelle zone de livraison
   */
  async createShippingZone(zone: ShippingZoneInsert): Promise<ShippingZone> {
    try {
      logger.info('Création zone de livraison', { name: zone.name, storeId }, 'shippingService');

      const { data, error } = await supabase
        .from('shipping_zones')
        .insert(zone)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur création zone:', error);
        throw error;
      }

      logger.info('Zone créée', { zoneId: data.id, storeId }, 'shippingService');
      return data;
    } catch (error) {
      console.error('❌ Erreur service createShippingZone:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une zone de livraison
   */
  async updateShippingZone(id: string, updates: ShippingZoneUpdate): Promise<ShippingZone> {
    try {
      logger.info('Mise à jour zone', { zoneId: id, storeId }, 'shippingService');

      const { data, error } = await supabase
        .from('shipping_zones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur mise à jour zone:', error);
        throw error;
      }

      logger.info('Zone mise à jour', { zoneId: data.id, storeId }, 'shippingService');
      return data;
    } catch (error) {
      console.error('❌ Erreur service updateShippingZone:', error);
      throw error;
    }
  }

  /**
   * Supprimer une zone de livraison
   */
  async deleteShippingZone(id: string): Promise<void> {
    try {
      logger.info('Suppression zone', { zoneId: id, storeId }, 'shippingService');

      const { error } = await supabase
        .from('shipping_zones')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur suppression zone:', error);
        throw error;
      }

      logger.info('Zone supprimée', { zoneId: id, storeId }, 'shippingService');
    } catch (error) {
      console.error('❌ Erreur service deleteShippingZone:', error);
      throw error;
    }
  }

  // ==================== MÉTHODES DE LIVRAISON ====================

  /**
   * Récupérer toutes les méthodes de livraison d'une boutique
   */
  async getShippingMethods(storeId: string): Promise<ShippingMethod[]> {
    try {
      logger.debug('Récupération méthodes de livraison pour boutique', { storeId }, 'shippingService');

      const { data, error } = await supabase
        .from('shipping_methods' as any)
        .select(`
          *,
          shipping_zone:shipping_zones(*)
        `)
        .eq('store_id', storeId)
        .order('sort_order', { ascending: true });

      if (error) {
        console.warn('⚠️ Tables shipping pas encore créées ou erreur:', error.message);
        return []; // Retourner un tableau vide au lieu de planter
      }

      logger.debug('Méthodes récupérées', { count: data?.length || 0, storeId }, 'shippingService');
      return data || [];
    } catch (error) {
      console.warn('⚠️ Erreur service getShippingMethods (normal si tables pas créées):', error);
      return []; // Retourner un tableau vide au lieu de planter
    }
  }

  /**
   * Récupérer les méthodes de livraison actives pour un pays
   */
  async getActiveShippingMethodsForCountry(storeId: string, country: string): Promise<ShippingMethod[]> {
    try {
      logger.debug('Récupération méthodes actives pour', { storeId, country }, 'shippingService');

      const { data, error } = await supabase
        .from('shipping_methods')
        .select(`
          *,
          shipping_zone:shipping_zones(*)
        `)
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('❌ Erreur récupération méthodes actives:', error);
        throw error;
      }

      // Filtrer par pays si une zone est définie
      const filteredMethods = data?.filter(method => {
        if (!method.shipping_zone) return true; // Méthode globale
        return method.shipping_zone.countries.includes(country);
      }) || [];

      logger.debug('Méthodes filtrées pour', { country, count: filteredMethods.length, storeId }, 'shippingService');
      return filteredMethods;
    } catch (error) {
      console.error('❌ Erreur service getActiveShippingMethodsForCountry:', error);
      throw error;
    }
  }

  /**
   * Créer une nouvelle méthode de livraison
   */
  async createShippingMethod(method: ShippingMethodInsert): Promise<ShippingMethod> {
    try {
      logger.info('Création méthode de livraison', { name: method.name, storeId }, 'shippingService');

      const { data, error } = await supabase
        .from('shipping_methods')
        .insert(method)
        .select(`
          *,
          shipping_zone:shipping_zones(*)
        `)
        .single();

      if (error) {
        console.error('❌ Erreur création méthode:', error);
        throw error;
      }

      logger.info('Méthode créée', { methodId: data.id, storeId }, 'shippingService');
      return data;
    } catch (error) {
      console.error('❌ Erreur service createShippingMethod:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une méthode de livraison
   */
  async updateShippingMethod(id: string, updates: ShippingMethodUpdate): Promise<ShippingMethod> {
    try {
      logger.info('Mise à jour méthode', { methodId: id, storeId }, 'shippingService');

      const { data, error } = await supabase
        .from('shipping_methods')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          shipping_zone:shipping_zones(*)
        `)
        .single();

      if (error) {
        console.error('❌ Erreur mise à jour méthode:', error);
        throw error;
      }

      logger.info('Méthode mise à jour', { methodId: data.id, storeId }, 'shippingService');
      return data;
    } catch (error) {
      console.error('❌ Erreur service updateShippingMethod:', error);
      throw error;
    }
  }

  /**
   * Supprimer une méthode de livraison
   */
  async deleteShippingMethod(id: string): Promise<void> {
    try {
      logger.info('Suppression méthode', { methodId: id, storeId }, 'shippingService');

      const { error } = await supabase
        .from('shipping_methods')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur suppression méthode:', error);
        throw error;
      }

      logger.info('Méthode supprimée', { methodId: id, storeId }, 'shippingService');
    } catch (error) {
      console.error('❌ Erreur service deleteShippingMethod:', error);
      throw error;
    }
  }

  // ==================== CALCULS DE LIVRAISON ====================

  /**
   * Calculer les frais de livraison pour une commande
   */
  async calculateShipping(request: ShippingCalculationRequest): Promise<ShippingCalculation[]> {
    try {
      logger.debug('Calcul frais de livraison', { storeId: request.storeId, country: request.country, weight: request.weight }, 'shippingService');

      const methods = await this.getActiveShippingMethodsForCountry(request.storeId, request.country);
      
      const calculations: ShippingCalculation[] = methods.map(method => {
        let calculatedPrice = method.price;
        let isFree = false;
        let reason = '';

        // Vérifier si livraison gratuite selon le seuil
        if (method.free_shipping_threshold && request.totalAmount >= method.free_shipping_threshold) {
          calculatedPrice = 0;
          isFree = true;
          reason = `Livraison gratuite à partir de ${method.free_shipping_threshold} CFA`;
        }

        // Livraison gratuite si prix = 0
        if (method.price === 0) {
          isFree = true;
          reason = 'Livraison gratuite';
        }

        return {
          method,
          originalPrice: method.price,
          calculatedPrice,
          isFree,
          reason
        };
      });

      logger.debug('Calculs terminés', { count: calculations.length, storeId: request.storeId }, 'shippingService');
      return calculations;
    } catch (error) {
      console.error('❌ Erreur service calculateShipping:', error);
      throw error;
    }
  }

  // ==================== STATISTIQUES ====================

  /**
   * Récupérer les statistiques de livraison d'une boutique
   */
  async getShippingStats(storeId: string): Promise<ShippingStats> {
    try {
      logger.debug('Récupération statistiques livraison', { storeId }, 'shippingService');

      // Compter les méthodes et zones
      const [methodsResult, zonesResult] = await Promise.all([
        supabase
          .from('shipping_methods')
          .select('id, is_active, price')
          .eq('store_id', storeId),
        supabase
          .from('shipping_zones')
          .select('id, is_active')
          .eq('store_id', storeId)
      ]);

      if (methodsResult.error) throw methodsResult.error;
      if (zonesResult.error) throw zonesResult.error;

      const methods = methodsResult.data || [];
      const zones = zonesResult.data || [];

      const stats: ShippingStats = {
        totalMethods: methods.length,
        activeMethods: methods.filter(m => m.is_active).length,
        totalZones: zones.length,
        activeZones: zones.filter(z => z.is_active).length,
        averageShippingCost: methods.length > 0 
          ? methods.reduce((sum, m) => sum + (m.price || 0), 0) / methods.length 
          : 0,
        freeShippingOrders: 0, // À calculer depuis les commandes
        totalShippingRevenue: 0 // À calculer depuis les commandes
      };

      logger.debug('Statistiques calculées', { storeId, totalOrders: stats.totalOrders, totalRevenue: stats.totalRevenue }, 'shippingService');
      return stats;
    } catch (error) {
      console.error('❌ Erreur service getShippingStats:', error);
      throw error;
    }
  }
}

// Instance singleton du service
export const shippingService = new ShippingService();
export default shippingService;
