# Script de test pour l'Edge Function payment-gateway
Write-Host "🧪 Test de l'Edge Function payment-gateway..." -ForegroundColor Green

# URL de l'Edge Function
$baseUrl = "https://grutldacuowplosarucp.supabase.co/functions/v1/payment-gateway"

# Headers
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdXdwbG9zYXJ1Y3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTY5NzI2MywiZXhwIjoyMDUxMjczMjYzfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"
}

# Test 1: Vérifier la configuration
Write-Host "`n📋 Test 1: Vérification de configuration..." -ForegroundColor Yellow
try {
    $body = @{
        provider = "moneroo"
        storeId = "test"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/check-configuration" -Method POST -Headers $headers -Body $body
    Write-Host "✅ Réponse reçue:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ Erreur lors du test de configuration:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 2: Vérifier que l'endpoint existe
Write-Host "`n🔍 Test 2: Vérification de l'existence de l'endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/check-configuration" -Method OPTIONS
    Write-Host "✅ Endpoint accessible (CORS OK)" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur lors de l'accès à l'endpoint:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`n🎉 Tests terminés!" -ForegroundColor Green
