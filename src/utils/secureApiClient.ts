/**
 * 🔐 Client API sécurisé
 * Wrapper sécurisé pour les appels API avec validation et protection
 */

import { csrfProtection } from './csrfProtection';
import { rateLimiters } from './rateLimiter';
import { handleApiError, sanitizeErrorForClient } from './secureErrorHandler';
import { validateText } from './inputValidation';

interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  validateInput?: boolean;
  rateLimitType?: keyof typeof rateLimiters;
}

class SecureApiClient {
  private config: ApiConfig;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseURL: import.meta.env.VITE_API_BASE_URL || '',
      timeout: 30000, // 30 secondes
      retries: 3,
      retryDelay: 1000,
      ...config
    };
  }

  /**
   * 🔐 Effectuer une requête API sécurisée
   */
  public async request<T = any>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<T> {
    const {
      timeout = this.config.timeout,
      retries = this.config.retries,
      validateInput = true,
      rateLimitType = 'api',
      ...requestOptions
    } = options;

    // Validation des entrées
    if (validateInput) {
      this.validateEndpoint(endpoint);
      this.validateRequestOptions(requestOptions);
    }

    // Vérification du rate limiting
    const limiter = rateLimiters[rateLimitType];
    if (!limiter.isAllowed({ endpoint, userId: this.getCurrentUserId() })) {
      const timeUntilReset = limiter.getTimeUntilReset({ endpoint });
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(timeUntilReset / 1000)} seconds.`);
    }

    // Construction de l'URL
    const url = this.buildURL(endpoint);
    
    // Configuration de la requête
    const requestConfig: RequestInit = {
      ...requestOptions,
      headers: this.buildHeaders(requestOptions.headers),
      signal: this.createAbortSignal(timeout)
    };

    // Ajout de la protection CSRF
    if (requestConfig.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(requestConfig.method.toUpperCase())) {
      requestConfig.headers = csrfProtection.addTokenToHeaders(requestConfig.headers);
    }

    // Exécution avec retry
    return this.executeWithRetry(url, requestConfig, retries);
  }

  /**
   * 🔐 Méthodes HTTP sécurisées
   */
  public async get<T = any>(endpoint: string, options: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public async post<T = any>(endpoint: string, data?: any, options: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }

  public async put<T = any>(endpoint: string, data?: any, options: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }

  public async patch<T = any>(endpoint: string, data?: any, options: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }

  public async delete<T = any>(endpoint: string, options: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * 🔐 Validation de l'endpoint
   */
  private validateEndpoint(endpoint: string): void {
    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error('Endpoint invalide');
    }

    // Vérifier les caractères dangereux
    if (/[<>\"'&]/.test(endpoint)) {
      throw new Error('Endpoint contient des caractères non autorisés');
    }

    // Vérifier la longueur
    if (endpoint.length > 2048) {
      throw new Error('Endpoint trop long');
    }
  }

  /**
   * 🔐 Validation des options de requête
   */
  private validateRequestOptions(options: RequestInit): void {
    // Vérifier les headers
    if (options.headers) {
      const headers = options.headers as Record<string, string>;
      for (const [key, value] of Object.entries(headers)) {
        if (typeof key !== 'string' || typeof value !== 'string') {
          throw new Error('Headers invalides');
        }
        
        // Vérifier les headers dangereux
        const dangerousHeaders = ['host', 'referer', 'user-agent'];
        if (dangerousHeaders.includes(key.toLowerCase())) {
          throw new Error(`Header non autorisé: ${key}`);
        }
      }
    }

    // Vérifier le body
    if (options.body) {
      if (typeof options.body === 'string') {
        // Vérifier la taille
        if (options.body.length > 10 * 1024 * 1024) { // 10MB
          throw new Error('Body de requête trop volumineux');
        }
      }
    }
  }

  /**
   * 🔐 Construction de l'URL
   */
  private buildURL(endpoint: string): string {
    // Nettoyer l'endpoint
    const cleanEndpoint = endpoint.replace(/^\/+/, '').replace(/\/+$/, '');
    
    // Construire l'URL complète
    const baseURL = this.config.baseURL.replace(/\/+$/, '');
    return `${baseURL}/${cleanEndpoint}`;
  }

  /**
   * 🔐 Construction des headers
   */
  private buildHeaders(existingHeaders?: HeadersInit): HeadersInit {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Client-Version': '1.0.0',
      'X-Client-Platform': 'web',
      ...(existingHeaders as Record<string, string>)
    };

    // Ajouter l'authentification si disponible
    const authToken = this.getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return headers;
  }

  /**
   * 🔐 Créer un signal d'abandon
   */
  private createAbortSignal(timeout: number): AbortSignal {
    const controller = new AbortController();
    const requestId = Math.random().toString(36).substring(7);
    
    this.abortControllers.set(requestId, controller);
    
    // Timeout automatique
    setTimeout(() => {
      controller.abort();
      this.abortControllers.delete(requestId);
    }, timeout);

    return controller.signal;
  }

  /**
   * 🔐 Exécution avec retry
   */
  private async executeWithRetry<T>(
    url: string,
    config: RequestInit,
    retries: number
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;

      } catch (error) {
        lastError = error as Error;
        
        // Ne pas retry pour certaines erreurs
        if (error instanceof Error) {
          if (error.name === 'AbortError' || 
              error.message.includes('400') || 
              error.message.includes('401') || 
              error.message.includes('403')) {
            break;
          }
        }

        // Attendre avant le prochain essai
        if (attempt < retries) {
          await new Promise(resolve => 
            setTimeout(resolve, this.config.retryDelay * Math.pow(2, attempt))
          );
        }
      }
    }

    // Gérer l'erreur finale
    const secureError = handleApiError(lastError, {
      endpoint: url,
      userId: this.getCurrentUserId()
    });

    throw new Error(secureError.message);
  }

  /**
   * 🔐 Obtenir le token d'authentification
   */
  private getAuthToken(): string | null {
    try {
      // Essayer de récupérer depuis le localStorage
      const token = localStorage.getItem('auth_token');
      if (token && this.isValidToken(token)) {
        return token;
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération du token d\'auth:', error);
    }
    
    return null;
  }

  /**
   * 🔐 Valider un token d'authentification
   */
  private isValidToken(token: string): boolean {
    // Validation basique du format JWT
    if (!token || typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    try {
      // Vérifier l'expiration
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 🔐 Obtenir l'ID de l'utilisateur actuel
   */
  private getCurrentUserId(): string | null {
    try {
      const token = this.getAuthToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.user_id || null;
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération de l\'ID utilisateur:', error);
    }
    
    return null;
  }

  /**
   * 🔐 Annuler toutes les requêtes en cours
   */
  public cancelAllRequests(): void {
    for (const [id, controller] of this.abortControllers.entries()) {
      controller.abort();
      this.abortControllers.delete(id);
    }
  }
}

// Instance globale
export const secureApiClient = new SecureApiClient();

// Nettoyage automatique des contrôleurs d'abandon
setInterval(() => {
  secureApiClient.cancelAllRequests();
}, 5 * 60 * 1000);

/**
 * 🔐 Hook React pour utiliser le client API sécurisé
 */
export const useSecureApi = () => {
  return {
    get: secureApiClient.get.bind(secureApiClient),
    post: secureApiClient.post.bind(secureApiClient),
    put: secureApiClient.put.bind(secureApiClient),
    patch: secureApiClient.patch.bind(secureApiClient),
    delete: secureApiClient.delete.bind(secureApiClient),
    request: secureApiClient.request.bind(secureApiClient)
  };
};
