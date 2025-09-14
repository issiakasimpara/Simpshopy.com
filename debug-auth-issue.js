/**
 * 🔍 Script de diagnostic pour les problèmes d'authentification
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (utilise les variables d'environnement)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseAuthIssue() {
  console.log('🔍 Diagnostic des problèmes d\'authentification...');
  
  try {
    // 1. Tester la connexion Supabase
    console.log('\n1. Test de connexion Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur de connexion Supabase:', testError);
      return;
    }
    console.log('✅ Connexion Supabase OK');
    
    // 2. Tester la récupération des profils
    console.log('\n2. Test de récupération des profils...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Erreur récupération profils:', profilesError);
    } else {
      console.log('✅ Profils récupérés:', profiles?.length || 0);
    }
    
    // 3. Tester la récupération des boutiques
    console.log('\n3. Test de récupération des boutiques...');
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .limit(5);
    
    if (storesError) {
      console.error('❌ Erreur récupération boutiques:', storesError);
    } else {
      console.log('✅ Boutiques récupérées:', stores?.length || 0);
    }
    
    // 4. Tester la création d'un profil (simulation)
    console.log('\n4. Test de création de profil...');
    const testUserId = 'test-user-' + Date.now();
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        user_id: testUserId,
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com'
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Erreur création profil:', createError);
    } else {
      console.log('✅ Profil créé:', newProfile.id);
      
      // Nettoyer le profil de test
      await supabase
        .from('profiles')
        .delete()
        .eq('id', newProfile.id);
      console.log('🧹 Profil de test supprimé');
    }
    
    console.log('\n✅ Diagnostic terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

// Exécuter le diagnostic
diagnoseAuthIssue();
