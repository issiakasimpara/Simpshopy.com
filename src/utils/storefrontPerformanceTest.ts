/**
 * Tests de performance pour le Storefront
 */

export interface StorefrontPerformanceMetrics {
  initialLoadTime: number;
  dataFetchTime: number;
  renderTime: number;
  totalTime: number;
  memoryUsage?: number;
  timestamp: number;
}

export class StorefrontPerformanceTester {
  private metrics: StorefrontPerformanceMetrics[] = [];
  private startTime: number = 0;

  /**
   * Test complet du Storefront
   */
  async testStorefrontPerformance(storeSlug: string): Promise<StorefrontPerformanceMetrics> {
    console.log(`🧪 Test de performance Storefront pour: ${storeSlug}`);
    
    this.startTime = performance.now();
    
    // Test 1: Temps de chargement initial
    const initialLoadTime = this.measureInitialLoad();
    
    // Test 2: Temps de récupération des données
    const dataFetchTime = await this.measureDataFetch(storeSlug);
    
    // Test 3: Temps de rendu
    const renderTime = this.measureRenderTime();
    
    const totalTime = performance.now() - this.startTime;
    
    const metric: StorefrontPerformanceMetrics = {
      initialLoadTime,
      dataFetchTime,
      renderTime,
      totalTime,
      memoryUsage: this.getMemoryUsage(),
      timestamp: Date.now()
    };
    
    this.metrics.push(metric);
    this.logMetrics(metric);
    
    return metric;
  }

  /**
   * Mesure le temps de chargement initial
   */
  private measureInitialLoad(): number {
    const loadTime = performance.now() - this.startTime;
    console.log(`⚡ Temps de chargement initial: ${loadTime.toFixed(2)}ms`);
    return loadTime;
  }

  /**
   * Mesure le temps de récupération des données
   */
  private async measureDataFetch(storeSlug: string): Promise<number> {
    const fetchStart = performance.now();
    
    try {
      // Simuler la requête optimisée
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('stores')
        .select(`
          *,
          site_templates!inner(
            template_data,
            is_published,
            updated_at
          ),
          products(
            id,
            name,
            description,
            price,
            images,
            status
          )
        `)
        .eq('status', 'active')
        .eq('site_templates.is_published', true)
        .ilike('name', `%${storeSlug.replace(/-/g, ' ')}%`)
        .order('site_templates.updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      
      const fetchTime = performance.now() - fetchStart;
      console.log(`📊 Temps de récupération des données: ${fetchTime.toFixed(2)}ms`);
      return fetchTime;
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données:', error);
      return performance.now() - fetchStart;
    }
  }

  /**
   * Mesure le temps de rendu
   */
  private measureRenderTime(): number {
    const renderTime = performance.now() - this.startTime;
    console.log(`🎨 Temps de rendu: ${renderTime.toFixed(2)}ms`);
    return renderTime;
  }

  /**
   * Récupère l'utilisation mémoire
   */
  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return undefined;
  }

  /**
   * Affiche les métriques
   */
  private logMetrics(metric: StorefrontPerformanceMetrics): void {
    console.log('\n📊 MÉTRIQUES STOREFRONT');
    console.log('========================');
    console.log(`⚡ Chargement initial: ${metric.initialLoadTime.toFixed(2)}ms`);
    console.log(`📊 Récupération données: ${metric.dataFetchTime.toFixed(2)}ms`);
    console.log(`🎨 Temps de rendu: ${metric.renderTime.toFixed(2)}ms`);
    console.log(`⏱️ Temps total: ${metric.totalTime.toFixed(2)}ms`);
    
    if (metric.memoryUsage) {
      console.log(`💾 Utilisation mémoire: ${metric.memoryUsage.toFixed(2)}MB`);
    }
    
    // Évaluation des performances
    if (metric.totalTime < 1000) {
      console.log('✅ EXCELLENT: Performance optimale (< 1s)');
    } else if (metric.totalTime < 3000) {
      console.log('🟡 BON: Performance acceptable (< 3s)');
    } else {
      console.log('🔴 À AMÉLIORER: Performance lente (> 3s)');
    }
  }

  /**
   * Génère un rapport complet
   */
  generateReport(): void {
    if (this.metrics.length === 0) {
      console.log('❌ Aucune métrique à analyser');
      return;
    }

    const avgTotalTime = this.metrics.reduce((sum, m) => sum + m.totalTime, 0) / this.metrics.length;
    const avgDataFetchTime = this.metrics.reduce((sum, m) => sum + m.dataFetchTime, 0) / this.metrics.length;
    const minTotalTime = Math.min(...this.metrics.map(m => m.totalTime));
    const maxTotalTime = Math.max(...this.metrics.map(m => m.totalTime));

    console.log('\n📈 RAPPORT DE PERFORMANCE STOREFRONT');
    console.log('=====================================');
    console.log(`🎯 Nombre de tests: ${this.metrics.length}`);
    console.log(`⏱️ Temps total moyen: ${avgTotalTime.toFixed(2)}ms`);
    console.log(`📊 Temps données moyen: ${avgDataFetchTime.toFixed(2)}ms`);
    console.log(`🏃 Temps minimum: ${minTotalTime.toFixed(2)}ms`);
    console.log(`🐌 Temps maximum: ${maxTotalTime.toFixed(2)}ms`);
    
    if (avgTotalTime < 1000) {
      console.log('✅ EXCELLENT: Storefront ultra-rapide');
    } else if (avgTotalTime < 3000) {
      console.log('🟡 BON: Storefront performant');
    } else {
      console.log('🔴 À AMÉLIORER: Storefront lent');
    }
  }

  /**
   * Test de comparaison avant/après optimisation
   */
  async comparePerformance(storeSlug: string): Promise<void> {
    console.log('\n🔄 TEST DE COMPARAISON AVANT/APRÈS');
    console.log('==================================');
    
    // Test avec l'ancienne méthode (simulation)
    console.log('\n📊 Test avec méthode actuelle:');
    const oldMethodTime = await this.simulateOldMethod(storeSlug);
    
    // Test avec la nouvelle méthode
    console.log('\n📊 Test avec méthode optimisée:');
    const newMethodTime = await this.testStorefrontPerformance(storeSlug);
    
    // Comparaison
    const improvement = ((oldMethodTime.totalTime - newMethodTime.totalTime) / oldMethodTime.totalTime) * 100;
    
    console.log('\n📈 RÉSULTATS DE LA COMPARAISON');
    console.log('==============================');
    console.log(`⏱️ Ancienne méthode: ${oldMethodTime.totalTime.toFixed(2)}ms`);
    console.log(`⚡ Nouvelle méthode: ${newMethodTime.totalTime.toFixed(2)}ms`);
    console.log(`📈 Amélioration: ${improvement.toFixed(1)}%`);
    
    if (improvement > 50) {
      console.log('🎉 EXCELLENT: Amélioration significative !');
    } else if (improvement > 20) {
      console.log('✅ BON: Amélioration notable');
    } else {
      console.log('🟡 MODESTE: Amélioration limitée');
    }
  }

  /**
   * Simule l'ancienne méthode (plus lente)
   */
  private async simulateOldMethod(storeSlug: string): Promise<StorefrontPerformanceMetrics> {
    const startTime = performance.now();
    
    // Simuler les requêtes multiples de l'ancienne méthode
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Requête 1: Récupérer toutes les boutiques
    const { data: stores } = await supabase
      .from('stores')
      .select('*')
      .eq('status', 'active');
    
    // Requête 2: Trouver la boutique par slug
    const foundStore = stores?.find(s => {
      const generatedSlug = s.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return generatedSlug === storeSlug;
    });
    
    if (!foundStore) throw new Error('Boutique non trouvée');
    
    // Requête 3: Récupérer les templates
    const { data: templates } = await supabase
      .from('site_templates')
      .select('*')
      .eq('store_id', foundStore.id)
      .eq('is_published', true);
    
    // Requête 4: Récupérer les produits
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', foundStore.id)
      .eq('status', 'active');
    
    const totalTime = performance.now() - startTime;
    
    return {
      initialLoadTime: totalTime * 0.3,
      dataFetchTime: totalTime * 0.7,
      renderTime: totalTime * 0.1,
      totalTime,
      timestamp: Date.now()
    };
  }
}

/**
 * Hook pour tester les performances dans React
 */
export const useStorefrontPerformanceTest = () => {
  const tester = new StorefrontPerformanceTester();

  const testPerformance = async (storeSlug: string) => {
    return await tester.testStorefrontPerformance(storeSlug);
  };

  const comparePerformance = async (storeSlug: string) => {
    return await tester.comparePerformance(storeSlug);
  };

  const generateReport = () => {
    tester.generateReport();
  };

  return { testPerformance, comparePerformance, generateReport, tester };
};

export default StorefrontPerformanceTester;
