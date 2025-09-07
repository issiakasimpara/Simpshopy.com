# Script PowerShell pour déployer l'intégration ZeptoMail
# Ce script déploie les Edge Functions et configure les triggers

Write-Host "🚀 Déploiement de l'intégration ZeptoMail" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Étape 1: Déployer l'Edge Function
Write-Host "`n📡 Étape 1: Déploiement de l'Edge Function send-order-emails" -ForegroundColor Yellow
try {
    $deployResult = npx supabase functions deploy send-order-emails
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Edge Function déployée avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors du déploiement: $deployResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors du déploiement: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Étape 2: Exécuter les triggers SQL
Write-Host "`n🗄️ Étape 2: Configuration des triggers PostgreSQL" -ForegroundColor Yellow
Write-Host "Exécutez le script SQL suivant dans votre éditeur SQL Supabase:" -ForegroundColor Cyan
Write-Host "Fichier: create_email_triggers.sql" -ForegroundColor Cyan
Write-Host "`nOu exécutez cette commande SQL directement:" -ForegroundColor Yellow

$sqlContent = Get-Content "create_email_triggers.sql" -Raw
Write-Host $sqlContent -ForegroundColor White

# Étape 3: Tester l'intégration
Write-Host "`n🧪 Étape 3: Test de l'intégration" -ForegroundColor Yellow
$testChoice = Read-Host "Voulez-vous tester l'intégration maintenant? (y/n)"
if ($testChoice -eq "y" -or $testChoice -eq "Y") {
    Write-Host "Lancement du test..." -ForegroundColor Cyan
    .\test-zeptomail-integration.ps1
}

# Étape 4: Vérification finale
Write-Host "`n✅ Étape 4: Vérification finale" -ForegroundColor Yellow
Write-Host "Vérifiez que:" -ForegroundColor Cyan
Write-Host "1. L'Edge Function est déployée: https://supabase.com/dashboard/project/grutldacuowplosarucp/functions" -ForegroundColor White
Write-Host "2. Les triggers sont créés dans la base de données" -ForegroundColor White
Write-Host "3. Les emails sont envoyés lors de nouvelles commandes" -ForegroundColor White

Write-Host "`n🎉 Déploiement terminé!" -ForegroundColor Green
Write-Host "L'intégration ZeptoMail est maintenant active!" -ForegroundColor Green
