#!/usr/bin/env node

/**
 * 🔐 Script d'audit de sécurité pour Simpshopy
 * Vérifie les bonnes pratiques de sécurité et les vulnérabilités communes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns de détection de secrets
const SECRET_PATTERNS = [
  /AKIA[0-9A-Z]{16}/g, // AWS Access Keys
  /AIza[0-9A-Za-z-_]{35}/g, // Google API Keys
  /sk_live_[a-zA-Z0-9]+/g, // Stripe Live Keys
  /pk_live_[a-zA-Z0-9]+/g, // Stripe Public Live Keys
  /-----BEGIN (RSA )?PRIVATE KEY-----/g, // Private Keys
  /[0-9a-f]{32}/g, // Potential API keys (32 hex chars)
  /SG\.[A-Za-z0-9_\-]{20,}/g, // SendGrid API Keys
  /xoxp-[a-zA-Z0-9-]+/g, // Slack Bot Tokens
  /xoxb-[a-zA-Z0-9-]+/g, // Slack Bot Tokens
];

// Patterns de vulnérabilités XSS
const XSS_PATTERNS = [
  /dangerouslySetInnerHTML/g,
  /\.innerHTML\s*=/g,
  /document\.write/g,
  /eval\s*\(/g,
  /Function\s*\(/g,
];

// Patterns de vulnérabilités SQL
const SQL_PATTERNS = [
  /SELECT.*FROM.*\+/g,
  /INSERT.*INTO.*\+/g,
  /UPDATE.*SET.*\+/g,
  /DELETE.*FROM.*\+/g,
];

class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.stats = {
      filesScanned: 0,
      secretsFound: 0,
      xssVulnerabilities: 0,
      sqlVulnerabilities: 0,
    };
  }

  /**
   * Scanner un fichier pour les vulnérabilités
   */
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      this.stats.filesScanned++;

      // Vérifier les secrets
      this.checkSecrets(content, relativePath);
      
      // Vérifier les vulnérabilités XSS
      this.checkXSS(content, relativePath);
      
      // Vérifier les vulnérabilités SQL
      this.checkSQL(content, relativePath);
      
    } catch (error) {
      console.warn(`⚠️  Erreur lors du scan de ${filePath}:`, error.message);
    }
  }

  /**
   * Vérifier la présence de secrets
   */
  checkSecrets(content, filePath) {
    SECRET_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.issues.push({
            type: 'SECRET',
            severity: 'CRITICAL',
            file: filePath,
            pattern: pattern.toString(),
            match: this.maskSecret(match),
            description: 'Secret potentiellement exposé détecté'
          });
          this.stats.secretsFound++;
        });
      }
    });
  }

  /**
   * Vérifier les vulnérabilités XSS
   */
  checkXSS(content, filePath) {
    XSS_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.issues.push({
            type: 'XSS',
            severity: 'HIGH',
            file: filePath,
            pattern: pattern.toString(),
            match: match,
            description: 'Vulnérabilité XSS potentielle'
          });
          this.stats.xssVulnerabilities++;
        });
      }
    });
  }

  /**
   * Vérifier les vulnérabilités SQL
   */
  checkSQL(content, filePath) {
    SQL_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.issues.push({
            type: 'SQL_INJECTION',
            severity: 'MEDIUM',
            file: filePath,
            pattern: pattern.toString(),
            match: match,
            description: 'Vulnérabilité SQL injection potentielle'
          });
          this.stats.sqlVulnerabilities++;
        });
      }
    });
  }

  /**
   * Masquer un secret pour l'affichage
   */
  maskSecret(secret) {
    if (secret.length <= 8) return '***';
    return secret.substring(0, 4) + '***' + secret.substring(secret.length - 4);
  }

  /**
   * Scanner récursivement un dossier
   */
  scanDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Ignorer certains dossiers
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          this.scanDirectory(fullPath, extensions);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          this.scanFile(fullPath);
        }
      }
    });
  }

  /**
   * Générer le rapport
   */
  generateReport() {
    console.log('\n🔐 RAPPORT D\'AUDIT DE SÉCURITÉ\n');
    console.log('=' .repeat(50));
    
    // Statistiques
    console.log('\n📊 STATISTIQUES:');
    console.log(`   Fichiers scannés: ${this.stats.filesScanned}`);
    console.log(`   Secrets trouvés: ${this.stats.secretsFound}`);
    console.log(`   Vulnérabilités XSS: ${this.stats.xssVulnerabilities}`);
    console.log(`   Vulnérabilités SQL: ${this.stats.sqlVulnerabilities}`);
    
    // Issues par sévérité
    const critical = this.issues.filter(i => i.severity === 'CRITICAL');
    const high = this.issues.filter(i => i.severity === 'HIGH');
    const medium = this.issues.filter(i => i.severity === 'MEDIUM');
    
    console.log('\n🚨 ISSUES PAR SÉVÉRITÉ:');
    console.log(`   CRITIQUE: ${critical.length}`);
    console.log(`   HAUTE: ${high.length}`);
    console.log(`   MOYENNE: ${medium.length}`);
    
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
    const totalIssues = this.issues.length;
    const securityScore = Math.max(0, 100 - (critical.length * 20) - (high.length * 10) - (medium.length * 5));
    
    console.log('\n🎯 SCORE DE SÉCURITÉ:');
    console.log(`   Score: ${securityScore}/100`);
    console.log(`   Statut: ${securityScore >= 80 ? '✅ SÉCURISÉ' : securityScore >= 60 ? '⚠️  VULNÉRABLE' : '🚨 CRITIQUE'}`);
    
    console.log('\n' + '=' .repeat(50));
    
    return {
      score: securityScore,
      issues: this.issues,
      stats: this.stats
    };
  }
}

// Exécution du script
const auditor = new SecurityAuditor();

console.log('🔍 Démarrage de l\'audit de sécurité...');

// Scanner le dossier src
auditor.scanDirectory('./src');

// Générer le rapport
const report = auditor.generateReport();

// Code de sortie basé sur le score
process.exit(report.score < 60 ? 1 : 0);

export default SecurityAuditor;
