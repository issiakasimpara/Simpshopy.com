// 🚀 SERVICE OPTIMISÉ POUR LE STOREFRONT
// Date: 2025-01-28
// Objectif: Service optimisé pour récupérer toutes les données d'une boutique avec une seule requête

import { supabase } from '@/integrations/supabase/client';

export interface StorefrontData {
  store: {
    id: string;
    name: string;
    description: string | null;
    domain: string | null;
    logo_url: string | null;
    merchant_id: string;
    slug: string;
    status: string;
    settings: any;
    created_at: string;
    updated_at: string;
    primary_color: string | null;
    contact_email: string | null;
    currency: string;
  };
  template: {
    template_data: any;
    is_published: boolean;
    updated_at: string;
  } | null;
  products: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    images: string[] | null;
    status: string;
    category_id: string | null;
    created_at: string;
    updated_at: string;
    category: {
      name: string | null;
    } | null;
  }>;
  market_settings: {
    id: string;
    store_id: string;
    enabled_countries: string[];
    default_currency: string;
    tax_settings: any;
    created_at: string;
    updated_at: string;
    enabled_currencies: string[];
    currency_format: string;
    decimal_places: number;
    exchange_rates: any;
    auto_currency_detection: boolean;
  } | null;
}

export interface StoreBasicInfo {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  slug: string;
  status: string;
  primary_color: string | null; // CHARACTER VARYING(7)
  currency: string; // CHARACTER VARYING(3)
}

export class OptimizedStorefrontService {
  /**
   * Récupère toutes les données d'une boutique avec une seule requête optimisée
   * @param storeSlug - Le slug de la boutique
   * @returns Promise<StorefrontData | null>
   */
  static async getStorefrontBySlug(storeSlug: string): Promise<StorefrontData | null> {
    try {
      const { data, error } = await supabase.rpc('get_storefront_by_slug', {
        store_slug: storeSlug
      });

      if (error) {
        console.error('Erreur lors de la récupération des données de la boutique:', error);
        return null;
      }

      return data as StorefrontData;
    } catch (error) {
      console.error('Erreur inattendue lors de la récupération des données de la boutique:', error);
      return null;
    }
  }

  /**
   * Vérifie si une boutique existe et est active
   * @param storeSlug - Le slug de la boutique
   * @returns Promise<boolean>
   */
  static async storeExistsBySlug(storeSlug: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('store_exists_by_slug', {
        store_slug: storeSlug
      });

      if (error) {
        console.error('Erreur lors de la vérification de l\'existence de la boutique:', error);
        return false;
      }

      return data as boolean;
    } catch (error) {
      console.error('Erreur inattendue lors de la vérification de l\'existence de la boutique:', error);
      return false;
    }
  }

  /**
   * Récupère uniquement les informations de base d'une boutique
   * @param storeSlug - Le slug de la boutique
   * @returns Promise<StoreBasicInfo | null>
   */
  static async getStoreBasicInfoBySlug(storeSlug: string): Promise<StoreBasicInfo | null> {
    try {
      const { data, error } = await supabase.rpc('get_store_basic_info_by_slug', {
        store_slug: storeSlug
      });

      if (error) {
        console.error('Erreur lors de la récupération des informations de base de la boutique:', error);
        return null;
      }

      return data as StoreBasicInfo;
    } catch (error) {
      console.error('Erreur inattendue lors de la récupération des informations de base de la boutique:', error);
      return null;
    }
  }

  /**
   * Génère un slug unique basé sur le nom de la boutique
   * @param storeName - Le nom de la boutique
   * @param storeId - L'ID de la boutique (optionnel, pour les mises à jour)
   * @returns Promise<string>
   */
  static async generateUniqueSlug(storeName: string, storeId?: string): Promise<string> {
    try {
      // Générer le slug de base
      let baseSlug = storeName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '') // Supprimer les caractères spéciaux
        .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
        .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début/fin

      // S'assurer que le slug n'est pas vide
      if (!baseSlug) {
        baseSlug = 'boutique';
      }

      let finalSlug = baseSlug;
      let counter = 0;

      // Vérifier l'unicité
      while (true) {
        const { data, error } = await supabase
          .from('stores')
          .select('id')
          .eq('slug', finalSlug)
          .eq('status', 'active')
          .neq('id', storeId || '') // Exclure le store actuel si on fait une mise à jour
          .limit(1);

        if (error) {
          console.error('Erreur lors de la vérification de l\'unicité du slug:', error);
          break;
        }

        // Si le slug est unique, on peut l'utiliser
        if (!data || data.length === 0) {
          break;
        }

        // Sinon, ajouter un numéro
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
      }

      return finalSlug;
    } catch (error) {
      console.error('Erreur inattendue lors de la génération du slug:', error);
      return `boutique-${Date.now()}`;
    }
  }

  /**
   * Valide un slug de boutique
   * @param slug - Le slug à valider
   * @returns boolean
   */
  static isValidSlug(slug: string): boolean {
    // Un slug valide doit :
    // - Contenir uniquement des lettres minuscules, des chiffres et des tirets
    // - Commencer et finir par une lettre ou un chiffre
    // - Avoir une longueur entre 1 et 50 caractères
    const slugRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    return slugRegex.test(slug) && slug.length >= 1 && slug.length <= 50;
  }

  /**
   * Nettoie un slug (supprime les caractères invalides)
   * @param slug - Le slug à nettoyer
   * @returns string
   */
  static cleanSlug(slug: string): string {
    return slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul
      .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début/fin
  }
}
