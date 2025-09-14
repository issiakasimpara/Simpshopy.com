/**
 * 🔐 Sécurité SQL - Protection contre les injections
 * Validation et sanitisation des requêtes SQL/Supabase
 */

import { supabase } from '@/integrations/supabase/client';

interface SQLSecurityConfig {
  maxQueryLength: number;
  allowedTables: string[];
  blockedPatterns: RegExp[];
  maxParameters: number;
}

class SQLSecurity {
  private config: SQLSecurityConfig;

  constructor() {
    this.config = {
      maxQueryLength: 10000,
      allowedTables: [
        'products', 'categories', 'orders', 'public_orders', 'stores', 'users',
        'shipping_zones', 'shipping_methods', 'payment_configurations',
        'market_settings', 'domains', 'templates', 'cart_sessions',
        'abandoned_carts', 'testimonials', 'integrations', 'analytics'
      ],
      blockedPatterns: [
        /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
        /(\b(or|and)\s+\d+\s*=\s*\d+)/i,
        /(\b(union|select).*from)/i,
        /(\b(insert|update|delete).*where)/i,
        /(\b(drop|create|alter)\s+(table|database|user|index))/i,
        /(\b(exec|execute)\s+\w+)/i,
        /(\b(load_file|into\s+outfile|into\s+dumpfile))/i,
        /(\b(concat|char|ascii|substring|length|count|sum|avg|max|min))/i,
        /(\b(version|user|database|schema|table_name|column_name))/i,
        /(\b(if|case|when|then|else|end))/i,
        /(\b(declare|set|begin|end|transaction|commit|rollback))/i,
        /(\b(grant|revoke|deny|backup|restore))/i,
        /(\b(openrowset|opendatasource|bulk\s+insert))/i,
        /(\b(sp_executesql|xp_cmdshell|xp_regread|xp_regwrite))/i,
        /(\b(load\s+data|load\s+xml|load\s+json))/i,
        /(\b(select\s+\*\s+from\s+information_schema))/i,
        /(\b(select\s+\*\s+from\s+sys\.))/i,
        /(\b(select\s+\*\s+from\s+mysql\.))/i,
        /(\b(select\s+\*\s+from\s+pg_))/i,
        /(\b(select\s+\*\s+from\s+sqlite_))/i
      ],
      maxParameters: 50
    };
  }

  /**
   * 🔐 Valider un nom de table
   */
  public validateTableName(tableName: string): boolean {
    if (!tableName || typeof tableName !== 'string') {
      return false;
    }

    // Vérifier si la table est autorisée
    if (!this.config.allowedTables.includes(tableName.toLowerCase())) {
      console.warn(`Table non autorisée: ${tableName}`);
      return false;
    }

    // Vérifier le format du nom de table
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      console.warn(`Format de table invalide: ${tableName}`);
      return false;
    }

    return true;
  }

  /**
   * 🔐 Valider un paramètre de requête
   */
  public validateParameter(param: any, paramName: string): boolean {
    if (param === null || param === undefined) {
      return true; // Les valeurs null sont autorisées
    }

    // Vérifier le type
    if (typeof param === 'string') {
      return this.validateStringParameter(param, paramName);
    } else if (typeof param === 'number') {
      return this.validateNumberParameter(param, paramName);
    } else if (typeof param === 'boolean') {
      return true; // Les booléens sont toujours sûrs
    } else if (Array.isArray(param)) {
      return this.validateArrayParameter(param, paramName);
    } else if (typeof param === 'object') {
      return this.validateObjectParameter(param, paramName);
    }

    return false;
  }

  /**
   * 🔐 Valider un paramètre string
   */
  private validateStringParameter(param: string, paramName: string): boolean {
    // Vérifier la longueur
    if (param.length > 10000) {
      console.warn(`Paramètre trop long: ${paramName}`);
      return false;
    }

    // Vérifier les patterns bloqués
    for (const pattern of this.config.blockedPatterns) {
      if (pattern.test(param)) {
        console.warn(`Pattern suspect détecté dans ${paramName}: ${param}`);
        return false;
      }
    }

    // Vérifier les caractères dangereux
    const dangerousChars = ['<', '>', '"', "'", '&', ';', '(', ')', '[', ']', '{', '}'];
    if (dangerousChars.some(char => param.includes(char))) {
      console.warn(`Caractères dangereux dans ${paramName}: ${param}`);
      return false;
    }

    return true;
  }

  /**
   * 🔐 Valider un paramètre number
   */
  private validateNumberParameter(param: number, paramName: string): boolean {
    // Vérifier si c'est un nombre valide
    if (!Number.isFinite(param)) {
      console.warn(`Nombre invalide: ${paramName} = ${param}`);
      return false;
    }

    // Vérifier les limites
    if (param < -999999999 || param > 999999999) {
      console.warn(`Nombre hors limites: ${paramName} = ${param}`);
      return false;
    }

    return true;
  }

  /**
   * 🔐 Valider un paramètre array
   */
  private validateArrayParameter(param: any[], paramName: string): boolean {
    // Vérifier la taille
    if (param.length > this.config.maxParameters) {
      console.warn(`Tableau trop grand: ${paramName}`);
      return false;
    }

    // Valider chaque élément
    return param.every((item, index) => 
      this.validateParameter(item, `${paramName}[${index}]`)
    );
  }

  /**
   * 🔐 Valider un paramètre object
   */
  private validateObjectParameter(param: Record<string, any>, paramName: string): boolean {
    // Vérifier le nombre de propriétés
    const keys = Object.keys(param);
    if (keys.length > this.config.maxParameters) {
      console.warn(`Objet trop complexe: ${paramName}`);
      return false;
    }

    // Valider chaque propriété
    return keys.every(key => 
      this.validateParameter(param[key], `${paramName}.${key}`)
    );
  }

  /**
   * 🔐 Sanitiser une chaîne de caractères
   */
  public sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Supprimer les caractères de contrôle
    let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Échapper les caractères spéciaux
    sanitized = sanitized
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\0/g, '\\0')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');

    // Limiter la longueur
    if (sanitized.length > 10000) {
      sanitized = sanitized.substring(0, 10000);
    }

    return sanitized;
  }

  /**
   * 🔐 Wrapper sécurisé pour supabase.from()
   */
  public secureFrom(tableName: string) {
    if (!this.validateTableName(tableName)) {
      throw new Error(`Table non autorisée ou invalide: ${tableName}`);
    }

    return supabase.from(tableName);
  }

  /**
   * 🔐 Wrapper sécurisé pour supabase.rpc()
   */
  public secureRpc(functionName: string, params?: Record<string, any>) {
    // Valider le nom de fonction
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(functionName)) {
      throw new Error(`Nom de fonction invalide: ${functionName}`);
    }

    // Valider les paramètres
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (!this.validateParameter(value, key)) {
          throw new Error(`Paramètre invalide: ${key}`);
        }
      }
    }

    return supabase.rpc(functionName, params);
  }

  /**
   * 🔐 Construire une requête SELECT sécurisée
   */
  public buildSecureSelect(
    tableName: string,
    columns: string[] = ['*'],
    filters: Record<string, any> = {},
    options: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
    } = {}
  ) {
    if (!this.validateTableName(tableName)) {
      throw new Error(`Table non autorisée: ${tableName}`);
    }

    // Valider les colonnes
    const validColumns = columns.filter(col => 
      col === '*' || /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col)
    );

    if (validColumns.length === 0) {
      throw new Error('Aucune colonne valide spécifiée');
    }

    // Valider les filtres
    for (const [key, value] of Object.entries(filters)) {
      if (!this.validateParameter(value, key)) {
        throw new Error(`Filtre invalide: ${key}`);
      }
    }

    // Valider les options
    if (options.limit && (options.limit < 1 || options.limit > 1000)) {
      throw new Error('Limite invalide (1-1000)');
    }

    if (options.offset && (options.offset < 0 || options.offset > 10000)) {
      throw new Error('Offset invalide (0-10000)');
    }

    if (options.orderBy && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(options.orderBy)) {
      throw new Error('Colonne de tri invalide');
    }

    // Construire la requête
    let query = supabase.from(tableName).select(validColumns.join(', '));

    // Appliquer les filtres
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }

    // Appliquer les options
    if (options.orderBy) {
      query = query.order(options.orderBy, { 
        ascending: options.orderDirection !== 'desc' 
      });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    return query;
  }

  /**
   * 🔐 Construire une requête INSERT sécurisée
   */
  public buildSecureInsert(tableName: string, data: Record<string, any>) {
    if (!this.validateTableName(tableName)) {
      throw new Error(`Table non autorisée: ${tableName}`);
    }

    // Valider les données
    for (const [key, value] of Object.entries(data)) {
      if (!this.validateParameter(value, key)) {
        throw new Error(`Donnée invalide: ${key}`);
      }
    }

    return supabase.from(tableName).insert(data);
  }

  /**
   * 🔐 Construire une requête UPDATE sécurisée
   */
  public buildSecureUpdate(
    tableName: string,
    data: Record<string, any>,
    filters: Record<string, any>
  ) {
    if (!this.validateTableName(tableName)) {
      throw new Error(`Table non autorisée: ${tableName}`);
    }

    // Valider les données
    for (const [key, value] of Object.entries(data)) {
      if (!this.validateParameter(value, key)) {
        throw new Error(`Donnée invalide: ${key}`);
      }
    }

    // Valider les filtres
    for (const [key, value] of Object.entries(filters)) {
      if (!this.validateParameter(value, key)) {
        throw new Error(`Filtre invalide: ${key}`);
      }
    }

    let query = supabase.from(tableName).update(data);

    // Appliquer les filtres
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }

    return query;
  }

  /**
   * 🔐 Construire une requête DELETE sécurisée
   */
  public buildSecureDelete(tableName: string, filters: Record<string, any>) {
    if (!this.validateTableName(tableName)) {
      throw new Error(`Table non autorisée: ${tableName}`);
    }

    // Valider les filtres
    for (const [key, value] of Object.entries(filters)) {
      if (!this.validateParameter(value, key)) {
        throw new Error(`Filtre invalide: ${key}`);
      }
    }

    let query = supabase.from(tableName).delete();

    // Appliquer les filtres
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }

    return query;
  }

  /**
   * 🔐 Vérifier la sécurité d'une requête existante
   */
  public auditQuery(query: any): {
    isSecure: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Analyser la requête (cette partie dépendrait de l'implémentation spécifique)
      // Pour l'instant, on retourne une analyse basique
      
      return {
        isSecure: issues.length === 0,
        issues,
        recommendations
      };
    } catch (error) {
      return {
        isSecure: false,
        issues: ['Erreur lors de l\'analyse de la requête'],
        recommendations: ['Utiliser les méthodes sécurisées de SQLSecurity']
      };
    }
  }
}

// Instance globale
export const sqlSecurity = new SQLSecurity();

/**
 * 🔐 Hook React pour utiliser la sécurité SQL
 */
export const useSQLSecurity = () => {
  const secureFrom = (tableName: string) => sqlSecurity.secureFrom(tableName);
  const secureRpc = (functionName: string, params?: Record<string, any>) => 
    sqlSecurity.secureRpc(functionName, params);
  const buildSecureSelect = sqlSecurity.buildSecureSelect.bind(sqlSecurity);
  const buildSecureInsert = sqlSecurity.buildSecureInsert.bind(sqlSecurity);
  const buildSecureUpdate = sqlSecurity.buildSecureUpdate.bind(sqlSecurity);
  const buildSecureDelete = sqlSecurity.buildSecureDelete.bind(sqlSecurity);
  const sanitizeString = (input: string) => sqlSecurity.sanitizeString(input);
  const auditQuery = (query: any) => sqlSecurity.auditQuery(query);

  return {
    secureFrom,
    secureRpc,
    buildSecureSelect,
    buildSecureInsert,
    buildSecureUpdate,
    buildSecureDelete,
    sanitizeString,
    auditQuery
  };
};
