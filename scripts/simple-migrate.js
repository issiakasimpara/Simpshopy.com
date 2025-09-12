#!/usr/bin/env node

/**
 * 🚀 SCRIPT DE MIGRATION SIMPLE VERS R2
 * Migre les assets de Simpshopy vers Cloudflare R2
 */

const fs = require('fs');
const path = require('path');

class SimpleMigrator {
  constructor() {
    this.uploadedFiles = [];
    this.errors = [];
  }

  /**
   * Migre tous les assets vers R2
   */
  async migrateAllAssets() {
    console.log('🚀 DÉBUT DE LA MIGRATION VERS R2');
    console.log('=====================================');
    
    try {
      // 1. Analyser les fichiers du dossier public
      await this.analyzePublicFiles();
      
      // 2. Générer les instructions de migration
      await this.generateMigrationInstructions();
      
      console.log('✅ ANALYSE TERMINÉE !');
      console.log(`📊 ${this.uploadedFiles.length} fichiers à migrer`);
      
      if (this.errors.length > 0) {
        console.log(`⚠️ ${this.errors.length} erreurs:`);
        this.errors.forEach(error => console.log(`  - ${error}`));
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error);
    }
  }

  /**
   * Analyse les fichiers du dossier public
   */
  async analyzePublicFiles() {
    console.log('📁 Analyse des fichiers du dossier public...');
    
    const publicDir = path.join(process.cwd(), 'public');
    
    if (!fs.existsSync(publicDir)) {
      console.log('⚠️ Dossier public non trouvé');
      return;
    }

    const files = fs.readdirSync(publicDir);
    
    for (const file of files) {
      const filePath = path.join(publicDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile()) {
        const fileInfo = {
          name: file,
          path: filePath,
          size: stat.size,
          destination: this.getDestinationFolder(file),
          priority: this.getPriority(file)
        };
        
        this.uploadedFiles.push(fileInfo);
        console.log(`  ✅ ${file} → ${fileInfo.destination} (${this.formatSize(fileInfo.size)})`);
      }
    }
  }

  /**
   * Détermine le dossier de destination
   */
  getDestinationFolder(fileName) {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('favicon') || lowerName.includes('robots') || lowerName.includes('sitemap')) {
      return 'static/system/';
    }
    
    if (lowerName.includes('pay') || lowerName.includes('moneroo') || lowerName.includes('stripe')) {
      return 'static/payment-providers/';
    }
    
    if (lowerName.includes('dsers') || lowerName.includes('mailchimp')) {
      return 'static/integrations/';
    }
    
    if (lowerName.includes('logo') || lowerName.includes('simpshopy')) {
      return 'static/logos/';
    }
    
    return 'static/logos/';
  }

  /**
   * Détermine la priorité
   */
  getPriority(fileName) {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('favicon') || lowerName.includes('logo')) {
      return 'CRITIQUE';
    }
    
    if (lowerName.includes('pay') || lowerName.includes('moneroo')) {
      return 'HAUTE';
    }
    
    return 'MOYENNE';
  }

  /**
   * Formate la taille
   */
  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Génère les instructions de migration
   */
  async generateMigrationInstructions() {
    console.log('📋 Génération des instructions de migration...');
    
    const instructions = {
      bucket_name: 'simpshopy-assets',
      public_url: 'https://pub-345c927832db4e89a418c5e42b39ec6a.r2.dev',
      files_to_migrate: this.uploadedFiles,
      migration_steps: [
        '1. Aller dans votre bucket R2: simpshopy-assets',
        '2. Créer les dossiers: static/logos/, static/system/, static/payment-providers/, static/integrations/',
        '3. Uploader les fichiers selon leur destination',
        '4. Configurer Cloud Connector avec les règles de redirection',
        '5. Tester les performances'
      ],
      cloud_connector_rules: [
        {
          path: '/static/*',
          destination: 'simpshopy-assets/static/',
          cache: 'public, max-age=31536000'
        },
        {
          path: '/payment-logos/*',
          destination: 'simpshopy-assets/static/payment-providers/',
          cache: 'public, max-age=31536000'
        },
        {
          path: '/integration-logos/*',
          destination: 'simpshopy-assets/static/integrations/',
          cache: 'public, max-age=2592000'
        }
      ]
    };
    
    // Sauvegarder les instructions
    fs.writeFileSync(
      path.join(process.cwd(), 'migration-instructions.json'),
      JSON.stringify(instructions, null, 2)
    );
    
    console.log('  ✅ Instructions sauvegardées dans migration-instructions.json');
    
    // Afficher le résumé
    this.displaySummary(instructions);
  }

  /**
   * Affiche le résumé
   */
  displaySummary(instructions) {
    console.log('');
    console.log('📊 RÉSUMÉ DE LA MIGRATION');
    console.log('==========================');
    console.log(`📦 Bucket: ${instructions.bucket_name}`);
    console.log(`🌐 URL publique: ${instructions.public_url}`);
    console.log(`📁 Fichiers à migrer: ${instructions.files_to_migrate.length}`);
    console.log('');
    
    console.log('🎯 FICHIERS CRITIQUES (à migrer en premier):');
    const criticalFiles = instructions.files_to_migrate.filter(f => f.priority === 'CRITIQUE');
    criticalFiles.forEach(file => {
      console.log(`  ⚡ ${file.name} → ${file.destination}`);
    });
    
    console.log('');
    console.log('🚀 PROCHAINES ÉTAPES:');
    instructions.migration_steps.forEach(step => {
      console.log(`  ${step}`);
    });
    
    console.log('');
    console.log('⚡ RÉSULTAT ATTENDU:');
    console.log('  • Assets statiques: < 50ms');
    console.log('  • Images de produits: < 100ms');
    console.log('  • Logo de boutique: < 30ms');
    console.log('  • Total: < 200ms (comme Shopify !)');
  }
}

// Exécution du script
async function main() {
  console.log('🚀 SIMPSHOPY - MIGRATION VERS R2');
  console.log('==================================');
  
  const migrator = new SimpleMigrator();
  await migrator.migrateAllAssets();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SimpleMigrator };
