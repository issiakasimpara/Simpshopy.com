
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'

// 🔐 Validation de sécurité au démarrage
import { logSecurityReport } from './utils/securityValidator'
// ⚡ Monitoring de performance - ÉTAPE 1 RÉACTIVATION
import { performanceManager } from './utils/performanceManager'
// 🛡️ Système de récupération d'erreurs global
import { errorRecoveryManager } from './utils/errorRecovery'
// 🔍 Système de monitoring avancé (DÉSACTIVÉ TEMPORAIREMENT)
// import { monitoring } from './utils/monitoring'
// 🔍 Système de diagnostic pour identifier les problèmes (DÉSACTIVÉ - cause des violations de performance)
// import { systemDiagnostic } from './utils/systemDiagnostic'
// 🗄️ Migration de la base de données
import { checkMarketSettingsTable, applyMarketSettingsMigration } from './scripts/applyMarketSettingsMigration'
// 🔐 Nouvelles sécurités
import { setupGlobalErrorHandler } from './utils/secureErrorHandler'
import { initializeRateLimiting } from './utils/rateLimiter'
import { initializeCSRF } from './utils/csrfProtection'
import { sessionSecurity } from './utils/sessionSecurity'
import { securityMiddleware } from './utils/securityMiddleware'

// 🔍 Exécuter la validation de sécurité en développement uniquement (réduit)
if (import.meta.env.DEV && Math.random() < 0.01) {
  logSecurityReport();

  // ⚡ Monitoring de performance (développement uniquement - réduit)
  try {
    const stopPerformanceReporting = performanceManager.startPeriodicReporting(300000); // 5 minutes au lieu de 2
    
    // Nettoyer au démontage
    window.addEventListener('beforeunload', () => {
      stopPerformanceReporting();
    });
  } catch (error) {
    // Log silencieux en production
  }
}

// 🔍 DÉSACTIVÉ : Système de diagnostic cause des violations de performance
// if (import.meta.env.DEV) {
//   systemDiagnostic.runDiagnostic();
// }

// 🛡️ Initialiser le système de récupération d'erreurs (silencieux)

// Enregistrer des actions de récupération spécifiques
errorRecoveryManager.registerRecoveryAction('Products_fetch_products_Error', {
  type: 'retry',
  action: async () => {
    // Retenter le chargement des produits
    window.dispatchEvent(new CustomEvent('retry-fetch-products'));
  },
  maxAttempts: 3,
  delay: 2000
});

errorRecoveryManager.registerRecoveryAction('Products_create_product_Error', {
  type: 'retry',
  action: async () => {
    // Retenter la création de produit
    window.dispatchEvent(new CustomEvent('retry-create-product'));
  },
  maxAttempts: 2,
  delay: 1000
});

errorRecoveryManager.registerRecoveryAction('Auth_signIn_Error', {
  type: 'redirect',
  action: async () => {
    // Rediriger vers la page de connexion sur admin.simpshopy.com
    const currentHostname = window.location.hostname;
    if (currentHostname === 'admin.simpshopy.com') {
      window.location.href = '/auth';
    } else {
      window.location.href = 'https://admin.simpshopy.com/auth';
    }
  },
  maxAttempts: 1,
  delay: 0
});



// 🔐 Initialiser les systèmes de sécurité
setupGlobalErrorHandler();
initializeRateLimiting();
initializeCSRF();
securityMiddleware.initialize();
// sessionSecurity est déjà initialisé automatiquement

// 🗄️ Vérifier et appliquer les migrations de base de données
// NOTE: Migration désactivée - exécutez manuellement CREATE_MARKET_SETTINGS_MANUAL.sql
(async () => {
  try {
    const tableExists = await checkMarketSettingsTable();
    if (!tableExists) {
      console.log('⚠️ Table market_settings manquante - exécutez CREATE_MARKET_SETTINGS_MANUAL.sql manuellement');
    }
  } catch (error) {
    console.warn('⚠️ Erreur lors de la vérification des migrations:', error);
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
