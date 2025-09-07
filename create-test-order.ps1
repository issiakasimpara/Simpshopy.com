# Script PowerShell pour creer une commande de test avec sirikisuv@gmail.com
# Ce script cree une vraie commande dans la base de donnees pour tester ZeptoMail

Write-Host "Creation d'une commande de test avec sirikisuv@gmail.com" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green

# Configuration Supabase
$SUPABASE_URL = "https://grutldacuowplosarucp.supabase.co"
$SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQ4NzQ4MCwiZXhwIjoyMDUzMDYzNDgwfQ.8Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q"

# Generer un numero de commande unique
$orderNumber = "TEST-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$orderId = [System.Guid]::NewGuid().ToString()

Write-Host "Numero de commande: $orderNumber" -ForegroundColor Cyan
Write-Host "ID de commande: $orderId" -ForegroundColor Cyan

# Donnees de la commande de test
$orderData = @{
    id = $orderId
    order_number = $orderNumber
    store_id = "votre-store-id"  # A remplacer par un vrai store_id
    customer_email = "sirikisuv@gmail.com"
    customer_name = "Test Customer"
    customer_phone = "+225 07 12 34 56 78"
    total_amount = 25000
    currency = "CFA"
    status = "pending"
    payment_method = "moneroo"
    payment_status = "pending"
    items = @(
        @{
            name = "Produit Test ZeptoMail"
            quantity = 2
            price = 12500
            image = "https://via.placeholder.com/150"
        }
    )
    shipping_address = @{
        street = "123 Rue Test"
        city = "Abidjan"
        postal_code = "00225"
        country = "Côte d'Ivoire"
    }
    billing_address = @{
        street = "123 Rue Test"
        city = "Abidjan"
        postal_code = "00225"
        country = "Côte d'Ivoire"
    }
    shipping_method = @{
        name = "Livraison Standard"
        delivery_time = "3-5 jours ouvrables"
        cost = 0
    }
    shipping_cost = 0
    created_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    updated_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json -Depth 4

Write-Host "`nDonnees de la commande:" -ForegroundColor Yellow
Write-Host $orderData -ForegroundColor White

# Methode 1: Insertion directe dans la base de donnees
Write-Host "`nMethode 1: Insertion directe dans public_orders" -ForegroundColor Yellow

try {
    $insertResponse = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/public_orders" -Method POST -Headers @{
        "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
        "Content-Type" = "application/json"
        "apikey" = $SUPABASE_SERVICE_KEY
        "Prefer" = "return=representation"
    } -Body $orderData

    Write-Host "Commande creee avec succes!" -ForegroundColor Green
    Write-Host "Reponse:" -ForegroundColor Cyan
    $insertResponse | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White

    Write-Host "`nLes triggers PostgreSQL devraient maintenant envoyer les emails automatiquement!" -ForegroundColor Green
    Write-Host "Verifiez l'email: sirikisuv@gmail.com" -ForegroundColor Yellow

} catch {
    Write-Host "Erreur lors de la creation de la commande: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Details de l'erreur: $errorBody" -ForegroundColor Red
    }
}

# Methode 2: Test via l'Edge Function (si la commande existe deja)
Write-Host "`nMethode 2: Test direct de l'Edge Function" -ForegroundColor Yellow

$edgeFunctionData = @{
    orderId = $orderId
} | ConvertTo-Json

try {
    $edgeResponse = Invoke-RestMethod -Uri "$SUPABASE_URL/functions/v1/send-order-emails" -Method POST -Headers @{
        "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
        "Content-Type" = "application/json"
    } -Body $edgeFunctionData

    Write-Host "Edge Function executee avec succes!" -ForegroundColor Green
    Write-Host "Reponse:" -ForegroundColor Cyan
    $edgeResponse | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White

} catch {
    Write-Host "Edge Function non accessible (normal si la commande n'existe pas encore)" -ForegroundColor Yellow
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest termine!" -ForegroundColor Green
Write-Host "Verifiez l'email sirikisuv@gmail.com pour confirmer la reception des emails ZeptoMail" -ForegroundColor Yellow
