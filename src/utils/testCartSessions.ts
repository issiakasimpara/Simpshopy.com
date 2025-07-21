import { supabase } from '@/integrations/supabase/client';

/**
 * Tester la table cart_sessions
 */
export const testCartSessions = async () => {
  console.log('🛒 Test de la table cart_sessions...');

  try {
    // Test 1: Vérifier l'existence de la table
    console.log('📋 Test existence table cart_sessions...');
    const { data: testData, error: testError } = await supabase
      .from('cart_sessions')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Erreur table cart_sessions:', testError);
      return {
        success: false,
        message: 'Table cart_sessions non accessible',
        error: testError
      };
    }

    console.log('✅ Table cart_sessions accessible');

    // Test 2: Créer une session de test
    console.log('🧪 Test création session...');
    const testSessionId = `test_${Date.now()}`;
    const testStoreId = 'test-store-id';
    
    const { data: insertData, error: insertError } = await supabase
      .from('cart_sessions')
      .insert({
        session_id: testSessionId,
        store_id: testStoreId,
        items: [
          {
            id: 'test-item',
            name: 'Test Product',
            price: 1000,
            quantity: 1,
            product_id: 'test-product-id'
          }
        ],
        customer_info: { test: true }
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erreur insertion:', insertError);
      return {
        success: false,
        message: 'Impossible de créer une session de test',
        error: insertError
      };
    }

    console.log('✅ Session créée:', insertData.id);

    // Test 3: Récupérer la session
    console.log('🔍 Test récupération session...');
    const { data: selectData, error: selectError } = await supabase
      .from('cart_sessions')
      .select('*')
      .eq('session_id', testSessionId)
      .eq('store_id', testStoreId)
      .single();

    if (selectError) {
      console.error('❌ Erreur récupération:', selectError);
      return {
        success: false,
        message: 'Impossible de récupérer la session',
        error: selectError
      };
    }

    console.log('✅ Session récupérée:', selectData);

    // Test 4: Nettoyer (supprimer la session de test)
    console.log('🧹 Nettoyage session de test...');
    const { error: deleteError } = await supabase
      .from('cart_sessions')
      .delete()
      .eq('id', insertData.id);

    if (deleteError) {
      console.warn('⚠️ Erreur nettoyage:', deleteError);
    } else {
      console.log('✅ Session de test supprimée');
    }

    return {
      success: true,
      message: 'Table cart_sessions fonctionne parfaitement !',
      data: {
        tableExists: true,
        canInsert: true,
        canSelect: true,
        canDelete: !deleteError
      }
    };

  } catch (error) {
    console.error('❌ Erreur générale test cart_sessions:', error);
    return {
      success: false,
      message: 'Erreur lors du test de cart_sessions',
      error
    };
  }
};

/**
 * Vérifier rapidement si cart_sessions est accessible
 */
export const checkCartSessionsTable = async () => {
  try {
    const { error } = await supabase
      .from('cart_sessions')
      .select('id')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('❌ Table cart_sessions non accessible:', error);
    return false;
  }
};

// Exposer les fonctions globalement pour les tests
if (typeof window !== 'undefined') {
  (window as any).testCartSessions = testCartSessions;
  (window as any).checkCartSessionsTable = checkCartSessionsTable;
}
