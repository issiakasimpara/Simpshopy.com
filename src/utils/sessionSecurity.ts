/**
 * 🔐 Sécurité des sessions
 * Gestion sécurisée des sessions utilisateur avec rotation et validation
 */

import { secureStorage, secureSessionStorage } from './secureStorage';

interface SessionData {
  userId: string;
  sessionId: string;
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
  userAgent: string;
  ipAddress?: string;
  permissions: string[];
}

interface SessionConfig {
  maxDuration: number; // en millisecondes
  maxInactivity: number; // en millisecondes
  rotationInterval: number; // en millisecondes
  maxConcurrentSessions: number;
}

class SessionSecurity {
  private config: SessionConfig;
  private currentSession: SessionData | null = null;
  private sessionCheckInterval: number | null = null;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = {
      maxDuration: 24 * 60 * 60 * 1000, // 24 heures
      maxInactivity: 2 * 60 * 60 * 1000, // 2 heures
      rotationInterval: 60 * 60 * 1000, // 1 heure
      maxConcurrentSessions: 3,
      ...config
    };

    this.initializeSession();
  }

  /**
   * 🔐 Initialiser la session
   */
  private async initializeSession(): Promise<void> {
    try {
      // Récupérer la session existante
      const existingSession = await secureStorage.getItemJSON<SessionData>('current_session');
      
      if (existingSession && this.isValidSession(existingSession)) {
        this.currentSession = existingSession;
        this.updateLastActivity();
      } else {
        // Créer une nouvelle session
        await this.createNewSession();
      }

      // Démarrer la surveillance de session
      this.startSessionMonitoring();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session:', error);
    }
  }

  /**
   * 🔐 Créer une nouvelle session
   */
  private async createNewSession(): Promise<void> {
    const sessionId = this.generateSessionId();
    const now = Date.now();

    this.currentSession = {
      userId: this.getCurrentUserId() || 'anonymous',
      sessionId,
      createdAt: now,
      lastActivity: now,
      expiresAt: now + this.config.maxDuration,
      userAgent: navigator.userAgent,
      ipAddress: await this.getClientIP().catch(() => undefined),
      permissions: this.getDefaultPermissions()
    };

    await this.saveSession();
    await this.cleanupOldSessions();
  }

  /**
   * 🔐 Générer un ID de session sécurisé
   */
  private generateSessionId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 🔐 Valider une session
   */
  private isValidSession(session: SessionData): boolean {
    const now = Date.now();

    // Vérifier l'expiration
    if (now > session.expiresAt) {
      return false;
    }

    // Vérifier l'inactivité
    if (now - session.lastActivity > this.config.maxInactivity) {
      return false;
    }

    // Vérifier la durée maximale
    if (now - session.createdAt > this.config.maxDuration) {
      return false;
    }

    // Vérifier le User-Agent (optionnel)
    if (session.userAgent !== navigator.userAgent) {
      console.warn('User-Agent mismatch détecté');
      // Ne pas invalider pour les changements mineurs
    }

    return true;
  }

  /**
   * 🔐 Mettre à jour la dernière activité
   */
  public updateLastActivity(): void {
    if (this.currentSession) {
      this.currentSession.lastActivity = Date.now();
      this.saveSession();
    }
  }

  /**
   * 🔐 Sauvegarder la session
   */
  private async saveSession(): Promise<void> {
    if (this.currentSession) {
      await secureStorage.setItem('current_session', this.currentSession);
      secureSessionStorage.setItem('session_id', this.currentSession.sessionId);
    }
  }

  /**
   * 🔐 Obtenir l'ID de l'utilisateur actuel
   */
  private getCurrentUserId(): string | null {
    try {
      // Essayer de récupérer depuis le token d'auth
      const authToken = localStorage.getItem('auth_token');
      if (authToken) {
        const payload = JSON.parse(atob(authToken.split('.')[1]));
        return payload.sub || payload.user_id || null;
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération de l\'ID utilisateur:', error);
    }
    
    return null;
  }

  /**
   * 🔐 Obtenir l'IP du client
   */
  private async getClientIP(): Promise<string | undefined> {
    try {
      // Utiliser un service d'IP publique
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Impossible de récupérer l\'IP du client:', error);
      return undefined;
    }
  }

  /**
   * 🔐 Obtenir les permissions par défaut
   */
  private getDefaultPermissions(): string[] {
    // Permissions de base pour les utilisateurs non authentifiés
    return ['read:public', 'browse:products'];
  }

  /**
   * 🔐 Vérifier les permissions
   */
  public hasPermission(permission: string): boolean {
    if (!this.currentSession) {
      return false;
    }

    return this.currentSession.permissions.includes(permission) ||
           this.currentSession.permissions.includes('admin:*');
  }

  /**
   * 🔐 Ajouter des permissions
   */
  public addPermissions(permissions: string[]): void {
    if (this.currentSession) {
      const newPermissions = permissions.filter(p => !this.currentSession!.permissions.includes(p));
      this.currentSession.permissions.push(...newPermissions);
      this.saveSession();
    }
  }

  /**
   * 🔐 Supprimer des permissions
   */
  public removePermissions(permissions: string[]): void {
    if (this.currentSession) {
      this.currentSession.permissions = this.currentSession.permissions.filter(
        p => !permissions.includes(p)
      );
      this.saveSession();
    }
  }

  /**
   * 🔐 Nettoyer les anciennes sessions
   */
  private async cleanupOldSessions(): Promise<void> {
    try {
      const sessions = await secureStorage.getItemJSON<SessionData[]>('user_sessions') || [];
      const now = Date.now();
      
      // Filtrer les sessions valides
      const validSessions = sessions.filter(session => 
        now < session.expiresAt && 
        now - session.lastActivity < this.config.maxInactivity
      );

      // Limiter le nombre de sessions concurrentes
      if (validSessions.length >= this.config.maxConcurrentSessions) {
        // Supprimer les sessions les plus anciennes
        validSessions.sort((a, b) => a.lastActivity - b.lastActivity);
        validSessions.splice(0, validSessions.length - this.config.maxConcurrentSessions + 1);
      }

      await secureStorage.setItem('user_sessions', validSessions);
    } catch (error) {
      console.error('Erreur lors du nettoyage des sessions:', error);
    }
  }

  /**
   * 🔐 Démarrer la surveillance de session
   */
  private startSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    this.sessionCheckInterval = window.setInterval(() => {
      this.checkSessionValidity();
    }, 60000); // Vérifier toutes les minutes

    // Mettre à jour l'activité sur les événements utilisateur
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.updateLastActivity();
      }, { passive: true });
    });
  }

  /**
   * 🔐 Vérifier la validité de la session
   */
  private checkSessionValidity(): void {
    if (!this.currentSession || !this.isValidSession(this.currentSession)) {
      this.invalidateSession();
    } else if (Date.now() - this.currentSession.createdAt > this.config.rotationInterval) {
      this.rotateSession();
    }
  }

  /**
   * 🔐 Invalider la session
   */
  public invalidateSession(): void {
    this.currentSession = null;
    secureStorage.removeItem('current_session');
    secureSessionStorage.removeItem('session_id');
    
    // Rediriger vers la page de connexion
    if (window.location.pathname !== '/auth') {
      window.location.href = '/auth';
    }
  }

  /**
   * 🔐 Faire tourner la session
   */
  private async rotateSession(): Promise<void> {
    if (this.currentSession) {
      const newSessionId = this.generateSessionId();
      this.currentSession.sessionId = newSessionId;
      this.currentSession.lastActivity = Date.now();
      
      await this.saveSession();
      
      if (import.meta.env.DEV) {
        console.log('Session rotée:', newSessionId);
      }
    }
  }

  /**
   * 🔐 Obtenir les informations de session
   */
  public getSessionInfo(): SessionData | null {
    return this.currentSession;
  }

  /**
   * 🔐 Vérifier si la session est valide
   */
  public isSessionValid(): boolean {
    return this.currentSession !== null && this.isValidSession(this.currentSession);
  }

  /**
   * 🔐 Obtenir l'ID de session
   */
  public getSessionId(): string | null {
    return this.currentSession?.sessionId || null;
  }

  /**
   * 🔐 Nettoyer les ressources
   */
  public cleanup(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }
}

// Instance globale
export const sessionSecurity = new SessionSecurity();

// Nettoyage automatique au déchargement de la page
window.addEventListener('beforeunload', () => {
  sessionSecurity.cleanup();
});

/**
 * 🔐 Hook React pour utiliser la sécurité des sessions
 */
export const useSessionSecurity = () => {
  const hasPermission = (permission: string) => sessionSecurity.hasPermission(permission);
  const addPermissions = (permissions: string[]) => sessionSecurity.addPermissions(permissions);
  const removePermissions = (permissions: string[]) => sessionSecurity.removePermissions(permissions);
  const invalidateSession = () => sessionSecurity.invalidateSession();
  const getSessionInfo = () => sessionSecurity.getSessionInfo();
  const isSessionValid = () => sessionSecurity.isSessionValid();
  const getSessionId = () => sessionSecurity.getSessionId();

  return {
    hasPermission,
    addPermissions,
    removePermissions,
    invalidateSession,
    getSessionInfo,
    isSessionValid,
    getSessionId
  };
};
