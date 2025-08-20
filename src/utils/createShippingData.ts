import { supabase } from '@/integrations/supabase/client';

/**
 * CRÉER LES MÉTHODES DE LIVRAISON DIRECTEMENT - SOLUTION RADICALE
 */
export const createShippingDataNow = async (storeId: string) => {
  console.log('🔥 CRÉATION RADICALE DES MÉTHODES DE LIVRAISON !');
  
  try {
    // 1. SUPPRIMER TOUTES LES ANCIENNES DONNÉES
    console.log('🗑️ Suppression des anciennes données...');
    
    await supabase.from('shipping_methods').delete().eq('store_id', storeId);
    await supabase.from('shipping_zones').delete().eq('store_id', storeId);
    
    console.log('✅ Anciennes données supprimées');

    // 2. CRÉER LES ZONES DE LIVRAISON
    console.log('🌍 Création des zones...');
    
    const zonesData = [
      {
        store_id: storeId,
        name: 'Afrique de l\'Ouest',
        description: 'Pays francophones d\'Afrique de l\'Ouest',
        countries: ['ML', 'SN', 'BF', 'CI', 'NE', 'TG', 'BJ', 'GN'],
        is_active: true
      },
      {
        store_id: storeId,
        name: 'Afrique Centrale',
        description: 'Pays d\'Afrique Centrale',
        countries: ['CM', 'TD', 'CF', 'GA', 'CG', 'CD'],
        is_active: true
      },
      {
        store_id: storeId,
        name: 'Afrique du Nord',
        description: 'Pays du Maghreb',
        countries: ['DZ', 'MA', 'TN'],
        is_active: true
      }
    ];

    const { data: zones, error: zonesError } = await supabase
      .from('shipping_zones')
      .insert(zonesData)
      .select();

    if (zonesError) {
      console.error('❌ Erreur création zones:', zonesError);
      throw zonesError;
    }

    console.log('✅ Zones créées:', zones.length);

    // 3. CRÉER LES MÉTHODES DE LIVRAISON
    console.log('🚚 Création des méthodes...');
    
    const methodsData = [
      // Méthodes globales (sans zone)
      {
        store_id: storeId,
        name: 'Livraison Standard',
        description: 'Livraison standard dans toute l\'Afrique',
        price: 2500,
        estimated_days: '5-7 jours',
        is_active: true,
        sort_order: 1,
        shipping_zone_id: null // GLOBAL
      },
      {
        store_id: storeId,
        name: 'Livraison Express',
        description: 'Livraison rapide dans toute l\'Afrique',
        price: 5000,
        estimated_days: '2-3 jours',
        is_active: true,
        sort_order: 2,
        shipping_zone_id: null // GLOBAL
      },
      
      // Méthodes spécifiques à l'Afrique de l'Ouest
      {
        store_id: storeId,
        name: 'Livraison Locale Ouest',
        description: 'Livraison économique en Afrique de l\'Ouest',
        price: 1500,
        estimated_days: '3-5 jours',
        is_active: true,
        sort_order: 3,
        shipping_zone_id: zones.find(z => z.name === 'Afrique de l\'Ouest')?.id
      },
      
      // Méthodes spécifiques à l'Afrique Centrale
      {
        store_id: storeId,
        name: 'Livraison Centrale',
        description: 'Livraison en Afrique Centrale',
        price: 3000,
        estimated_days: '4-6 jours',
        is_active: true,
        sort_order: 4,
        shipping_zone_id: zones.find(z => z.name === 'Afrique Centrale')?.id
      },
      
      // Méthodes spécifiques au Maghreb
      {
        store_id: storeId,
        name: 'Livraison Maghreb',
        description: 'Livraison en Afrique du Nord',
        price: 4000,
        estimated_days: '6-8 jours',
        is_active: true,
        sort_order: 5,
        shipping_zone_id: zones.find(z => z.name === 'Afrique du Nord')?.id
      }
    ];

    const { data: methods, error: methodsError } = await supabase
      .from('shipping_methods')
      .insert(methodsData)
      .select();

    if (methodsError) {
      console.error('❌ Erreur création méthodes:', methodsError);
      throw methodsError;
    }

    console.log('✅ Méthodes créées:', methods.length);

    // 4. VÉRIFICATION FINALE
    console.log('🔍 Vérification finale...');
    
    const { data: finalMethods, error: finalError } = await supabase
      .from('shipping_methods')
      .select(`
        *,
        shipping_zones(*)
      `)
      .eq('store_id', storeId)
      .eq('is_active', true);

    if (finalError) {
      console.error('❌ Erreur vérification:', finalError);
      throw finalError;
    }

    console.log('🎉 SUCCÈS TOTAL !');
    console.log('📊 Méthodes disponibles:', finalMethods.length);
    console.log('📋 Détails:', finalMethods);

    return {
      success: true,
      zones: zones.length,
      methods: methods.length,
      data: finalMethods
    };

  } catch (error) {
    console.error('💥 ÉCHEC CRÉATION:', error);
    return {
      success: false,
      error: error
    };
  }
};

/**
 * TESTER LES MÉTHODES POUR UN PAYS SPÉCIFIQUE
 */
export const testShippingForCountry = async (storeId: string, countryCode: string) => {
  console.log(`🧪 Test livraison pour ${countryCode} dans store ${storeId}`);
  
  try {
    // 1. Récupérer toutes les méthodes
    const { data: allMethods, error: methodsError } = await supabase
      .from('shipping_methods')
      .select(`
        *,
        shipping_zones(*)
      `)
      .eq('store_id', storeId)
      .eq('is_active', true);

    if (methodsError) {
      console.error('❌ Erreur récupération:', methodsError);
      return { success: false, error: methodsError };
    }

    console.log('📦 Méthodes totales:', allMethods?.length || 0);

    // 2. Filtrer pour le pays
    const availableMethods = allMethods?.filter(method => {
      // Méthodes globales (sans zone)
      if (!method.shipping_zone_id) {
        console.log(`✅ ${method.name} - GLOBALE`);
        return true;
      }

      // Méthodes avec zone
      const zone = method.shipping_zones;
      if (zone && zone.countries && zone.countries.includes(countryCode)) {
        console.log(`✅ ${method.name} - Zone: ${zone.name}`);
        return true;
      }

      console.log(`❌ ${method.name} - Non disponible`);
      return false;
    }) || [];

    console.log(`🎯 Méthodes pour ${countryCode}:`, availableMethods.length);
    
    return {
      success: true,
      total: allMethods?.length || 0,
      available: availableMethods.length,
      methods: availableMethods
    };

  } catch (error) {
    console.error('💥 Erreur test:', error);
    return { success: false, error };
  }
};

// Exposer globalement pour tests
if (typeof window !== 'undefined') {
  (window as any).createShippingDataNow = createShippingDataNow;
  (window as any).testShippingForCountry = testShippingForCountry;
}
