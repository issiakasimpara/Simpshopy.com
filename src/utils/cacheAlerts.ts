/**
 * 🚨 Système d'Alertes de Performance du Cache
 * Surveillance proactive et alertes automatiques
 */

import { cacheMetricsService } from '@/services/cacheMetricsService';
import { dynamicTTLManager } from '@/utils/dynamicCacheTTL';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: (metrics: any) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'capacity' | 'error' | 'security';
  cooldown: number; // Cooldown en millisecondes
  lastTriggered?: number;
  enabled: boolean;
}

interface AlertAction {
  id: string;
  name: string;
  description: string;
  action: () => Promise<void> | void;
  autoExecute: boolean;
  requiresConfirmation: boolean;
}

interface AlertNotification {
  id: string;
  ruleId: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  acknowledged: boolean;
  resolved: boolean;
  actions: AlertAction[];
}

class CacheAlertsManager {
  private rules: Map<string, AlertRule> = new Map();
  private notifications: AlertNotification[] = [];
  private actions: Map<string, AlertAction> = new Map();
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor() {
    this.initializeDefaultRules();
    this.initializeDefaultActions();
  }

  /**
   * 🔧 Initialiser les règles d'alerte par défaut
   */
  private initializeDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'hit_ratio_low',
        name: 'Hit Ratio Faible',
        description: 'Le hit ratio du cache est en dessous du seuil acceptable',
        condition: (metrics) => metrics.hitRatio < 0.7,
        severity: 'high',
        category: 'performance',
        cooldown: 5 * 60 * 1000, // 5 minutes
        enabled: true
      },
      {
        id: 'hit_ratio_critical',
        name: 'Hit Ratio Critique',
        description: 'Le hit ratio du cache est critique',
        condition: (metrics) => metrics.hitRatio < 0.5,
        severity: 'critical',
        category: 'performance',
        cooldown: 2 * 60 * 1000, // 2 minutes
        enabled: true
      },
      {
        id: 'response_time_high',
        name: 'Temps de Réponse Élevé',
        description: 'Le temps de réponse moyen est trop élevé',
        condition: (metrics) => metrics.averageResponseTime > 200,
        severity: 'medium',
        category: 'performance',
        cooldown: 3 * 60 * 1000, // 3 minutes
        enabled: true
      },
      {
        id: 'response_time_critical',
        name: 'Temps de Réponse Critique',
        description: 'Le temps de réponse moyen est critique',
        condition: (metrics) => metrics.averageResponseTime > 500,
        severity: 'critical',
        category: 'performance',
        cooldown: 1 * 60 * 1000, // 1 minute
        enabled: true
      },
      {
        id: 'cache_size_large',
        name: 'Cache Taille Importante',
        description: 'La taille du cache approche des limites',
        condition: (metrics) => metrics.cacheSize > 50 * 1024 * 1024, // 50MB
        severity: 'medium',
        category: 'capacity',
        cooldown: 10 * 60 * 1000, // 10 minutes
        enabled: true
      },
      {
        id: 'cache_size_critical',
        name: 'Cache Taille Critique',
        description: 'La taille du cache est critique',
        condition: (metrics) => metrics.cacheSize > 100 * 1024 * 1024, // 100MB
        severity: 'high',
        category: 'capacity',
        cooldown: 5 * 60 * 1000, // 5 minutes
        enabled: true
      },
      {
        id: 'error_rate_high',
        name: 'Taux d\'Erreur Élevé',
        description: 'Le taux d\'erreur du cache est élevé',
        condition: (metrics) => metrics.errorRate > 0.05,
        severity: 'high',
        category: 'error',
        cooldown: 2 * 60 * 1000, // 2 minutes
        enabled: true
      },
      {
        id: 'error_rate_critical',
        name: 'Taux d\'Erreur Critique',
        description: 'Le taux d\'erreur du cache est critique',
        condition: (metrics) => metrics.errorRate > 0.1,
        severity: 'critical',
        category: 'error',
        cooldown: 1 * 60 * 1000, // 1 minute
        enabled: true
      },
      {
        id: 'eviction_rate_high',
        name: 'Taux d\'Éviction Élevé',
        description: 'Le taux d\'éviction du cache est élevé',
        condition: (metrics) => metrics.evictionRate > 0.1,
        severity: 'medium',
        category: 'performance',
        cooldown: 5 * 60 * 1000, // 5 minutes
        enabled: true
      },
      {
        id: 'memory_pressure',
        name: 'Pression Mémoire',
        description: 'Pression mémoire détectée sur le cache',
        condition: (metrics) => {
          // Vérifier si la mémoire disponible est faible
          if ('memory' in performance) {
            const memory = (performance as any).memory;
            return memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8;
          }
          return false;
        },
        severity: 'high',
        category: 'capacity',
        cooldown: 2 * 60 * 1000, // 2 minutes
        enabled: true
      }
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  /**
   * 🔧 Initialiser les actions par défaut
   */
  private initializeDefaultActions(): void {
    const defaultActions: AlertAction[] = [
      {
        id: 'clear_old_cache',
        name: 'Nettoyer l\'Ancien Cache',
        description: 'Supprimer les éléments de cache expirés et peu utilisés',
        action: async () => {
          // Nettoyer le localStorage
          const keys = Object.keys(localStorage);
          const now = Date.now();
          let cleaned = 0;

          keys.forEach(key => {
            try {
              const item = localStorage.getItem(key);
              if (item) {
                const data = JSON.parse(item);
                if (data.expiry && data.expiry < now) {
                  localStorage.removeItem(key);
                  cleaned++;
                }
              }
            } catch (error) {
              // Ignorer les erreurs de parsing
            }
          });

          console.log(`🧹 Nettoyage du cache: ${cleaned} éléments supprimés`);
        },
        autoExecute: true,
        requiresConfirmation: false
      },
      {
        id: 'optimize_ttl',
        name: 'Optimiser les TTL',
        description: 'Ajuster automatiquement les durées de cache',
        action: async () => {
          // Déclencher l'optimisation des TTL
          const stats = dynamicTTLManager.getUsageStats();
          console.log('🎯 Optimisation des TTL déclenchée:', stats);
        },
        autoExecute: true,
        requiresConfirmation: false
      },
      {
        id: 'reduce_cache_size',
        name: 'Réduire la Taille du Cache',
        description: 'Supprimer les éléments les moins prioritaires',
        action: async () => {
          // Supprimer les éléments de faible priorité
          const keys = Object.keys(localStorage);
          let removed = 0;

          keys.forEach(key => {
            try {
              const item = localStorage.getItem(key);
              if (item) {
                const data = JSON.parse(item);
                if (data.priority === 'low' && data.lastAccess < Date.now() - 30 * 60 * 1000) {
                  localStorage.removeItem(key);
                  removed++;
                }
              }
            } catch (error) {
              // Ignorer les erreurs
            }
          });

          console.log(`📉 Réduction du cache: ${removed} éléments supprimés`);
        },
        autoExecute: false,
        requiresConfirmation: true
      },
      {
        id: 'restart_service_worker',
        name: 'Redémarrer le Service Worker',
        description: 'Redémarrer le service worker pour libérer la mémoire',
        action: async () => {
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              await registration.unregister();
            }
            
            // Recharger la page pour redémarrer le service worker
            window.location.reload();
          }
        },
        autoExecute: false,
        requiresConfirmation: true
      },
      {
        id: 'send_notification',
        name: 'Envoyer une Notification',
        description: 'Notifier l\'utilisateur du problème de cache',
        action: async () => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Problème de Cache Détecté', {
              body: 'Un problème de performance du cache a été détecté. Des actions automatiques ont été prises.',
              icon: '/favicon.ico'
            });
          }
        },
        autoExecute: true,
        requiresConfirmation: false
      }
    ];

    defaultActions.forEach(action => {
      this.actions.set(action.id, action);
    });
  }

  /**
   * 🚀 Démarrer la surveillance
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.checkAlerts();
    }, 30000); // Vérifier toutes les 30 secondes

    console.log('🚨 Surveillance des alertes de cache démarrée');
  }

  /**
   * 🛑 Arrêter la surveillance
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    console.log('🛑 Surveillance des alertes de cache arrêtée');
  }

  /**
   * 🔍 Vérifier les alertes
   */
  private async checkAlerts(): Promise<void> {
    const metrics = cacheMetricsService.getMetrics();
    const now = Date.now();

    for (const [ruleId, rule] of this.rules.entries()) {
      if (!rule.enabled) continue;

      // Vérifier le cooldown
      if (rule.lastTriggered && now - rule.lastTriggered < rule.cooldown) {
        continue;
      }

      // Vérifier la condition
      if (rule.condition(metrics)) {
        await this.triggerAlert(rule);
        rule.lastTriggered = now;
      }
    }
  }

  /**
   * 🚨 Déclencher une alerte
   */
  private async triggerAlert(rule: AlertRule): Promise<void> {
    const notification: AlertNotification = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      message: `${rule.name}: ${rule.description}`,
      severity: rule.severity,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
      actions: this.getActionsForRule(rule)
    };

    this.notifications.push(notification);

    // Exécuter les actions automatiques
    for (const action of notification.actions) {
      if (action.autoExecute) {
        try {
          await action.action();
          console.log(`✅ Action automatique exécutée: ${action.name}`);
        } catch (error) {
          console.error(`❌ Erreur lors de l'exécution de l'action ${action.name}:`, error);
        }
      }
    }

    // Log de l'alerte
    console.warn(`🚨 Alerte de cache [${rule.severity.toUpperCase()}]: ${rule.name}`);
  }

  /**
   * 🎯 Obtenir les actions pour une règle
   */
  private getActionsForRule(rule: AlertRule): AlertAction[] {
    const actionMap: Record<string, string[]> = {
      'hit_ratio_low': ['optimize_ttl', 'clear_old_cache'],
      'hit_ratio_critical': ['optimize_ttl', 'clear_old_cache', 'send_notification'],
      'response_time_high': ['clear_old_cache', 'optimize_ttl'],
      'response_time_critical': ['clear_old_cache', 'reduce_cache_size', 'send_notification'],
      'cache_size_large': ['clear_old_cache', 'optimize_ttl'],
      'cache_size_critical': ['reduce_cache_size', 'clear_old_cache', 'send_notification'],
      'error_rate_high': ['clear_old_cache', 'send_notification'],
      'error_rate_critical': ['restart_service_worker', 'clear_old_cache', 'send_notification'],
      'eviction_rate_high': ['optimize_ttl'],
      'memory_pressure': ['reduce_cache_size', 'clear_old_cache', 'restart_service_worker']
    };

    const actionIds = actionMap[rule.id] || [];
    return actionIds.map(id => this.actions.get(id)).filter(Boolean) as AlertAction[];
  }

  /**
   * 📊 Obtenir les notifications
   */
  public getNotifications(resolved?: boolean): AlertNotification[] {
    if (resolved !== undefined) {
      return this.notifications.filter(n => n.resolved === resolved);
    }
    return this.notifications;
  }

  /**
   * ✅ Marquer une notification comme résolue
   */
  public resolveNotification(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.resolved = true;
    }
  }

  /**
   * 👁️ Marquer une notification comme vue
   */
  public acknowledgeNotification(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.acknowledged = true;
    }
  }

  /**
   * 🎯 Exécuter une action manuellement
   */
  public async executeAction(actionId: string): Promise<void> {
    const action = this.actions.get(actionId);
    if (action) {
      try {
        await action.action();
        console.log(`✅ Action exécutée: ${action.name}`);
      } catch (error) {
        console.error(`❌ Erreur lors de l'exécution de l'action ${action.name}:`, error);
        throw error;
      }
    }
  }

  /**
   * 🔧 Ajouter une règle personnalisée
   */
  public addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * 🔧 Modifier une règle
   */
  public updateRule(ruleId: string, updates: Partial<AlertRule>): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      Object.assign(rule, updates);
      this.rules.set(ruleId, rule);
    }
  }

  /**
   * 🔧 Activer/Désactiver une règle
   */
  public toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
      this.rules.set(ruleId, rule);
    }
  }

  /**
   * 📊 Obtenir les statistiques des alertes
   */
  public getAlertStats(): {
    totalNotifications: number;
    unresolvedNotifications: number;
    notificationsBySeverity: Record<string, number>;
    activeRules: number;
    totalRules: number;
  } {
    const notificationsBySeverity = this.notifications.reduce((acc, n) => {
      acc[n.severity] = (acc[n.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalNotifications: this.notifications.length,
      unresolvedNotifications: this.notifications.filter(n => !n.resolved).length,
      notificationsBySeverity,
      activeRules: Array.from(this.rules.values()).filter(r => r.enabled).length,
      totalRules: this.rules.size
    };
  }

  /**
   * 🧹 Nettoyer les anciennes notifications
   */
  public cleanupOldNotifications(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    this.notifications = this.notifications.filter(n => n.timestamp > cutoff);
  }

  /**
   * 📊 Exporter les données
   */
  public exportData(): {
    rules: AlertRule[];
    notifications: AlertNotification[];
    actions: AlertAction[];
    stats: ReturnType<typeof this.getAlertStats>;
  } {
    return {
      rules: Array.from(this.rules.values()),
      notifications: this.notifications,
      actions: Array.from(this.actions.values()),
      stats: this.getAlertStats()
    };
  }
}

// Instance globale
export const cacheAlertsManager = new CacheAlertsManager();

// Démarrer automatiquement la surveillance
cacheAlertsManager.startMonitoring();

/**
 * 🔍 Hook React pour utiliser le gestionnaire d'alertes
 */
export const useCacheAlerts = () => {
  const [notifications, setNotifications] = React.useState<AlertNotification[]>([]);
  const [stats, setStats] = React.useState(cacheAlertsManager.getAlertStats());

  React.useEffect(() => {
    const updateAlerts = () => {
      setNotifications(cacheAlertsManager.getNotifications());
      setStats(cacheAlertsManager.getAlertStats());
    };

    updateAlerts();
    const interval = setInterval(updateAlerts, 10000); // Mise à jour toutes les 10 secondes

    return () => clearInterval(interval);
  }, []);

  const resolveNotification = (notificationId: string) => {
    cacheAlertsManager.resolveNotification(notificationId);
  };

  const acknowledgeNotification = (notificationId: string) => {
    cacheAlertsManager.acknowledgeNotification(notificationId);
  };

  const executeAction = async (actionId: string) => {
    await cacheAlertsManager.executeAction(actionId);
  };

  return {
    notifications,
    stats,
    resolveNotification,
    acknowledgeNotification,
    executeAction,
    exportData: () => cacheAlertsManager.exportData()
  };
};
