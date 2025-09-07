# Script PowerShell pour tester l'intégration ZeptoMail
# Ce script teste l'envoi d'emails via l'Edge Function

Write-Host "🚀 Test de l'intégration ZeptoMail" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Configuration
$SUPABASE_URL = "https://grutldacuowplosarucp.supabase.co"
$SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0ODc0ODAsImV4cCI6MjA1MzA2MzQ4MH0.8Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q"

# Test 1: Vérifier que l'Edge Function est déployée
Write-Host "`n📡 Test 1: Vérification de l'Edge Function" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/functions/v1/send-order-emails" -Method OPTIONS -Headers @{
        "Authorization" = "Bearer $SUPABASE_ANON_KEY"
    }
    Write-Host "✅ Edge Function accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Edge Function non accessible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Créer une commande de test
Write-Host "`n🛒 Test 2: Création d'une commande de test" -ForegroundColor Yellow

# Données de test
$testOrderData = @{
    orderId = "test-order-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    customer_email = "test@simpshopy.com"
    customer_name = "Test Customer"
    items = @(
        @{
            name = "Produit Test"
            quantity = 2
            price = 5000
        }
    )
    total_amount = 10000
    status = "pending"
    created_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json -Depth 3

Write-Host "Données de test: $testOrderData" -ForegroundColor Cyan

# Test 3: Appeler l'Edge Function
Write-Host "`n📧 Test 3: Envoi d'emails via ZeptoMail" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/functions/v1/send-order-emails" -Method POST -Headers @{
        "Authorization" = "Bearer $SUPABASE_ANON_KEY"
        "Content-Type" = "application/json"
    } -Body $testOrderData

    Write-Host "✅ Réponse de l'Edge Function:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Cyan

    if ($response.success) {
        Write-Host "`n🎉 SUCCÈS: Emails envoyés avec ZeptoMail!" -ForegroundColor Green
        Write-Host "📧 Email client envoyé à: test@simpshopy.com" -ForegroundColor Green
        Write-Host "📧 Email admin envoyé au propriétaire de la boutique" -ForegroundColor Green
    } else {
        Write-Host "`n❌ ÉCHEC: $($response.error)" -ForegroundColor Red
    }

} catch {
    Write-Host "❌ Erreur lors de l'appel de l'Edge Function: $($_.Exception.Message)" -ForegroundColor Red
    
    # Afficher plus de détails sur l'erreur
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Détails de l'erreur: $errorBody" -ForegroundColor Red
    }
}

# Test 4: Vérifier les logs
Write-Host "`n📋 Test 4: Vérification des logs" -ForegroundColor Yellow
Write-Host "Consultez les logs Supabase pour voir les détails d'exécution" -ForegroundColor Cyan
Write-Host "URL des logs: https://supabase.com/dashboard/project/grutldacuowplosarucp/functions" -ForegroundColor Cyan

Write-Host "`n🏁 Test terminé!" -ForegroundColor Green
Write-Host "Verifiez vos emails pour confirmer la reception" -ForegroundColor Yellow
