# Test pour vérifier la configuration Moneroo dans la base de données
$supabaseUrl = "https://grutldacuowplosarucp.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdXdwYW9zYXJ1Y3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNzE5NzI5MCwiZXhwIjoyMDUyNzc1MjkwfQ.cqKxbF"

$storeId = "d6d0e01a-0283-4a87-8da0-b248c36e37d5"

Write-Host "=== VÉRIFICATION CONFIGURATION MONEROO ===" -ForegroundColor Cyan
Write-Host "Store ID: $storeId" -ForegroundColor Yellow

# Test 1: Vérifier la table payment_configurations
Write-Host "`n=== TEST 1: Vérification table payment_configurations ===" -ForegroundColor Green

try {
    $headers = @{
        "Content-Type" = "application/json"
        "apikey" = $anonKey
        "Authorization" = "Bearer $anonKey"
    }

    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/payment_configurations?store_id=eq.$storeId&select=*" -Method GET -Headers $headers

    Write-Host "✅ Configuration trouvée:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White

    if ($response -and $response.Count -gt 0) {
        $config = $response[0]
        Write-Host "`n📊 Détails de la configuration:" -ForegroundColor Cyan
        Write-Host "Moneroo enabled: $($config.moneroo_enabled)" -ForegroundColor Yellow
        Write-Host "Moneroo API key: $($config.moneroo_api_key)" -ForegroundColor Yellow
        Write-Host "Moneroo test mode: $($config.moneroo_test_mode)" -ForegroundColor Yellow
        
        if ($config.moneroo_api_key) {
            Write-Host "✅ Clé API Moneroo configurée" -ForegroundColor Green
        } else {
            Write-Host "❌ Clé API Moneroo manquante" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Aucune configuration trouvée pour ce store" -ForegroundColor Red
    }

} catch {
    Write-Host "❌ Erreur lors de la vérification:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

# Test 2: Vérifier via l'Edge Function
Write-Host "`n=== TEST 2: Vérification via Edge Function ===" -ForegroundColor Green

try {
    $testData = @{
        provider = "moneroo"
        storeId = $storeId
    }

    $body = $testData | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/payment-gateway/check-configuration" -Method POST -Headers $headers -Body $body -ContentType "application/json"

    Write-Host "✅ Réponse Edge Function:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White

} catch {
    Write-Host "❌ Erreur Edge Function:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n=== VERIFICATION TERMINEE ===" -ForegroundColor Cyan
