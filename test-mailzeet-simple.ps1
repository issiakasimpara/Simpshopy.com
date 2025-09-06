# Test simple Mailzeet global
Write-Host "Test Mailzeet global pour Simpshopy" -ForegroundColor Green

$supabaseUrl = "https://grutldacuowplosarucp.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTAxNjEsImV4cCI6MjA2NDY2NjE2MX0.cqKxbFdqF589dQBSH3IKNL6kXdRNtS9dpkrYNOHk0Ac"

Write-Host "Configuration Mailzeet globale:" -ForegroundColor Cyan
Write-Host "API Key: 5eelaz32hdbl:efyg6m7n0937bmp1y0sr5j2fn" -ForegroundColor Gray
Write-Host "Server: SimpShopy" -ForegroundColor Gray
Write-Host ""

# Test Edge Function
Write-Host "Test Edge Function test-mailzeet..." -ForegroundColor Yellow

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

    Write-Host "SUCCESS: Edge Function test-mailzeet fonctionnelle" -ForegroundColor Green
    Write-Host "Message: $($testResponse.message)" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Instructions finales:" -ForegroundColor Cyan
Write-Host "1. Allez sur: https://supabase.com/dashboard/project/grutldacuowplosarucp/settings/functions" -ForegroundColor White
Write-Host "2. Ajoutez ces variables d'environnement:" -ForegroundColor White
Write-Host "   MAILZEET_API_KEY = 5eelaz32hdbl:efyg6m7n0937bmp1y0sr5j2fn" -ForegroundColor Yellow
Write-Host "   MAILZEET_SERVER_NAME = SimpShopy" -ForegroundColor Yellow
Write-Host "3. Redéployez les Edge Functions" -ForegroundColor White
Write-Host ""
Write-Host "Mailzeet global pret pour Simpshopy !" -ForegroundColor Green
