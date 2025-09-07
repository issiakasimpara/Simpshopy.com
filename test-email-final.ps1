# Test des vrais templates d'emails
$supabaseUrl = "https://grutldacuowplosarucp.supabase.co"
$supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQ4NzQ4MCwiZXhwIjoyMDUzMDYzNDgwfQ.8Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q"

Write-Host "Test des vrais templates d'emails ZeptoMail" -ForegroundColor Cyan

# Donnees de test
$testOrderData = @{
    id = "test-order-" + (Get-Date -Format "yyyyMMdd-HHmmss")
    order_number = "CMD-" + (Get-Date -Format "yyyyMMdd-HHmmss")
    customer_email = "sirikisuv@gmail.com"
    customer_name = "Siriki Simpara"
    customer_phone = "+225 07 12 34 56 78"
    total_amount = 25000
    currency = "XOF"
    status = "pending"
    created_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    items = @(
        @{
            product_id = "prod-test-123"
            name = "Produit Test ZeptoMail"
            price = 25000
            quantity = 1
        }
    )
    shipping_address = @{
        name = "Siriki Simpara"
        address = "123 Rue quartier rouge"
        city = "Abidjan"
        postal_code = "00225"
        country = "Cote d'Ivoire"
    }
    payment_method = "Moneroo"
}

$testStoreData = @{
    id = "store-test-123"
    name = "Ma Boutique Test"
    description = "Une boutique de test pour SimpShopy"
    domain = "ma-boutique-test.simpshopy.com"
    owner_email = "admin@ma-boutique-test.com"
}

Write-Host "Envoi de l'email client..." -ForegroundColor Yellow

# Test email client
$clientEmailPayload = @{
    orderData = $testOrderData
    storeData = $testStoreData
    emailType = "customer"
} | ConvertTo-Json -Depth 10

try {
    $clientResponse = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/send-order-emails" -Method POST -Headers @{
        "Authorization" = "Bearer $supabaseServiceKey"
        "Content-Type" = "application/json"
    } -Body $clientEmailPayload
    
    Write-Host "Email client envoye avec succes!" -ForegroundColor Green
    Write-Host "Destinataire: sirikisuv@gmail.com" -ForegroundColor Cyan
    
} catch {
    Write-Host "Erreur email client: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Envoi de l'email admin..." -ForegroundColor Yellow

# Test email admin
$adminEmailPayload = @{
    orderData = $testOrderData
    storeData = $testStoreData
    emailType = "admin"
    adminEmail = "admin@ma-boutique-test.com"
} | ConvertTo-Json -Depth 10

try {
    $adminResponse = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/send-order-emails" -Method POST -Headers @{
        "Authorization" = "Bearer $supabaseServiceKey"
        "Content-Type" = "application/json"
    } -Body $adminEmailPayload
    
    Write-Host "Email admin envoye avec succes!" -ForegroundColor Green
    Write-Host "Destinataire: admin@ma-boutique-test.com" -ForegroundColor Cyan
    
} catch {
    Write-Host "Erreur email admin: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "RESULTAT DU TEST:" -ForegroundColor Green
Write-Host "Email client: Verifiez sirikisuv@gmail.com" -ForegroundColor Yellow
Write-Host "Email admin: Verifiez admin@ma-boutique-test.com" -ForegroundColor Yellow
Write-Host "Ces emails utilisent les VRAIS templates du systeme!" -ForegroundColor Cyan
