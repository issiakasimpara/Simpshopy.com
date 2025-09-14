/**
 * 🔐 Limiteur de taux (Rate Limiter) côté client
 * Protection contre les attaques par déni de service et les abus
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (context: any) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Nettoyer les entrées expirées toutes les minutes
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * 🔐 Vérifier si une requête est autorisée
   */
  public isAllowed(context: any = {}): boolean {
    const key = this.getKey(context);
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      // Première requête
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return true;
    }

    if (now > entry.resetTime) {
      // Fenêtre expirée, réinitialiser
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return true;
    }

    if (entry.count >= this.config.maxRequests) {
      // Limite atteinte
      return false;
    }

    // Incrémenter le compteur
    entry.count++;
    this.limits.set(key, entry);
    return true;
  }

  /**
   * 🔐 Obtenir le temps restant avant reset
   */
  public getTimeUntilReset(context: any = {}): number {
    const key = this.getKey(context);
    const entry = this.limits.get(key);
    
    if (!entry) return 0;
    
    const now = Date.now();
    return Math.max(0, entry.resetTime - now);
  }

  /**
   * 🔐 Obtenir le nombre de requêtes restantes
   */
  public getRemainingRequests(context: any = {}): number {
    const key = this.getKey(context);
    const entry = this.limits.get(key);
    
    if (!entry) return this.config.maxRequests;
    
    const now = Date.now();
    if (now > entry.resetTime) {
      return this.config.maxRequests;
    }
    
    return Math.max(0, this.config.maxRequests - entry.count);
  }

  /**
   * 🔐 Générer une clé unique pour le contexte
   */
  private getKey(context: any): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(context);
    }
    
    // Clé par défaut basée sur l'URL et l'utilisateur
    const userId = context.userId || 'anonymous';
    const endpoint = context.endpoint || window.location.pathname;
    return `${userId}:${endpoint}`;
  }

  /**
   * 🔐 Nettoyer les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  /**
   * 🔐 Réinitialiser un limiteur spécifique
   */
  public reset(context: any = {}): void {
    const key = this.getKey(context);
    this.limits.delete(key);
  }

  /**
   * 🔐 Réinitialiser tous les limiteurs
   */
  public resetAll(): void {
    this.limits.clear();
  }
}

// 🔐 Limiteurs prédéfinis pour différents types d'opérations
export const rateLimiters = {
  // Limiteur pour les requêtes API générales
  api: new RateLimiter({
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (context) => `api:${context.userId || 'anonymous'}:${context.endpoint || 'general'}`
  }),

  // Limiteur pour les tentatives de connexion
  auth: new RateLimiter({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (context) => `auth:${context.ip || 'unknown'}:${context.userAgent || 'unknown'}`
  }),

  // Limiteur pour les uploads de fichiers
  upload: new RateLimiter({
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 heure
    keyGenerator: (context) => `upload:${context.userId || 'anonymous'}`
  }),

  // Limiteur pour les recherches
  search: new RateLimiter({
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (context) => `search:${context.userId || 'anonymous'}`
  }),

  // Limiteur pour les formulaires de contact
  contact: new RateLimiter({
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 heure
    keyGenerator: (context) => `contact:${context.ip || 'unknown'}`
  }),

  // Limiteur pour les paiements
  payment: new RateLimiter({
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (context) => `payment:${context.userId || 'anonymous'}`
  }),
};

/**
 * 🔐 Hook pour utiliser le rate limiting dans React
 */
export const useRateLimit = (limiterType: keyof typeof rateLimiters, context?: any) => {
  const limiter = rateLimiters[limiterType];
  
  const checkRateLimit = (): boolean => {
    return limiter.isAllowed(context);
  };

  const getTimeUntilReset = (): number => {
    return limiter.getTimeUntilReset(context);
  };

  const getRemainingRequests = (): number => {
    return limiter.getRemainingRequests(context);
  };

  const reset = (): void => {
    limiter.reset(context);
  };

  return {
    checkRateLimit,
    getTimeUntilReset,
    getRemainingRequests,
    reset,
    isAllowed: checkRateLimit()
  };
};

/**
 * 🔐 Wrapper pour les fonctions avec rate limiting
 */
export const withRateLimit = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  limiterType: keyof typeof rateLimiters,
  context?: any
) => {
  return async (...args: T): Promise<R> => {
    const limiter = rateLimiters[limiterType];
    
    if (!limiter.isAllowed(context)) {
      const timeUntilReset = limiter.getTimeUntilReset(context);
      throw new Error(`Trop de requêtes. Réessayez dans ${Math.ceil(timeUntilReset / 1000)} secondes.`);
    }
    
    return await fn(...args);
  };
};

/**
 * 🔐 Middleware pour les requêtes fetch avec rate limiting
 */
export const createRateLimitedFetch = (limiterType: keyof typeof rateLimiters) => {
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    const limiter = rateLimiters[limiterType];
    const context = {
      endpoint: url,
      userId: options.headers?.['X-User-ID'] as string,
      ip: options.headers?.['X-Forwarded-For'] as string,
    };

    if (!limiter.isAllowed(context)) {
      const timeUntilReset = limiter.getTimeUntilReset(context);
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(timeUntilReset / 1000)} seconds.`);
    }

    return fetch(url, options);
  };
};

/**
 * 🔐 Fonction utilitaire pour afficher les informations de rate limit
 */
export const getRateLimitInfo = (limiterType: keyof typeof rateLimiters, context?: any) => {
  const limiter = rateLimiters[limiterType];
  
  return {
    remaining: limiter.getRemainingRequests(context),
    resetTime: limiter.getTimeUntilReset(context),
    isAllowed: limiter.isAllowed(context)
  };
};

/**
 * 🔐 Initialiser le rate limiting global
 */
export const initializeRateLimiting = (): void => {
  // Nettoyer le localStorage des anciennes données de rate limiting
  const keysToRemove = Object.keys(localStorage).filter(key => 
    key.startsWith('rateLimit_')
  );
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  // Logger l'initialisation en développement
  if (import.meta.env.DEV) {
    console.log('🔐 Rate limiting initialisé');
  }
};
