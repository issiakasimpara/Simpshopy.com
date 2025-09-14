#!/usr/bin/env node

/**
 * 🧹 Script de Nettoyage des Console.log
 * Remplace automatiquement les console.log par le système de logging structuré
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  srcDir: './src',
  excludeDirs: ['node_modules', '.git', 'dist', 'build'],
  excludeFiles: ['logger.ts'], // Ne pas modifier le fichier logger lui-même
  dryRun: false, // Mettre à true pour voir ce qui serait modifié sans rien changer
  backup: true // Créer des sauvegardes
};

// Statistiques
const stats = {
  filesProcessed: 0,
  consoleLogsReplaced: 0,
  errors: 0,
  backups: 0
};

/**
 * 🔍 Trouver tous les fichiers TypeScript/JavaScript
 */
function findSourceFiles(dir) {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory()) {
        if (!CONFIG.excludeDirs.includes(item.name)) {
          walk(path.join(currentDir, item.name));
        }
      } else if (item.isFile()) {
        const ext = path.extname(item.name);
        if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
          if (!CONFIG.excludeFiles.includes(item.name)) {
            files.push(path.join(currentDir, item.name));
          }
        }
      }
    }
  }
  
  walk(dir);
  return files;
}

/**
 * 🔄 Remplacer les console.log par logger
 */
function replaceConsoleLogs(content, filePath) {
  let newContent = content;
  let replacements = 0;
  
  // Patterns de remplacement
  const patterns = [
    // console.log simple
    {
      regex: /console\.log\(([^)]+)\);?/g,
      replacement: (match, args) => {
        replacements++;
        return `logger.debug(${args}, undefined, '${getSourceName(filePath)}');`;
      }
    },
    // console.error
    {
      regex: /console\.error\(([^)]+)\);?/g,
      replacement: (match, args) => {
        replacements++;
        return `logger.error(${args}, undefined, '${getSourceName(filePath)}');`;
      }
    },
    // console.warn
    {
      regex: /console\.warn\(([^)]+)\);?/g,
      replacement: (match, args) => {
        replacements++;
        return `logger.warn(${args}, undefined, '${getSourceName(filePath)}');`;
      }
    },
    // console.info
    {
      regex: /console\.info\(([^)]+)\);?/g,
      replacement: (match, args) => {
        replacements++;
        return `logger.info(${args}, undefined, '${getSourceName(filePath)}');`;
      }
    },
    // console.debug
    {
      regex: /console\.debug\(([^)]+)\);?/g,
      replacement: (match, args) => {
        replacements++;
        return `logger.debug(${args}, undefined, '${getSourceName(filePath)}');`;
      }
    }
  ];
  
  // Appliquer les remplacements
  for (const pattern of patterns) {
    newContent = newContent.replace(pattern.regex, pattern.replacement);
  }
  
  return { content: newContent, replacements };
}

/**
 * 📝 Obtenir le nom de la source
 */
function getSourceName(filePath) {
  const relativePath = path.relative(CONFIG.srcDir, filePath);
  const nameWithoutExt = path.basename(relativePath, path.extname(relativePath));
  return nameWithoutExt;
}

/**
 * 📦 Ajouter l'import du logger si nécessaire
 */
function addLoggerImport(content, filePath) {
  // Vérifier si logger est déjà importé
  if (content.includes("import { logger }") || content.includes("from '@/utils/logger'")) {
    return content;
  }
  
  // Trouver la dernière ligne d'import
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ') || lines[i].startsWith('import{')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex >= 0) {
    // Ajouter l'import après la dernière ligne d'import
    lines.splice(lastImportIndex + 1, 0, "import { logger } from '@/utils/logger';");
  } else {
    // Ajouter au début du fichier
    lines.unshift("import { logger } from '@/utils/logger';");
  }
  
  return lines.join('\n');
}

/**
 * 💾 Créer une sauvegarde
 */
function createBackup(filePath) {
  if (!CONFIG.backup) return;
  
  const backupPath = filePath + '.backup';
  try {
    fs.copyFileSync(filePath, backupPath);
    stats.backups++;
    console.log(`📦 Sauvegarde créée: ${backupPath}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la création de la sauvegarde: ${error.message}`);
  }
}

/**
 * 🔄 Traiter un fichier
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si le fichier contient des console.log
    if (!content.includes('console.')) {
      return;
    }
    
    console.log(`🔍 Traitement de: ${filePath}`);
    
    // Remplacer les console.log
    const { content: newContent, replacements } = replaceConsoleLogs(content, filePath);
    
    if (replacements > 0) {
      // Ajouter l'import du logger
      const finalContent = addLoggerImport(newContent, filePath);
      
      if (!CONFIG.dryRun) {
        // Créer une sauvegarde
        createBackup(filePath);
        
        // Écrire le nouveau contenu
        fs.writeFileSync(filePath, finalContent, 'utf8');
      }
      
      stats.consoleLogsReplaced += replacements;
      console.log(`✅ ${replacements} console.log remplacés dans ${path.basename(filePath)}`);
    }
    
    stats.filesProcessed++;
    
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}: ${error.message}`);
    stats.errors++;
  }
}

/**
 * 🚀 Fonction principale
 */
function main() {
  console.log('🧹 Démarrage du nettoyage des console.log...');
  console.log(`📁 Répertoire source: ${CONFIG.srcDir}`);
  console.log(`🔍 Mode dry-run: ${CONFIG.dryRun ? 'OUI' : 'NON'}`);
  console.log(`📦 Sauvegardes: ${CONFIG.backup ? 'OUI' : 'NON'}`);
  console.log('');
  
  // Trouver tous les fichiers source
  const files = findSourceFiles(CONFIG.srcDir);
  console.log(`📊 ${files.length} fichiers trouvés`);
  console.log('');
  
  // Traiter chaque fichier
  for (const file of files) {
    processFile(file);
  }
  
  // Afficher les statistiques
  console.log('');
  console.log('📊 STATISTIQUES:');
  console.log(`   Fichiers traités: ${stats.filesProcessed}`);
  console.log(`   Console.log remplacés: ${stats.consoleLogsReplaced}`);
  console.log(`   Sauvegardes créées: ${stats.backups}`);
  console.log(`   Erreurs: ${stats.errors}`);
  
  if (CONFIG.dryRun) {
    console.log('');
    console.log('🔍 MODE DRY-RUN: Aucun fichier n\'a été modifié');
    console.log('   Pour appliquer les changements, relancez avec dryRun: false');
  } else {
    console.log('');
    console.log('✅ Nettoyage terminé !');
    console.log('   Les sauvegardes sont disponibles avec l\'extension .backup');
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  main();
}

module.exports = {
  findSourceFiles,
  replaceConsoleLogs,
  addLoggerImport,
  processFile,
  main
};
