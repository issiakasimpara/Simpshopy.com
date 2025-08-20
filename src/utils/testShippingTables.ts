import { supabase } from '@/integrations/supabase/client';

/**
 * Fonction pour tester si les tables de livraisons existent et fonctionnent
 */
export const testShippingTables = async () => {
  console.log('🧪 Test des tables de livraisons...');

  try {
    // Test 1: Vérifier l'existence des tables en tentant une requête SELECT
    console.log('📋 Test de la table shipping_zones...');
    const { data: zonesData, error: zonesError } = await supabase
      .from('shipping_zones' as any)
      .select('id')
      .limit(1);

    console.log('📋 Test de la table shipping_methods...');
    const { data: methodsData, error: methodsError } = await supabase
      .from('shipping_methods' as any)
      .select('id')
      .limit(1);

    if (zonesError || methodsError) {
      console.error('❌ Erreurs détectées:', { zonesError, methodsError });
      return {
        success: false,
        message: 'Les tables n\'existent pas ou ne sont pas accessibles.',
        errors: { zonesError, methodsError }
      };
    }

    console.log('✅ Tables détectées et accessibles !');
    return {
      success: true,
      message: 'Les tables existent et sont fonctionnelles !',
      data: { zonesCount: zonesData?.length || 0, methodsCount: methodsData?.length || 0 }
    };

  } catch (error) {
    console.error('❌ Erreur lors du test des tables:', error);
    return {
      success: false,
      message: 'Erreur lors du test des tables.',
      error
    };
  }
};

/**
 * Fonction pour créer des données de test pour les livraisons
 */
export const createSampleShippingData = async (storeId: string) => {
  console.log('📦 Création des données de test pour la boutique:', storeId);

  try {
    // Créer une zone de livraison de test
    console.log('🌍 Création d\'une zone de livraison...');
    const { data: zone, error: zoneError } = await supabase
      .from('shipping_zones' as any)
      .insert({
        store_id: storeId,
        name: 'Afrique Francophone',
        description: 'Zone de livraison pour les pays francophones d\'Afrique',
        countries: [
          'Sénégal', 'Mali', 'Burkina Faso', 'Côte d\'Ivoire', 
          'Niger', 'Guinée', 'Bénin', 'Togo', 'Cameroun', 'Tchad'
        ],
        is_active: true
      })
      .select()
      .single();

    if (zoneError) {
      console.error('❌ Erreur création zone:', zoneError);
      throw zoneError;
    }

    console.log('✅ Zone créée:', zone.id);

    // Créer des méthodes de livraison de test
    console.log('🚚 Création des méthodes de livraison...');
    const shippingMethods = [
      {
        store_id: storeId,
        shipping_zone_id: zone.id,
        name: 'Livraison Standard',
        description: 'Livraison standard dans votre pays',
        icon: '📦',
        price: 2500,
        free_shipping_threshold: 50000,
        estimated_days: '3-5 jours ouvrables',
        is_active: true,
        sort_order: 1
      },
      {
        store_id: storeId,
        shipping_zone_id: zone.id,
        name: 'Livraison Express',
        description: 'Livraison rapide en 24-48h',
        icon: '⚡',
        price: 5000,
        free_shipping_threshold: null,
        estimated_days: '1-2 jours ouvrables',
        is_active: true,
        sort_order: 2
      },
      {
        store_id: storeId,
        shipping_zone_id: null, // Méthode globale
        name: 'Retrait en magasin',
        description: 'Récupérez votre commande directement en magasin',
        icon: '🏪',
        price: 0,
        free_shipping_threshold: null,
        estimated_days: 'Immédiat',
        is_active: true,
        sort_order: 3
      }
    ];

    const { data: methods, error: methodsError } = await supabase
      .from('shipping_methods' as any)
      .insert(shippingMethods)
      .select();

    if (methodsError) {
      console.error('❌ Erreur création méthodes:', methodsError);
      throw methodsError;
    }

    console.log('✅ Méthodes créées:', methods.length);

    return {
      success: true,
      message: `Données de test créées avec succès ! Zone: ${zone.name}, Méthodes: ${methods.length}`,
      data: { zone, methods }
    };

  } catch (error) {
    console.error('❌ Erreur lors de la création des données de test:', error);
    return {
      success: false,
      message: 'Erreur lors de la création des données de test.',
      error
    };
  }
};

/**
 * Fonction pour nettoyer les données de test
 */
export const cleanupTestData = async (storeId: string) => {
  console.log('🧹 Nettoyage des données de test pour la boutique:', storeId);

  try {
    // Supprimer les méthodes de livraison
    const { error: methodsError } = await supabase
      .from('shipping_methods' as any)
      .delete()
      .eq('store_id', storeId);

    if (methodsError) throw methodsError;

    // Supprimer les zones de livraison
    const { error: zonesError } = await supabase
      .from('shipping_zones' as any)
      .delete()
      .eq('store_id', storeId);

    if (zonesError) throw zonesError;

    console.log('✅ Données de test supprimées');
    return {
      success: true,
      message: 'Données de test supprimées avec succès !'
    };

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return {
      success: false,
      message: 'Erreur lors du nettoyage des données de test.',
      error
    };
  }
};
