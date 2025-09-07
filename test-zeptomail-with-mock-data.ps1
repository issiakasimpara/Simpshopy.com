# Script PowerShell pour tester ZeptoMail avec des donnees mock
# Ce script teste l'Edge Function avec des donnees simulees

Write-Host "Test ZeptoMail avec des donnees mock" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Configuration Supabase
$SUPABASE_URL = "https://grutldacuowplosarucp.supabase.co"
$SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQ4NzQ4MCwiZXhwIjoyMDUzMDYzNDgwfQ.8Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q"

# Test direct de l'API ZeptoMail avec les donnees de la commande
Write-Host "`nTest direct de l'API ZeptoMail avec les donnees de commande" -ForegroundColor Yellow

# Configuration ZeptoMail
$ZEPTOMAIL_TOKEN = "Zoho-enczapikey wSsVR61/rx72DvwulDf4c+cwmggEUln0R0h0jlbwvyD9T6yWosc5kRGdUQf1FaIdE2FrFTFHoO8pnxgE1TQNjol7nAoAXSiF9mqRe1U4J3x17qnvhDzOX2lakxuAKYsAwwxvnWZgE84r+g=="
$ZEPTOMAIL_URL = "https://api.zeptomail.com/v1.1/email"

# Donnees de la commande de test
$orderNumber = "TEST-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$customerEmail = "sirikisuv@gmail.com"
$customerName = "Test Customer"
$storeName = "SimpShopy Test Store"
$totalAmount = 25000

Write-Host "Numero de commande: $orderNumber" -ForegroundColor Cyan
Write-Host "Email client: $customerEmail" -ForegroundColor Cyan
Write-Host "Montant total: $totalAmount CFA" -ForegroundColor Cyan

# Test 1: Email de confirmation client
Write-Host "`nTest 1: Email de confirmation client" -ForegroundColor Yellow

$customerEmailData = @{
    from = @{
        address = "mail@simpshopy.com"
        name = $storeName
    }
    to = @(
        @{
            email_address = @{
                address = $customerEmail
                name = $customerName
            }
        }
    )
    subject = "✅ Confirmation de commande #$orderNumber - $storeName"
    htmlbody = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Confirmation de commande</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
                ✅ Commande Confirmée
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                Commande #$orderNumber
            </p>
        </div>

        <!-- Content -->
        <div style="padding: 30px 20px;">
            
            <!-- Greeting -->
            <div style="margin-bottom: 25px;">
                <p style="font-size: 16px; color: #333; margin: 0 0 10px 0;">
                    Bonjour <strong style="color: #28a745;">$customerName</strong>,
                </p>
                <p style="font-size: 16px; color: #666; margin: 0; line-height: 1.5;">
                    Votre commande a été confirmée et est en cours de traitement. Nous vous tiendrons informé de son avancement.
                </p>
            </div>

            <!-- Order Details -->
            <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="margin: 0 0 20px 0; color: #333; font-size: 20px; font-weight: 600;">
                    📦 Détails de votre commande
                </h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eee; vertical-align: top;">
                            <div style="font-weight: 500; color: #333;">Produit Test ZeptoMail</div>
                        </td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; vertical-align: top;">
                            <div style="color: #666;">2x</div>
                            <div style="font-weight: 500; color: #333;">12,500 CFA</div>
                        </td>
                    </tr>
                </table>
                
                <hr style="border: none; border-top: 2px solid #e9ecef; margin: 20px 0;">
                
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 600; color: #333;">
                    <span>Total :</span>
                    <span style="color: #28a745; font-size: 24px;">$totalAmount CFA</span>
                </div>
            </div>

            <!-- Shipping Info -->
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h4 style="margin: 0 0 15px 0; color: #1976d2; font-size: 18px; font-weight: 600;">
                    🚚 Adresse de livraison
                </h4>
                <div style="color: #666; line-height: 1.6;">
                    <div style="font-weight: 500; color: #333;">$customerName</div>
                    <div>123 Rue Test</div>
                    <div>Abidjan, 00225</div>
                    <div>Côte d'Ivoire</div>
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #bbdefb;">
                    <strong style="color: #1976d2;">Délai estimé :</strong> 3-5 jours ouvrables
                </div>
            </div>

            <!-- Next Steps -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h4 style="margin: 0 0 10px 0; color: #856404; font-size: 16px; font-weight: 600;">
                    📋 Prochaines étapes
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: #856404;">
                    <li>Votre commande est en cours de préparation</li>
                    <li>Vous recevrez un email de confirmation d'expédition</li>
                    <li>Un numéro de suivi vous sera communiqué</li>
                </ul>
            </div>

            <!-- Thank You -->
            <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 16px; color: #666; margin: 0 0 10px 0;">
                    Merci de votre confiance !
                </p>
                <p style="font-size: 18px; font-weight: 600; color: #333; margin: 0;">
                    $storeName
                </p>
            </div>

        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="font-size: 14px; color: #666; margin: 0;">
                Cet email a été envoyé automatiquement par SimpShopy
            </p>
        </div>

    </div>
</body>
</html>
"@
} | ConvertTo-Json -Depth 4

try {
    $customerResponse = Invoke-RestMethod -Uri $ZEPTOMAIL_URL -Method POST -Headers @{
        "Accept" = "application/json"
        "Content-Type" = "application/json"
        "Authorization" = $ZEPTOMAIL_TOKEN
    } -Body $customerEmailData

    Write-Host "Email client envoye avec succes!" -ForegroundColor Green
    Write-Host "Reponse:" -ForegroundColor Cyan
    $customerResponse | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White

} catch {
    Write-Host "Erreur lors de l'envoi de l'email client: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Email de notification admin
Write-Host "`nTest 2: Email de notification admin" -ForegroundColor Yellow

$adminEmailData = @{
    from = @{
        address = "mail@simpshopy.com"
        name = $storeName
    }
    to = @(
        @{
            email_address = @{
                address = "admin@simpshopy.com"
                name = "Administrateur"
            }
        }
    )
    subject = "🎉 Nouvelle commande #$orderNumber - $storeName"
    htmlbody = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nouvelle commande</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
                🎉 Nouvelle Commande !
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                Commande #$orderNumber
            </p>
        </div>

        <!-- Content -->
        <div style="padding: 30px 20px;">
            
            <!-- Alert -->
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 10px 0; color: #155724; font-size: 18px; font-weight: 600;">
                    ⚡ Action requise
                </h3>
                <p style="margin: 0; color: #155724; font-size: 16px;">
                    Une nouvelle commande a été reçue et nécessite votre attention.
                </p>
            </div>

            <!-- Customer Info -->
            <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="margin: 0 0 20px 0; color: #333; font-size: 20px; font-weight: 600;">
                    👤 Informations client
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <div style="font-weight: 600; color: #666; font-size: 14px; margin-bottom: 5px;">NOM</div>
                        <div style="font-size: 16px; color: #333; font-weight: 500;">$customerName</div>
                    </div>
                    <div>
                        <div style="font-weight: 600; color: #666; font-size: 14px; margin-bottom: 5px;">EMAIL</div>
                        <div style="font-size: 16px; color: #333; font-weight: 500;">$customerEmail</div>
                    </div>
                    <div>
                        <div style="font-weight: 600; color: #666; font-size: 14px; margin-bottom: 5px;">TÉLÉPHONE</div>
                        <div style="font-size: 16px; color: #333; font-weight: 500;">+225 07 12 34 56 78</div>
                    </div>
                    <div>
                        <div style="font-weight: 600; color: #666; font-size: 14px; margin-bottom: 5px;">STATUT</div>
                        <div style="font-size: 16px; color: #28a745; font-weight: 500; text-transform: uppercase;">pending</div>
                    </div>
                </div>
            </div>

            <!-- Order Details -->
            <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="margin: 0 0 20px 0; color: #333; font-size: 20px; font-weight: 600;">
                    💰 Détails de la commande
                </h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eee; vertical-align: top;">
                            <div style="font-weight: 500; color: #333;">Produit Test ZeptoMail</div>
                        </td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; vertical-align: top;">
                            <div style="color: #666;">2x</div>
                            <div style="font-weight: 500; color: #333;">12,500 CFA</div>
                        </td>
                    </tr>
                </table>
                
                <hr style="border: none; border-top: 2px solid #e9ecef; margin: 20px 0;">
                
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 600; color: #333;">
                    <span>Total :</span>
                    <span style="color: #007bff; font-size: 24px;">$totalAmount CFA</span>
                </div>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://simpshopy.com/admin/orders" 
                   style="display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    📋 Gérer la commande
                </a>
            </div>

        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="font-size: 14px; color: #666; margin: 0;">
                Notification automatique - SimpShopy
            </p>
        </div>

    </div>
</body>
</html>
"@
} | ConvertTo-Json -Depth 4

try {
    $adminResponse = Invoke-RestMethod -Uri $ZEPTOMAIL_URL -Method POST -Headers @{
        "Accept" = "application/json"
        "Content-Type" = "application/json"
        "Authorization" = $ZEPTOMAIL_TOKEN
    } -Body $adminEmailData

    Write-Host "Email admin envoye avec succes!" -ForegroundColor Green
    Write-Host "Reponse:" -ForegroundColor Cyan
    $adminResponse | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White

} catch {
    Write-Host "Erreur lors de l'envoi de l'email admin: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest termine!" -ForegroundColor Green
Write-Host "Verifiez l'email sirikisuv@gmail.com pour confirmer la reception des emails ZeptoMail" -ForegroundColor Yellow
