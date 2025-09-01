# Script pour verifier la configuration Moneroo via l'API REST
$supabaseUrl = "https://grutldacuowplosarucp.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTAxNjEsImV4cCI6MjA2NDY2NjE2MX0.cqKxbFdqF589dQBSH3IKNL6kXdRNtS9dpkrYNOHk0Ac"

$storeId = "d6d0e01a-0283-4a87-8da0-b248c36e37d5"

Write-Host "=== VERIFICATION CONFIGURATION MONEROO VIA API ===" -ForegroundColor Cyan
Write-Host "Store ID: $storeId" -ForegroundColor Yellow

$headers = @{
    "Content-Type" = "application/json"
    "apikey" = $anonKey
    "Authorization" = "Bearer $anonKey"
}

# Test 1: Verifier si la table existe en essayant de la lire
Write-Host "`n=== TEST 1: Verification existence table ===" -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/payment_configurations?select=id&limit=1" -Method GET -Headers $headers
    
    Write-Host "✅ Table payment_configurations existe" -ForegroundColor Green
    Write-Host "Nombre de configurations: $($response.Count)" -ForegroundColor White
    
} catch {
    Write-Host "❌ Erreur acces table:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

# Test 2: Verifier la configuration pour le store specifique
Write-Host "`n=== TEST 2: Configuration pour store $storeId ===" -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/payment_configurations?store_id=eq.$storeId&select=*" -Method GET -Headers $headers
    
    if ($response -and $response.Count -gt 0) {
        $config = $response[0]
        Write-Host "✅ Configuration trouvee pour le store" -ForegroundColor Green
        Write-Host "ID: $($config.id)" -ForegroundColor White
        Write-Host "Store ID: $($config.store_id)" -ForegroundColor White
        Write-Host "Moneroo enabled: $($config.moneroo_enabled)" -ForegroundColor Yellow
        Write-Host "Moneroo test mode: $($config.moneroo_test_mode)" -ForegroundColor Yellow
        
        if ($config.moneroo_api_key) {
            Write-Host "✅ Moneroo API key: CONFIGUREE" -ForegroundColor Green
            Write-Host "   Preview: $($config.moneroo_api_key.Substring(0, [Math]::Min(10, $config.moneroo_api_key.Length)))..." -ForegroundColor White
        } else {
            Write-Host "❌ Moneroo API key: NON CONFIGUREE" -ForegroundColor Red
        }
        
        Write-Host "Created at: $($config.created_at)" -ForegroundColor White
        Write-Host "Updated at: $($config.updated_at)" -ForegroundColor White
        
    } else {
        Write-Host "❌ Aucune configuration trouvee pour ce store" -ForegroundColor Red
        Write-Host "Cela signifie que:" -ForegroundColor Yellow
        Write-Host "1. La configuration n'a jamais ete sauvegardee" -ForegroundColor White
        Write-Host "2. Il y a un probleme avec l'onglet Paiements" -ForegroundColor White
        Write-Host "3. La sauvegarde a echoue" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Erreur verification config:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

# Test 3: Lister toutes les configurations
Write-Host "`n=== TEST 3: Toutes les configurations ===" -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/payment_configurations?select=id,store_id,moneroo_enabled,moneroo_api_key&order=created_at.desc" -Method GET -Headers $headers
    
    Write-Host "Total configurations: $($response.Count)" -ForegroundColor White
    
    foreach ($config in $response) {
        Write-Host "Store: $($config.store_id) - Moneroo: $($config.moneroo_enabled) - API Key: $(if($config.moneroo_api_key){'OUI'}else{'NON'})" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Erreur liste configs:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== VERIFICATION TERMINEE ===" -ForegroundColor Cyan
