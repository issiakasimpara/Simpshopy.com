/**
 * Suite de tests automatisés pour Simpshopy
 * Validation de la robustesse, sécurité et performance
 */

import { 
  validateEmail, 
  validateUrl, 
  validatePrice, 
  validateSku,
  validateProductName,
  validateDescription,
  validateUUID,
  validateImageFile,
  validateProductData,
  validateStoreData,
  validatePassword,
  sanitizeInput,
  constantTimeCompare
} from './securityUtils';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  total: number;
}

class AutomatedTestSuite {
  private suites: TestSuite[] = [];

  // Test de sécurité
  async runSecurityTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Tests de Sécurité',
      tests: [],
      passed: 0,
      failed: 0,
      total: 0
    };

    // Test de validation d'email
    suite.tests.push(this.runTest('Validation Email Valide', () => {
      const result = validateEmail('test@example.com');
      if (!result) throw new Error('Email valide rejeté');
    }));

    suite.tests.push(this.runTest('Validation Email Invalide', () => {
      const result = validateEmail('invalid-email');
      if (result) throw new Error('Email invalide accepté');
    }));

    // Test de validation d'URL
    suite.tests.push(this.runTest('Validation URL Valide', () => {
      const result = validateUrl('https://example.com');
      if (!result) throw new Error('URL valide rejetée');
    }));

    suite.tests.push(this.runTest('Validation URL Invalide', () => {
      const result = validateUrl('not-a-url');
      if (result) throw new Error('URL invalide acceptée');
    }));

    // Test de validation de prix
    suite.tests.push(this.runTest('Validation Prix Valide', () => {
      const result = validatePrice(100.50);
      if (!result) throw new Error('Prix valide rejeté');
    }));

    suite.tests.push(this.runTest('Validation Prix Négatif', () => {
      const result = validatePrice(-10);
      if (result) throw new Error('Prix négatif accepté');
    }));

    // Test de sanitisation XSS
    suite.tests.push(this.runTest('Sanitisation XSS', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(input);
      if (sanitized.includes('<script>')) {
        throw new Error('XSS non bloqué');
      }
    }));

    // Test de validation de mot de passe
    suite.tests.push(this.runTest('Validation Mot de Passe Fort', () => {
      const result = validatePassword('StrongPass123');
      if (!result.isValid) throw new Error('Mot de passe fort rejeté');
    }));

    suite.tests.push(this.runTest('Validation Mot de Passe Faible', () => {
      const result = validatePassword('weak');
      if (result.isValid) throw new Error('Mot de passe faible accepté');
    }));

    // Test de validation de données produit
    suite.tests.push(this.runTest('Validation Données Produit Valides', () => {
      const productData = {
        name: 'Produit Test',
        description: 'Description test',
        price: 100,
        sku: 'TEST-001',
        inventory_quantity: 10
      };
      const result = validateProductData(productData);
      if (!result.isValid) throw new Error('Données produit valides rejetées');
    }));

    // Test de validation UUID
    suite.tests.push(this.runTest('Validation UUID Valide', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = validateUUID(uuid);
      if (!result) throw new Error('UUID valide rejeté');
    }));

    suite.tests.push(this.runTest('Validation UUID Invalide', () => {
      const uuid = 'invalid-uuid';
      const result = validateUUID(uuid);
      if (result) throw new Error('UUID invalide accepté');
    }));

    // Calculer les statistiques
    suite.passed = suite.tests.filter(t => t.passed).length;
    suite.failed = suite.tests.filter(t => !t.passed).length;
    suite.total = suite.tests.length;

    this.suites.push(suite);
    return suite;
  }

  // Test de performance
  async runPerformanceTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Tests de Performance',
      tests: [],
      passed: 0,
      failed: 0,
      total: 0
    };

    // Test de temps de réponse des validations
    suite.tests.push(this.runTest('Performance Validation Email', () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        validateEmail('test@example.com');
      }
      const end = performance.now();
      const duration = end - start;
      if (duration > 100) { // Plus de 100ms pour 1000 validations
        throw new Error(`Validation trop lente: ${duration.toFixed(2)}ms`);
      }
    }));

    // Test de performance de sanitisation
    suite.tests.push(this.runTest('Performance Sanitisation', () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        sanitizeInput('<script>alert("test")</script>');
      }
      const end = performance.now();
      const duration = end - start;
      if (duration > 50) { // Plus de 50ms pour 1000 sanitisations
        throw new Error(`Sanitisation trop lente: ${duration.toFixed(2)}ms`);
      }
    }));

    // Test de comparaison en temps constant
    suite.tests.push(this.runTest('Performance Comparaison Temps Constant', () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        constantTimeCompare('test', 'test');
        constantTimeCompare('test', 'different');
      }
      const end = performance.now();
      const duration = end - start;
      if (duration > 10) { // Plus de 10ms pour 2000 comparaisons
        throw new Error(`Comparaison trop lente: ${duration.toFixed(2)}ms`);
      }
    }));

    // Test de validation de données produit
    suite.tests.push(this.runTest('Performance Validation Produit', () => {
      const productData = {
        name: 'Produit Test',
        description: 'Description test',
        price: 100,
        sku: 'TEST-001',
        inventory_quantity: 10
      };
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        validateProductData(productData);
      }
      const end = performance.now();
      const duration = end - start;
      if (duration > 20) { // Plus de 20ms pour 100 validations
        throw new Error(`Validation produit trop lente: ${duration.toFixed(2)}ms`);
      }
    }));

    // Calculer les statistiques
    suite.passed = suite.tests.filter(t => t.passed).length;
    suite.failed = suite.tests.filter(t => !t.passed).length;
    suite.total = suite.tests.length;

    this.suites.push(suite);
    return suite;
  }

  // Test de robustesse
  async runRobustnessTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Tests de Robustesse',
      tests: [],
      passed: 0,
      failed: 0,
      total: 0
    };

    // Test avec des entrées vides/null
    suite.tests.push(this.runTest('Gestion Entrées Vides', () => {
      const result = validateEmail('');
      if (result) throw new Error('Email vide accepté');
    }));

    suite.tests.push(this.runTest('Gestion Valeurs Null', () => {
      const result = validateEmail(null as any);
      if (result) throw new Error('Email null accepté');
    }));

    suite.tests.push(this.runTest('Gestion Valeurs Undefined', () => {
      const result = validateEmail(undefined as any);
      if (result) throw new Error('Email undefined accepté');
    }));

    // Test avec des entrées très longues
    suite.tests.push(this.runTest('Gestion Entrées Longues', () => {
      const longString = 'a'.repeat(10000);
      const result = validateProductName(longString);
      if (result) throw new Error('Nom trop long accepté');
    }));

    // Test avec des caractères spéciaux
    suite.tests.push(this.runTest('Gestion Caractères Spéciaux', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const sanitized = sanitizeInput(specialChars);
      if (sanitized !== specialChars) {
        throw new Error('Caractères spéciaux légitimes supprimés');
      }
    }));

    // Test de validation de données produit avec champs manquants
    suite.tests.push(this.runTest('Validation Produit Champs Manquants', () => {
      const productData = {
        name: '',
        description: '',
        price: -1
      };
      const result = validateProductData(productData);
      if (result.isValid) throw new Error('Données produit invalides acceptées');
    }));

    // Test de validation de boutique
    suite.tests.push(this.runTest('Validation Boutique Valide', () => {
      const storeData = {
        name: 'Ma Boutique',
        domain: 'example.com'
      };
      const result = validateStoreData(storeData);
      if (!result.isValid) throw new Error('Données boutique valides rejetées');
    }));

    // Calculer les statistiques
    suite.passed = suite.tests.filter(t => t.passed).length;
    suite.failed = suite.tests.filter(t => !t.passed).length;
    suite.total = suite.tests.length;

    this.suites.push(suite);
    return suite;
  }

  // Exécuter un test individuel
  private runTest(name: string, testFn: () => void): TestResult {
    const start = performance.now();
    try {
      testFn();
      const end = performance.now();
      return {
        name,
        passed: true,
        duration: end - start
      };
    } catch (error) {
      const end = performance.now();
      return {
        name,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        duration: end - start
      };
    }
  }

  // Exécuter tous les tests
  async runAllTests(): Promise<{ suites: TestSuite[]; summary: string }> {
    console.log('🧪 Démarrage des tests automatisés...');

    await this.runSecurityTests();
    await this.runPerformanceTests();
    await this.runRobustnessTests();

    const totalTests = this.suites.reduce((sum, suite) => sum + suite.total, 0);
    const totalPassed = this.suites.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = this.suites.reduce((sum, suite) => sum + suite.failed, 0);

    const summary = `
🧪 RAPPORT DES TESTS AUTOMATISÉS
====================================
📊 Résultats par suite:
${this.suites.map(suite => 
  `- ${suite.name}: ${suite.passed}/${suite.total} ✅ (${suite.failed} ❌)`
).join('\n')}

📈 Résumé global:
- Total des tests: ${totalTests}
- Tests réussis: ${totalPassed} ✅
- Tests échoués: ${totalFailed} ❌
- Taux de réussite: ${((totalPassed / totalTests) * 100).toFixed(1)}%

${totalFailed > 0 ? '⚠️ Certains tests ont échoué. Vérifiez les détails ci-dessus.' : '🎉 Tous les tests sont passés avec succès!'}
    `;

    console.log(summary);

    return {
      suites: this.suites,
      summary
    };
  }

  // Obtenir les résultats des tests
  getResults(): TestSuite[] {
    return this.suites;
  }

  // Effacer les résultats
  clearResults(): void {
    this.suites = [];
  }
}

// Instance singleton
export const testSuite = new AutomatedTestSuite();

// Hook React pour les tests
export const useTestSuite = () => {
  return {
    runSecurityTests: testSuite.runSecurityTests.bind(testSuite),
    runPerformanceTests: testSuite.runPerformanceTests.bind(testSuite),
    runRobustnessTests: testSuite.runRobustnessTests.bind(testSuite),
    runAllTests: testSuite.runAllTests.bind(testSuite),
    getResults: testSuite.getResults.bind(testSuite),
    clearResults: testSuite.clearResults.bind(testSuite)
  };
}; 