
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
// 🔍 Système de diagnostic pour identifier les problèmes
import { systemDiagnostic } from './utils/systemDiagnostic'

// 🔍 Exécuter la validation de sécurité en développement
if (import.meta.env.DEV) {
  logSecurityReport();

  // ⚡ ÉTAPE 1: Réactiver le monitoring de performance
  console.log('🚀 ÉTAPE 1: Activation du Performance Manager...');

  try {
    const stopPerformanceReporting = performanceManager.startPeriodicReporting(120000); // 2 minutes pour commencer
    console.log('✅ Performance Manager activé avec succès');

    // Nettoyer au démontage
    window.addEventListener('beforeunload', () => {
      stopPerformanceReporting();
    });
  } catch (error) {
    console.warn('⚠️ Erreur Performance Manager:', error);
  }
}

// 🛡️ Initialiser le système de récupération d'erreurs
console.log('🛡️ Initialisation du système de récupération d\'erreurs...');

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
    // Rediriger vers la page de connexion
    window.location.href = '/auth';
  },
  maxAttempts: 1,
  delay: 0
});

console.log('✅ Système de récupération d\'erreurs initialisé');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
