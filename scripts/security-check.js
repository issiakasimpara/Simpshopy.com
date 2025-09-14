#!/usr/bin/env node

/**
 * 🔐 Script d'audit de sécurité simplifié pour Simpshopy
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns de détection de secrets
const SECRET_PATTERNS = [
  /AKIA[0-9A-Z]{16}/g,
  /AIza[0-9A-Za-z-_]{35}/g,
  /sk_live_[a-zA-Z0-9]+/g,
  /pk_live_[a-zA-Z0-9]+/g,
  /-----BEGIN (RSA )?PRIVATE KEY-----/g,
  /SG\.[A-Za-z0-9_\-]{20,}/g,
];

// Patterns de vulnérabilités XSS
const XSS_PATTERNS = [
  /dangerouslySetInnerHTML/g,
  /\.innerHTML\s*=/g,
  /document\.write/g,
  /eval\s*\(/g,
];

let issues = [];
let stats = {
  filesScanned: 0,
  secretsFound: 0,
  xssVulnerabilities: 0,
};

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    stats.filesScanned++;

    // Vérifier les secrets
    SECRET_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          issues.push({
            type: 'SECRET',
            severity: 'CRITICAL',
            file: relativePath,
            match: maskSecret(match),
            description: 'Secret potentiellement exposé détecté'
          });
          stats.secretsFound++;
        });
      }
    });

    // Vérifier les vulnérabilités XSS
    XSS_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          issues.push({
            type: 'XSS',
            severity: 'HIGH',
            file: relativePath,
            match: match,
            description: 'Vulnérabilité XSS potentielle'
          });
          stats.xssVulnerabilities++;
        });
      }
    });

  } catch (error) {
    console.warn(`⚠️  Erreur lors du scan de ${filePath}:`, error.message);
  }
}

function maskSecret(secret) {
  if (secret.length <= 8) return '***';
  return secret.substring(0, 4) + '***' + secret.substring(secret.length - 4);
}

function scanDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          scanDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
          scanFile(fullPath);
        }
      }
    });
  } catch (error) {
    console.warn(`⚠️  Erreur lors du scan du dossier ${dirPath}:`, error.message);
  }
}

function generateReport() {
  console.log('\n🔐 RAPPORT D\'AUDIT DE SÉCURITÉ\n');
  console.log('='.repeat(50));
  
  // Statistiques
  console.log('\n📊 STATISTIQUES:');
  console.log(`   Fichiers scannés: ${stats.filesScanned}`);
  console.log(`   Secrets trouvés: ${stats.secretsFound}`);
  console.log(`   Vulnérabilités XSS: ${stats.xssVulnerabilities}`);
  
  // Issues par sévérité
  const critical = issues.filter(i => i.severity === 'CRITICAL');
  const high = issues.filter(i => i.severity === 'HIGH');
  
  console.log('\n🚨 ISSUES PAR SÉVÉRITÉ:');
  console.log(`   CRITIQUE: ${critical.length}`);
  console.log(`   HAUTE: ${high.length}`);
  
  // Détail des issues critiques
  if (critical.length > 0) {
    console.log('\n🚨 ISSUES CRITIQUES:');
    critical.forEach(issue => {
      console.log(`   ${issue.file}: ${issue.description}`);
      console.log(`   Pattern: ${issue.match}`);
    });
  }
  
  // Détail des issues importantes
  if (high.length > 0) {
    console.log('\n⚠️  ISSUES IMPORTANTES:');
    high.forEach(issue => {
      console.log(`   ${issue.file}: ${issue.description}`);
    });
  }
  
  // Score de sécurité
  const totalIssues = issues.length;
  const securityScore = Math.max(0, 100 - (critical.length * 20) - (high.length * 10));
  
  console.log('\n🎯 SCORE DE SÉCURITÉ:');
  console.log(`   Score: ${securityScore}/100`);
  console.log(`   Statut: ${securityScore >= 80 ? '✅ SÉCURISÉ' : securityScore >= 60 ? '⚠️  VULNÉRABLE' : '🚨 CRITIQUE'}`);
  
  console.log('\n' + '='.repeat(50));
  
  return {
    score: securityScore,
    issues: issues,
    stats: stats
  };
}

// Exécution du script
console.log('🔍 Démarrage de l\'audit de sécurité...');

// Scanner le dossier src
scanDirectory('./src');

// Générer le rapport
const report = generateReport();

// Code de sortie basé sur le score
process.exit(report.score < 60 ? 1 : 0);
