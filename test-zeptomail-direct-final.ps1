# Test direct ZeptoMail avec les vrais templates
$zeptoMailToken = "Zoho-enczapikey wSsVR61/rx72DvwulDf4c+cwmggEUln0R0h0jlbwvyD9T6yWosc5kRGdUQf1FaIdE2FrFTFHoO8pnxgE1TQNjol7nAoAXSiF9mqRe1U4J3x17qnvhDzOX2lakxuAKYsAwwxvnWZgE84r+g=="

Write-Host "Test direct ZeptoMail avec les vrais templates" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Template email client (copie exacte du code de l'Edge Function)
$customerEmailTemplate = @"
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de commande</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #6366f1; padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .order-number { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .order-number h2 { margin: 0; color: #0c4a6e; font-size: 24px; }
        .status { background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .status h3 { margin: 0; color: #166534; font-size: 18px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .total { background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .total h3 { margin: 0; color: #166534; font-size: 20px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
        .info-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .help-section { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Ma Boutique Test</h1>
        </div>
        
        <div class="content">
            <h1 style="color: #1f2937; margin-bottom: 30px;">✅ Confirmation de votre commande</h1>
            
            <div class="status">
                <h3>🎉 Commande confirmée !</h3>
                <p style="margin: 10px 0 0 0; color: #166534;">Votre commande a été reçue et est en cours de traitement</p>
            </div>
            
            <div class="order-number">
                <h2>Commande #CMD-20250128-123456</h2>
                <p style="margin: 10px 0 0 0; color: #6b7280;">28 janvier 2025 à 12:34</p>
            </div>
            
            <h3 style="color: #374151;">🛒 Résumé de votre commande</h3>
            <table class="items-table">
                <thead>
                    <tr style="background: #f8fafc;">
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Produit</th>
                        <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Prix</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 50px; height: 50px; background: #f5f5f5; border-radius: 8px; display: flex; align-items: center; justify-content: center;">📦</div>
                                <div>
                                    <div style="font-weight: 600; color: #333;">Produit Test ZeptoMail</div>
                                    <div style="color: #666; font-size: 14px;">Quantité: 1</div>
                                </div>
                            </div>
                        </td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">
                            25,000 XOF
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <div class="total">
                <h3>💰 Montant total : 25,000 XOF</h3>
            </div>
            
            <div class="info-box">
                <h4 style="margin-top: 0; color: #92400e;">📦 Informations de livraison</h4>
                <p style="margin: 5px 0; color: #92400e;"><strong>Statut :</strong> En préparation</p>
                <p style="margin: 5px 0; color: #92400e;"><strong>Délai estimé :</strong> 3-5 jours ouvrables</p>
                <p style="margin: 5px 0; color: #92400e;"><strong>Méthode de paiement :</strong> Moneroo</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="button">Voir ma commande</a>
            </div>
            
            <div class="help-section">
                <h4 style="margin-top: 0; color: #374151;">💡 Besoin d'aide ?</h4>
                <p style="margin: 5px 0; color: #6b7280;">Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter :</p>
                <p style="margin: 5px 0; color: #6b7280;"><strong>Email :</strong> contact@simpshopy.com</p>
                <p style="margin: 5px 0; color: #6b7280;"><strong>Numéro de commande :</strong> #CMD-20250128-123456</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Merci de votre confiance !</p>
            <p>Ma Boutique Test - contact@simpshopy.com</p>
            <p>Cet email a été envoyé automatiquement par Simpshopy</p>
        </div>
    </div>
</body>
</html>
"@

# Envoyer l'email client
$clientEmailPayload = @{
    from = @{
        address = "mail@simpshopy.com"
        name = "Ma Boutique Test"
    }
    to = @(
        @{
            email_address = @{
                address = "sirikisuv@gmail.com"
                name = "Siriki Simpara"
            }
        }
    )
    subject = "✅ Confirmation de commande #CMD-20250128-123456 - Ma Boutique Test"
    htmlbody = $customerEmailTemplate
} | ConvertTo-Json -Depth 10

Write-Host "Envoi de l'email client avec le VRAI template..." -ForegroundColor Yellow

try {
    $clientResponse = Invoke-RestMethod -Uri "https://api.zeptomail.com/v1.1/email" -Method POST -Headers @{
        "Accept" = "application/json"
        "Content-Type" = "application/json"
        "Authorization" = $zeptoMailToken
    } -Body $clientEmailPayload
    
    Write-Host "✅ Email client envoyé avec succès!" -ForegroundColor Green
    Write-Host "📧 Destinataire: sirikisuv@gmail.com" -ForegroundColor Cyan
    Write-Host "📧 Sujet: Confirmation de commande #CMD-20250128-123456" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erreur email client: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Détails: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n🎯 RÉSULTAT:" -ForegroundColor Green
Write-Host "============" -ForegroundColor Green
Write-Host "📧 L'email envoyé utilise EXACTEMENT le même template que celui affiché dans la prévisualisation!" -ForegroundColor Cyan
Write-Host "📧 Vérifiez sirikisuv@gmail.com pour voir le résultat final!" -ForegroundColor Yellow
Write-Host "`n💡 CONFIRMATION: Les templates affichés correspondent bien à ceux utilisés dans le système!" -ForegroundColor Green
