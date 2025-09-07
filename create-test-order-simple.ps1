# Script simple pour créer une commande de test
$supabaseUrl = "https://grutldacuowplosarucp.supabase.co"
$supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQ4NzQ4MCwiZXhwIjoyMDUzMDYzNDgwfQ.8Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q"

Write-Host "Recherche d'une boutique existante..." -ForegroundColor Yellow

# Récupérer une boutique
try {
    $storesUrl = $supabaseUrl + "/rest/v1/stores?select=id,name,merchant_id&limit=1"
    $storesResponse = Invoke-RestMethod -Uri $storesUrl -Method GET -Headers @{
        "apikey" = $supabaseServiceKey
        "Authorization" = "Bearer $supabaseServiceKey"
        "Content-Type" = "application/json"
    }
    
    if ($storesResponse.Count -eq 0) {
        Write-Host "Aucune boutique trouvee" -ForegroundColor Red
        exit 1
    }
    
    $store = $storesResponse[0]
    Write-Host "Boutique trouvee: $($store.name)" -ForegroundColor Green
    
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Récupérer un produit
Write-Host "Recherche d'un produit..." -ForegroundColor Yellow

try {
    $productsUrl = $supabaseUrl + "/rest/v1/products?select=id,name,price&store_id=eq." + $store.id + "&limit=1"
    $productsResponse = Invoke-RestMethod -Uri $productsUrl -Method GET -Headers @{
        "apikey" = $supabaseServiceKey
        "Authorization" = "Bearer $supabaseServiceKey"
        "Content-Type" = "application/json"
    }
    
    if ($productsResponse.Count -eq 0) {
        Write-Host "Aucun produit trouve" -ForegroundColor Red
        exit 1
    }
    
    $product = $productsResponse[0]
    Write-Host "Produit trouve: $($product.name)" -ForegroundColor Green
    
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Créer la commande
Write-Host "Creation de la commande..." -ForegroundColor Yellow

$orderNumber = "TEST-" + (Get-Date -Format "yyyyMMdd-HHmmss")

$orderData = @{
    order_number = $orderNumber
    customer_email = "sirikisuv@gmail.com"
    customer_name = "Siriki Simpara"
    customer_phone = "+225 07 12 34 56 78"
    store_id = $store.id
    total_amount = [decimal]$product.price
    currency = "XOF"
    status = "pending"
    items = @(
        @{
            product_id = $product.id
            name = $product.name
            price = [decimal]$product.price
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
} | ConvertTo-Json -Depth 10

try {
    $orderUrl = $supabaseUrl + "/rest/v1/public_orders"
    $orderResponse = Invoke-RestMethod -Uri $orderUrl -Method POST -Headers @{
        "apikey" = $supabaseServiceKey
        "Authorization" = "Bearer $supabaseServiceKey"
        "Content-Type" = "application/json"
        "Prefer" = "return=representation"
    } -Body $orderData
    
    Write-Host "Commande creee avec succes!" -ForegroundColor Green
    Write-Host "Numero: $($orderResponse.order_number)" -ForegroundColor Cyan
    Write-Host "Email: $($orderResponse.customer_email)" -ForegroundColor Cyan
    Write-Host "Montant: $($orderResponse.total_amount) $($orderResponse.currency)" -ForegroundColor Cyan
    
    Write-Host "Verifiez l'email sirikisuv@gmail.com!" -ForegroundColor Yellow
    
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Details: $responseBody" -ForegroundColor Red
    }
    exit 1
}

Write-Host "Test termine!" -ForegroundColor Green
