import { supabase } from '@/integrations/supabase/client';
import { StoreCurrencyService } from '@/services/storeCurrencyService';

/**
 * Test et force la mise à jour de la devise dans toute l'application
 */
export async function testCurrencyUpdate() {
  console.log('🔄 TEST: Mise à jour forcée de la devise...');
  console.log('==========================================');

  try {
    // 1. Récupérer l'utilisateur et le store
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ Erreur utilisateur:', userError);
      return;
    }

    console.log('✅ Utilisateur:', user.email);

    // 2. Récupérer le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.log('❌ Erreur profil:', profileError);
      return;
    }

    console.log('✅ Profil:', profile.id);

    // 3. Récupérer le store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, name')
      .eq('merchant_id', profile.id)
      .single();

    if (storeError) {
      console.log('❌ Erreur store:', storeError);
      return;
    }

    console.log('✅ Store:', store.id, store.name);

    // 4. Récupérer la devise actuelle
    const currentCurrency = await StoreCurrencyService.getStoreCurrency(store.id);
    console.log('💰 Devise actuelle:', currentCurrency);

    // 5. Changer la devise (alterner entre XOF et EUR)
    const newCurrency = currentCurrency === 'XOF' ? 'EUR' : 'XOF';
    console.log('🔄 Changement vers:', newCurrency);

    const updateSuccess = await StoreCurrencyService.updateStoreCurrency(store.id, newCurrency);
    console.log('✅ Mise à jour réussie:', updateSuccess);

    // 6. Vérifier le changement
    const updatedCurrency = await StoreCurrencyService.getStoreCurrency(store.id);
    console.log('✅ Nouvelle devise:', updatedCurrency);

    // 7. Forcer le rafraîchissement de la page
    console.log('🔄 Forcer le rafraîchissement...');
    
    // Attendre un peu puis rafraîchir
    setTimeout(() => {
      window.location.reload();
    }, 2000);

    console.log('🎉 Test terminé ! La page va se rafraîchir dans 2 secondes...');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

/**
 * Fonction pour exécuter le test depuis la console
 */
export function runCurrencyUpdateTest() {
  console.log('🚀 Lancement du test de mise à jour de devise...');
  testCurrencyUpdate().then(() => {
    console.log('✅ Test lancé');
  });
}
