# Script pour créer une vraie commande de test dans le système SimpShopy
# Utilise les vraies données de la base de données

$supabaseUrl = "https://grutldacuowplosarucp.supabase.co"
$supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQ4NzQ4MCwiZXhwIjoyMDUzMDYzNDgwfQ.8Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q"

Write-Host "🔍 Recherche d'une boutique existante..." -ForegroundColor Yellow

# 1. Récupérer une boutique existante
try {
    $storesResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/stores?select=id,name,merchant_id&limit=1" -Method GET -Headers @{
        "apikey" = $supabaseServiceKey
        "Authorization" = "Bearer $supabaseServiceKey"
        "Content-Type" = "application/json"
    }
    
    if ($storesResponse.Count -eq 0) {
        Write-Host "❌ Aucune boutique trouvée dans le système" -ForegroundColor Red
        exit 1
    }
    
    $store = $storesResponse[0]
    Write-Host "✅ Boutique trouvée: $($store.name) (ID: $($store.id))" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur lors de la récupération des boutiques: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Récupérer un produit de cette boutique
Write-Host "🔍 Recherche d'un produit dans la boutique..." -ForegroundColor Yellow

try {
    $productsUrl = '$supabaseUrl/rest/v1/products?select=id,name,price&store_id=eq.' + $store.id + '&limit=1'
    $productsResponse = Invoke-RestMethod -Uri $productsUrl -Method GET -Headers @{
        "apikey" = $supabaseServiceKey
        "Authorization" = "Bearer $supabaseServiceKey"
        "Content-Type" = "application/json"
    }
    
    if ($productsResponse.Count -eq 0) {
        Write-Host "❌ Aucun produit trouvé dans cette boutique" -ForegroundColor Red
        exit 1
    }
    
    $product = $productsResponse[0]
    Write-Host "✅ Produit trouvé: $($product.name) - Prix: $($product.price)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur lors de la récupération des produits: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Créer une commande avec les vraies données
Write-Host "🛒 Création de la commande de test..." -ForegroundColor Yellow

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
        country = "Côte d'Ivoire"
    }
    billing_address = @{
        name = "Siriki Simpara"
        address = "123 Rue quartier rouge"
        city = "Abidjan"
        postal_code = "00225"
        country = "Côte d'Ivoire"
    }
} | ConvertTo-Json -Depth 10

try {
    $orderResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/public_orders" -Method POST -Headers @{
        "apikey" = $supabaseServiceKey
        "Authorization" = "Bearer $supabaseServiceKey"
        "Content-Type" = "application/json"
        "Prefer" = "return=representation"
    } -Body $orderData
    
    Write-Host "✅ Commande créée avec succès!" -ForegroundColor Green
    Write-Host "📧 Numéro de commande: $($orderResponse.order_number)" -ForegroundColor Cyan
    Write-Host "📧 ID de commande: $($orderResponse.id)" -ForegroundColor Cyan
    Write-Host "📧 Email client: $($orderResponse.customer_email)" -ForegroundColor Cyan
    Write-Host "📧 Montant: $($orderResponse.total_amount) $($orderResponse.currency)" -ForegroundColor Cyan
    
    Write-Host "`n🎯 Les emails devraient être envoyés automatiquement via les triggers PostgreSQL!" -ForegroundColor Green
    Write-Host "📧 Vérifiez l'email sirikisuv@gmail.com pour l'email client" -ForegroundColor Yellow
    Write-Host "📧 Vérifiez l'email du propriétaire de la boutique pour l'email admin" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Erreur lors de la création de la commande: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Détails de l'erreur: $responseBody" -ForegroundColor Red
    }
    exit 1
}

Write-Host "`n🎉 Test terminé! Vérifiez vos emails pour voir les templates réels." -ForegroundColor Green
