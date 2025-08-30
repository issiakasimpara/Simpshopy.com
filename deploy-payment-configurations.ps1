# Script de déploiement pour la table payment_configurations
# Ce script crée la table et les politiques RLS nécessaires

Write-Host "🚀 Déploiement de la table payment_configurations..." -ForegroundColor Green

# Vérifier que le fichier SQL existe
$sqlFile = "create_payment_configurations_table.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Erreur: Le fichier $sqlFile n'existe pas!" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Lecture du fichier SQL..." -ForegroundColor Yellow
$sqlContent = Get-Content $sqlFile -Raw

Write-Host "✅ Contenu SQL lu avec succès" -ForegroundColor Green
Write-Host "📝 Contenu du script SQL:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host $sqlContent -ForegroundColor White
Write-Host "----------------------------------------" -ForegroundColor Gray

Write-Host ""
Write-Host "🔧 Instructions de déploiement:" -ForegroundColor Yellow
Write-Host "1. Ouvrez votre dashboard Supabase" -ForegroundColor White
Write-Host "2. Allez dans l'onglet 'SQL Editor'" -ForegroundColor White
Write-Host "3. Copiez-collez le contenu SQL ci-dessus" -ForegroundColor White
Write-Host "4. Cliquez sur 'Run' pour exécuter le script" -ForegroundColor White
Write-Host ""

Write-Host "📊 Ce script va créer:" -ForegroundColor Cyan
Write-Host "   • Table payment_configurations" -ForegroundColor White
Write-Host "   • Index pour les performances" -ForegroundColor White
Write-Host "   • Politiques RLS pour la sécurité" -ForegroundColor White
Write-Host "   • Trigger pour updated_at" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  Important:" -ForegroundColor Yellow
Write-Host "   • Assurez-vous d'être connecté à votre projet Supabase" -ForegroundColor White
Write-Host "   • Vérifiez que vous avez les permissions d'administrateur" -ForegroundColor White
Write-Host "   • Sauvegardez votre base de données avant l'exécution" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Une fois le script exécuté, vous pourrez:" -ForegroundColor Green
Write-Host "   • Configurer Stripe, PayPal, Moneroo, etc." -ForegroundColor White
Write-Host "   • Gérer les clés API de chaque fournisseur" -ForegroundColor White
Write-Host "   • Activer/désactiver les méthodes de paiement" -ForegroundColor White
Write-Host "   • Tester les configurations" -ForegroundColor White
Write-Host ""

Write-Host "✅ Script de déploiement terminé!" -ForegroundColor Green
Write-Host "📖 Consultez la documentation pour plus d'informations" -ForegroundColor Cyan
