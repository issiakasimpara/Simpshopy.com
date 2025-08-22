/**
 * Utilitaires de test de performance pour le bouton "Voir le site"
 */

export interface PerformanceMetrics {
  clickTime: number;
  loadTime: number;
  totalTime: number;
  timestamp: number;
}

export class PerformanceTester {
  private metrics: PerformanceMetrics[] = [];
  private startTime: number = 0;

  /**
   * Démarre le chronomètre
   */
  startTimer(): void {
    this.startTime = performance.now();
    console.log('⏱️ Début du test de performance');
  }

  /**
   * Mesure le temps de clic
   */
  measureClickTime(): number {
    const clickTime = performance.now() - this.startTime;
    console.log(`⚡ Temps de clic: ${clickTime.toFixed(2)}ms`);
    return clickTime;
  }

  /**
   * Mesure le temps de chargement total
   */
  measureLoadTime(): number {
    const loadTime = performance.now() - this.startTime;
    console.log(`📊 Temps de chargement total: ${loadTime.toFixed(2)}ms`);
    return loadTime;
  }

  /**
   * Enregistre les métriques
   */
  recordMetrics(clickTime: number, loadTime: number): void {
    const metric: PerformanceMetrics = {
      clickTime,
      loadTime,
      totalTime: loadTime,
      timestamp: Date.now()
    };

    this.metrics.push(metric);
    console.log('📈 Métriques enregistrées:', metric);
  }

  /**
   * Affiche le rapport de performance
   */
  generateReport(): void {
    if (this.metrics.length === 0) {
      console.log('❌ Aucune métrique à analyser');
      return;
    }

    const avgClickTime = this.metrics.reduce((sum, m) => sum + m.clickTime, 0) / this.metrics.length;
    const avgLoadTime = this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / this.metrics.length;
    const minClickTime = Math.min(...this.metrics.map(m => m.clickTime));
    const maxClickTime = Math.max(...this.metrics.map(m => m.clickTime));

    console.log('\n📊 RAPPORT DE PERFORMANCE');
    console.log('========================');
    console.log(`🎯 Nombre de tests: ${this.metrics.length}`);
    console.log(`⚡ Temps de clic moyen: ${avgClickTime.toFixed(2)}ms`);
    console.log(`📊 Temps de chargement moyen: ${avgLoadTime.toFixed(2)}ms`);
    console.log(`🏃 Temps de clic minimum: ${minClickTime.toFixed(2)}ms`);
    console.log(`🐌 Temps de clic maximum: ${maxClickTime.toFixed(2)}ms`);
    
    if (avgClickTime < 100) {
      console.log('✅ EXCELLENT: Performance optimale (< 100ms)');
    } else if (avgClickTime < 300) {
      console.log('🟡 BON: Performance acceptable (< 300ms)');
    } else {
      console.log('🔴 À AMÉLIORER: Performance lente (> 300ms)');
    }
  }

  /**
   * Test automatique du bouton
   */
  async testButtonPerformance(buttonElement: HTMLElement, iterations: number = 5): Promise<void> {
    console.log(`🧪 Démarrage du test de performance (${iterations} itérations)`);
    
    for (let i = 0; i < iterations; i++) {
      console.log(`\n--- Test ${i + 1}/${iterations} ---`);
      
      this.startTimer();
      
      // Simuler un clic
      buttonElement.click();
      
      const clickTime = this.measureClickTime();
      
      // Attendre un peu pour simuler le chargement
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const loadTime = this.measureLoadTime();
      this.recordMetrics(clickTime, loadTime);
      
      // Pause entre les tests
      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    this.generateReport();
  }
}

/**
 * Hook pour tester les performances dans React
 */
export const usePerformanceTest = () => {
  const tester = new PerformanceTester();

  const testButtonPerformance = (buttonRef: React.RefObject<HTMLElement>) => {
    if (buttonRef.current) {
      tester.testButtonPerformance(buttonRef.current);
    } else {
      console.error('❌ Référence du bouton non trouvée');
    }
  };

  return { testButtonPerformance, tester };
};

/**
 * Fonction utilitaire pour mesurer le temps d'exécution
 */
export const measureExecutionTime = <T>(fn: () => T, label: string = 'Fonction'): T => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
  return result;
};

/**
 * Fonction utilitaire pour mesurer le temps d'exécution asynchrone
 */
export const measureAsyncExecutionTime = async <T>(
  fn: () => Promise<T>, 
  label: string = 'Fonction asynchrone'
): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
  return result;
};

export default PerformanceTester;
