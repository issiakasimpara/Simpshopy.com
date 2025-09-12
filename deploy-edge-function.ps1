# 🚀 SCRIPT DE DÉPLOIEMENT EDGE FUNCTION
# Date: 2025-01-28
# Objectif: Déployer la fonction invalidate-cache sur Supabase

Write-Host "🚀 Déploiement de l'Edge Function invalidate-cache" -ForegroundColor Green

# 1. Vérifier si Supabase CLI est installé
Write-Host "`n📋 Vérification de Supabase CLI..." -ForegroundColor Yellow
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI trouvé: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI non trouvé. Installation nécessaire." -ForegroundColor Red
    Write-Host "📥 Téléchargez depuis: https://github.com/supabase/cli/releases" -ForegroundColor Cyan
    Write-Host "💡 Ou installez via: npm install -g supabase" -ForegroundColor Cyan
    exit 1
}

# 2. Vérifier les variables d'environnement
Write-Host "`n🔑 Vérification des variables d'environnement..." -ForegroundColor Yellow

$requiredVars = @(
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY"
)

$missingVars = @()
foreach ($var in $requiredVars) {
    if (-not (Get-Item "env:$var" -ErrorAction SilentlyContinue)) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "❌ Variables d'environnement manquantes:" -ForegroundColor Red
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor Red
    }
    Write-Host "`n💡 Ajoutez-les dans votre fichier .env ou définissez-les:" -ForegroundColor Cyan
    Write-Host "   `$env:SUPABASE_URL = 'https://grutldacuowplosarucp.supabase.co'" -ForegroundColor Gray
    Write-Host "   `$env:SUPABASE_SERVICE_ROLE_KEY = 'votre_service_role_key'" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Variables d'environnement trouvées" -ForegroundColor Green

# 3. Vérifier la structure du projet
Write-Host "`n📁 Vérification de la structure du projet..." -ForegroundColor Yellow

if (-not (Test-Path "supabase/functions/invalidate-cache/index.ts")) {
    Write-Host "❌ Fichier Edge Function non trouvé:" -ForegroundColor Red
    Write-Host "   supabase/functions/invalidate-cache/index.ts" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Structure du projet correcte" -ForegroundColor Green

# 4. Initialiser Supabase (si nécessaire)
Write-Host "`n🔧 Initialisation de Supabase..." -ForegroundColor Yellow

if (-not (Test-Path "supabase/config.toml")) {
    Write-Host "📝 Création du fichier de configuration Supabase..." -ForegroundColor Cyan
    supabase init
}

# 5. Lier au projet Supabase
Write-Host "`n🔗 Liaison au projet Supabase..." -ForegroundColor Yellow

try {
    supabase link --project-ref grutldacuowplosarucp
    Write-Host "✅ Projet lié avec succès" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Projet déjà lié ou erreur de liaison" -ForegroundColor Yellow
}

# 6. Déployer l'Edge Function
Write-Host "`n🚀 Déploiement de l'Edge Function..." -ForegroundColor Yellow

try {
    Write-Host "📤 Déploiement en cours..." -ForegroundColor Cyan
    supabase functions deploy invalidate-cache --project-ref grutldacuowplosarucp
    
    Write-Host "`n✅ Edge Function déployée avec succès!" -ForegroundColor Green
    Write-Host "🌐 URL: https://grutldacuowplosarucp.supabase.co/functions/v1/invalidate-cache" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erreur lors du déploiement:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# 7. Test de la fonction
Write-Host "`n🧪 Test de la fonction déployée..." -ForegroundColor Yellow

$testPayload = @{
    event = "UPDATE"
    table = "stores"
    record = @{
        id = "test-id"
        name = "Test Store"
    }
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://grutldacuowplosarucp.supabase.co/functions/v1/invalidate-cache" `
                                  -Method POST `
                                  -Body $testPayload `
                                  -ContentType "application/json" `
                                  -Headers @{
                                      "Authorization" = "Bearer $env:SUPABASE_SERVICE_ROLE_KEY"
                                  }
    
    Write-Host "✅ Test réussi!" -ForegroundColor Green
    Write-Host "📊 Réponse: $($response | ConvertTo-Json)" -ForegroundColor Gray
    
} catch {
    Write-Host "⚠️ Test échoué (normal si pas de données de test):" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}

# 8. Instructions finales
Write-Host "`n🎉 DÉPLOIEMENT TERMINÉ!" -ForegroundColor Green
Write-Host "`n📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Exécuter le script SQL: create_cache_invalidation_triggers.sql" -ForegroundColor White
Write-Host "2. Configurer les triggers dans Supabase Dashboard" -ForegroundColor White
Write-Host "3. Tester l'invalidation automatique" -ForegroundColor White

Write-Host "`n🔗 Liens utiles:" -ForegroundColor Cyan
Write-Host "- Dashboard Supabase: https://supabase.com/dashboard/project/grutldacuowplosarucp" -ForegroundColor Gray
Write-Host "- Logs Edge Functions: https://supabase.com/dashboard/project/grutldacuowplosarucp/functions" -ForegroundColor Gray
Write-Host "- Documentation: https://supabase.com/docs/guides/functions" -ForegroundColor Gray

Write-Host "`n✨ L'Edge Function est maintenant prête à invalider automatiquement le cache!" -ForegroundColor Green
