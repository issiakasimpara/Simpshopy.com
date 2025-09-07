# Script PowerShell pour tester ZeptoMail directement
# Ce script teste l'API ZeptoMail sans passer par Supabase

Write-Host "Test direct de l'API ZeptoMail" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

# Configuration ZeptoMail
$ZEPTOMAIL_TOKEN = "Zoho-enczapikey wSsVR61/rx72DvwulDf4c+cwmggEUln0R0h0jlbwvyD9T6yWosc5kRGdUQf1FaIdE2FrFTFHoO8pnxgE1TQNjol7nAoAXSiF9mqRe1U4J3x17qnvhDzOX2lakxuAKYsAwwxvnWZgE84r+g=="
$ZEPTOMAIL_URL = "https://api.zeptomail.com/v1.1/email"

# Test 1: Email de test simple
Write-Host "Test 1: Envoi d'un email de test" -ForegroundColor Yellow

$testEmailData = @{
    from = @{
        address = "mail@simpshopy.com"
        name = "SimpShopy Test"
    }
    to = @(
        @{
            email_address = @{
                address = "test@simpshopy.com"
                name = "Test User"
            }
        }
    )
    subject = "Test ZeptoMail Integration - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    htmlbody = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Test ZeptoMail</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Test ZeptoMail</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Integration SimpShopy</p>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #e9ecef; border-top: none;">
        <h2 style="color: #333; margin-top: 0;">Email de test envoye avec succes !</h2>
        <p style="color: #666; line-height: 1.6;">
            Cet email confirme que l'integration ZeptoMail fonctionne correctement.
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Details du test :</h3>
            <ul style="color: #666;">
                <li><strong>Service :</strong> ZeptoMail</li>
                <li><strong>Domaine :</strong> mail@simpshopy.com</li>
                <li><strong>Date :</strong> $(Get-Date -Format 'dd/MM/yyyy HH:mm')</li>
                <li><strong>Statut :</strong> Fonctionnel</li>
            </ul>
        </div>
        
        <p style="text-align: center; color: #666; margin-top: 30px;">
            Merci de votre confiance !<br>
            <strong>SimpShopy</strong>
        </p>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef; border-top: none;">
        <p style="font-size: 14px; color: #666; margin: 0;">
            Cet email a ete envoye automatiquement par SimpShopy
        </p>
    </div>
</body>
</html>
"@
} | ConvertTo-Json -Depth 4

Write-Host "Donnees de l'email:" -ForegroundColor Cyan
Write-Host $testEmailData -ForegroundColor White

try {
    $response = Invoke-RestMethod -Uri $ZEPTOMAIL_URL -Method POST -Headers @{
        "Accept" = "application/json"
        "Content-Type" = "application/json"
        "Authorization" = $ZEPTOMAIL_TOKEN
    } -Body $testEmailData

    Write-Host "Reponse de ZeptoMail:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Cyan

    if ($response) {
        Write-Host "SUCCES: Email envoye avec ZeptoMail!" -ForegroundColor Green
        Write-Host "Verifiez votre boite email: test@simpshopy.com" -ForegroundColor Green
    }

} catch {
    Write-Host "Erreur lors de l'envoi de l'email: $($_.Exception.Message)" -ForegroundColor Red
    
    # Afficher plus de details sur l'erreur
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Details de l'erreur: $errorBody" -ForegroundColor Red
    }
}

Write-Host "Test termine!" -ForegroundColor Green
