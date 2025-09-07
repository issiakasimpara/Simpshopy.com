# Script PowerShell pour tester l'integration ZeptoMail
# Ce script teste l'envoi d'emails via l'Edge Function

Write-Host "Test de l'integration ZeptoMail" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Configuration
$SUPABASE_URL = "https://grutldacuowplosarucp.supabase.co"
$SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQ4NzQ4MCwiZXhwIjoyMDUzMDYzNDgwfQ.8Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q"

# Test 1: Verifier que l'Edge Function est deployee
Write-Host "Test 1: Verification de l'Edge Function" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/functions/v1/send-order-emails" -Method OPTIONS -Headers @{
        "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
    }
    Write-Host "Edge Function accessible" -ForegroundColor Green
} catch {
    Write-Host "Edge Function non accessible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Creer une commande de test
Write-Host "Test 2: Creation d'une commande de test" -ForegroundColor Yellow

# Donnees de test
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

Write-Host "Donnees de test: $testOrderData" -ForegroundColor Cyan

# Test 3: Appeler l'Edge Function
Write-Host "Test 3: Envoi d'emails via ZeptoMail" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/functions/v1/send-order-emails" -Method POST -Headers @{
        "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
        "Content-Type" = "application/json"
    } -Body $testOrderData

    Write-Host "Reponse de l'Edge Function:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Cyan

    if ($response.success) {
        Write-Host "SUCCES: Emails envoyes avec ZeptoMail!" -ForegroundColor Green
        Write-Host "Email client envoye a: test@simpshopy.com" -ForegroundColor Green
        Write-Host "Email admin envoye au proprietaire de la boutique" -ForegroundColor Green
    } else {
        Write-Host "ECHEC: $($response.error)" -ForegroundColor Red
    }

} catch {
    Write-Host "Erreur lors de l'appel de l'Edge Function: $($_.Exception.Message)" -ForegroundColor Red
    
    # Afficher plus de details sur l'erreur
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Details de l'erreur: $errorBody" -ForegroundColor Red
    }
}

# Test 4: Verifier les logs
Write-Host "Test 4: Verification des logs" -ForegroundColor Yellow
Write-Host "Consultez les logs Supabase pour voir les details d'execution" -ForegroundColor Cyan
Write-Host "URL des logs: https://supabase.com/dashboard/project/grutldacuowplosarucp/functions" -ForegroundColor Cyan

Write-Host "Test termine!" -ForegroundColor Green
Write-Host "Verifiez vos emails pour confirmer la reception" -ForegroundColor Yellow
