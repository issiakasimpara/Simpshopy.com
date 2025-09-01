# Test avec les données exactes du checkout
$supabaseUrl = "https://grutldacuowplosarucp.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTAxNjEsImV4cCI6MjA2NDY2NjE2MX0.cqKxbFdqF589dQBSH3IKNL6kXdRNtS9dpkrYNOHk0Ac"

$storeId = "d6d0e01a-0283-4a87-8da0-b248c36e37d5"

Write-Host "=== TEST AVEC DONNÉES EXACTES DU CHECKOUT ===" -ForegroundColor Cyan
Write-Host "Store ID: $storeId" -ForegroundColor Yellow

$headers = @{
    "Content-Type" = "application/json"
    "apikey" = $anonKey
    "Authorization" = "Bearer $anonKey"
}

# Test avec les données exactes du checkout (après modification)
Write-Host "`n=== TEST: Données exactes du checkout avec GBP ===" -ForegroundColor Green

try {
    $paymentData = @{
        provider = "moneroo"
        storeId = $storeId
        paymentData = @{
            amount = 10.50  # Montant décimal (pas en centimes)
            currency = "GBP"  # Devise du checkout (comme dans la DB)
            description = "Commande TEMP-1756700000000 - maman"
            return_url = "http://localhost:5173/payment-success?temp_order=TEMP-1756700000000"
            storeId = $storeId
            customer = @{
                email = "test@example.com"
                first_name = "John"
                last_name = "Doe"
                phone = "+1234567890"
                address = "123 Test Street"
                city = "Test City"
                country = "ML"
                zip = "12345"
            }
            metadata = @{
                temp_order_number = "TEMP-1756700000000"
                store_id = $storeId
                store_name = "maman"
                customer_info = '{"email":"test@example.com","firstName":"John","lastName":"Doe","phone":"+1234567890","address":"123 Test Street","city":"Test City","country":"ML","postalCode":"12345"}'
                items = '[{"id":"1","name":"Test Product","price":10,"quantity":1}]'
                shipping_method = '{"name":"Standard","cost":0}'
                shipping_cost = "0"
                total_amount = "10.50"
            }
        }
    }

    $body = $paymentData | ConvertTo-Json -Depth 10

    Write-Host "Données envoyées:" -ForegroundColor Yellow
    Write-Host $body -ForegroundColor Gray

    $response = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/payment-gateway/initialize-payment" -Method POST -Headers $headers -Body $body -ContentType "application/json"

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
