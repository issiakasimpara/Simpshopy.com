# Script de déploiement pour l'Edge Function payment-gateway
Write-Host "🚀 Déploiement de l'Edge Function payment-gateway..." -ForegroundColor Green

# Vérifier que Supabase CLI est installé
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI détecté: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI non trouvé. Veuillez l'installer d'abord." -ForegroundColor Red
    Write-Host "📥 Installation: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "supabase/functions/payment-gateway")) {
    Write-Host "❌ Répertoire payment-gateway non trouvé. Vérifiez que vous êtes dans le bon répertoire." -ForegroundColor Red
    exit 1
}

# Déployer l'Edge Function
Write-Host "📤 Déploiement de payment-gateway..." -ForegroundColor Yellow
try {
    supabase functions deploy payment-gateway --project-ref grutldacuowplosarucp
    Write-Host "✅ Edge Function payment-gateway déployée avec succès!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du déploiement: $_" -ForegroundColor Red
    exit 1
}

# Vérifier le déploiement
Write-Host "🔍 Vérification du déploiement..." -ForegroundColor Yellow
try {
    $functions = supabase functions list --project-ref grutldacuowplosarucp
    if ($functions -match "payment-gateway") {
        Write-Host "✅ Edge Function payment-gateway confirmée dans la liste!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Edge Function non trouvée dans la liste. Vérifiez le déploiement." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Impossible de vérifier la liste des fonctions: $_" -ForegroundColor Yellow
}

Write-Host "🎉 Déploiement terminé!" -ForegroundColor Green
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Testez l'Edge Function" -ForegroundColor White
Write-Host "   2. Vérifiez que les paiements fonctionnent" -ForegroundColor White
Write-Host "   3. Testez le checkout complet" -ForegroundColor White
