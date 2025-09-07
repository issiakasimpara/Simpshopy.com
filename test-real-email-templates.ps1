# Script pour tester les vrais templates d'emails avec des données réalistes
$supabaseUrl = "https://grutldacuowplosarucp.supabase.co"
$supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQ4NzQ4MCwiZXhwIjoyMDUzMDYzNDgwfQ.8Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q"

Write-Host "🧪 Test des vrais templates d'emails ZeptoMail" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Données de test réalistes
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
            image_url = "https://via.placeholder.com/100x100"
        }
    )
    shipping_address = @{
        name = "Siriki Simpara"
        address = "123 Rue quartier rouge"
        city = "Abidjan"
        postal_code = "00225"
        country = "Côte d'Ivoire"
    }
    billing_address = @{
        name = "Siriki Simpara"
        address = "123 Rue quartier rouge"
        city = "Abidjan"
        postal_code = "00225"
        country = "Côte d'Ivoire"
    }
    payment_method = "Moneroo"
}

$testStoreData = @{
    id = "store-test-123"
    name = "Ma Boutique Test"
    description = "Une boutique de test pour SimpShopy"
    domain = "ma-boutique-test.simpshopy.com"
    logo_url = "https://via.placeholder.com/200x100"
    owner_email = "admin@ma-boutique-test.com"
    settings = @{
        currency = "XOF"
        language = "fr"
        timezone = "Africa/Abidjan"
    }
}

Write-Host "📧 Envoi de l'email client..." -ForegroundColor Yellow

# Test de l'email client
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
    
    Write-Host "✅ Email client envoyé avec succès!" -ForegroundColor Green
    Write-Host "📧 Destinataire: sirikisuv@gmail.com" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erreur email client: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Détails: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n📧 Envoi de l'email admin..." -ForegroundColor Yellow

# Test de l'email admin
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
    
    Write-Host "✅ Email admin envoyé avec succès!" -ForegroundColor Green
    Write-Host "📧 Destinataire: admin@ma-boutique-test.com" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erreur email admin: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Détails: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n🎯 RÉSULTAT DU TEST:" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "📧 Email client: Vérifiez sirikisuv@gmail.com" -ForegroundColor Yellow
Write-Host "📧 Email admin: Vérifiez admin@ma-boutique-test.com" -ForegroundColor Yellow
Write-Host "`n💡 Ces emails utilisent les VRAIS templates du système!" -ForegroundColor Cyan
Write-Host "💡 Ils correspondent exactement à ce qui est affiché dans la prévisualisation!" -ForegroundColor Cyan
