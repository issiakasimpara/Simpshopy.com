/**
 * 🔐 Middleware de sécurité
 * Intercepteur global pour toutes les requêtes et actions sensibles
 */

import { secureApiClient } from './secureApiClient';
import { sessionSecurity } from './sessionSecurity';
import { rateLimiters } from './rateLimiter';
import { csrfProtection } from './csrfProtection';
import { secureStorage } from './secureStorage';

interface SecurityEvent {
  type: 'request' | 'response' | 'error' | 'auth' | 'data_access';
  timestamp: number;
  userId?: string;
  sessionId?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class SecurityMiddleware {
  private eventLog: SecurityEvent[] = [];
  private maxLogSize = 1000;
  private alertThresholds = {
    failed_requests: 10,
    auth_failures: 5,
    rate_limit_hits: 20,
    suspicious_activity: 3
  };

  /**
   * 🔐 Intercepter les requêtes fetch
   */
  public interceptFetch(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const startTime = Date.now();
      const url = typeof input === 'string' ? input : input.toString();
      
      // Log de la requête
      this.logEvent({
        type: 'request',
        timestamp: startTime,
        userId: sessionSecurity.getSessionInfo()?.userId,
        sessionId: sessionSecurity.getSessionId(),
        details: {
          url,
          method: init?.method || 'GET',
          headers: init?.headers
        },
        severity: this.getRequestSeverity(url, init?.method)
      });

      try {
        // Vérifications de sécurité
        await this.validateRequest(url, init);
        
        // Exécuter la requête
        const response = await originalFetch(input, init);
        
        // Log de la réponse
        this.logEvent({
          type: 'response',
          timestamp: Date.now(),
          userId: sessionSecurity.getSessionInfo()?.userId,
          sessionId: sessionSecurity.getSessionId(),
          details: {
            url,
            status: response.status,
            statusText: response.statusText,
            duration: Date.now() - startTime
          },
          severity: this.getResponseSeverity(response.status)
        });

        return response;
      } catch (error) {
        // Log de l'erreur
        this.logEvent({
          type: 'error',
          timestamp: Date.now(),
          userId: sessionSecurity.getSessionInfo()?.userId,
          sessionId: sessionSecurity.getSessionId(),
          details: {
            url,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration: Date.now() - startTime
          },
          severity: 'high'
        });

        throw error;
      }
    };
  }

  /**
   * 🔐 Valider une requête
   */
  private async validateRequest(url: string, init?: RequestInit): Promise<void> {
    // Vérifier la session
    if (!sessionSecurity.isSessionValid()) {
      throw new Error('Session invalide');
    }

    // Vérifier le rate limiting
    const limiter = rateLimiters.api;
    if (!limiter.isAllowed({ endpoint: url })) {
      throw new Error('Rate limit exceeded');
    }

    // Vérifier les URLs suspectes
    if (this.isSuspiciousURL(url)) {
      this.logEvent({
        type: 'request',
        timestamp: Date.now(),
        details: { url, reason: 'suspicious_url' },
        severity: 'high'
      });
      throw new Error('URL suspecte détectée');
    }

    // Vérifier les méthodes HTTP
    if (init?.method && !this.isAllowedMethod(init.method)) {
      throw new Error(`Méthode HTTP non autorisée: ${init.method}`);
    }
  }

  /**
   * 🔐 Vérifier si une URL est suspecte
   */
  private isSuspiciousURL(url: string): boolean {
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /file:/i,
      /ftp:/i,
      /localhost/i,
      /127\.0\.0\.1/i,
      /0\.0\.0\.0/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(url));
  }

  /**
   * 🔐 Vérifier si une méthode HTTP est autorisée
   */
  private isAllowedMethod(method: string): boolean {
    const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    return allowedMethods.includes(method.toUpperCase());
  }

  /**
   * 🔐 Déterminer la sévérité d'une requête
   */
  private getRequestSeverity(url: string, method?: string): 'low' | 'medium' | 'high' | 'critical' {
    if (method && ['POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
      return 'medium';
    }
    
    if (url.includes('/admin') || url.includes('/api/auth')) {
      return 'high';
    }
    
    return 'low';
  }

  /**
   * 🔐 Déterminer la sévérité d'une réponse
   */
  private getResponseSeverity(status: number): 'low' | 'medium' | 'high' | 'critical' {
    if (status >= 500) return 'critical';
    if (status >= 400) return 'high';
    if (status >= 300) return 'medium';
    return 'low';
  }

  /**
   * 🔐 Logger un événement de sécurité
   */
  private logEvent(event: SecurityEvent): void {
    this.eventLog.push(event);
    
    // Limiter la taille du log
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog = this.eventLog.slice(-this.maxLogSize);
    }

    // Vérifier les seuils d'alerte
    this.checkAlertThresholds(event);

    // Sauvegarder les événements critiques
    if (event.severity === 'critical') {
      this.saveCriticalEvent(event);
    }
  }

  /**
   * 🔐 Vérifier les seuils d'alerte
   */
  private checkAlertThresholds(event: SecurityEvent): void {
    const recentEvents = this.eventLog.filter(
      e => Date.now() - e.timestamp < 5 * 60 * 1000 // 5 minutes
    );

    // Compter les événements par type
    const eventCounts = recentEvents.reduce((counts, e) => {
      counts[e.type] = (counts[e.type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    // Vérifier les seuils
    if (eventCounts.error >= this.alertThresholds.failed_requests) {
      this.triggerAlert('Trop de requêtes échouées', 'high');
    }

    if (eventCounts.auth >= this.alertThresholds.auth_failures) {
      this.triggerAlert('Trop d\'échecs d\'authentification', 'critical');
    }
  }

  /**
   * 🔐 Déclencher une alerte
   */
  private triggerAlert(message: string, severity: 'high' | 'critical'): void {
    console.warn(`🚨 ALERTE SÉCURITÉ [${severity.toUpperCase()}]: ${message}`);
    
    // En production, envoyer l'alerte à un service de monitoring
    if (import.meta.env.PROD) {
      this.sendSecurityAlert(message, severity);
    }
  }

  /**
   * 🔐 Envoyer une alerte de sécurité
   */
  private async sendSecurityAlert(message: string, severity: string): Promise<void> {
    try {
      // Ici, vous pourriez envoyer l'alerte à un service externe
      // comme Sentry, DataDog, ou un webhook personnalisé
      console.log('Alerte de sécurité envoyée:', { message, severity });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'alerte:', error);
    }
  }

  /**
   * 🔐 Sauvegarder un événement critique
   */
  private async saveCriticalEvent(event: SecurityEvent): Promise<void> {
    try {
      const criticalEvents = await secureStorage.getItemJSON<SecurityEvent[]>('critical_events') || [];
      criticalEvents.push(event);
      
      // Garder seulement les 100 derniers événements critiques
      if (criticalEvents.length > 100) {
        criticalEvents.splice(0, criticalEvents.length - 100);
      }
      
      await secureStorage.setItem('critical_events', criticalEvents);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'événement critique:', error);
    }
  }

  /**
   * 🔐 Obtenir les statistiques de sécurité
   */
  public getSecurityStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    recentActivity: SecurityEvent[];
  } {
    const recentEvents = this.eventLog.filter(
      e => Date.now() - e.timestamp < 60 * 60 * 1000 // 1 heure
    );

    const eventsByType = recentEvents.reduce((counts, e) => {
      counts[e.type] = (counts[e.type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const eventsBySeverity = recentEvents.reduce((counts, e) => {
      counts[e.severity] = (counts[e.severity] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      totalEvents: this.eventLog.length,
      eventsByType,
      eventsBySeverity,
      recentActivity: recentEvents.slice(-10) // 10 derniers événements
    };
  }

  /**
   * 🔐 Nettoyer les logs
   */
  public clearLogs(): void {
    this.eventLog = [];
  }

  /**
   * 🔐 Initialiser le middleware
   */
  public initialize(): void {
    this.interceptFetch();
    
    if (import.meta.env.DEV) {
      console.log('🔐 Middleware de sécurité initialisé');
    }
  }
}

// Instance globale
export const securityMiddleware = new SecurityMiddleware();

/**
 * 🔐 Hook React pour utiliser le middleware de sécurité
 */
export const useSecurityMiddleware = () => {
  const getStats = () => securityMiddleware.getSecurityStats();
  const clearLogs = () => securityMiddleware.clearLogs();

  return {
    getStats,
    clearLogs
  };
};
