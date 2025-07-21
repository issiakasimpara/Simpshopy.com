# Script de synchronisation automatique avec GitHub
param(
    [string]$CommitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

$GitPath = "C:\Program Files\Git\bin\git.exe"

Write-Host "Synchronisation avec GitHub..." -ForegroundColor Cyan
Write-Host "Repertoire: $(Get-Location)" -ForegroundColor Gray

Write-Host "Verification de l'etat..." -ForegroundColor Yellow
& $GitPath status

Write-Host "Ajout des fichiers modifies..." -ForegroundColor Yellow
& $GitPath add .

$status = & $GitPath status --porcelain
if ($status) {
    Write-Host "Creation du commit..." -ForegroundColor Yellow
    & $GitPath commit -m $CommitMessage

    Write-Host "Push vers GitHub..." -ForegroundColor Yellow
    & $GitPath push origin main

    Write-Host "Synchronisation terminee avec succes!" -ForegroundColor Green
    Write-Host "Votre code est maintenant sur: https://github.com/issiakasimpara/malibashopy" -ForegroundColor Blue
} else {
    Write-Host "Aucun changement a synchroniser." -ForegroundColor Green
}

Write-Host "Statut final:" -ForegroundColor Cyan
& $GitPath status
