/**
 * 🔐 Utilitaires de validation des entrées utilisateur
 * Protection contre les injections et les attaques XSS
 */

// Types de validation
export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  sanitize?: boolean;
  type?: 'email' | 'url' | 'phone' | 'number' | 'text';
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
};

/**
 * 🔐 Sanitiser une chaîne de caractères
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Supprimer les balises HTML
    .replace(/javascript:/gi, '') // Supprimer les protocoles JavaScript
    .replace(/on\w+=/gi, '') // Supprimer les gestionnaires d'événements
    .replace(/script/gi, '') // Supprimer les scripts
    .trim();
};

/**
 * 🔐 Valider un email
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const sanitized = sanitizeString(email);

  if (!sanitized) {
    errors.push('Email requis');
    return { isValid: false, errors };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(sanitized)) {
    errors.push('Format d\'email invalide');
  }

  if (sanitized.length > 254) {
    errors.push('Email trop long');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? sanitized : undefined
  };
};

/**
 * 🔐 Valider une URL
 */
export const validateUrl = (url: string): ValidationResult => {
  const errors: string[] = [];
  const sanitized = sanitizeString(url);

  if (!sanitized) {
    errors.push('URL requise');
    return { isValid: false, errors };
  }

  try {
    const urlObj = new URL(sanitized);
    
    // Vérifier que c'est HTTPS en production
    if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
      errors.push('Protocole invalide');
    }

    // Vérifier les domaines dangereux
    const dangerousDomains = ['localhost', '127.0.0.1', '0.0.0.0'];
    if (dangerousDomains.includes(urlObj.hostname)) {
      errors.push('Domaine non autorisé');
    }

  } catch {
    errors.push('Format d\'URL invalide');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? sanitized : undefined
  };
};

/**
 * 🔐 Valider un numéro de téléphone
 */
export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  const sanitized = sanitizeString(phone);

  if (!sanitized) {
    errors.push('Numéro de téléphone requis');
    return { isValid: false, errors };
  }

  // Pattern pour numéros internationaux
  const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phonePattern.test(sanitized.replace(/[\s\-\(\)]/g, ''))) {
    errors.push('Format de numéro invalide');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? sanitized : undefined
  };
};

/**
 * 🔐 Valider un nombre
 */
export const validateNumber = (input: string | number, min?: number, max?: number): ValidationResult => {
  const errors: string[] = [];
  const num = typeof input === 'string' ? parseFloat(input) : input;

  if (isNaN(num)) {
    errors.push('Valeur numérique invalide');
    return { isValid: false, errors };
  }

  if (min !== undefined && num < min) {
    errors.push(`Valeur minimale: ${min}`);
  }

  if (max !== undefined && num > max) {
    errors.push(`Valeur maximale: ${max}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? num.toString() : undefined
  };
};

/**
 * 🔐 Valider du texte générique
 */
export const validateText = (input: string, rules: ValidationRule = {}): ValidationResult => {
  const errors: string[] = [];
  const sanitized = rules.sanitize !== false ? sanitizeString(input) : input;

  if (rules.required && !sanitized) {
    errors.push('Champ requis');
    return { isValid: false, errors };
  }

  if (rules.minLength && sanitized.length < rules.minLength) {
    errors.push(`Longueur minimale: ${rules.minLength} caractères`);
  }

  if (rules.maxLength && sanitized.length > rules.maxLength) {
    errors.push(`Longueur maximale: ${rules.maxLength} caractères`);
  }

  if (rules.pattern && !rules.pattern.test(sanitized)) {
    errors.push('Format invalide');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? sanitized : undefined
  };
};

/**
 * 🔐 Valider un objet avec plusieurs champs
 */
export const validateObject = (obj: Record<string, any>, schema: Record<string, ValidationRule>): {
  isValid: boolean;
  errors: Record<string, string[]>;
  sanitizedData: Record<string, any>;
} => {
  const errors: Record<string, string[]> = {};
  const sanitizedData: Record<string, any> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = obj[field];
    let result: ValidationResult;

    switch (rules.type) {
      case 'email':
        result = validateEmail(value);
        break;
      case 'url':
        result = validateUrl(value);
        break;
      case 'phone':
        result = validatePhone(value);
        break;
      case 'number':
        result = validateNumber(value, rules.minLength, rules.maxLength);
        break;
      default:
        result = validateText(value, rules);
    }

    if (!result.isValid) {
      errors[field] = result.errors;
    } else if (result.sanitizedValue !== undefined) {
      sanitizedData[field] = result.sanitizedValue;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};

/**
 * 🔐 Valider les données d'un formulaire de produit
 */
export const validateProductData = (data: any) => {
  const schema = {
    name: { required: true, minLength: 1, maxLength: 255, type: 'text' as const },
    description: { maxLength: 2000, type: 'text' as const },
    price: { required: true, type: 'number' as const },
    category: { maxLength: 100, type: 'text' as const },
    sku: { maxLength: 100, type: 'text' as const },
    stock: { type: 'number' as const }
  };

  return validateObject(data, schema);
};

/**
 * 🔐 Valider les données d'un formulaire de contact
 */
export const validateContactData = (data: any) => {
  const schema = {
    name: { required: true, minLength: 2, maxLength: 100, type: 'text' as const },
    email: { required: true, type: 'email' as const },
    phone: { type: 'phone' as const },
    message: { required: true, minLength: 10, maxLength: 1000, type: 'text' as const }
  };

  return validateObject(data, schema);
};

/**
 * 🔐 Valider les données d'authentification
 */
export const validateAuthData = (data: any) => {
  const schema = {
    email: { required: true, type: 'email' as const },
    password: { 
      required: true, 
      minLength: 8, 
      maxLength: 128,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      type: 'text' as const 
    }
  };

  return validateObject(data, schema);
};
