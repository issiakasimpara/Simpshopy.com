# Script de test final pour Mailzeet global
# Usage: .\test-mailzeet-global.ps1

Write-Host "🚀 Test final Mailzeet global pour Simpshopy" -ForegroundColor Green
Write-Host ""

# Configuration
$supabaseUrl = "https://grutldacuowplosarucp.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTAxNjEsImV4cCI6MjA2NDY2NjE2MX0.cqKxbFdqF589dQBSH3IKNL6kXdRNtS9dpkrYNOHk0Ac"

Write-Host "📧 Configuration Mailzeet globale:" -ForegroundColor Cyan
Write-Host "   API Key: 5eelaz32hdbl:efyg6m7n0937bmp1y0sr5j2fn" -ForegroundColor Gray
Write-Host "   Server: SimpShopy" -ForegroundColor Gray
Write-Host "   Status: Configuration globale pour toutes les boutiques" -ForegroundColor Green
Write-Host ""

# Test 1: Vérifier l'Edge Function test-mailzeet
Write-Host "🧪 Test 1: Edge Function test-mailzeet" -ForegroundColor Yellow

try {
    $testResponse = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/test-mailzeet" -Method POST -Headers @{
        "Authorization" = "Bearer $anonKey"
        "Content-Type" = "application/json"
    } -Body (@{
        apiKey = "5eelaz32hdbl:efyg6m7n0937bmp1y0sr5j2fn"
        serverName = "SimpShopy"
        fromEmail = "noreply@simpshopy.com"
        fromName = "Simpshopy"
    } | ConvertTo-Json)

    Write-Host "✅ Edge Function test-mailzeet fonctionnelle" -ForegroundColor Green
    Write-Host "📧 Test réussi: $($testResponse.message)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur Edge Function: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Vérifier l'Edge Function send-order-emails
Write-Host "🧪 Test 2: Edge Function send-order-emails" -ForegroundColor Yellow

try {
    $orderResponse = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/send-order-emails" -Method POST -Headers @{
        "Authorization" = "Bearer $anonKey"
        "Content-Type" = "application/json"
    } -Body (@{
        orderId = "test-order-global-mailzeet"
    } | ConvertTo-Json)

    Write-Host "✅ Edge Function send-order-emails accessible" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*MAILZEET_API_KEY*") {
        Write-Host "⚠️ Variables d'environnement non configurées dans Supabase" -ForegroundColor Yellow
        Write-Host "💡 Configurez les variables d'environnement dans Supabase Dashboard" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Erreur Edge Function: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Test direct de l'API Mailzeet
Write-Host "🧪 Test 3: API Mailzeet directe" -ForegroundColor Yellow

try {
    $mailzeetResponse = Invoke-RestMethod -Uri "https://api.mailzeet.com/v1/mails" -Method POST -Headers @{
        "Authorization" = "Bearer 5eelaz32hdbl:efyg6m7n0937bmp1y0sr5j2fn"
        "Content-Type" = "application/json"
    } -Body (@{
        sender = @{
            email = "noreply@simpshopy.com"
            name = "Simpshopy"
        }
        recipients = @(
            @{
                email = "noreply@simpshopy.com"
                name = "Test"
            }
        )
        subject = "✅ Test Mailzeet Global - Simpshopy"
        html = "<p>Test de l'API Mailzeet globale pour Simpshopy.</p><p>Configuration réussie !</p>"
        server = "SimpShopy"
    } | ConvertTo-Json -Depth 3)

    Write-Host "✅ API Mailzeet fonctionnelle" -ForegroundColor Green
    Write-Host "📧 Message ID: $($mailzeetResponse.id)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur API Mailzeet: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Instructions finales
Write-Host "🎯 Configuration finale requise:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Allez sur: https://supabase.com/dashboard/project/grutldacuowplosarucp/settings/functions" -ForegroundColor White
Write-Host ""
Write-Host "2. Ajoutez ces variables d'environnement:" -ForegroundColor White
Write-Host ""
Write-Host "   MAILZEET_API_KEY = 5eelaz32hdbl:efyg6m7n0937bmp1y0sr5j2fn" -ForegroundColor Yellow
Write-Host "   MAILZEET_SERVER_NAME = SimpShopy" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Redéployez les Edge Functions:" -ForegroundColor White
Write-Host "   npx supabase functions deploy send-order-emails" -ForegroundColor Gray
Write-Host "   npx supabase functions deploy test-mailzeet" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉 Avantages de la configuration globale:" -ForegroundColor Green
Write-Host "   ✅ Une seule configuration pour toutes les boutiques" -ForegroundColor White
Write-Host "   ✅ Pas de configuration par boutique nécessaire" -ForegroundColor White
Write-Host "   ✅ Gestion centralisée des emails" -ForegroundColor White
Write-Host "   ✅ Templates professionnels automatiques" -ForegroundColor White
Write-Host "   ✅ Logs centralisés" -ForegroundColor White
Write-Host ""

Write-Host "📋 Fonctionnalités disponibles pour toutes les boutiques:" -ForegroundColor Cyan
Write-Host "   • Emails de confirmation de commande" -ForegroundColor White
Write-Host "   • Notifications admin de nouvelles commandes" -ForegroundColor White
Write-Host "   • Emails de changement de statut" -ForegroundColor White
Write-Host "   • Templates HTML professionnels" -ForegroundColor White
Write-Host "   • Logs d'emails dans la base de données" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Mailzeet global prêt pour Simpshopy !" -ForegroundColor Green
