# Test de l'Edge Function avec la configuration Moneroo
$supabaseUrl = "https://grutldacuowplosarucp.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTAxNjEsImV4cCI6MjA2NDY2NjE2MX0.cqKxbFdqF589dQBSH3IKNL6kXdRNtS9dpkrYNOHk0Ac"

$storeId = "d6d0e01a-0283-4a87-8da0-b248c36e37d5"

Write-Host "=== TEST EDGE FUNCTION CONFIGURATION ===" -ForegroundColor Cyan
Write-Host "Store ID: $storeId" -ForegroundColor Yellow

$headers = @{
    "Content-Type" = "application/json"
    "apikey" = $anonKey
    "Authorization" = "Bearer $anonKey"
}

# Test 1: Vérifier la configuration via l'Edge Function
Write-Host "`n=== TEST 1: Vérification configuration via Edge Function ===" -ForegroundColor Green

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

Write-Host "`n=== TEST TERMINÉ ===" -ForegroundColor Cyan
