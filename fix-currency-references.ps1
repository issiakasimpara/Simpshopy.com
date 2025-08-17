# 💰 Script de Correction des Références Monétaires - SimpShopy
# Remplace CFA par USD et méthodes de paiement africaines par internationales

Write-Host "💰 Correction des références monétaires SimpShopy..." -ForegroundColor Green
Write-Host ""

# Étape 1: Remplacer CFA par USD dans les fichiers importants
Write-Host "📝 Remplacement CFA → USD..." -ForegroundColor Yellow

$filesToUpdate = @(
    "src/utils/orderUtils.tsx",
    "src/components/analytics/AnalyticsTabs.tsx",
    "src/components/analytics/SalesChart.tsx",
    "src/components/dashboard/DashboardStats.tsx",
    "src/components/payments/TransactionsList.tsx",
    "src/components/payments/RecentActivity.tsx",
    "src/components/payments/PaymentsStats.tsx",
    "src/components/products/ProductCard.tsx",
    "src/components/products/forms/ProductBasicInfoForm.tsx",
    "src/components/products/forms/ProductAdvancedForm.tsx",
    "src/components/products/variants/VariantCard.tsx",
    "src/components/products/variants/SimpleVariantSection.tsx",
    "src/components/products/variants/VariantCreationForm.tsx",
    "src/components/products/variants/VariantEditor.tsx",
    "src/components/markets/CreateShippingMethodDialog.tsx",
    "src/components/OrderDetailsModal.tsx",
    "src/pages/Checkout.tsx",
    "src/pages/MarketsShipping.tsx"
)

foreach ($file in $filesToUpdate) {
    if (Test-Path $file) {
        Write-Host "✅ Mise à jour de $file" -ForegroundColor Green
        
        # Lire le contenu du fichier
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Remplacer CFA par USD
        $content = $content -replace 'CFA', 'USD'
        $content = $content -replace 'cfa', 'usd'
        
        # Remplacer les références spécifiques
        $content = $content -replace 'Prix \(CFA\)', 'Prix (USD)'
        $content = $content -replace 'Prix de comparaison \(CFA\)', 'Prix de comparaison (USD)'
        $content = $content -replace 'Prix de revient \(CFA\)', 'Prix de revient (USD)'
        $content = $content = $content -replace 'Prix de vente \(CFA\)', 'Prix de vente (USD)'
        $content = $content -replace 'Prix comparé \(CFA\)', 'Prix comparé (USD)'
        
        # Écrire le contenu modifié
        Set-Content $file -Value $content -Encoding UTF8
    } else {
        Write-Host "⚠️ Fichier non trouvé : $file" -ForegroundColor Yellow
    }
}

Write-Host ""

# Étape 2: Corriger les méthodes de paiement
Write-Host "💳 Correction des méthodes de paiement..." -ForegroundColor Yellow

$paymentFiles = @(
    "src/components/checkout/PaymentMethodSelector.tsx",
    "src/components/demo/PaymentLogosDemo.tsx",
    "src/components/test/LogoTest.tsx",
    "src/components/showcase/PaymentLogosShowcase.tsx"
)

foreach ($file in $paymentFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Mise à jour de $file" -ForegroundColor Green
        
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Remplacer les méthodes de paiement africaines
        $content = $content -replace 'Orange Money', 'PayPal'
        $content = $content -replace 'MTN Mobile Money', 'Stripe'
        $content = $content -replace 'Moov Money', 'Visa/Mastercard'
        $content = $content -replace 'Mobile Money', 'Paiements en ligne'
        $content = $content -replace 'Paiement mobile', 'Paiement sécurisé'
        
        # Remplacer les types
        $content = $content -replace "'orange'", "'paypal'"
        $content = $content -replace "'mtn'", "'stripe'"
        $content = $content -replace "'moov'", "'visa'"
        
        Set-Content $file -Value $content -Encoding UTF8
    }
}

Write-Host ""

# Étape 3: Corriger les références dans les composants UI
Write-Host "🎨 Correction des composants UI..." -ForegroundColor Yellow

$uiFiles = @(
    "src/components/ui/PaymentLogos.tsx"
)

foreach ($file in $uiFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Mise à jour de $file" -ForegroundColor Green
        
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Remplacer les références
        $content = $content -replace 'Orange Money', 'PayPal'
        $content = $content -replace 'MTN Mobile Money', 'Stripe'
        $content = $content -replace 'MTN', 'Stripe'
        
        Set-Content $file -Value $content -Encoding UTF8
    }
}

Write-Host ""

# Étape 4: Vérification finale
Write-Host "🔍 Vérification finale..." -ForegroundColor Yellow

$remainingCFA = Get-ChildItem -Path "src" -Recurse -Include "*.tsx" | Select-String -Pattern "CFA" | Measure-Object
$remainingOrange = Get-ChildItem -Path "src" -Recurse -Include "*.tsx" | Select-String -Pattern "Orange Money" | Measure-Object
$remainingMTN = Get-ChildItem -Path "src" -Recurse -Include "*.tsx" | Select-String -Pattern "MTN" | Measure-Object

Write-Host "📊 Résultats de la vérification :" -ForegroundColor Cyan
Write-Host "• Références CFA restantes : $($remainingCFA.Count)" -ForegroundColor White
Write-Host "• Références Orange Money restantes : $($remainingOrange.Count)" -ForegroundColor White
Write-Host "• Références MTN restantes : $($remainingMTN.Count)" -ForegroundColor White

Write-Host ""

# Étape 5: Instructions pour les corrections manuelles
Write-Host "📝 CORRECTIONS MANUELLES NÉCESSAIRES :" -ForegroundColor Magenta
Write-Host ""
Write-Host "1. Vérifiez les fichiers suivants pour des corrections manuelles :" -ForegroundColor White
Write-Host "   • src/pages/Checkout.tsx (variables totalAmountCFA)" -ForegroundColor Gray
Write-Host "   • src/pages/AvailableGateways.tsx (mobile_money)" -ForegroundColor Gray
Write-Host "   • Tous les fichiers avec des références spécifiques" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Mettez à jour les variables de configuration :" -ForegroundColor White
Write-Host "   • Remplacez totalAmountCFA par totalAmountUSD" -ForegroundColor Gray
Write-Host "   • Remplacez mobile_money par online_payment" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉 Correction des références monétaires terminée !" -ForegroundColor Green
Write-Host "SimpShopy utilise maintenant USD et des méthodes de paiement internationales !" -ForegroundColor Green
Write-Host ""

Write-Host "✅ Script de correction terminé !" -ForegroundColor Green
