# Script pour configurer Mailzeet globalement pour toutes les boutiques
# Usage: .\configure-global-mailzeet.ps1

Write-Host "🚀 Configuration globale Mailzeet pour Simpshopy" -ForegroundColor Green
Write-Host ""

# Configuration Mailzeet globale
$mailzeetApiKey = "5eelaz32hdbl:efyg6m7n0937bmp1y0sr5j2fn"
$mailzeetServerName = "SimpShopy"

Write-Host "📧 Configuration Mailzeet globale:" -ForegroundColor Cyan
Write-Host "   API Key: $($mailzeetApiKey.Substring(0, 20))..." -ForegroundColor Gray
Write-Host "   Server: $mailzeetServerName" -ForegroundColor Gray
Write-Host ""

Write-Host "🔧 Instructions pour configurer les variables d'environnement:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Allez sur: https://supabase.com/dashboard/project/grutldacuowplosarucp/settings/functions" -ForegroundColor White
Write-Host ""
Write-Host "2. Dans la section 'Environment Variables', ajoutez:" -ForegroundColor White
Write-Host ""
Write-Host "   Variable: MAILZEET_API_KEY" -ForegroundColor Yellow
Write-Host "   Valeur: $mailzeetApiKey" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Variable: MAILZEET_SERVER_NAME" -ForegroundColor Yellow
Write-Host "   Valeur: $mailzeetServerName" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Cliquez sur 'Save' pour sauvegarder" -ForegroundColor White
Write-Host ""
Write-Host "4. Redéployez les Edge Functions:" -ForegroundColor White
Write-Host "   npx supabase functions deploy send-order-emails" -ForegroundColor Gray
Write-Host "   npx supabase functions deploy test-mailzeet" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Avantages de cette approche:" -ForegroundColor Green
Write-Host "   • Une seule configuration pour toutes les boutiques" -ForegroundColor White
Write-Host "   • Pas besoin de configurer Mailzeet par boutique" -ForegroundColor White
Write-Host "   • Gestion centralisée des emails" -ForegroundColor White
Write-Host "   • Plus simple pour les utilisateurs" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Après configuration, toutes les boutiques Simpshopy pourront:" -ForegroundColor Cyan
Write-Host "   • Envoyer des emails de confirmation de commande" -ForegroundColor White
Write-Host "   • Recevoir des notifications de nouvelles commandes" -ForegroundColor White
Write-Host "   • Envoyer des emails de changement de statut" -ForegroundColor White
Write-Host "   • Utiliser les templates professionnels" -ForegroundColor White
Write-Host ""

Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. ✅ Configurer les variables d'environnement (instructions ci-dessus)" -ForegroundColor Yellow
Write-Host "2. 🔄 Redéployer les Edge Functions" -ForegroundColor Yellow
Write-Host "3. 🧪 Tester avec une vraie commande" -ForegroundColor Yellow
Write-Host "4. 🎉 Profiter des emails automatiques !" -ForegroundColor Green
