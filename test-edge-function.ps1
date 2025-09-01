Write-Host "Test de l'Edge Function payment-gateway..." -ForegroundColor Green

$url = "https://grutldacuowplosarucp.supabase.co/functions/v1/payment-gateway/check-configuration"
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdXdwbG9zYXJ1Y3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTY5NzI2MywiZXhwIjoyMDUxMjczMjYzfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdXdwbG9zYXJ1Y3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTY5NzI2MywiZXhwIjoyMDUxMjczMjYzfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"
}
$body = '{"provider": "moneroo", "storeId": "test"}'

Write-Host "URL: $url" -ForegroundColor Yellow
Write-Host "Headers: $($headers | ConvertTo-Json)" -ForegroundColor Yellow
Write-Host "Body: $body" -ForegroundColor Yellow

try {
    Write-Host "Envoi de la requête..." -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
    Write-Host "SUCCESS: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}
