# 🚀 Guide d'Installation Laravel + Moneroo SDK sur Windows

## 📋 Vue d'ensemble

Guide complet pour installer un backend Laravel avec le SDK officiel Moneroo sur Windows, pour résoudre les problèmes d'API REST.

## 🎯 Prérequis

### **1. Installer XAMPP (PHP + Apache)**
```bash
# 1. Télécharger XAMPP depuis https://www.apachefriends.org/
# 2. Installer avec PHP 8.1+ et Apache
# 3. Démarrer Apache dans le panneau de contrôle XAMPP
```

### **2. Installer Composer**
```bash
# 1. Télécharger Composer depuis https://getcomposer.org/download/
# 2. Installer globalement sur Windows
# 3. Redémarrer PowerShell/CMD après l'installation
```

### **3. Vérifier l'installation**
```bash
# Ouvrir PowerShell et vérifier
php -v
composer -V
```

## 🛠️ Installation Laravel

### **Étape 1 : Créer le projet Laravel**
```bash
# Aller dans le dossier de votre projet
cd C:\Users\User\Desktop\malibashopy-d0ae3bdc04e412e66cbbbcd6efabc8aad1c182d9

# Créer un nouveau projet Laravel
composer create-project laravel/laravel moneroo-laravel-backend

# Aller dans le dossier
cd moneroo-laravel-backend
```

### **Étape 2 : Installer le SDK Moneroo**
```bash
# Installer le SDK Moneroo
composer require moneroo/laravel-sdk

# Publier la configuration
php artisan vendor:publish --provider="Moneroo\Laravel\MonerooServiceProvider"
```

### **Étape 3 : Configurer l'environnement**
```bash
# Copier le fichier d'environnement
copy .env.example .env

# Générer la clé d'application
php artisan key:generate
```

### **Étape 4 : Configurer les variables d'environnement**
```env
# Éditer le fichier .env et ajouter :

# Configuration Moneroo
MONEROO_PUBLIC_KEY=pvk_4kym2f|01K13TKF19WGJ59VWV3FK6GHH4
MONEROO_SECRET_KEY=pvk_4kym2f|01K13TKF19WGJ59VWV3FK6GHH4
MONEROO_WEBHOOK_SECRET=ih_01JZWW2N841AJR7YHDQKH3WKSV_03h3152yuo2g_L3FvaJTdSBhn
MONEROO_ENVIRONMENT=sandbox

# Configuration de l'application
APP_NAME="Simpshopy Moneroo Backend"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Configuration CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://votre-domaine.com
```

### **Étape 5 : Copier les fichiers créés**
```bash
# Copier les contrôleurs
copy ..\moneroo-laravel-backend\app\Http\Controllers\PaymentController.php app\Http\Controllers\
copy ..\moneroo-laravel-backend\app\Http\Controllers\WebhookController.php app\Http\Controllers\

# Copier les routes
copy ..\moneroo-laravel-backend\routes\api.php routes\

# Copier la configuration CORS
copy ..\moneroo-laravel-backend\config\cors.php config\
```

### **Étape 6 : Démarrer le serveur**
```bash
# Démarrer le serveur de développement
php artisan serve
```

## 🧪 Tests

### **1. Test de connectivité**
```bash
# Ouvrir un nouveau PowerShell et tester
curl http://localhost:8000/api/health
```

### **2. Test de création de paiement**
```bash
curl -X POST http://localhost:8000/api/payments/create `
  -H "Content-Type: application/json" `
  -d '{
    "amount": 1000,
    "currency": "XOF",
    "description": "Test payment",
    "customer_email": "test@example.com",
    "customer_name": "Test Customer",
    "customer_phone": "+22507000000",
    "redirect_url": "https://example.com/success"
  }'
```

### **3. Test des méthodes de paiement**
```bash
curl http://localhost:8000/api/payments/methods?country=CI
```

## 🔗 Intégration avec React

### **Mise à jour du service Moneroo**
Le service React a déjà été mis à jour pour utiliser le backend Laravel :

```typescript
// src/services/monerooService.ts
const LARAVEL_API_URL = 'http://localhost:8000/api';
```

### **Tester l'intégration**
```bash
# Démarrer l'application React
npm run dev

# Aller dans Payments → Test Moneroo
# Créer un paiement de test
```

## 🎯 Endpoints API

### **Paiements**
```
POST /api/payments/create          # Créer un paiement
GET  /api/payments/methods         # Récupérer les méthodes
GET  /api/payments/{id}/status     # Statut d'un paiement
POST /api/payments/{id}/refund     # Rembourser un paiement
```

### **Webhooks**
```
POST /api/webhook/moneroo          # Webhook Moneroo
```

### **Système**
```
GET  /api/health                   # Vérification de santé
```

## 🚀 Déploiement

### **1. Production**
```bash
# Configurer les variables d'environnement
MONEROO_ENVIRONMENT=live

# Optimiser Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### **2. Webhook URL**
```
https://votre-domaine.com/api/webhook/moneroo
```

## 🔒 Sécurité

### **1. Vérification des signatures**
Le SDK Moneroo gère automatiquement la vérification des signatures des webhooks.

### **2. CORS Configuration**
Configuré pour permettre les requêtes depuis votre frontend React.

## 📊 Monitoring

### **1. Logs**
```bash
# Logs Laravel
tail -f storage/logs/laravel.log

# Logs spécifiques Moneroo
grep "Moneroo" storage/logs/laravel.log
```

### **2. Health Check**
```bash
curl http://localhost:8000/api/health
```

## 🎯 Avantages

1. **✅ SDK Officiel** - Utilise le SDK officiel Moneroo
2. **✅ Gestion d'erreurs** - Meilleure gestion des erreurs
3. **✅ Webhooks** - Traitement automatique des notifications
4. **✅ Sécurité** - Vérification des signatures
5. **✅ Documentation** - Support officiel Moneroo
6. **✅ Logs** - Logging complet des opérations
7. **✅ Validation** - Validation des données d'entrée

## 🚨 Résolution des Problèmes

### **Problème : PHP non reconnu**
```bash
# Ajouter PHP au PATH Windows
# Aller dans Variables d'environnement → Path
# Ajouter : C:\xampp\php
```

### **Problème : Composer non reconnu**
```bash
# Réinstaller Composer globalement
# Redémarrer PowerShell après l'installation
```

### **Problème : SDK non trouvé**
```bash
# Vérifier que le SDK est installé
composer show moneroo/laravel-sdk

# Réinstaller si nécessaire
composer require moneroo/laravel-sdk
```

### **Problème : Erreur de connectivité**
```bash
# Vérifier que le serveur Laravel fonctionne
php artisan serve

# Vérifier les logs
tail -f storage/logs/laravel.log
```

### **Problème : CORS**
```bash
# Vérifier la configuration CORS
php artisan config:cache

# Vérifier les headers CORS
curl -H "Origin: http://localhost:3000" `
     -H "Access-Control-Request-Method: POST" `
     -H "Access-Control-Request-Headers: Content-Type" `
     -X OPTIONS http://localhost:8000/api/payments/create
```

## 🎯 Prochaines Étapes

1. **Installer XAMPP** avec PHP 8.1+
2. **Installer Composer** globalement
3. **Créer le projet Laravel** avec les commandes ci-dessus
4. **Configurer l'environnement** avec vos clés Moneroo
5. **Tester la connectivité** avec les commandes curl
6. **Tester l'intégration complète** dans React

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** : `storage/logs/laravel.log`
2. **Testez la connectivité** : `curl http://localhost:8000/api/health`
3. **Vérifiez les variables d'environnement** dans `.env`
4. **Redémarrez les services** : Apache, Laravel

**Cette solution résout définitivement les problèmes d'API REST ! 🚀** 