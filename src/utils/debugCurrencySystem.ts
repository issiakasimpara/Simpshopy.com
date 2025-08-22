import { supabase } from '@/integrations/supabase/client';
import { StoreCurrencyService } from '@/services/storeCurrencyService';

/**
 * Script de debug pour tester le système de devise
 */
export async function debugCurrencySystem() {
  console.log('🔍 DEBUG: Test du système de devise...');
  console.log('=====================================');

  try {
    // 1. Vérifier l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ Erreur utilisateur:', userError);
      return;
    }

    console.log('✅ Utilisateur connecté:', user.email);

    // 2. Vérifier le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.log('❌ Erreur profil:', profileError);
      return;
    }

    console.log('✅ Profil trouvé:', profile.id);

    // 3. Vérifier le store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, name')
      .eq('merchant_id', profile.id)
      .single();

    if (storeError) {
      console.log('❌ Erreur store:', storeError);
      return;
    }

    console.log('✅ Store trouvé:', store.id, store.name);

    // 4. Vérifier la table market_settings
    const { data: marketSettings, error: marketError } = await supabase
      .from('market_settings')
      .select('*')
      .eq('store_id', store.id)
      .single();

    if (marketError) {
      console.log('❌ Erreur market_settings:', marketError);
      console.log('💡 La table market_settings n\'existe peut-être pas');
      return;
    }

    console.log('✅ Market settings trouvés:', marketSettings);

    // 5. Tester le service
    console.log('\n🧪 Test du service StoreCurrencyService...');
    
    const currentCurrency = await StoreCurrencyService.getStoreCurrency(store.id);
    console.log('✅ Devise actuelle (service):', currentCurrency);

    const settings = await StoreCurrencyService.getStoreCurrencySettings(store.id);
    console.log('✅ Paramètres (service):', settings);

    // 6. Tester un changement de devise
    console.log('\n🔄 Test de changement de devise...');
    
    const testCurrency = currentCurrency === 'XOF' ? 'EUR' : 'XOF';
    console.log('🔄 Changement vers:', testCurrency);
    
    const updateSuccess = await StoreCurrencyService.updateStoreCurrency(store.id, testCurrency);
    console.log('✅ Mise à jour réussie:', updateSuccess);

    // 7. Vérifier le changement
    const newCurrency = await StoreCurrencyService.getStoreCurrency(store.id);
    console.log('✅ Nouvelle devise:', newCurrency);

    // 8. Remettre la devise originale
    console.log('\n🔄 Retour à la devise originale...');
    await StoreCurrencyService.updateStoreCurrency(store.id, currentCurrency);
    console.log('✅ Retour à:', currentCurrency);

    console.log('\n🎉 Test terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

/**
 * Fonction pour exécuter le debug depuis la console
 */
export function runCurrencyDebug() {
  console.log('🚀 Lancement du debug du système de devise...');
  debugCurrencySystem().then(() => {
    console.log('✅ Debug terminé');
  });
}
