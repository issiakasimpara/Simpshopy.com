# Script PowerShell pour recuperer les stores et creer une commande de test
# Ce script recupere d'abord les stores existants, puis cree une commande

Write-Host "Recuperation des stores et creation d'une commande de test" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green

# Configuration Supabase
$SUPABASE_URL = "https://grutldacuowplosarucp.supabase.co"
$SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQ4NzQ4MCwiZXhwIjoyMDUzMDYzNDgwfQ.8Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q"

# Etape 1: Recuperer les stores existants
Write-Host "`nEtape 1: Recuperation des stores existants" -ForegroundColor Yellow

try {
    $storesResponse = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/stores?select=id,name,merchant_id" -Method GET -Headers @{
        "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
        "apikey" = $SUPABASE_SERVICE_KEY
        "Content-Type" = "application/json"
    }

    Write-Host "Stores trouves:" -ForegroundColor Green
    $storesResponse | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Cyan

    if ($storesResponse.Count -gt 0) {
        $firstStore = $storesResponse[0]
        $storeId = $firstStore.id
        $storeName = $firstStore.name
        
        Write-Host "`nUtilisation du store: $storeName (ID: $storeId)" -ForegroundColor Green

        # Etape 2: Creer une commande de test
        Write-Host "`nEtape 2: Creation d'une commande de test" -ForegroundColor Yellow

        $orderNumber = "TEST-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        $orderId = [System.Guid]::NewGuid().ToString()

        Write-Host "Numero de commande: $orderNumber" -ForegroundColor Cyan
        Write-Host "ID de commande: $orderId" -ForegroundColor Cyan

        # Donnees de la commande de test
        $orderData = @{
            id = $orderId
            order_number = $orderNumber
            store_id = $storeId
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

        # Insertion de la commande
        try {
            $insertResponse = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/public_orders" -Method POST -Headers @{
                "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
                "Content-Type" = "application/json"
                "apikey" = $SUPABASE_SERVICE_KEY
                "Prefer" = "return=representation"
            } -Body $orderData

            Write-Host "`nCommande creee avec succes!" -ForegroundColor Green
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

    } else {
        Write-Host "Aucun store trouve dans la base de donnees" -ForegroundColor Red
        Write-Host "Vous devez d'abord creer une boutique dans SimpShopy" -ForegroundColor Yellow
    }

} catch {
    Write-Host "Erreur lors de la recuperation des stores: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Details de l'erreur: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`nTest termine!" -ForegroundColor Green
Write-Host "Verifiez l'email sirikisuv@gmail.com pour confirmer la reception des emails ZeptoMail" -ForegroundColor Yellow
