# Test simple pour vérifier si l'Edge Function répond
$supabaseUrl = "https://grutldacuowplosarucp.supabase.co"

Write-Host "=== TEST SIMPLE EDGE FUNCTION ===" -ForegroundColor Cyan
Write-Host "URL: $supabaseUrl/functions/v1/payment-gateway/check-configuration" -ForegroundColor Yellow

# Test simple sans authentification pour voir si l'endpoint existe
try {
    $testData = @{
        provider = "moneroo"
        storeId = "d6d0e01a-0283-4a87-8da0-b248c36e37d5"
    }

    $headers = @{
        "Content-Type" = "application/json"
    }

    $body = $testData | ConvertTo-Json

    Write-Host "`n=== MAKING REQUEST ===" -ForegroundColor Green
    
    $response = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/payment-gateway/check-configuration" -Method POST -Headers $headers -Body $body -ContentType "application/json"

    Write-Host "=== SUCCESS RESPONSE ===" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White

} catch {
    Write-Host "=== ERROR RESPONSE ===" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n=== TEST COMPLETED ===" -ForegroundColor Cyan
