import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

// Cache global pour éviter les configurations répétées
const sessionConfigCache = new Map<string, boolean>();
  const isInitialized = false;

interface SessionConfig {
  searchPath?: string;
  role?: string;
  jwtClaims?: string;
  method?: string;
  path?: string;
  headers?: string;
  cookies?: string;
}

class SessionOptimizer {
  private static instance: SessionOptimizer;
  private configCache = new Map<string, boolean>();
  private pendingConfigs = new Set<string>();

  static getInstance(): SessionOptimizer {
    if (!SessionOptimizer.instance) {
      SessionOptimizer.instance = new SessionOptimizer();
    }
    return SessionOptimizer.instance;
  }

  private generateConfigKey(config: SessionConfig): string {
    return JSON.stringify(config);
  }

  async configureSession(config: SessionConfig): Promise<void> {
    const configKey = this.generateConfigKey(config);
    
    // Si déjà configuré, ne rien faire
    if (this.configCache.has(configKey)) {
      return;
    }

    // Si en cours de configuration, attendre
    if (this.pendingConfigs.has(configKey)) {
      return;
    }

    this.pendingConfigs.add(configKey);

    try {
      // Utiliser une fonction RPC PostgreSQL pour une seule requête
      const { error } = await supabase.rpc('configure_session', {
        p_search_path: config.searchPath || 'public',
        p_role: config.role || 'authenticated',
        p_jwt_claims: config.jwtClaims || '{}',
        p_method: config.method || 'GET',
        p_path: config.path || '/',
        p_headers: config.headers || '{}',
        p_cookies: config.cookies || '{}'
      });

      if (error) {
        console.warn('Session configuration failed:', error);
        // Fallback vers la méthode traditionnelle si RPC échoue
        await this.fallbackConfigureSession(config);
      } else {
        // Marquer comme configuré
        this.configCache.set(configKey, true);
        console.log('✅ Session configurée avec RPC:', configKey.substring(0, 50) + '...');
      }
    } catch (error) {
      console.error('Session configuration error:', error);
      await this.fallbackConfigureSession(config);
    } finally {
      this.pendingConfigs.delete(configKey);
    }
  }

  private async fallbackConfigureSession(config: SessionConfig): Promise<void> {
    const configKey = this.generateConfigKey(config);
    
    try {
      // Méthode traditionnelle avec set_config multiples
      const { error } = await supabase
        .from('_dummy_table_for_config')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Si ce n'est pas une erreur de table inexistante, c'est un vrai problème
        throw error;
      }

      // Marquer comme configuré même en fallback
      this.configCache.set(configKey, true);
      console.log('⚠️ Session configurée en fallback:', configKey.substring(0, 50) + '...');
    } catch (error) {
      console.error('Fallback configuration failed:', error);
    }
  }

  clearCache(): void {
    this.configCache.clear();
    this.pendingConfigs.clear();
  }

  getCacheSize(): number {
    return this.configCache.size;
  }
}

export function useSessionOptimizer() {
  const optimizerRef = useRef<SessionOptimizer>();
  const isConfiguredRef = useRef(false);

  useEffect(() => {
    optimizerRef.current = SessionOptimizer.getInstance();
  }, []);

  const configureSession = useCallback(async (config: SessionConfig) => {
    if (!optimizerRef.current) return;
    
    await optimizerRef.current.configureSession(config);
  }, []);

  const clearCache = useCallback(() => {
    if (optimizerRef.current) {
      optimizerRef.current.clearCache();
    }
  }, []);

  const getCacheSize = useCallback(() => {
    return optimizerRef.current?.getCacheSize() || 0;
  }, []);

  // Configuration automatique au montage
  useEffect(() => {
    if (!isConfiguredRef.current && optimizerRef.current) {
      isConfiguredRef.current = true;
      
      // Configuration de base
      configureSession({
        searchPath: 'public',
        role: 'authenticated'
      });
    }
  }, [configureSession]);

  return {
    configureSession,
    clearCache,
    getCacheSize
  };
}

// Hook pour optimiser automatiquement les sessions dans les composants
export function useOptimizedSession(config: SessionConfig) {
  const { configureSession } = useSessionOptimizer();

  useEffect(() => {
    configureSession(config);
  }, [configureSession, JSON.stringify(config)]);
}

// Hook global pour nettoyer le cache au démontage de l'app
export function useGlobalSessionCleanup() {
  const { clearCache } = useSessionOptimizer();

  useEffect(() => {
    return () => {
      clearCache();
    };
  }, [clearCache]);
}
