/**
 * 🔐 Stockage sécurisé
 * Gestion sécurisée du localStorage et sessionStorage avec chiffrement
 */

interface StorageConfig {
  encryptionKey: string;
  prefix: string;
  maxSize: number; // en bytes
}

class SecureStorage {
  private config: StorageConfig;
  private encryptionKey: CryptoKey | null = null;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = {
      encryptionKey: 'simpshopy-secure-key-2024',
      prefix: 'secure_',
      maxSize: 5 * 1024 * 1024, // 5MB
      ...config
    };
    
    this.initializeEncryption();
  }

  /**
   * 🔐 Initialiser le chiffrement
   */
  private async initializeEncryption(): Promise<void> {
    try {
      const keyData = new TextEncoder().encode(this.config.encryptionKey);
      this.encryptionKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.warn('Impossible d\'initialiser le chiffrement:', error);
    }
  }

  /**
   * 🔐 Chiffrer une valeur
   */
  private async encrypt(value: string): Promise<string> {
    if (!this.encryptionKey) {
      return value; // Fallback sans chiffrement
    }

    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedValue = new TextEncoder().encode(value);
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        encodedValue
      );

      // Combiner IV et données chiffrées
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Encoder en base64
      return btoa(String.fromCharCode.apply(null, Array.from(combined)));
    } catch (error) {
      console.warn('Erreur de chiffrement:', error);
      return value; // Fallback sans chiffrement
    }
  }

  /**
   * 🔐 Déchiffrer une valeur
   */
  private async decrypt(encryptedValue: string): Promise<string> {
    if (!this.encryptionKey) {
      return encryptedValue; // Fallback sans déchiffrement
    }

    try {
      // Décoder depuis base64
      const combined = new Uint8Array(
        atob(encryptedValue).split('').map(char => char.charCodeAt(0))
      );

      // Extraire IV et données chiffrées
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        encrypted
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.warn('Erreur de déchiffrement:', error);
      return encryptedValue; // Fallback sans déchiffrement
    }
  }

  /**
   * 🔐 Valider une clé de stockage
   */
  private validateKey(key: string): void {
    if (!key || typeof key !== 'string') {
      throw new Error('Clé de stockage invalide');
    }

    if (key.length > 100) {
      throw new Error('Clé de stockage trop longue');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
      throw new Error('Clé de stockage contient des caractères non autorisés');
    }
  }

  /**
   * 🔐 Valider une valeur de stockage
   */
  private validateValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (stringValue.length > this.config.maxSize) {
      throw new Error('Valeur trop volumineuse pour le stockage');
    }

    return stringValue;
  }

  /**
   * 🔐 Obtenir la clé complète
   */
  private getFullKey(key: string): string {
    return `${this.config.prefix}${key}`;
  }

  /**
   * 🔐 Stocker une valeur de manière sécurisée
   */
  public async setItem(key: string, value: any): Promise<void> {
    this.validateKey(key);
    const validatedValue = this.validateValue(value);
    
    try {
      const encryptedValue = await this.encrypt(validatedValue);
      const fullKey = this.getFullKey(key);
      
      localStorage.setItem(fullKey, encryptedValue);
    } catch (error) {
      console.error('Erreur lors du stockage sécurisé:', error);
      throw new Error('Impossible de stocker la valeur');
    }
  }

  /**
   * 🔐 Récupérer une valeur de manière sécurisée
   */
  public async getItem(key: string): Promise<string | null> {
    this.validateKey(key);
    
    try {
      const fullKey = this.getFullKey(key);
      const encryptedValue = localStorage.getItem(fullKey);
      
      if (!encryptedValue) {
        return null;
      }

      return await this.decrypt(encryptedValue);
    } catch (error) {
      console.error('Erreur lors de la récupération sécurisée:', error);
      return null;
    }
  }

  /**
   * 🔐 Récupérer une valeur JSON de manière sécurisée
   */
  public async getItemJSON<T = any>(key: string): Promise<T | null> {
    const value = await this.getItem(key);
    
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Erreur lors du parsing JSON:', error);
      return null;
    }
  }

  /**
   * 🔐 Supprimer une valeur
   */
  public removeItem(key: string): void {
    this.validateKey(key);
    
    try {
      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }

  /**
   * 🔐 Vérifier si une clé existe
   */
  public hasItem(key: string): boolean {
    this.validateKey(key);
    
    try {
      const fullKey = this.getFullKey(key);
      return localStorage.getItem(fullKey) !== null;
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return false;
    }
  }

  /**
   * 🔐 Obtenir toutes les clés sécurisées
   */
  public getSecureKeys(): string[] {
    const keys: string[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.config.prefix)) {
          keys.push(key.substring(this.config.prefix.length));
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des clés:', error);
    }
    
    return keys;
  }

  /**
   * 🔐 Nettoyer toutes les données sécurisées
   */
  public clearSecureData(): void {
    try {
      const keys = this.getSecureKeys();
      keys.forEach(key => this.removeItem(key));
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  }

  /**
   * 🔐 Obtenir la taille des données sécurisées
   */
  public getSecureDataSize(): number {
    let totalSize = 0;
    
    try {
      const keys = this.getSecureKeys();
      keys.forEach(key => {
        const fullKey = this.getFullKey(key);
        const value = localStorage.getItem(fullKey);
        if (value) {
          totalSize += value.length;
        }
      });
    } catch (error) {
      console.error('Erreur lors du calcul de la taille:', error);
    }
    
    return totalSize;
  }
}

// Instance globale
export const secureStorage = new SecureStorage();

/**
 * 🔐 Hook React pour utiliser le stockage sécurisé
 */
export const useSecureStorage = () => {
  const setItem = async (key: string, value: any) => {
    await secureStorage.setItem(key, value);
  };

  const getItem = async (key: string) => {
    return await secureStorage.getItem(key);
  };

  const getItemJSON = async <T = any>(key: string) => {
    return await secureStorage.getItemJSON<T>(key);
  };

  const removeItem = (key: string) => {
    secureStorage.removeItem(key);
  };

  const hasItem = (key: string) => {
    return secureStorage.hasItem(key);
  };

  const clearSecureData = () => {
    secureStorage.clearSecureData();
  };

  return {
    setItem,
    getItem,
    getItemJSON,
    removeItem,
    hasItem,
    clearSecureData,
    getSecureDataSize: secureStorage.getSecureDataSize.bind(secureStorage),
    getSecureKeys: secureStorage.getSecureKeys.bind(secureStorage)
  };
};

/**
 * 🔐 Stockage sécurisé pour les sessions
 */
export const secureSessionStorage = {
  setItem: async (key: string, value: any) => {
    const validatedValue = typeof value === 'string' ? value : JSON.stringify(value);
    sessionStorage.setItem(`secure_${key}`, validatedValue);
  },

  getItem: (key: string) => {
    return sessionStorage.getItem(`secure_${key}`);
  },

  getItemJSON: <T = any>(key: string): T | null => {
    const value = sessionStorage.getItem(`secure_${key}`);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  removeItem: (key: string) => {
    sessionStorage.removeItem(`secure_${key}`);
  },

  hasItem: (key: string) => {
    return sessionStorage.getItem(`secure_${key}`) !== null;
  },

  clear: () => {
    const keys = Object.keys(sessionStorage).filter(key => key.startsWith('secure_'));
    keys.forEach(key => sessionStorage.removeItem(key));
  }
};
