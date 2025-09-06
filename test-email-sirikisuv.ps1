# Test d'envoi d'email de confirmation de commande sur sirikisuv@gmail.com
Write-Host "Test d'envoi d'email de confirmation de commande" -ForegroundColor Green
Write-Host "Destinataire: sirikisuv@gmail.com" -ForegroundColor Cyan
Write-Host "Template: ffyypgq3toe2" -ForegroundColor Cyan
Write-Host ""

# Test direct de l'API Mailzeet avec le template
Write-Host "Envoi d'email de test via API Mailzeet..." -ForegroundColor Yellow

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
                email = "sirikisuv@gmail.com"
                name = "Test Simpshopy"
            }
        )
        template_id = "ffyypgq3toe2"
        params = @{
            order_id = "TEST001"
            store_name = "Boutique Test Simpshopy"
            customer_name = "Test Client"
            customer_email = "sirikisuv@gmail.com"
            total_amount = "99.99"
            order_date = (Get-Date).ToString("dd/MM/yyyy")
            payment_method = "Moneroo"
            order_items = @(
                @{
                    name = "Produit Test Simpshopy"
                    quantity = 1
                    price = "99.99"
                }
            )
        }
        server = "SimpShopy"
    } | ConvertTo-Json -Depth 4)

    Write-Host "SUCCESS: Email envoyé avec succès !" -ForegroundColor Green
    Write-Host "Message ID: $($mailzeetResponse.data.id)" -ForegroundColor Cyan
    Write-Host "Status: $($mailzeetResponse.data.status)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Vérifiez votre boîte email: sirikisuv@gmail.com" -ForegroundColor Yellow
    Write-Host "L'email devrait arriver dans quelques minutes." -ForegroundColor Yellow
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Message -like "*422*") {
        Write-Host "Erreur 422: Vérifiez les paramètres du template" -ForegroundColor Yellow
    } elseif ($_.Exception.Message -like "*401*") {
        Write-Host "Erreur 401: Vérifiez la clé API Mailzeet" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Détails de l'email de test:" -ForegroundColor Cyan
Write-Host "- Expéditeur: mail@simpshopy.com" -ForegroundColor White
Write-Host "- Destinataire: sirikisuv@gmail.com" -ForegroundColor White
Write-Host "- Template: ffyypgq3toe2 (Confirmation de commande)" -ForegroundColor White
Write-Host "- Boutique: Boutique Test Simpshopy" -ForegroundColor White
Write-Host "- Commande: TEST001" -ForegroundColor White
Write-Host "- Montant: 99.99" -ForegroundColor White
Write-Host ""
Write-Host "Test terminé !" -ForegroundColor Green
