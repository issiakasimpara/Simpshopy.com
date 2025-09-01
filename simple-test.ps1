Write-Host "Test simple de l'Edge Function payment-gateway"

$url = "https://grutldacuowplosarucp.supabase.co/functions/v1/payment-gateway/check-configuration"
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdXdwbG9zYXJ1Y3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTY5NzI2MywiZXhwIjoyMDUxMjczMjYzfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdXdwbG9zYXJ1Y3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTY5NzI2MywiZXhwIjoyMDUxMjczMjYzfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"
}
$body = '{"provider": "moneroo", "storeId": "test"}'

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
    Write-Host "SUCCESS: $($response | ConvertTo-Json)"
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
