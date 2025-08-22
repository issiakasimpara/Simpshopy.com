import { supabase } from '@/integrations/supabase/client';
import { createSimpleShippingMethods, getShippingMethodsForCountry } from './simpleShipping';

/**
 * TESTER LE SYSTÈME SIMPLE IMMÉDIATEMENT
 */
export const testShippingNow = async () => {
  console.log('🧪 TEST IMMÉDIAT DU SYSTÈME DE LIVRAISON');

  try {
    // 1. Trouver une boutique existante
    console.log('🔍 Recherche d\'une boutique...');
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, name')
      .limit(1);

    if (storesError || !stores || stores.length === 0) {
      console.error('❌ Aucune boutique trouvée:', storesError);
      return { success: false, message: 'Aucune boutique trouvée' };
    }

    const testStore = stores[0];
    console.log('🏪 Boutique de test:', testStore.name, `(${testStore.id})`);

    // 2. Créer les méthodes de livraison
    console.log('🚀 Création des méthodes...');
    const createResult = await createSimpleShippingMethods(testStore.id);
    
    if (!createResult.success) {
      console.error('❌ Échec création:', createResult.error);
      return createResult;
    }

    console.log('✅ Méthodes créées:', createResult.methods);

    // 3. Tester pour le Mali
    console.log('🇲🇱 Test pour le Mali...');
    const maliResult = await getShippingMethodsForCountry(testStore.id, 'ML');
    
    if (!maliResult.success) {
      console.error('❌ Échec test Mali:', maliResult.error);
      return maliResult;
    }

    console.log('✅ Méthodes Mali:', maliResult.methods.length);

    // 4. Tester pour le Sénégal
    console.log('🇸🇳 Test pour le Sénégal...');
    const senegalResult = await getShippingMethodsForCountry(testStore.id, 'SN');
    
    if (!senegalResult.success) {
      console.error('❌ Échec test Sénégal:', senegalResult.error);
      return senegalResult;
    }

    console.log('✅ Méthodes Sénégal:', senegalResult.methods.length);

    // 5. Résultat final
    console.log('🎉 TEST RÉUSSI !');
    return {
      success: true,
      storeId: testStore.id,
      storeName: testStore.name,
      methodsCreated: createResult.methods,
      maliMethods: maliResult.methods.length,
      senegalMethods: senegalResult.methods.length,
      details: {
        mali: maliResult.methods,
        senegal: senegalResult.methods
      }
    };

  } catch (error) {
    console.error('💥 ERREUR TEST:', error);
    return {
      success: false,
      error: error
    };
  }
};

/**
 * Vérifier la structure de la table shipping_methods
 */
export const checkTableStructure = async () => {
  console.log('🔍 Vérification structure table shipping_methods...');

  try {
    // Essayer d'insérer une méthode de test
    const testMethod = {
      store_id: '00000000-0000-0000-0000-000000000000', // UUID fictif
      name: 'Test Method',
      description: 'Test',
      price: 1000,
      estimated_days: '1-2 jours',
      is_active: true,
      available_countries: ['ML']
    };

    const { error } = await supabase
      .from('shipping_methods')
      .insert(testMethod)
      .select();

    if (error) {
      console.log('📋 Structure détectée via erreur:', error.message);
      
      // Analyser l'erreur pour comprendre la structure
      if (error.message.includes('available_countries')) {
        console.log('✅ Colonne available_countries: EXISTE');
      } else {
        console.log('❌ Colonne available_countries: MANQUANTE');
      }

      if (error.message.includes('shipping_zone_id')) {
        console.log('✅ Colonne shipping_zone_id: EXISTE');
      }

      return {
        success: false,
        error: error.message,
        hasAvailableCountries: error.message.includes('available_countries'),
        hasShippingZoneId: error.message.includes('shipping_zone_id')
      };
    }

    // Si pas d'erreur, supprimer la méthode de test
    await supabase
      .from('shipping_methods')
      .delete()
      .eq('store_id', '00000000-0000-0000-0000-000000000000');

    console.log('✅ Structure table OK !');
    return {
      success: true,
      message: 'Table structure compatible'
    };

  } catch (error) {
    console.error('💥 Erreur vérification:', error);
    return {
      success: false,
      error: error
    };
  }
};

// Exposer globalement
if (typeof window !== 'undefined') {
  (window as any).testShippingNow = testShippingNow;
  (window as any).checkTableStructure = checkTableStructure;
}
