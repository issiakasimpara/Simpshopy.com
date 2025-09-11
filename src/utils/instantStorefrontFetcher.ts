// 🚀 RÉCUPÉRATEUR INSTANTANÉ DE STOREFRONT
// Date: 2025-01-28
// Objectif: Récupérer les données de boutique instantanément avant React

import { supabase } from '@/integrations/supabase/client';

export interface InstantStorefrontData {
  store: any;
  template: any;
  products: any[];
  market_settings: any;
}

/**
 * Récupère les données de boutique instantanément
 * Utilisé par le script HTML pour pré-charger les données
 */
export async function fetchStorefrontInstantly(storeSlug: string): Promise<InstantStorefrontData | null> {
  try {
    console.log('🚀 Récupération instantanée pour:', storeSlug);
    
    const { data, error } = await supabase.rpc('get_storefront_by_slug', {
      store_slug: storeSlug
    });

    if (error) {
      console.error('Erreur récupération instantanée:', error);
      return null;
    }

    if (!data) {
      console.warn('Boutique non trouvée:', storeSlug);
      return null;
    }

    console.log('✅ Données instantanées récupérées');
    return data as InstantStorefrontData;
  } catch (error) {
    console.error('Erreur inattendue récupération instantanée:', error);
    return null;
  }
}

/**
 * Stocke les données instantanées dans le localStorage
 */
export function storeInstantData(data: InstantStorefrontData): void {
  try {
    localStorage.setItem('instant-storefront-data', JSON.stringify(data));
    console.log('💾 Données instantanées stockées');
  } catch (error) {
    console.error('Erreur stockage données instantanées:', error);
  }
}

/**
 * Récupère les données instantanées du localStorage
 */
export function getInstantData(): InstantStorefrontData | null {
  try {
    const data = localStorage.getItem('instant-storefront-data');
    if (data) {
      return JSON.parse(data) as InstantStorefrontData;
    }
    return null;
  } catch (error) {
    console.error('Erreur récupération données instantanées:', error);
    return null;
  }
}

/**
 * Nettoie les données instantanées du localStorage
 */
export function clearInstantData(): void {
  try {
    localStorage.removeItem('instant-storefront-data');
    console.log('🧹 Données instantanées nettoyées');
  } catch (error) {
    console.error('Erreur nettoyage données instantanées:', error);
  }
}
