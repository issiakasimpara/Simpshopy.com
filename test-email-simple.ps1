# Test simple d'envoi d'email
Write-Host "Test d'envoi email sur sirikisuv@gmail.com" -ForegroundColor Green

try {
    $body = @{
        sender = @{
            email = "mail@simpshopy.com"
            name = "Simpshopy"
        }
        recipients = @(
            @{
                email = "sirikisuv@gmail.com"
                name = "Test"
            }
        )
        template_id = "ffyypgq3toe2"
        params = @{
            order_id = "TEST001"
            store_name = "Boutique Test"
            customer_name = "Test Client"
            customer_email = "sirikisuv@gmail.com"
            total_amount = "99.99"
            order_date = "15/01/2024"
            payment_method = "Moneroo"
        }
        server = "SimpShopy"
    } | ConvertTo-Json -Depth 3

    Write-Host "Envoi en cours..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "https://api.mailzeet.com/v1/mails" -Method POST -Headers @{
        "Authorization" = "Bearer 5eelaz32hdbl:efyg6m7n0937bmp1y0sr5j2fn"
        "Content-Type" = "application/json"
    } -Body $body

    Write-Host "SUCCESS: Email envoyé !" -ForegroundColor Green
    Write-Host "Message ID: $($response.data.id)" -ForegroundColor Cyan
    Write-Host "Vérifiez sirikisuv@gmail.com" -ForegroundColor Yellow
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}
