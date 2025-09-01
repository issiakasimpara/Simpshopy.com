# Test des messages d'erreur détaillés
$supabaseUrl = "https://grutldacuowplosarucp.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTAxNjEsImV4cCI6MjA2NDY2NjE2MX0.cqKxbFdqF589dQBSH3IKNL6kXdRNtS9dpkrYNOHk0Ac"

$storeId = "d6d0e01a-0283-4a87-8da0-b248c36e37d5"

Write-Host "=== TEST DES MESSAGES D'ERREUR DÉTAILLÉS ===" -ForegroundColor Cyan

$headers = @{
    "Content-Type" = "application/json"
    "apikey" = $anonKey
    "Authorization" = "Bearer $anonKey"
}

# Test 1: Erreur de devise (GBP non activée)
Write-Host "`n=== TEST 1: Erreur de devise GBP ===" -ForegroundColor Yellow

try {
    $paymentData = @{
        provider = "moneroo"
        storeId = $storeId
        paymentData = @{
            amount = 10.50
            currency = "GBP"  # Devise non activée
            description = "Test erreur devise"
            return_url = "http://localhost:5173/payment-success"
            storeId = $storeId
            customer = @{
                email = "test@example.com"
                first_name = "John"
                last_name = "Doe"
            }
            metadata = @{
                temp_order_number = "TEST-001"
                store_id = $storeId
                total_amount = "10.50"
            }
        }
    }

    $body = $paymentData | ConvertTo-Json -Depth 10
    $response = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/payment-gateway/initialize-payment" -Method POST -Headers $headers -Body $body -ContentType "application/json"

} catch {
    Write-Host "✅ Erreur attendue détectée:" -ForegroundColor Green
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $errorData = $responseBody | ConvertFrom-Json
        
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
        Write-Host "Error: $($errorData.error)" -ForegroundColor Red
        Write-Host "Details: $($errorData.details)" -ForegroundColor Red
        
        if ($errorData.details -like "*No payment methods enabled for this currency*") {
            Write-Host "✅ Message d'erreur de devise détecté correctement!" -ForegroundColor Green
        }
    }
}

# Test 2: Erreur de montant insuffisant
Write-Host "`n=== TEST 2: Erreur de montant insuffisant ===" -ForegroundColor Yellow

try {
    $paymentData = @{
        provider = "moneroo"
        storeId = $storeId
        paymentData = @{
            amount = 0.001  # Montant trop petit
            currency = "XOF"  # Devise activée
            description = "Test erreur montant"
            return_url = "http://localhost:5173/payment-success"
            storeId = $storeId
            customer = @{
                email = "test@example.com"
                first_name = "John"
                last_name = "Doe"
            }
            metadata = @{
                temp_order_number = "TEST-002"
                store_id = $storeId
                total_amount = "0.001"
            }
        }
    }

    $body = $paymentData | ConvertTo-Json -Depth 10
    $response = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/payment-gateway/initialize-payment" -Method POST -Headers $headers -Body $body -ContentType "application/json"

} catch {
    Write-Host "✅ Erreur attendue détectée:" -ForegroundColor Green
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $errorData = $responseBody | ConvertFrom-Json
        
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
        Write-Host "Error: $($errorData.error)" -ForegroundColor Red
        Write-Host "Details: $($errorData.details)" -ForegroundColor Red
        
        if ($errorData.details -like "*amount must be at least*") {
            Write-Host "✅ Message d'erreur de montant détecté correctement!" -ForegroundColor Green
        }
    }
}

Write-Host "`n=== TESTS TERMINÉS ===" -ForegroundColor Cyan
