/**
 * 🛠️ Système de Logging Structuré - Simpshopy
 * Remplace tous les console.log par un système de logging professionnel
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  source?: string;
  userId?: string;
  sessionId?: string;
}

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  maxLogs: number;
  sanitizeData: boolean;
}

class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';
    
    this.config = {
      level: this.isDevelopment ? 'DEBUG' : 'WARN',
      enableConsole: this.isDevelopment,
      enableFile: !this.isDevelopment,
      enableRemote: !this.isDevelopment,
      maxLogs: 1000,
      sanitizeData: true
    };
  }

  /**
   * 🔍 Log de niveau DEBUG
   */
  debug(message: string, data?: any, source?: string): void {
    this.log('DEBUG', message, data, source);
  }

  /**
   * ℹ️ Log de niveau INFO
   */
  info(message: string, data?: any, source?: string): void {
    this.log('INFO', message, data, source);
  }

  /**
   * ⚠️ Log de niveau WARN
   */
  warn(message: string, data?: any, source?: string): void {
    this.log('WARN', message, data, source);
  }

  /**
   * ❌ Log de niveau ERROR
   */
  error(message: string, error?: any, source?: string): void {
    this.log('ERROR', message, error, source);
  }

  /**
   * 📊 Log principal
   */
  private log(level: LogLevel, message: string, data?: any, source?: string): void {
    // Vérifier le niveau de log
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: this.sanitizeData ? this.sanitize(data) : data,
      source: source || this.getSource(),
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId()
    };

    // Ajouter aux logs en mémoire
    this.addToMemory(entry);

    // Envoyer aux destinations configurées
    this.sendToDestinations(entry);
  }

  /**
   * 🔍 Vérifier si le log doit être affiché
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      'DEBUG': 0,
      'INFO': 1,
      'WARN': 2,
      'ERROR': 3
    };

    return levels[level] >= levels[this.config.level];
  }

  /**
   * 🧹 Sanitiser les données sensibles
   */
  private sanitize(data: any): any {
    if (!data) return data;

    // Si c'est une string, vérifier si elle contient des données sensibles
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }

    // Si c'est un objet, sanitiser récursivement
    if (typeof data === 'object') {
      return this.sanitizeObject(data);
    }

    return data;
  }

  /**
   * 🧹 Sanitiser une string
   */
  private sanitizeString(str: string): string {
    const sensitivePatterns = [
      /token['":\s]*([a-zA-Z0-9\-_]+)/gi,
      /password['":\s]*([^\s,}]+)/gi,
      /apikey['":\s]*([a-zA-Z0-9\-_]+)/gi,
      /secret['":\s]*([a-zA-Z0-9\-_]+)/gi,
      /key['":\s]*([a-zA-Z0-9\-_]+)/gi,
      /bearer['":\s]*([a-zA-Z0-9\-_]+)/gi
    ];

    let sanitized = str;
    sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, (match, value) => {
        return match.replace(value, '***');
      });
    });

    return sanitized;
  }

  /**
   * 🧹 Sanitiser un objet
   */
  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitize(item));
    }

    const sensitiveKeys = [
      'token', 'password', 'apikey', 'secret', 'key', 'bearer',
      'authorization', 'auth', 'credential', 'access_token',
      'refresh_token', 'session_id', 'cookie', 'jwt'
    ];

    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '***';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * 📝 Ajouter aux logs en mémoire
   */
  private addToMemory(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Limiter le nombre de logs en mémoire
    if (this.logs.length > this.config.maxLogs) {
      this.logs = this.logs.slice(-this.config.maxLogs);
    }
  }

  /**
   * 📤 Envoyer aux destinations configurées
   */
  private sendToDestinations(entry: LogEntry): void {
    if (this.config.enableConsole) {
      this.sendToConsole(entry);
    }

    if (this.config.enableFile) {
      this.sendToFile(entry);
    }

    if (this.config.enableRemote) {
      this.sendToRemote(entry);
    }
  }

  /**
   * 🖥️ Envoyer à la console
   */
  private sendToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level}]`;
    const source = entry.source ? ` [${entry.source}]` : '';
    const message = `${prefix}${source} ${entry.message}`;

    switch (entry.level) {
      case 'DEBUG':
        console.log(message, entry.data);
        break;
      case 'INFO':
        console.info(message, entry.data);
        break;
      case 'WARN':
        console.warn(message, entry.data);
        break;
      case 'ERROR':
        console.error(message, entry.data);
        break;
    }
  }

  /**
   * 📁 Envoyer au fichier (simulation)
   */
  private sendToFile(entry: LogEntry): void {
    // En production, cela pourrait envoyer à un fichier de log
    // Pour l'instant, on simule avec localStorage
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(entry);
      
      // Garder seulement les 100 derniers logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // Ignorer les erreurs de localStorage
    }
  }

  /**
   * 🌐 Envoyer à un service distant (simulation)
   */
  private sendToRemote(entry: LogEntry): void {
    // En production, cela pourrait envoyer à Sentry, LogRocket, etc.
    // Pour l'instant, on simule
    if (entry.level === 'ERROR') {
      // Envoyer les erreurs à un service de monitoring
      this.sendErrorToMonitoring(entry);
    }
  }

  /**
   * 🚨 Envoyer les erreurs au monitoring
   */
  private sendErrorToMonitoring(entry: LogEntry): void {
    // Simulation d'envoi à Sentry ou autre service
    try {
      // En production, remplacer par l'API réelle
      console.warn('Error sent to monitoring:', entry.message);
    } catch (error) {
      // Ignorer les erreurs d'envoi
    }
  }

  /**
   * 🔍 Obtenir la source du log
   */
  private getSource(): string {
    try {
      const stack = new Error().stack;
      if (stack) {
        const lines = stack.split('\n');
        // Chercher la première ligne qui n'est pas dans ce fichier
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (line && !line.includes('logger.ts') && !line.includes('Logger.log')) {
            const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
            if (match) {
              return `${match[2]}:${match[3]}`;
            }
          }
        }
      }
    } catch (error) {
      // Ignorer les erreurs
    }
    
    return 'unknown';
  }

  /**
   * 👤 Obtenir l'ID utilisateur actuel
   */
  private getCurrentUserId(): string | undefined {
    try {
      // Récupérer depuis le contexte d'authentification
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.id;
      }
    } catch (error) {
      // Ignorer les erreurs
    }
    return undefined;
  }

  /**
   * 🔑 Obtenir l'ID de session actuel
   */
  private getCurrentSessionId(): string | undefined {
    try {
      return sessionStorage.getItem('session_id') || undefined;
    } catch (error) {
      // Ignorer les erreurs
    }
    return undefined;
  }

  /**
   * 📊 Obtenir les logs en mémoire
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * 🧹 Nettoyer les logs en mémoire
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * ⚙️ Configurer le logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 📊 Obtenir les statistiques des logs
   */
  getStats(): {
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    logsBySource: Record<string, number>;
    averageLogSize: number;
    errorRate: number;
  } {
    const logsByLevel: Record<LogLevel, number> = {
      'DEBUG': 0,
      'INFO': 0,
      'WARN': 0,
      'ERROR': 0
    };

    const logsBySource: Record<string, number> = {};
    let totalSize = 0;

    this.logs.forEach(log => {
      logsByLevel[log.level]++;
      logsBySource[log.source || 'unknown'] = (logsBySource[log.source || 'unknown'] || 0) + 1;
      totalSize += JSON.stringify(log).length;
    });

    return {
      totalLogs: this.logs.length,
      logsByLevel,
      logsBySource,
      averageLogSize: this.logs.length > 0 ? totalSize / this.logs.length : 0,
      errorRate: this.logs.length > 0 ? logsByLevel.ERROR / this.logs.length : 0
    };
  }
}

// Instance globale
export const logger = new Logger();

// Export des types pour TypeScript
export type { LogEntry, LoggerConfig };

// Hook React pour utiliser le logger
export const useLogger = () => {
  return {
    debug: (message: string, data?: any, source?: string) => logger.debug(message, data, source),
    info: (message: string, data?: any, source?: string) => logger.info(message, data, source),
    warn: (message: string, data?: any, source?: string) => logger.warn(message, data, source),
    error: (message: string, error?: any, source?: string) => logger.error(message, error, source),
    getLogs: (level?: LogLevel) => logger.getLogs(level),
    clearLogs: () => logger.clearLogs(),
    getStats: () => logger.getStats(),
    configure: (config: Partial<LoggerConfig>) => logger.configure(config)
  };
};
