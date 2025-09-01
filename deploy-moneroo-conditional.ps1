# Script de déploiement pour rendre Moneroo conditionnel
Write-Host "🚀 Déploiement des changements Moneroo conditionnels..." -ForegroundColor Green

# 1. Ajouter tous les fichiers modifiés
Write-Host "📁 Ajout des fichiers modifiés..." -ForegroundColor Yellow
git add .

# 2. Commiter les changements
Write-Host "💾 Commit des changements..." -ForegroundColor Yellow
git commit -m "Make Moneroo conditional - only available when configured by store owner"

# 3. Pousser vers le repository
Write-Host "📤 Push vers le repository..." -ForegroundColor Yellow
git push origin master

# 4. Construire le projet
Write-Host "🔨 Construction du projet..." -ForegroundColor Yellow
npm run build

# 5. Déployer sur Vercel
Write-Host "🚀 Déploiement sur Vercel..." -ForegroundColor Yellow
vercel --prod

Write-Host "✅ Déploiement terminé avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Résumé des changements:" -ForegroundColor Cyan
Write-Host "• Moneroo n'est plus natif et nécessite une configuration" -ForegroundColor White
Write-Host "• Vérification automatique de la configuration Moneroo" -ForegroundColor White
Write-Host "• Message d'erreur informatif si Moneroo n'est pas configuré" -ForegroundColor White
Write-Host "• Interface utilisateur adaptée selon la disponibilité" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "• Les propriétaires de boutiques doivent configurer Moneroo dans leurs paramètres" -ForegroundColor White
Write-Host "• Les clients verront un message si Moneroo n'est pas disponible" -ForegroundColor White
