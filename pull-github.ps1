# Script pour récupérer les dernières modifications depuis GitHub
# Usage: .\pull-github.ps1

# Chemin vers Git
$GitPath = "C:\Program Files\Git\bin\git.exe"

Write-Host "⬇️ Récupération des modifications depuis GitHub..." -ForegroundColor Cyan
Write-Host "📁 Répertoire: $(Get-Location)" -ForegroundColor Gray

# Vérifier l'état avant le pull
Write-Host "`n📊 État actuel:" -ForegroundColor Yellow
& $GitPath status

# Récupérer les modifications
Write-Host "`n🔄 Pull depuis origin/main..." -ForegroundColor Yellow
& $GitPath pull origin main

Write-Host "`n✅ Récupération terminée!" -ForegroundColor Green
Write-Host "`n📈 Nouvel état:" -ForegroundColor Cyan
& $GitPath status
