# Script pour corriger la table payment_configurations
Write-Host "🔧 Correction de la table payment_configurations..." -ForegroundColor Green

Write-Host ""
Write-Host "📋 Instructions:" -ForegroundColor Cyan
Write-Host "1. Allez sur votre dashboard Supabase" -ForegroundColor White
Write-Host "2. Ouvrez l'onglet 'SQL Editor'" -ForegroundColor White
Write-Host "3. Copiez-collez le contenu du fichier 'fix-payment-configurations-table.sql'" -ForegroundColor White
Write-Host "4. Cliquez sur 'Run'" -ForegroundColor White
Write-Host "5. Vérifiez que la table est créée correctement" -ForegroundColor White

Write-Host ""
Write-Host "📁 Fichier SQL à exécuter: fix-payment-configurations-table.sql" -ForegroundColor Yellow

Write-Host ""
Write-Host "🔍 Vérifications à faire après l'exécution:" -ForegroundColor Cyan
Write-Host "• La table 'payment_configurations' existe" -ForegroundColor White
Write-Host "• Les politiques RLS sont créées" -ForegroundColor White
Write-Host "• La contrainte d'unicité est en place" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Une fois le SQL exécuté, vous pourrez:" -ForegroundColor Green
Write-Host "• Configurer Moneroo dans l'onglet Paiements" -ForegroundColor White
Write-Host "• Activer/désactiver les fournisseurs de paiement" -ForegroundColor White
Write-Host "• Sauvegarder les configurations sans erreur" -ForegroundColor White

Write-Host ""
Write-Host "⚠️ Si vous avez encore des erreurs après l'exécution du SQL:" -ForegroundColor Yellow
Write-Host "• Vérifiez les logs dans la console du navigateur" -ForegroundColor White
Write-Host "• Assurez-vous que vous êtes connecté à Supabase" -ForegroundColor White
Write-Host "• Vérifiez que votre store_id est correct" -ForegroundColor White
