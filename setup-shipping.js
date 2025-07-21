/**
 * Script pour configurer les tables de livraisons via Supabase CLI
 * Exécute les migrations et insère des données de test
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Configuration des tables de livraisons...');

try {
  // 1. Vérifier si Supabase CLI est installé
  console.log('📋 Vérification de Supabase CLI...');
  try {
    execSync('supabase --version', { stdio: 'pipe' });
    console.log('✅ Supabase CLI détecté');
  } catch (error) {
    console.log('❌ Supabase CLI non trouvé');
    console.log('💡 Installez-le avec: npm install -g supabase');
    process.exit(1);
  }

  // 2. Vérifier le statut du projet
  console.log('📋 Vérification du statut du projet...');
  try {
    const status = execSync('supabase status', { encoding: 'utf8' });
    console.log('✅ Projet Supabase configuré');
    console.log(status);
  } catch (error) {
    console.log('⚠️ Projet pas encore démarré, tentative de démarrage...');
    try {
      execSync('supabase start', { stdio: 'inherit' });
      console.log('✅ Projet Supabase démarré');
    } catch (startError) {
      console.log('❌ Impossible de démarrer le projet Supabase');
      console.log('💡 Essayez: supabase login puis supabase start');
      process.exit(1);
    }
  }

  // 3. Appliquer les migrations
  console.log('📋 Application des migrations...');
  try {
    execSync('supabase db push', { stdio: 'inherit' });
    console.log('✅ Migrations appliquées avec succès');
  } catch (error) {
    console.log('⚠️ Erreur lors de l\'application des migrations');
    console.log('💡 Vérifiez votre connexion et réessayez');
  }

  // 4. Afficher les instructions pour les données de test
  console.log('\n🎯 Configuration terminée !');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Allez sur http://localhost:8080/shipping');
  console.log('2. Cliquez sur l\'onglet "Initialisation"');
  console.log('3. Cliquez sur "Tester les tables"');
  console.log('4. Si tout fonctionne, cliquez sur "Créer données test"');
  console.log('\n✅ Les tables de livraisons sont maintenant configurées !');

} catch (error) {
  console.error('❌ Erreur lors de la configuration:', error.message);
  console.log('\n💡 Solutions alternatives :');
  console.log('1. Utilisez l\'interface web de Supabase');
  console.log('2. Importez les fichiers CSV manuellement');
  console.log('3. Exécutez le SQL dans l\'éditeur Supabase');
}
