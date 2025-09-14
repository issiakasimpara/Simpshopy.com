/**
 * 🔐 Protection CSRF (Cross-Site Request Forgery)
 * Génération et validation de tokens CSRF
 */

interface CSRFConfig {
  tokenLength: number;
  tokenExpiry: number; // en millisecondes
  storageKey: string;
}

class CSRFProtection {
  private config: CSRFConfig;
  private tokenCache: Map<string, { token: string; expiry: number }> = new Map();

  constructor(config: Partial<CSRFConfig> = {}) {
    this.config = {
      tokenLength: 32,
      tokenExpiry: 60 * 60 * 1000, // 1 heure
      storageKey: 'csrf_token',
      ...config
    };
  }

  /**
   * 🔐 Générer un token CSRF sécurisé
   */
  public generateToken(): string {
    const array = new Uint8Array(this.config.tokenLength);
    crypto.getRandomValues(array);
    
    // Convertir en base64 URL-safe
    const token = btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    // Stocker le token avec son expiration
    const expiry = Date.now() + this.config.tokenExpiry;
    this.tokenCache.set(token, { token, expiry });
    
    // Stocker aussi dans le localStorage pour persistance
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify({
        token,
        expiry
      }));
    } catch (error) {
      console.warn('Impossible de stocker le token CSRF:', error);
    }
    
    return token;
  }

  /**
   * 🔐 Valider un token CSRF
   */
  public validateToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Vérifier dans le cache
    const cached = this.tokenCache.get(token);
    if (cached && Date.now() < cached.expiry) {
      return true;
    }

    // Vérifier dans le localStorage
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const { token: storedToken, expiry } = JSON.parse(stored);
        if (storedToken === token && Date.now() < expiry) {
          // Mettre à jour le cache
          this.tokenCache.set(token, { token, expiry });
          return true;
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la validation du token CSRF:', error);
    }

    return false;
  }

  /**
   * 🔐 Obtenir le token actuel ou en générer un nouveau
   */
  public getToken(): string {
    // Essayer de récupérer un token existant valide
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const { token, expiry } = JSON.parse(stored);
        if (Date.now() < expiry) {
          this.tokenCache.set(token, { token, expiry });
          return token;
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération du token CSRF:', error);
    }

    // Générer un nouveau token
    return this.generateToken();
  }

  /**
   * 🔐 Invalider un token
   */
  public invalidateToken(token: string): void {
    this.tokenCache.delete(token);
    
    try {
      localStorage.removeItem(this.config.storageKey);
    } catch (error) {
      console.warn('Erreur lors de l\'invalidation du token CSRF:', error);
    }
  }

  /**
   * 🔐 Nettoyer les tokens expirés
   */
  public cleanup(): void {
    const now = Date.now();
    
    // Nettoyer le cache
    for (const [token, data] of this.tokenCache.entries()) {
      if (now >= data.expiry) {
        this.tokenCache.delete(token);
      }
    }
    
    // Nettoyer le localStorage
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const { expiry } = JSON.parse(stored);
        if (now >= expiry) {
          localStorage.removeItem(this.config.storageKey);
        }
      }
    } catch (error) {
      console.warn('Erreur lors du nettoyage des tokens CSRF:', error);
    }
  }

  /**
   * 🔐 Ajouter le token CSRF aux headers d'une requête
   */
  public addTokenToHeaders(headers: HeadersInit = {}): HeadersInit {
    const token = this.getToken();
    
    return {
      ...headers,
      'X-CSRF-Token': token,
      'X-Requested-With': 'XMLHttpRequest'
    };
  }

  /**
   * 🔐 Wrapper pour fetch avec protection CSRF
   */
  public secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const secureOptions: RequestInit = {
      ...options,
      headers: this.addTokenToHeaders(options.headers)
    };

    return fetch(url, secureOptions);
  }
}

// Instance globale
export const csrfProtection = new CSRFProtection();

// Nettoyage automatique toutes les 5 minutes
setInterval(() => {
  csrfProtection.cleanup();
}, 5 * 60 * 1000);

/**
 * 🔐 Hook React pour utiliser la protection CSRF
 */
export const useCSRF = () => {
  const getToken = () => csrfProtection.getToken();
  const validateToken = (token: string) => csrfProtection.validateToken(token);
  const invalidateToken = (token: string) => csrfProtection.invalidateToken(token);
  const secureFetch = (url: string, options?: RequestInit) => 
    csrfProtection.secureFetch(url, options);

  return {
    getToken,
    validateToken,
    invalidateToken,
    secureFetch
  };
};

/**
 * 🔐 Middleware pour valider les tokens CSRF côté client
 */
export const withCSRFValidation = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    // Vérifier que nous avons un token CSRF valide
    const token = csrfProtection.getToken();
    if (!csrfProtection.validateToken(token)) {
      throw new Error('Token CSRF invalide ou expiré');
    }
    
    return await fn(...args);
  };
};

/**
 * 🔐 Fonction utilitaire pour ajouter la protection CSRF aux formulaires
 */
export const addCSRFToForm = (form: HTMLFormElement): void => {
  // Vérifier si un token CSRF existe déjà
  const existingToken = form.querySelector('input[name="csrf_token"]');
  if (existingToken) {
    return;
  }

  // Ajouter le token CSRF au formulaire
  const token = csrfProtection.getToken();
  const tokenInput = document.createElement('input');
  tokenInput.type = 'hidden';
  tokenInput.name = 'csrf_token';
  tokenInput.value = token;
  
  form.appendChild(tokenInput);
};

/**
 * 🔐 Initialiser la protection CSRF
 */
export const initializeCSRF = (): void => {
  // Générer un token initial
  csrfProtection.getToken();
  
  // Ajouter la protection CSRF à tous les formulaires existants
  document.querySelectorAll('form').forEach(addCSRFToForm);
  
  // Observer les nouveaux formulaires
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Vérifier si c'est un formulaire
          if (element.tagName === 'FORM') {
            addCSRFToForm(element as HTMLFormElement);
          }
          
          // Vérifier les formulaires dans les enfants
          element.querySelectorAll('form').forEach(addCSRFToForm);
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  if (import.meta.env.DEV) {
    console.log('🔐 Protection CSRF initialisée');
  }
};
