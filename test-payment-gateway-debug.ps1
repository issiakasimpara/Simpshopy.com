# Test script pour déboguer l'Edge Function payment-gateway
$supabaseUrl = "https://grutldacuowplosarucp.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdXdwYW9zYXJ1Y3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNzE5NzI5MCwiZXhwIjoyMDUyNzc1MjkwfQ.cqKxbF"

# Données de test basées sur ce que nous voyons dans la console
$testData = @{
    provider = "moneroo"
    storeId = "d6d0e01a-0283-4a87-8da0-b248c36e37d5"
    paymentData = @{
        amount = 1000  # 10 GBP en centimes
        currency = "GBP"
        description = "Test payment"
        return_url = "https://simpshopy.com/payment-success?temp_order=TEMP-1756698540000"
        storeId = "d6d0e01a-0283-4a87-8da0-b248c36e37d5"
        customer = @{
            email = "test@example.com"
            first_name = "Test"
            last_name = "User"
            phone = "+1234567890"
            address = "123 Test St"
            city = "Test City"
            country = "ML"
            zip = "12345"
        }
        metadata = @{
            temp_order_number = "TEMP-1756698540000"
            store_id = "d6d0e01a-0283-4a87-8da0-b248c36e37d5"
            store_name = "Test Store"
            customer_info = '{"email":"test@example.com","firstName":"Test","lastName":"User","phone":"+1234567890","address":"123 Test St","city":"Test City","country":"ML","postalCode":"12345"}'
            items = '[{"id":"test-item","name":"Test Product","price":10,"quantity":1}]'
            shipping_method = '{"name":"Standard","cost":0}'
            shipping_cost = "0"
            total_amount = "10"
        }
    }
}

Write-Host "=== TEST PAYMENT GATEWAY DEBUG ===" -ForegroundColor Cyan
Write-Host "URL: $supabaseUrl/functions/v1/payment-gateway/initialize-payment" -ForegroundColor Yellow
Write-Host "Data: $($testData | ConvertTo-Json -Depth 10)" -ForegroundColor Yellow

try {
    $headers = @{
        "Content-Type" = "application/json"
        "apikey" = $anonKey
        "Authorization" = "Bearer $anonKey"
    }

    $body = $testData | ConvertTo-Json -Depth 10

    Write-Host "`n=== MAKING REQUEST ===" -ForegroundColor Green
    
    $response = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/payment-gateway/initialize-payment" -Method POST -Headers $headers -Body $body -ContentType "application/json"

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
