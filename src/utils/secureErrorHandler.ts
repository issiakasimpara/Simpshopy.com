/**
 * 🔐 Gestionnaire d'erreurs sécurisé
 * Évite l'exposition d'informations sensibles dans les erreurs
 */

interface SecureError {
  message: string;
  code: string;
  timestamp: string;
  userId?: string;
  requestId?: string;
}

interface ErrorContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  userAgent?: string;
  ip?: string;
}

/**
 * 🔐 Messages d'erreur sécurisés (sans informations sensibles)
 */
const SECURE_ERROR_MESSAGES = {
  // Erreurs d'authentification
  AUTH_INVALID_CREDENTIALS: 'Identifiants invalides',
  AUTH_TOKEN_EXPIRED: 'Session expirée',
  AUTH_INSUFFICIENT_PERMISSIONS: 'Permissions insuffisantes',
  AUTH_ACCOUNT_LOCKED: 'Compte verrouillé temporairement',
  
  // Erreurs de validation
  VALIDATION_INVALID_INPUT: 'Données invalides',
  VALIDATION_MISSING_REQUIRED_FIELD: 'Champ requis manquant',
  VALIDATION_INVALID_FORMAT: 'Format invalide',
  
  // Erreurs de base de données
  DB_CONNECTION_ERROR: 'Erreur de connexion à la base de données',
  DB_QUERY_ERROR: 'Erreur lors de l\'exécution de la requête',
  DB_CONSTRAINT_VIOLATION: 'Violation de contrainte de données',
  
  // Erreurs de fichiers
  FILE_UPLOAD_ERROR: 'Erreur lors du téléchargement',
  FILE_INVALID_TYPE: 'Type de fichier non autorisé',
  FILE_SIZE_EXCEEDED: 'Taille de fichier dépassée',
  
  // Erreurs de paiement
  PAYMENT_FAILED: 'Paiement échoué',
  PAYMENT_INVALID_CARD: 'Carte de paiement invalide',
  PAYMENT_INSUFFICIENT_FUNDS: 'Fonds insuffisants',
  
  // Erreurs génériques
  INTERNAL_SERVER_ERROR: 'Erreur interne du serveur',
  SERVICE_UNAVAILABLE: 'Service temporairement indisponible',
  RATE_LIMIT_EXCEEDED: 'Trop de requêtes, veuillez réessayer plus tard',
  NETWORK_ERROR: 'Erreur de réseau',
};

/**
 * 🔐 Types d'erreurs sensibles à masquer
 */
const SENSITIVE_ERROR_PATTERNS = [
  /password/i,
  /token/i,
  /key/i,
  /secret/i,
  /credential/i,
  /auth/i,
  /jwt/i,
  /session/i,
  /cookie/i,
  /database/i,
  /connection/i,
  /sql/i,
  /query/i,
  /stack/i,
  /trace/i,
];

/**
 * 🔐 Masquer les informations sensibles dans un message d'erreur
 */
export const sanitizeErrorMessage = (error: any): string => {
  if (!error) return 'Erreur inconnue';

  let message = '';
  
  if (typeof error === 'string') {
    message = error;
  } else if (error.message) {
    message = error.message;
  } else if (error.error) {
    message = error.error;
  } else {
    message = 'Erreur inconnue';
  }

  // Vérifier si le message contient des informations sensibles
  const containsSensitiveInfo = SENSITIVE_ERROR_PATTERNS.some(pattern => 
    pattern.test(message)
  );

  if (containsSensitiveInfo) {
    return SECURE_ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
  }

  // Limiter la longueur du message
  if (message.length > 200) {
    message = message.substring(0, 197) + '...';
  }

  return message;
};

/**
 * 🔐 Créer une erreur sécurisée
 */
export const createSecureError = (
  code: string,
  originalError?: any,
  context?: ErrorContext
): SecureError => {
  const message = SECURE_ERROR_MESSAGES[code as keyof typeof SECURE_ERROR_MESSAGES] || 
                  sanitizeErrorMessage(originalError);

  return {
    message,
    code,
    timestamp: new Date().toISOString(),
    userId: context?.userId,
    requestId: context?.requestId,
  };
};

/**
 * 🔐 Logger sécurisé des erreurs
 */
export const logSecureError = (
  error: any,
  context?: ErrorContext
): void => {
  // En production, ne logger que les erreurs non sensibles
  if (import.meta.env.PROD) {
    const sanitizedMessage = sanitizeErrorMessage(error);
    
    // Logger uniquement si le message n'est pas sensible
    if (sanitizedMessage !== SECURE_ERROR_MESSAGES.INTERNAL_SERVER_ERROR) {
      console.error('Erreur sécurisée:', {
        message: sanitizedMessage,
        code: error.code || 'UNKNOWN',
        timestamp: new Date().toISOString(),
        context: {
          userId: context?.userId,
          requestId: context?.requestId,
          endpoint: context?.endpoint,
        }
      });
    }
  } else {
    // En développement, logger plus d'informations
    console.error('Erreur détaillée:', {
      error,
      context,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * 🔐 Gestionnaire d'erreurs pour les requêtes API
 */
export const handleApiError = (error: any, context?: ErrorContext): SecureError => {
  logSecureError(error, context);

  // Déterminer le code d'erreur basé sur le type d'erreur
  let errorCode = 'INTERNAL_SERVER_ERROR';

  if (error.status === 401) {
    errorCode = 'AUTH_INVALID_CREDENTIALS';
  } else if (error.status === 403) {
    errorCode = 'AUTH_INSUFFICIENT_PERMISSIONS';
  } else if (error.status === 429) {
    errorCode = 'RATE_LIMIT_EXCEEDED';
  } else if (error.status >= 500) {
    errorCode = 'SERVICE_UNAVAILABLE';
  } else if (error.name === 'ValidationError') {
    errorCode = 'VALIDATION_INVALID_INPUT';
  } else if (error.name === 'NetworkError') {
    errorCode = 'NETWORK_ERROR';
  }

  return createSecureError(errorCode, error, context);
};

/**
 * 🔐 Gestionnaire d'erreurs pour les formulaires
 */
export const handleFormError = (error: any, fieldName?: string): string => {
  const sanitizedMessage = sanitizeErrorMessage(error);
  
  if (fieldName) {
    return `Erreur dans le champ "${fieldName}": ${sanitizedMessage}`;
  }
  
  return sanitizedMessage;
};

/**
 * 🔐 Wrapper pour les fonctions async avec gestion d'erreurs sécurisée
 */
export const withSecureErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: ErrorContext
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const secureError = handleApiError(error, context);
      throw new Error(secureError.message);
    }
  };
};

/**
 * 🔐 Valider et nettoyer les données d'erreur avant envoi
 */
export const sanitizeErrorForClient = (error: any): any => {
  return {
    message: sanitizeErrorMessage(error),
    code: error.code || 'UNKNOWN',
    timestamp: new Date().toISOString(),
    // Ne pas inclure stack, details, ou autres informations sensibles
  };
};

/**
 * 🔐 Gestionnaire global d'erreurs pour l'application
 */
export const setupGlobalErrorHandler = (): void => {
  // Gestionnaire d'erreurs non capturées
  window.addEventListener('error', (event) => {
    logSecureError(event.error, {
      endpoint: window.location.pathname,
      userAgent: navigator.userAgent,
    });
  });

  // Gestionnaire d'erreurs de promesses non capturées
  window.addEventListener('unhandledrejection', (event) => {
    logSecureError(event.reason, {
      endpoint: window.location.pathname,
      userAgent: navigator.userAgent,
    });
  });
};
