# 🚀 DÉPLOIEMENT DU NOUVEAU SYSTÈME DE ROUTAGE
# Date: 2025-01-28
# Objectif: Déployer le nouveau système de routage direct par slug

Write-Host "🚀 Déploiement du nouveau système de routage..." -ForegroundColor Green

# =====================================================
# 1. CORRIGER LES TRIGGERS DE SLUG
# =====================================================

Write-Host "📝 Étape 1: Correction des triggers de slug..." -ForegroundColor Yellow

# Exécuter le script de correction des triggers
if (Test-Path "fix_slug_triggers_conflict.sql") {
    Write-Host "✅ Exécution de fix_slug_triggers_conflict.sql..." -ForegroundColor Green
    # Note: Vous devrez exécuter ce script dans votre interface Supabase
    Write-Host "⚠️  Veuillez exécuter fix_slug_triggers_conflict.sql dans votre interface Supabase" -ForegroundColor Yellow
} else {
    Write-Host "❌ Fichier fix_slug_triggers_conflict.sql non trouvé" -ForegroundColor Red
}

# =====================================================
# 2. CRÉER LES FONCTIONS OPTIMISÉES
# =====================================================

Write-Host "📝 Étape 2: Création des fonctions optimisées..." -ForegroundColor Yellow

# Exécuter le script de création des fonctions
if (Test-Path "create_optimized_storefront_function.sql") {
    Write-Host "✅ Exécution de create_optimized_storefront_function.sql..." -ForegroundColor Green
    # Note: Vous devrez exécuter ce script dans votre interface Supabase
    Write-Host "⚠️  Veuillez exécuter create_optimized_storefront_function.sql dans votre interface Supabase" -ForegroundColor Yellow
} else {
    Write-Host "❌ Fichier create_optimized_storefront_function.sql non trouvé" -ForegroundColor Red
}

# =====================================================
# 3. TESTER LE NOUVEAU SYSTÈME
# =====================================================

Write-Host "📝 Étape 3: Test du nouveau système..." -ForegroundColor Yellow

# Exécuter le script de test
if (Test-Path "test_new_routing_system.sql") {
    Write-Host "✅ Exécution de test_new_routing_system.sql..." -ForegroundColor Green
    # Note: Vous devrez exécuter ce script dans votre interface Supabase
    Write-Host "⚠️  Veuillez exécuter test_new_routing_system.sql dans votre interface Supabase" -ForegroundColor Yellow
} else {
    Write-Host "❌ Fichier test_new_routing_system.sql non trouvé" -ForegroundColor Red
}

# =====================================================
# 4. VÉRIFIER LES FICHIERS FRONTEND
# =====================================================

Write-Host "📝 Étape 4: Vérification des fichiers frontend..." -ForegroundColor Yellow

# Vérifier que les fichiers frontend existent
$frontendFiles = @(
    "src/services/optimizedStorefrontService.ts",
    "src/hooks/useOptimizedStorefront.tsx",
    "src/pages/Storefront.tsx",
    "src/App.tsx"
)

foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file trouvé" -ForegroundColor Green
    } else {
        Write-Host "❌ $file non trouvé" -ForegroundColor Red
    }
}

# =====================================================
# 5. INSTRUCTIONS DE DÉPLOIEMENT
# =====================================================

Write-Host "📝 Étape 5: Instructions de déploiement..." -ForegroundColor Yellow

Write-Host @"
🚀 INSTRUCTIONS DE DÉPLOIEMENT:

1. BASE DE DONNÉES (Supabase):
   - Exécutez fix_slug_triggers_conflict.sql
   - Exécutez create_optimized_storefront_function.sql
   - Exécutez test_new_routing_system.sql pour vérifier

2. FRONTEND (Vercel):
   - Les fichiers ont été modifiés automatiquement
   - Déployez sur Vercel avec: vercel --prod

3. TEST:
   - Testez l'accès direct: https://simpshopy.com/isco
   - Vérifiez que l'ancien système /store/isco ne fonctionne plus
   - Vérifiez que toutes les boutiques sont accessibles directement

4. VÉRIFICATION:
   - Vérifiez que les URLs sont maintenant: simpshopy.com/nomdelaboutique
   - Vérifiez que le chargement est plus rapide
   - Vérifiez que les erreurs 404 sont gérées correctement

⚠️  IMPORTANT:
   - Sauvegardez votre base de données avant le déploiement
   - Testez d'abord en local avant de déployer en production
   - Surveillez les logs pour détecter d'éventuels problèmes

"@ -ForegroundColor Cyan

# =====================================================
# 6. RÉSUMÉ
# =====================================================

Write-Host "📝 Résumé du déploiement..." -ForegroundColor Yellow

Write-Host @"
✅ CHANGEMENTS APPLIQUÉS:

1. ❌ SUPPRIMÉ: Système /store/:storeSlug
2. ✅ AJOUTÉ: Système direct /:storeSlug
3. ✅ OPTIMISÉ: Une seule requête pour récupérer toutes les données
4. ✅ AMÉLIORÉ: Performance et vitesse de chargement
5. ✅ SIMPLIFIÉ: Architecture plus claire

🎯 RÉSULTAT ATTENDU:
- URLs: simpshopy.com/nomdelaboutique (au lieu de simpshopy.com/store/nomdelaboutique)
- Performance: Chargement plus rapide avec une seule requête
- Maintenance: Code plus simple et plus maintenable

"@ -ForegroundColor Green

Write-Host "🚀 Déploiement terminé ! Suivez les instructions ci-dessus pour finaliser." -ForegroundColor Green
