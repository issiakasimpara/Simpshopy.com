# Script PowerShell pour tester ZeptoMail avec un email simple
# Ce script teste l'API ZeptoMail avec un email basique

Write-Host "Test ZeptoMail avec un email simple" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

# Configuration ZeptoMail
$ZEPTOMAIL_TOKEN = "Zoho-enczapikey wSsVR61/rx72DvwulDf4c+cwmggEUln0R0h0jlbwvyD9T6yWosc5kRGdUQf1FaIdE2FrFTFHoO8pnxgE1TQNjol7nAoAXSiF9mqRe1U4J3x17qnvhDzOX2lakxuAKYsAwwxvnWZgE84r+g=="
$ZEPTOMAIL_URL = "https://api.zeptomail.com/v1.1/email"

# Test avec un email simple
Write-Host "`nTest avec un email simple" -ForegroundColor Yellow

$simpleEmailData = @{
    from = @{
        address = "mail@simpshopy.com"
        name = "SimpShopy"
    }
    to = @(
        @{
            email_address = @{
                address = "sirikisuv@gmail.com"
                name = "Test User"
            }
        }
    )
    subject = "Test Commande SimpShopy - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    htmlbody = "<h1>Test de commande SimpShopy</h1><p>Commande #TEST-$(Get-Date -Format 'yyyyMMdd-HHmmss')</p><p>Montant: 25,000 CFA</p><p>Email envoye via ZeptoMail</p>"
} | ConvertTo-Json -Depth 3

Write-Host "Donnees de l'email:" -ForegroundColor Cyan
Write-Host $simpleEmailData -ForegroundColor White

try {
    $response = Invoke-RestMethod -Uri $ZEPTOMAIL_URL -Method POST -Headers @{
        "Accept" = "application/json"
        "Content-Type" = "application/json"
        "Authorization" = $ZEPTOMAIL_TOKEN
    } -Body $simpleEmailData

    Write-Host "Email envoye avec succes!" -ForegroundColor Green
    Write-Host "Reponse:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White

    Write-Host "`nVerifiez l'email sirikisuv@gmail.com" -ForegroundColor Yellow

} catch {
    Write-Host "Erreur lors de l'envoi de l'email: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Details de l'erreur: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`nTest termine!" -ForegroundColor Green
