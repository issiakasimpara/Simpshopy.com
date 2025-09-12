#!/usr/bin/env node

/**
 * 🚀 SCRIPT DE MIGRATION AUTOMATIQUE VERS R2
 * Migre tous les assets de Simpshopy vers Cloudflare R2
 * Date: 2025-01-28
 */

const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, CreateBucketCommand } = require('@aws-sdk/client-s3');

// Configuration R2
const R2_CONFIG = {
  endpoint: 'https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com',
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
};

const BUCKET_NAME = 'simpshopy-assets';
const s3Client = new S3Client(R2_CONFIG);

// Structure des dossiers R2
const R2_STRUCTURE = {
  'static/logos/': 'public/*.svg',
  'static/logos/': 'public/*.png',
  'static/logos/': 'public/*.webp',
  'static/system/': 'public/favicon.ico',
  'static/system/': 'public/robots.txt',
  'static/system/': 'public/sitemap.xml',
  'static/payment-providers/': 'public/*pay*.svg',
  'static/payment-providers/': 'public/*moneroo*.svg',
  'static/payment-providers/': 'public/*stripe*.svg',
  'static/integrations/': 'public/*dsers*.svg',
  'static/integrations/': 'public/*mailchimp*.svg',
};

class AssetMigrator {
  constructor() {
    this.uploadedFiles = [];
    this.errors = [];
  }

  /**
   * Migre tous les assets vers R2
   */
  async migrateAllAssets() {
    console.log('🚀 Début de la migration vers R2...');
    
    try {
      // 1. Créer la structure des dossiers
      await this.createFolderStructure();
      
      // 2. Migrer les fichiers statiques
      await this.migrateStaticAssets();
      
      // 3. Générer le mapping des URLs
      await this.generateUrlMapping();
      
      console.log('✅ Migration terminée avec succès !');
      console.log(`📊 ${this.uploadedFiles.length} fichiers migrés`);
      
      if (this.errors.length > 0) {
        console.log(`⚠️ ${this.errors.length} erreurs:`);
        this.errors.forEach(error => console.log(`  - ${error}`));
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
    }
  }

  /**
   * Crée la structure des dossiers dans R2
   */
  async createFolderStructure() {
    console.log('📁 Création de la structure des dossiers...');
    
    const folders = [
      'static/logos/',
      'static/system/',
      'static/payment-providers/',
      'static/integrations/',
      'stores/',
      'products/',
      'templates/'
    ];

    for (const folder of folders) {
      try {
        await s3Client.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: folder,
          Body: '',
          ContentType: 'application/x-directory'
        }));
        console.log(`  ✅ Dossier créé: ${folder}`);
      } catch (error) {
        console.log(`  ⚠️ Dossier ${folder} déjà existant`);
      }
    }
  }

  /**
   * Migre les assets statiques
   */
  async migrateStaticAssets() {
    console.log('📦 Migration des assets statiques...');
    
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
        await this.uploadFile(file, filePath);
      }
    }
  }

  /**
   * Upload un fichier vers R2
   */
  async uploadFile(fileName, filePath) {
    try {
      const fileContent = fs.readFileSync(filePath);
      const contentType = this.getContentType(fileName);
      
      // Déterminer le dossier de destination
      const destinationFolder = this.getDestinationFolder(fileName);
      const key = `${destinationFolder}${fileName}`;
      
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
        CacheControl: this.getCacheControl(fileName),
        Metadata: {
          'original-path': filePath,
          'migrated-at': new Date().toISOString()
        }
      }));
      
      this.uploadedFiles.push({
        original: fileName,
        r2Path: key,
        size: fileContent.length,
        contentType
      });
      
      console.log(`  ✅ ${fileName} → ${key}`);
      
    } catch (error) {
      this.errors.push(`${fileName}: ${error.message}`);
      console.log(`  ❌ Erreur ${fileName}: ${error.message}`);
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
   * Détermine le type de contenu
   */
  getContentType(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    
    const types = {
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.ico': 'image/x-icon',
      '.txt': 'text/plain',
      '.xml': 'application/xml',
      '.css': 'text/css',
      '.js': 'application/javascript'
    };
    
    return types[ext] || 'application/octet-stream';
  }

  /**
   * Détermine le cache control
   */
  getCacheControl(fileName) {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('favicon') || lowerName.includes('logo')) {
      return 'public, max-age=31536000'; // 1 an
    }
    
    if (lowerName.includes('robots') || lowerName.includes('sitemap')) {
      return 'public, max-age=86400'; // 1 jour
    }
    
    return 'public, max-age=2592000'; // 1 mois
  }

  /**
   * Génère le mapping des URLs
   */
  async generateUrlMapping() {
    console.log('🗺️ Génération du mapping des URLs...');
    
    const mapping = {
      generated_at: new Date().toISOString(),
      bucket: BUCKET_NAME,
      base_url: `https://${BUCKET_NAME}.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com`,
      files: this.uploadedFiles.map(file => ({
        original: file.original,
        r2_path: file.r2Path,
        cdn_url: `/assets/${file.r2Path}`,
        size: file.size,
        content_type: file.contentType
      }))
    };
    
    // Sauvegarder le mapping
    fs.writeFileSync(
      path.join(process.cwd(), 'r2-asset-mapping.json'),
      JSON.stringify(mapping, null, 2)
    );
    
    console.log('  ✅ Mapping sauvegardé dans r2-asset-mapping.json');
  }
}

// Exécution du script
async function main() {
  console.log('🚀 SIMPSHOPY - MIGRATION VERS R2');
  console.log('=====================================');
  
  // Vérifier les variables d'environnement
  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    console.error('❌ Variables d\'environnement R2 manquantes !');
    console.log('Ajoutez dans votre .env :');
    console.log('R2_ACCESS_KEY_ID=your_access_key');
    console.log('R2_SECRET_ACCESS_KEY=your_secret_key');
    process.exit(1);
  }
  
  const migrator = new AssetMigrator();
  await migrator.migrateAllAssets();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AssetMigrator };
