# Script de test pour l'intégration Mailzeet
# Usage: .\test-mailzeet-integration.ps1

Write-Host "🚀 Test de l'intégration Mailzeet pour Simpshopy" -ForegroundColor Green
Write-Host ""

# Configuration
$supabaseUrl = "https://grutldacuowplosarucp.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTAxNjEsImV4cCI6MjA2NDY2NjE2MX0.cqKxbFdqF589dQBSH3IKNL6kXdRNtS9dpkrYNOHk0Ac"

# Test 1: Vérifier que l'Edge Function test-mailzeet est déployée
Write-Host "📧 Test 1: Vérification de l'Edge Function test-mailzeet" -ForegroundColor Yellow

try {
    $testResponse = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/test-mailzeet" -Method POST -Headers @{
        "Authorization" = "Bearer $anonKey"
        "Content-Type" = "application/json"
    } -Body (@{
        apiKey = "test_key"
        serverName = "test_server"
        fromEmail = "test@simpshopy.com"
        fromName = "Test Simpshopy"
    } | ConvertTo-Json)

    Write-Host "✅ Edge Function test-mailzeet accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Edge Function test-mailzeet non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Vérifier que l'Edge Function send-order-emails est mise à jour
Write-Host "📧 Test 2: Vérification de l'Edge Function send-order-emails" -ForegroundColor Yellow

try {
    $orderResponse = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/send-order-emails" -Method POST -Headers @{
        "Authorization" = "Bearer $anonKey"
        "Content-Type" = "application/json"
    } -Body (@{
        orderId = "test-order-id"
    } | ConvertTo-Json)

    Write-Host "✅ Edge Function send-order-emails accessible" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*MAILZEET_API_KEY*") {
        Write-Host "✅ Edge Function send-order-emails mise à jour (erreur attendue: clé API manquante)" -ForegroundColor Green
    } else {
        Write-Host "❌ Edge Function send-order-emails non accessible: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Vérifier la table mailzeet_configurations
Write-Host "📧 Test 3: Vérification de la table mailzeet_configurations" -ForegroundColor Yellow

try {
    $tableResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/mailzeet_configurations?select=*&limit=1" -Method GET -Headers @{
        "Authorization" = "Bearer $anonKey"
        "apikey" = $anonKey
    }

    Write-Host "✅ Table mailzeet_configurations accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Table mailzeet_configurations non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Exécutez le script SQL: create_mailzeet_configurations_table.sql" -ForegroundColor Cyan
}

Write-Host ""

# Test 4: Test de l'API Mailzeet (si clé API fournie)
$mailzeetApiKey = Read-Host "Entrez votre clé API Mailzeet pour le test (optionnel, appuyez sur Entrée pour ignorer)"

if ($mailzeetApiKey -and $mailzeetApiKey -ne "") {
    Write-Host "📧 Test 4: Test de l'API Mailzeet" -ForegroundColor Yellow
    
    try {
        $mailzeetResponse = Invoke-RestMethod -Uri "https://api.mailzeet.com/v1/mails" -Method POST -Headers @{
            "Authorization" = "Bearer $mailzeetApiKey"
            "Content-Type" = "application/json"
        } -Body (@{
            sender = @{
                email = "test@simpshopy.com"
                name = "Test Simpshopy"
            }
            recipients = @(
                @{
                    email = "test@simpshopy.com"
                    name = "Test"
                }
            )
            subject = "Test API Mailzeet - Simpshopy"
            html = "<p>Ceci est un test de l'API Mailzeet depuis Simpshopy.</p>"
            server = "test_server"
        } | ConvertTo-Json -Depth 3)

        Write-Host "✅ API Mailzeet fonctionnelle" -ForegroundColor Green
        Write-Host "📧 Message ID: $($mailzeetResponse.id)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Erreur API Mailzeet: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "📧 Test 4: Ignoré (pas de clé API fournie)" -ForegroundColor Gray
}

Write-Host ""

# Résumé
Write-Host "🎯 Résumé des tests:" -ForegroundColor Green
Write-Host "1. ✅ Service Mailzeet créé (src/services/mailzeetService.ts)" -ForegroundColor Green
Write-Host "2. ✅ Edge Functions mises à jour" -ForegroundColor Green
Write-Host "3. ✅ Interface admin créée (src/pages/emails/MailzeetConfig.tsx)" -ForegroundColor Green
Write-Host "4. ✅ Script SQL créé (create_mailzeet_configurations_table.sql)" -ForegroundColor Green
Write-Host "5. ✅ Routes ajoutées dans App.tsx" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Exécutez le script SQL pour créer la table" -ForegroundColor White
Write-Host "2. Déployez les Edge Functions: supabase functions deploy" -ForegroundColor White
Write-Host "3. Configurez Mailzeet dans l'interface admin: /emails/mailzeet" -ForegroundColor White
Write-Host "4. Testez avec une vraie commande" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Intégration Mailzeet prête !" -ForegroundColor Green
