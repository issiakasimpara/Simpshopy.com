/**
 * 🔐 Audit des requêtes SQL - Script automatisé
 * Analyse toutes les requêtes SQL pour détecter les vulnérabilités
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SQLAuditor {
  constructor() {
    this.vulnerabilities = [];
    this.totalQueries = 0;
    this.secureQueries = 0;
    this.insecureQueries = 0;
  }

  /**
   * 🔐 Analyser un fichier pour les requêtes SQL
   */
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, lineNumber) => {
        this.analyzeLine(line, lineNumber + 1, filePath);
      });
    } catch (error) {
      console.error(`Erreur lors de l'analyse de ${filePath}:`, error.message);
    }
  }

  /**
   * 🔐 Analyser une ligne de code
   */
  analyzeLine(line, lineNumber, filePath) {
    // Patterns de requêtes SQL dangereuses
    const dangerousPatterns = [
      {
        pattern: /supabase\.from\([^)]*\)\.select\([^)]*\+[^)]*\)/,
        severity: 'high',
        message: 'Concaténation de chaînes dans SELECT - risque d\'injection SQL'
      },
      {
        pattern: /supabase\.from\([^)]*\)\.insert\([^)]*\+[^)]*\)/,
        severity: 'critical',
        message: 'Concaténation de chaînes dans INSERT - risque d\'injection SQL'
      },
      {
        pattern: /supabase\.from\([^)]*\)\.update\([^)]*\+[^)]*\)/,
        severity: 'critical',
        message: 'Concaténation de chaînes dans UPDATE - risque d\'injection SQL'
      },
      {
        pattern: /supabase\.from\([^)]*\)\.delete\([^)]*\+[^)]*\)/,
        severity: 'critical',
        message: 'Concaténation de chaînes dans DELETE - risque d\'injection SQL'
      },
      {
        pattern: /\.rpc\([^)]*\+[^)]*\)/,
        severity: 'high',
        message: 'Concaténation de chaînes dans RPC - risque d\'injection SQL'
      },
      {
        pattern: /supabase\.from\([^)]*\)\.select\([^)]*\$\{[^}]*\}[^)]*\)/,
        severity: 'high',
        message: 'Interpolation de variables dans SELECT - risque d\'injection SQL'
      },
      {
        pattern: /supabase\.from\([^)]*\)\.insert\([^)]*\$\{[^}]*\}[^)]*\)/,
        severity: 'critical',
        message: 'Interpolation de variables dans INSERT - risque d\'injection SQL'
      },
      {
        pattern: /supabase\.from\([^)]*\)\.update\([^)]*\$\{[^}]*\}[^)]*\)/,
        severity: 'critical',
        message: 'Interpolation de variables dans UPDATE - risque d\'injection SQL'
      },
      {
        pattern: /supabase\.from\([^)]*\)\.delete\([^)]*\$\{[^}]*\}[^)]*\)/,
        severity: 'critical',
        message: 'Interpolation de variables dans DELETE - risque d\'injection SQL'
      },
      {
        pattern: /\.eq\([^)]*\+[^)]*\)/,
        severity: 'medium',
        message: 'Concaténation de chaînes dans .eq() - risque d\'injection SQL'
      },
      {
        pattern: /\.like\([^)]*\+[^)]*\)/,
        severity: 'high',
        message: 'Concaténation de chaînes dans .like() - risque d\'injection SQL'
      },
      {
        pattern: /\.ilike\([^)]*\+[^)]*\)/,
        severity: 'high',
        message: 'Concaténation de chaînes dans .ilike() - risque d\'injection SQL'
      },
      {
        pattern: /\.textSearch\([^)]*\+[^)]*\)/,
        severity: 'high',
        message: 'Concaténation de chaînes dans .textSearch() - risque d\'injection SQL'
      },
      {
        pattern: /\.filter\([^)]*\+[^)]*\)/,
        severity: 'medium',
        message: 'Concaténation de chaînes dans .filter() - risque d\'injection SQL'
      },
      {
        pattern: /\.order\([^)]*\+[^)]*\)/,
        severity: 'medium',
        message: 'Concaténation de chaînes dans .order() - risque d\'injection SQL'
      }
    ];

    // Patterns de requêtes SQL sûres
    const safePatterns = [
      /sqlSecurity\.buildSecureSelect/,
      /sqlSecurity\.buildSecureInsert/,
      /sqlSecurity\.buildSecureUpdate/,
      /sqlSecurity\.buildSecureDelete/,
      /sqlSecurity\.secureFrom/,
      /sqlSecurity\.secureRpc/,
      /sqlSecurity\.sanitizeString/
    ];

    // Compter les requêtes
    const sqlPatterns = [
      /supabase\.from\(/,
      /\.select\(/,
      /\.insert\(/,
      /\.update\(/,
      /\.delete\(/,
      /\.rpc\(/
    ];

    sqlPatterns.forEach(pattern => {
      if (pattern.test(line)) {
        this.totalQueries++;
      }
    });

    // Vérifier les patterns dangereux
    dangerousPatterns.forEach(({ pattern, severity, message }) => {
      if (pattern.test(line)) {
        this.vulnerabilities.push({
          file: filePath,
          line: lineNumber,
          severity,
          message,
          code: line.trim()
        });
        this.insecureQueries++;
      }
    });

    // Vérifier les patterns sûrs
    safePatterns.forEach(pattern => {
      if (pattern.test(line)) {
        this.secureQueries++;
      }
    });
  }

  /**
   * 🔐 Analyser un répertoire récursivement
   */
  analyzeDirectory(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Ignorer certains dossiers
          if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
            this.analyzeDirectory(fullPath);
          }
        } else if (stat.isFile() && this.isRelevantFile(item)) {
          this.analyzeFile(fullPath);
        }
      });
    } catch (error) {
      console.error(`Erreur lors de l'analyse du répertoire ${dirPath}:`, error.message);
    }
  }

  /**
   * 🔐 Vérifier si un fichier est pertinent pour l'audit SQL
   */
  isRelevantFile(filename) {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const relevantFiles = ['orderService', 'useProducts', 'useStores', 'useOrders'];
    
    const hasRelevantExtension = extensions.some(ext => filename.endsWith(ext));
    const isRelevantFile = relevantFiles.some(name => filename.includes(name));
    
    return hasRelevantExtension && (isRelevantFile || filename.includes('service') || filename.includes('hook'));
  }

  /**
   * 🔐 Générer le rapport d'audit
   */
  generateReport() {
    const report = {
      summary: {
        totalQueries: this.totalQueries,
        secureQueries: this.secureQueries,
        insecureQueries: this.insecureQueries,
        vulnerabilities: this.vulnerabilities.length,
        securityScore: this.calculateSecurityScore()
      },
      vulnerabilities: this.vulnerabilities,
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  /**
   * 🔐 Calculer le score de sécurité
   */
  calculateSecurityScore() {
    if (this.totalQueries === 0) return 100;
    
    const securePercentage = (this.secureQueries / this.totalQueries) * 100;
    const vulnerabilityPenalty = this.vulnerabilities.length * 5;
    
    return Math.max(0, Math.min(100, securePercentage - vulnerabilityPenalty));
  }

  /**
   * 🔐 Générer les recommandations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.vulnerabilities.length > 0) {
      recommendations.push({
        priority: 'critical',
        action: 'Remplacer toutes les requêtes SQL non sécurisées par sqlSecurity',
        description: 'Utiliser les méthodes buildSecureSelect, buildSecureInsert, etc.'
      });
    }

    if (this.secureQueries < this.totalQueries * 0.8) {
      recommendations.push({
        priority: 'high',
        action: 'Migrer vers sqlSecurity pour toutes les requêtes',
        description: 'Au moins 80% des requêtes doivent utiliser sqlSecurity'
      });
    }

    if (this.vulnerabilities.some(v => v.severity === 'critical')) {
      recommendations.push({
        priority: 'critical',
        action: 'Corriger immédiatement les vulnérabilités critiques',
        description: 'Les injections SQL peuvent compromettre toute la base de données'
      });
    }

    return recommendations;
  }

  /**
   * 🔐 Sauvegarder le rapport
   */
  saveReport(report, outputPath) {
    try {
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
      console.log(`📊 Rapport d'audit SQL sauvegardé: ${outputPath}`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du rapport:', error.message);
    }
  }
}

// Exécution de l'audit
async function runSQLAudit() {
  console.log('🔐 Début de l\'audit des requêtes SQL...');
  
  const auditor = new SQLAuditor();
  const projectRoot = path.join(__dirname, '..');
  
  // Analyser les répertoires pertinents
  const directoriesToAnalyze = [
    path.join(projectRoot, 'src', 'services'),
    path.join(projectRoot, 'src', 'hooks'),
    path.join(projectRoot, 'src', 'pages'),
    path.join(projectRoot, 'src', 'components')
  ];
  
  directoriesToAnalyze.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`📁 Analyse du répertoire: ${dir}`);
      auditor.analyzeDirectory(dir);
    }
  });
  
  // Générer le rapport
  const report = auditor.generateReport();
  
  // Afficher le résumé
  console.log('\n📊 RÉSUMÉ DE L\'AUDIT SQL:');
  console.log(`Total des requêtes: ${report.summary.totalQueries}`);
  console.log(`Requêtes sécurisées: ${report.summary.secureQueries}`);
  console.log(`Requêtes non sécurisées: ${report.summary.insecureQueries}`);
  console.log(`Vulnérabilités détectées: ${report.summary.vulnerabilities}`);
  console.log(`Score de sécurité: ${report.summary.securityScore.toFixed(1)}/100`);
  
  // Afficher les vulnérabilités critiques
  const criticalVulns = report.vulnerabilities.filter(v => v.severity === 'critical');
  if (criticalVulns.length > 0) {
    console.log('\n🚨 VULNÉRABILITÉS CRITIQUES:');
    criticalVulns.forEach(vuln => {
      console.log(`- ${vuln.file}:${vuln.line} - ${vuln.message}`);
    });
  }
  
  // Afficher les recommandations
  if (report.recommendations.length > 0) {
    console.log('\n💡 RECOMMANDATIONS:');
    report.recommendations.forEach(rec => {
      console.log(`- [${rec.priority.toUpperCase()}] ${rec.action}`);
    });
  }
  
  // Sauvegarder le rapport
  const reportPath = path.join(projectRoot, 'analysis_reports', 'sql-audit-report.json');
  auditor.saveReport(report, reportPath);
  
  console.log('\n✅ Audit SQL terminé!');
  
  return report;
}

// Exécuter l'audit si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runSQLAudit().catch(console.error);
}

export { SQLAuditor, runSQLAudit };
