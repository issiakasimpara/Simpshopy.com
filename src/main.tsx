
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'

// 🔐 Validation de sécurité au démarrage
import { logSecurityReport } from './utils/securityValidator'
// ⚡ Monitoring de performance - ÉTAPE 1 RÉACTIVATION
import { performanceManager } from './utils/performanceManager'

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
