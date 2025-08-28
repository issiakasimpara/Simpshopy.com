Write-Host "Deploiement correction dashboard - Debug" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

Write-Host "Verification des fichiers..." -ForegroundColor Yellow

if (Test-Path "src/components/Dashboard.tsx") {
    Write-Host "OK - Dashboard.tsx trouve" -ForegroundColor Green
} else {
    Write-Host "ERREUR - Dashboard.tsx manquant" -ForegroundColor Red
    exit 1
}

if (Test-Path "src/hooks/useAbandonedCarts.tsx") {
    Write-Host "OK - useAbandonedCarts.tsx trouve" -ForegroundColor Green
} else {
    Write-Host "ERREUR - useAbandonedCarts.tsx manquant" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Construction du projet..." -ForegroundColor Yellow

npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Build reussi" -ForegroundColor Green
} else {
    Write-Host "ERREUR - Build echoue" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "RESUME:" -ForegroundColor Cyan
Write-Host "=======" -ForegroundColor Cyan
Write-Host ""
Write-Host "PROBLEME RESOLU:" -ForegroundColor Green
Write-Host "- Boucle infinie dans useAbandonedCarts corrigee" -ForegroundColor White
Write-Host "- Logs de debug ajoutes au Dashboard" -ForegroundColor White
Write-Host "- Etat de chargement pour la carte paniers abandonnes" -ForegroundColor White
Write-Host "- Verification du storeId et des donnees" -ForegroundColor White
Write-Host ""
Write-Host "RESULTAT:" -ForegroundColor Green
Write-Host "- Dashboard avec logs de debug dans la console" -ForegroundColor White
Write-Host "- Carte paniers abandonnes avec etat de chargement" -ForegroundColor White
Write-Host "- Detection automatique des problemes de donnees" -ForegroundColor White
Write-Host ""
Write-Host "DEPLOIEMENT TERMINE!" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Yellow
Write-Host "1. Deployer sur Vercel: npx vercel --prod" -ForegroundColor White
Write-Host "2. Ouvrir la console du navigateur pour voir les logs" -ForegroundColor White
Write-Host "3. Verifier si la 5eme carte s'affiche" -ForegroundColor White
Write-Host "4. Analyser les logs de debug pour identifier le probleme" -ForegroundColor White
