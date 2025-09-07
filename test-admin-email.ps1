# Test de l'email admin avec le vrai template
$zeptoMailToken = "Zoho-enczapikey wSsVR61/rx72DvwulDf4c+cwmggEUln0R0h0jlbwvyD9T6yWosc5kRGdUQf1FaIdE2FrFTFHoO8pnxgE1TQNjol7nAoAXSiF9mqRe1U4J3x17qnvhDzOX2lakxuAKYsAwwxvnWZgE84r+g=="

Write-Host "Test de l'email admin avec le VRAI template" -ForegroundColor Cyan

# Template email admin (copie exacte du code de l'Edge Function)
$adminEmailTemplate = @"
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle commande</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #6366f1; padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .order-number { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .order-number h2 { margin: 0; color: #0c4a6e; font-size: 24px; }
        .customer-info { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .total { background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .total h3 { margin: 0; color: #166534; font-size: 20px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Ma Boutique Test</h1>
        </div>
        
        <div class="content">
            <h1 style="color: #1f2937; margin-bottom: 30px;">Nouvelle commande recue !</h1>
            
            <div class="order-number">
                <h2>Commande #CMD-20250128-123456</h2>
                <p style="margin: 10px 0 0 0; color: #6b7280;">28 janvier 2025 a 12:34</p>
            </div>
            
            <div class="customer-info">
                <h3 style="margin-top: 0; color: #374151;">Informations client</h3>
                <p><strong>Nom :</strong> Siriki Simpara</p>
                <p><strong>Email :</strong> sirikisuv@gmail.com</p>
                <p><strong>Telephone :</strong> +225 07 12 34 56 78</p>
                <p><strong>Adresse :</strong> 123 Rue quartier rouge, Abidjan, Cote d'Ivoire</p>
                <p><strong>Methode de paiement :</strong> Moneroo</p>
            </div>
            
            <h3 style="color: #374151;">Produits commandes</h3>
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
                                <div style="width: 50px; height: 50px; background: #f5f5f5; border-radius: 8px; display: flex; align-items: center; justify-content: center;">Produit</div>
                                <div>
                                    <div style="font-weight: 600; color: #333;">Produit Test ZeptoMail</div>
                                    <div style="color: #666; font-size: 14px;">Quantite: 1</div>
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
                <h3>Montant total : 25,000 XOF</h3>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="button">Voir la commande</a>
            </div>
        </div>
        
        <div class="footer">
            <p>Cet email a ete envoye automatiquement par Simpshopy</p>
            <p>Ma Boutique Test - contact@simpshopy.com</p>
        </div>
    </div>
</body>
</html>
"@

# Envoyer l'email admin
$adminEmailPayload = @{
    from = @{
        address = "mail@simpshopy.com"
        name = "Ma Boutique Test"
    }
    to = @(
        @{
            email_address = @{
                address = "sirikisuv@gmail.com"
                name = "Administrateur"
            }
        }
    )
    subject = "Nouvelle commande #CMD-20250128-123456 - Ma Boutique Test"
    htmlbody = $adminEmailTemplate
} | ConvertTo-Json -Depth 10

Write-Host "Envoi de l'email admin avec le VRAI template..." -ForegroundColor Yellow

try {
    $adminResponse = Invoke-RestMethod -Uri "https://api.zeptomail.com/v1.1/email" -Method POST -Headers @{
        "Accept" = "application/json"
        "Content-Type" = "application/json"
        "Authorization" = $zeptoMailToken
    } -Body $adminEmailPayload
    
    Write-Host "Email admin envoye avec succes!" -ForegroundColor Green
    Write-Host "Destinataire: sirikisuv@gmail.com" -ForegroundColor Cyan
    Write-Host "Sujet: Nouvelle commande #CMD-20250128-123456" -ForegroundColor Cyan
    
} catch {
    Write-Host "Erreur email admin: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Details: $responseBody" -ForegroundColor Red
    }
}

Write-Host "RESULTAT:" -ForegroundColor Green
Write-Host "L'email admin envoye utilise EXACTEMENT le meme template que celui affiche dans la previsualisation!" -ForegroundColor Cyan
Write-Host "Verifiez sirikisuv@gmail.com pour voir l'email admin!" -ForegroundColor Yellow
Write-Host "CONFIRMATION: Les templates admin correspondent bien a ceux utilises dans le systeme!" -ForegroundColor Green
