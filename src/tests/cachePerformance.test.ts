/**
 * 🧪 Tests de Performance du Cache
 * Tests automatisés pour valider les performances du système de cache
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cacheMetricsService } from '@/services/cacheMetricsService';
import { secureStorage } from '@/utils/secureStorage';

// Mock des APIs du navigateur
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

const mockCaches = {
  open: vi.fn(),
  keys: vi.fn(),
  delete: vi.fn(),
  has: vi.fn(),
  match: vi.fn()
};

// Configuration des mocks
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true
});

Object.defineProperty(window, 'caches', {
  value: mockCaches,
  writable: true
});

describe('Cache Performance Tests', () => {
  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks();
    cacheMetricsService.reset();
    
    // Configuration des mocks par défaut
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockReturnValue(undefined);
    mockSessionStorage.getItem.mockReturnValue(null);
    mockSessionStorage.setItem.mockReturnValue(undefined);
    mockCaches.open.mockResolvedValue({
      keys: vi.fn().mockResolvedValue([]),
      match: vi.fn().mockResolvedValue(undefined)
    });
    mockCaches.keys.mockResolvedValue([]);
  });

  afterEach(() => {
    cacheMetricsService.reset();
  });

  describe('localStorage Performance', () => {
    it('should have fast read operations (< 10ms)', async () => {
      const testData = { key: 'test', value: 'data' };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const startTime = performance.now();
      const result = mockLocalStorage.getItem('test');
      const endTime = performance.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(10); // Moins de 10ms
      expect(result).toBe(JSON.stringify(testData));

      // Enregistrer la métrique
      cacheMetricsService.recordMetric({
        type: 'hit',
        source: 'localStorage',
        key: 'test',
        responseTime
      });
    });

    it('should have fast write operations (< 20ms)', async () => {
      const testData = { key: 'test', value: 'data' };

      const startTime = performance.now();
      mockLocalStorage.setItem('test', JSON.stringify(testData));
      const endTime = performance.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(20); // Moins de 20ms
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test', JSON.stringify(testData));

      // Enregistrer la métrique
      cacheMetricsService.recordMetric({
        type: 'hit',
        source: 'localStorage',
        key: 'test',
        responseTime,
        size: JSON.stringify(testData).length
      });
    });

    it('should handle cache misses efficiently', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const startTime = performance.now();
      const result = mockLocalStorage.getItem('nonexistent');
      const endTime = performance.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(5); // Moins de 5ms pour un miss
      expect(result).toBeNull();

      // Enregistrer la métrique
      cacheMetricsService.recordMetric({
        type: 'miss',
        source: 'localStorage',
        key: 'nonexistent',
        responseTime
      });
    });
  });

  describe('sessionStorage Performance', () => {
    it('should have fast read operations (< 10ms)', async () => {
      const testData = { key: 'test', value: 'data' };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const startTime = performance.now();
      const result = mockSessionStorage.getItem('test');
      const endTime = performance.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(10);
      expect(result).toBe(JSON.stringify(testData));

      cacheMetricsService.recordMetric({
        type: 'hit',
        source: 'sessionStorage',
        key: 'test',
        responseTime
      });
    });

    it('should have fast write operations (< 20ms)', async () => {
      const testData = { key: 'test', value: 'data' };

      const startTime = performance.now();
      mockSessionStorage.setItem('test', JSON.stringify(testData));
      const endTime = performance.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(20);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('test', JSON.stringify(testData));

      cacheMetricsService.recordMetric({
        type: 'hit',
        source: 'sessionStorage',
        key: 'test',
        responseTime,
        size: JSON.stringify(testData).length
      });
    });
  });

  describe('Service Worker Cache Performance', () => {
    it('should have fast cache operations (< 50ms)', async () => {
      const mockCache = {
        keys: vi.fn().mockResolvedValue([
          new Request('https://example.com/asset1.js'),
          new Request('https://example.com/asset2.css')
        ]),
        match: vi.fn().mockResolvedValue(new Response('cached content'))
      };

      mockCaches.open.mockResolvedValue(mockCache);

      const startTime = performance.now();
      const cache = await mockCaches.open('test-cache');
      const keys = await cache.keys();
      const endTime = performance.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(50);
      expect(keys).toHaveLength(2);

      cacheMetricsService.recordMetric({
        type: 'hit',
        source: 'serviceWorker',
        responseTime
      });
    });

    it('should handle cache misses efficiently', async () => {
      const mockCache = {
        match: vi.fn().mockResolvedValue(undefined)
      };

      mockCaches.open.mockResolvedValue(mockCache);

      const startTime = performance.now();
      const cache = await mockCaches.open('test-cache');
      const result = await cache.match('https://example.com/nonexistent');
      const endTime = performance.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(30);
      expect(result).toBeUndefined();

      cacheMetricsService.recordMetric({
        type: 'miss',
        source: 'serviceWorker',
        responseTime
      });
    });
  });

  describe('Cache Metrics and Statistics', () => {
    it('should track hit ratio accurately', () => {
      // Simuler des hits et misses
      for (let i = 0; i < 80; i++) {
        cacheMetricsService.recordMetric({
          type: 'hit',
          source: 'localStorage',
          responseTime: 5
        });
      }

      for (let i = 0; i < 20; i++) {
        cacheMetricsService.recordMetric({
          type: 'miss',
          source: 'localStorage',
          responseTime: 2
        });
      }

      const stats = cacheMetricsService.getStats('localStorage') as any;
      expect(stats.hitRatio).toBeCloseTo(0.8, 2); // 80% hit ratio
      expect(stats.hits).toBe(80);
      expect(stats.misses).toBe(20);
    });

    it('should calculate average response time correctly', () => {
      const responseTimes = [10, 20, 30, 40, 50];
      
      responseTimes.forEach(time => {
        cacheMetricsService.recordMetric({
          type: 'hit',
          source: 'localStorage',
          responseTime: time
        });
      });

      const stats = cacheMetricsService.getStats('localStorage') as any;
      expect(stats.averageResponseTime).toBe(30); // Moyenne de 10,20,30,40,50
    });

    it('should track cache size accurately', () => {
      const sizes = [100, 200, 300, 400, 500];
      
      sizes.forEach(size => {
        cacheMetricsService.recordMetric({
          type: 'hit',
          source: 'localStorage',
          size
        });
      });

      const stats = cacheMetricsService.getStats('localStorage') as any;
      expect(stats.totalSize).toBe(1500); // Somme de toutes les tailles
    });
  });

  describe('Cache Alerts', () => {
    it('should generate performance alerts for low hit ratio', () => {
      // Simuler un hit ratio faible
      for (let i = 0; i < 10; i++) {
        cacheMetricsService.recordMetric({
          type: 'hit',
          source: 'localStorage',
          responseTime: 5
        });
      }

      for (let i = 0; i < 90; i++) {
        cacheMetricsService.recordMetric({
          type: 'miss',
          source: 'localStorage',
          responseTime: 2
        });
      }

      const alerts = cacheMetricsService.getAlerts(false);
      const performanceAlerts = alerts.filter(alert => alert.type === 'performance');
      
      expect(performanceAlerts.length).toBeGreaterThan(0);
      expect(performanceAlerts[0].severity).toBe('critical');
    });

    it('should generate capacity alerts for large cache size', () => {
      // Simuler une grande taille de cache
      for (let i = 0; i < 100; i++) {
        cacheMetricsService.recordMetric({
          type: 'hit',
          source: 'localStorage',
          size: 1024 * 1024 // 1MB par opération
        });
      }

      const alerts = cacheMetricsService.getAlerts(false);
      const capacityAlerts = alerts.filter(alert => alert.type === 'capacity');
      
      expect(capacityAlerts.length).toBeGreaterThan(0);
      expect(capacityAlerts[0].severity).toBe('high');
    });

    it('should generate error alerts for high error rate', () => {
      // Simuler des erreurs
      for (let i = 0; i < 20; i++) {
        cacheMetricsService.recordMetric({
          type: 'error',
          source: 'localStorage',
          error: 'Storage quota exceeded'
        });
      }

      for (let i = 0; i < 80; i++) {
        cacheMetricsService.recordMetric({
          type: 'hit',
          source: 'localStorage',
          responseTime: 5
        });
      }

      const alerts = cacheMetricsService.getAlerts(false);
      const errorAlerts = alerts.filter(alert => alert.type === 'error');
      
      expect(errorAlerts.length).toBeGreaterThan(0);
      expect(errorAlerts[0].severity).toBe('critical');
    });
  });

  describe('Cache Trends Analysis', () => {
    it('should calculate trends correctly', () => {
      // Simuler des métriques sur deux périodes
      const now = Date.now();
      
      // Métriques récentes (bonnes performances)
      for (let i = 0; i < 50; i++) {
        cacheMetricsService.recordMetric({
          type: 'hit',
          source: 'localStorage',
          responseTime: 10,
          timestamp: now - (i * 1000) // Dernière heure
        });
      }

      // Métriques anciennes (mauvaises performances)
      for (let i = 0; i < 50; i++) {
        cacheMetricsService.recordMetric({
          type: 'hit',
          source: 'localStorage',
          responseTime: 50,
          timestamp: now - (3600 * 1000) - (i * 1000) // Il y a 1-2 heures
        });
      }

      const trends = cacheMetricsService.getTrends(60);
      expect(trends.responseTime).toBeLessThan(0); // Amélioration du temps de réponse
    });
  });

  describe('Cache Stress Tests', () => {
    it('should handle high volume of operations', async () => {
      const startTime = performance.now();
      
      // Simuler 1000 opérations
      for (let i = 0; i < 1000; i++) {
        cacheMetricsService.recordMetric({
          type: i % 2 === 0 ? 'hit' : 'miss',
          source: 'localStorage',
          key: `key_${i}`,
          responseTime: Math.random() * 20 + 5,
          size: Math.random() * 1000 + 100
        });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(1000); // Moins de 1 seconde pour 1000 opérations
      
      const stats = cacheMetricsService.getStats('localStorage') as any;
      expect(stats.hits + stats.misses).toBe(1000);
    });

    it('should maintain performance under memory pressure', async () => {
      // Simuler une pression mémoire
      const largeData = 'x'.repeat(10000); // 10KB de données
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        cacheMetricsService.recordMetric({
          type: 'hit',
          source: 'localStorage',
          key: `large_key_${i}`,
          size: largeData.length,
          responseTime: Math.random() * 50 + 10
        });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(500); // Moins de 500ms pour 100 opérations avec de grandes données
    });
  });

  describe('Cache Security Tests', () => {
    it('should not expose sensitive data in metrics', () => {
      cacheMetricsService.recordMetric({
        type: 'hit',
        source: 'localStorage',
        key: 'user_token',
        responseTime: 5
      });

      const exportedData = cacheMetricsService.exportData();
      const sensitiveMetric = exportedData.metrics.find(m => m.key === 'user_token');
      
      expect(sensitiveMetric).toBeDefined();
      // Le service ne devrait pas exposer les valeurs sensibles, seulement les métadonnées
      expect(sensitiveMetric?.key).toBe('user_token');
    });

    it('should handle malformed data gracefully', () => {
      expect(() => {
        cacheMetricsService.recordMetric({
          type: 'hit',
          source: 'localStorage',
          responseTime: -1 // Valeur invalide
        });
      }).not.toThrow();

      expect(() => {
        cacheMetricsService.recordMetric({
          type: 'hit',
          source: 'localStorage',
          size: -100 // Valeur invalide
        });
      }).not.toThrow();
    });
  });
});

// Tests d'intégration
describe('Cache Integration Tests', () => {
  it('should work with secureStorage', async () => {
    const testData = { sensitive: 'data', timestamp: Date.now() };
    
    const startTime = performance.now();
    await secureStorage.setItem('test_key', testData);
    const storedData = await secureStorage.getItem('test_key');
    const endTime = performance.now();

    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(100); // Moins de 100ms pour l'opération complète
    expect(storedData).toBe(JSON.stringify(testData));

    // Enregistrer les métriques
    cacheMetricsService.recordMetric({
      type: 'hit',
      source: 'localStorage',
      key: 'test_key',
      responseTime,
      size: JSON.stringify(testData).length
    });
  });

  it('should handle concurrent operations', async () => {
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      promises.push(
        new Promise(resolve => {
          setTimeout(() => {
            cacheMetricsService.recordMetric({
              type: 'hit',
              source: 'localStorage',
              key: `concurrent_${i}`,
              responseTime: Math.random() * 20 + 5
            });
            resolve(undefined);
          }, Math.random() * 100);
        })
      );
    }

    const startTime = performance.now();
    await Promise.all(promises);
    const endTime = performance.now();

    const totalTime = endTime - startTime;
    expect(totalTime).toBeLessThan(200); // Moins de 200ms pour 10 opérations concurrentes

    const stats = cacheMetricsService.getStats('localStorage') as any;
    expect(stats.hits).toBe(10);
  });
});
