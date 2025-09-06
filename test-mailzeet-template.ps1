# Test du template Mailzeet pour confirmation de commande
Write-Host "Test du template Mailzeet ffyypgq3toe2" -ForegroundColor Green

$supabaseUrl = "https://grutldacuowplosarucp.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTAxNjEsImV4cCI6MjA2NDY2NjE2MX0.cqKxbFdqF589dQBSH3IKNL6kXdRNtS9dpkrYNOHk0Ac"

Write-Host "Template ID: ffyypgq3toe2" -ForegroundColor Cyan
Write-Host "Type: Confirmation de commande" -ForegroundColor Cyan
Write-Host ""

# Test direct de l'API Mailzeet avec le template
Write-Host "Test direct API Mailzeet avec template..." -ForegroundColor Yellow

try {
    $mailzeetResponse = Invoke-RestMethod -Uri "https://api.mailzeet.com/v1/mails" -Method POST -Headers @{
        "Authorization" = "Bearer 5eelaz32hdbl:efyg6m7n0937bmp1y0sr5j2fn"
        "Content-Type" = "application/json"
    } -Body (@{
        sender = @{
            email = "mail@simpshopy.com"
            name = "Simpshopy"
        }
        recipients = @(
            @{
                email = "mail@simpshopy.com"
                name = "Test"
            }
        )
        template_id = "ffyypgq3toe2"
        params = @{
            order_id = "123456"
            store_name = "Boutique Test"
            customer_name = "Jean Dupont"
            customer_email = "jean@example.com"
            total_amount = "150.00"
            order_date = "15/01/2024"
            payment_method = "Moneroo"
            order_items = @(
                @{
                    name = "Produit Test"
                    quantity = 2
                    price = "75.00"
                }
            )
        }
        server = "SimpShopy"
    } | ConvertTo-Json -Depth 4)

    Write-Host "SUCCESS: Template Mailzeet fonctionnel" -ForegroundColor Green
    Write-Host "Message ID: $($mailzeetResponse.data.id)" -ForegroundColor Cyan
    Write-Host "Status: $($mailzeetResponse.data.status)" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test de l'Edge Function
Write-Host "Test Edge Function send-order-emails..." -ForegroundColor Yellow

try {
    $orderResponse = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/send-order-emails" -Method POST -Headers @{
        "Authorization" = "Bearer $anonKey"
        "Content-Type" = "application/json"
    } -Body (@{
        orderId = "test-template-mailzeet"
    } | ConvertTo-Json)

    Write-Host "SUCCESS: Edge Function avec template fonctionnelle" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*MAILZEET_API_KEY*") {
        Write-Host "WARNING: Variables d'environnement non configurées" -ForegroundColor Yellow
        Write-Host "Configurez MAILZEET_API_KEY et MAILZEET_SERVER_NAME dans Supabase" -ForegroundColor Cyan
    } else {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Configuration finale:" -ForegroundColor Cyan
Write-Host "1. Template ID: ffyypgq3toe2" -ForegroundColor White
Write-Host "2. Variables disponibles:" -ForegroundColor White
Write-Host "   - order_id, store_name, customer_name" -ForegroundColor Gray
Write-Host "   - customer_email, total_amount, order_date" -ForegroundColor Gray
Write-Host "   - payment_method, order_items" -ForegroundColor Gray
Write-Host "3. Configuration globale pour toutes les boutiques" -ForegroundColor White
Write-Host ""
Write-Host "Template Mailzeet pret !" -ForegroundColor Green

# Test direct de l'API Mailzeet avec le template
Write-Host ""
Write-Host "Test direct API Mailzeet avec template..." -ForegroundColor Yellow

try {
    $mailzeetResponse = Invoke-RestMethod -Uri "https://api.mailzeet.com/v1/mails" -Method POST -Headers @{
        "Authorization" = "Bearer 5eelaz32hdbl:efyg6m7n0937bmp1y0sr5j2fn"
        "Content-Type" = "application/json"
    } -Body (@{
        sender = @{
            email = "mail@simpshopy.com"
            name = "Simpshopy"
        }
        recipients = @(
            @{
                email = "mail@simpshopy.com"
                name = "Test"
            }
        )
        template_id = "ffyypgq3toe2"
        params = @{
            order_id = "123456"
            store_name = "Boutique Test"
            customer_name = "Jean Dupont"
            customer_email = "jean@example.com"
            total_amount = "150.00"
            order_date = "15/01/2024"
            payment_method = "Moneroo"
        }
        server = "SimpShopy"
    } | ConvertTo-Json -Depth 3)

    Write-Host "SUCCESS: Template Mailzeet fonctionnel" -ForegroundColor Green
    Write-Host "Message ID: $($mailzeetResponse.data.id)" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
