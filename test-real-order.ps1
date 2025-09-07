# Script PowerShell pour tester avec une vraie commande
# Ce script simule une vraie commande pour tester l'envoi automatique d'emails

Write-Host "Test avec une vraie commande SimpShopy" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Configuration Supabase
$SUPABASE_URL = "https://grutldacuowplosarucp.supabase.co"
$SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQ4NzQ4MCwiZXhwIjoyMDUzMDYzNDgwfQ.8Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q"

Write-Host "Instructions pour tester:" -ForegroundColor Yellow
Write-Host "1. Allez sur votre boutique SimpShopy" -ForegroundColor Cyan
Write-Host "2. Ajoutez un produit au panier" -ForegroundColor Cyan
Write-Host "3. Passez une commande avec votre email" -ForegroundColor Cyan
Write-Host "4. Les emails seront envoyes automatiquement via ZeptoMail" -ForegroundColor Cyan

Write-Host "`nOu testez directement via l'API:" -ForegroundColor Yellow

# Test direct via l'API Supabase
$testOrderData = @{
    store_id = "votre-store-id"
    customer_email = "votre-email@test.com"
    customer_name = "Test Customer"
    total_amount = 15000
    currency = "CFA"
    status = "pending"
    items = @(
        @{
            name = "Produit Test"
            quantity = 1
            price = 15000
        }
    )
    shipping_address = @{
        street = "123 Rue Test"
        city = "Abidjan"
        postal_code = "00225"
        country = "Côte d'Ivoire"
    }
} | ConvertTo-Json -Depth 3

Write-Host "`nDonnees de test pour une vraie commande:" -ForegroundColor Cyan
Write-Host $testOrderData -ForegroundColor White

Write-Host "`nPour tester manuellement:" -ForegroundColor Yellow
Write-Host "1. Remplacez 'votre-store-id' par l'ID de votre boutique" -ForegroundColor White
Write-Host "2. Remplacez 'votre-email@test.com' par votre email" -ForegroundColor White
Write-Host "3. Inserez cette commande dans la table public_orders" -ForegroundColor White
Write-Host "4. Les triggers enverront automatiquement les emails" -ForegroundColor White

Write-Host "`nURL de votre boutique:" -ForegroundColor Yellow
Write-Host "https://simpshopy.com" -ForegroundColor Cyan

Write-Host "`nTest termine! Passez une vraie commande pour valider l'integration." -ForegroundColor Green
