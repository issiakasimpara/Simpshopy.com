# 🚀 Guide d'Installation Backend PHP + Moneroo SDK

## 📋 Vue d'ensemble

Ce guide vous montre comment créer un **backend PHP** avec le **SDK officiel Moneroo** pour résoudre les problèmes d'intégration API REST.

## 🎯 Pourquoi PHP/Laravel ?

### ✅ **Avantages :**
- **SDK Officiel** - Plus fiable que l'API REST
- **Gestion d'erreurs** - Meilleure gestion des erreurs
- **Webhooks** - Traitement automatique des notifications
- **Sécurité** - Vérification des signatures
- **Documentation** - Support officiel Moneroo

### ❌ **Problèmes actuels :**
- API REST retourne 404 pour `/v1/payment-methods`
- Endpoints non documentés
- Gestion d'erreurs complexe

## 🛠️ Installation

### **Option 1 : Backend PHP Simple**

#### 1. Créer le dossier
```bash
mkdir backend-php-moneroo
cd backend-php-moneroo
```

#### 2. Installer Composer
```bash
# Si vous n'avez pas Composer
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
```

#### 3. Initialiser le projet
```bash
composer init --name="simpshopy/moneroo-backend" --description="Backend PHP pour Moneroo" --type="project" --require="php:>=8.0" --require="moneroo/php-sdk:^1.0" --require="vlucas/phpdotenv:^5.0" --no-interaction
```

#### 4. Installer les dépendances
```bash
composer install
```

#### 5. Créer le fichier .env
```bash
cp env.example .env
```

#### 6. Démarrer le serveur
```bash
php -S localhost:8000
```

### **Option 2 : Backend Laravel**

#### 1. Créer un projet Laravel
```bash
composer create-project laravel/laravel moneroo-laravel-backend
cd moneroo-laravel-backend
```

#### 2. Installer le SDK Moneroo
```bash
composer require moneroo/laravel-sdk
```

#### 3. Publier la configuration
```bash
php artisan vendor:publish --provider="Moneroo\Laravel\MonerooServiceProvider"
```

#### 4. Configurer les variables d'environnement
```env
MONEROO_PUBLIC_KEY=pvk_4kym2f|01K13TKF19WGJ59VWV3FK6GHH4
MONEROO_SECRET_KEY=pvk_4kym2f|01K13TKF19WGJ59VWV3FK6GHH4
MONEROO_WEBHOOK_SECRET=ih_01JZWW2N841AJR7YHDQKH3WKSV_03h3152yuo2g_L3FvaJTdSBhn
MONEROO_ENVIRONMENT=sandbox
```

#### 5. Démarrer le serveur
```bash
php artisan serve
```

## 🔧 Configuration

### **Variables d'environnement (.env)**
```env
# Configuration Moneroo
MONEROO_PUBLIC_KEY=pvk_4kym2f|01K13TKF19WGJ59VWV3FK6GHH4
MONEROO_SECRET_KEY=pvk_4kym2f|01K13TKF19WGJ59VWV3FK6GHH4
MONEROO_WEBHOOK_SECRET=ih_01JZWW2N841AJR7YHDQKH3WKSV_03h3152yuo2g_L3FvaJTdSBhn
MONEROO_ENVIRONMENT=sandbox

# Configuration de l'application
APP_NAME="Simpshopy Moneroo Backend"
APP_ENV=development
APP_DEBUG=true

# Configuration CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://votre-domaine.com
```

## 🎯 Endpoints API

### **Backend PHP Simple**
```
POST /api/payments/create          # Créer un paiement
GET  /api/payments/methods         # Récupérer les méthodes
GET  /api/payments/{id}/status     # Statut d'un paiement
POST /api/payments/{id}/refund     # Rembourser un paiement
POST /api/webhook/moneroo          # Webhook Moneroo
GET  /api/health                   # Vérification de santé
```

### **Backend Laravel**
```
POST /api/payments/create          # Créer un paiement
GET  /api/payments/methods         # Récupérer les méthodes
GET  /api/payments/{id}/status     # Statut d'un paiement
POST /api/payments/{id}/refund     # Rembourser un paiement
POST /api/webhook/moneroo          # Webhook Moneroo
```

## 🔗 Intégration avec React

### **Mise à jour du service Moneroo**
```typescript
// src/services/monerooService.ts
const PHP_BACKEND_URL = 'http://localhost:8000';

export const monerooService = {
  async createPayment(paymentData: MonerooPaymentRequest): Promise<MonerooPaymentResponse> {
    const response = await fetch(`${PHP_BACKEND_URL}/api/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });

    return response.json();
  },

  async getPaymentStatus(paymentId: string): Promise<MonerooPaymentStatus> {
    const response = await fetch(`${PHP_BACKEND_URL}/api/payments/${paymentId}/status`);
    return response.json();
  },

  async getAvailablePaymentMethods(country: string = 'CI'): Promise<MonerooPaymentMethod[]> {
    const response = await fetch(`${PHP_BACKEND_URL}/api/payments/methods?country=${country}`);
    const data = await response.json();
    return data.data || [];
  }
};
```

## 🧪 Tests

### **1. Test de connectivité**
```bash
curl http://localhost:8000/api/health
```

### **2. Test de création de paiement**
```bash
curl -X POST http://localhost:8000/api/payments/create \
  -H "Content-Type: application/json" \
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

## 🚀 Déploiement

### **1. Production (PHP Simple)**
```bash
# Configurer les variables d'environnement
MONEROO_ENVIRONMENT=live

# Utiliser un serveur web (Apache/Nginx)
# ou un gestionnaire de processus comme PM2
```

### **2. Production (Laravel)**
```bash
# Configurer les variables d'environnement
MONEROO_ENVIRONMENT=live

# Optimiser Laravel
php artisan config:cache
php artisan route:cache

# Utiliser un serveur web ou Forge/Envoyer
```

### **3. Webhook URL**
```
https://votre-domaine.com/api/webhook/moneroo
```

## 🔒 Sécurité

### **1. Vérification des signatures**
```php
// Le SDK Moneroo gère automatiquement la vérification
$isValid = $moneroo->webhook()->verify($request);
```

### **2. CORS Configuration**
```php
// Headers CORS dans le backend PHP
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

## 📊 Monitoring

### **1. Logs**
```bash
# Logs PHP
tail -f /var/log/php_errors.log

# Logs Laravel
tail -f storage/logs/laravel.log
```

### **2. Health Check**
```bash
curl http://localhost:8000/api/health
```

## 🎯 Avantages de cette Solution

1. **✅ SDK Officiel** - Utilise le SDK officiel Moneroo
2. **✅ Gestion d'erreurs** - Meilleure gestion des erreurs
3. **✅ Webhooks** - Traitement automatique des notifications
4. **✅ Sécurité** - Vérification des signatures
5. **✅ Documentation** - Support officiel Moneroo
6. **✅ Flexibilité** - Peut être déployé séparément
7. **✅ Performance** - Backend dédié pour les paiements

## 🚨 Résolution des Problèmes

### **Problème : SDK non trouvé**
```bash
# Vérifier que le SDK est installé
composer show moneroo/php-sdk
composer show moneroo/laravel-sdk
```

### **Problème : Erreur de connectivité**
```bash
# Vérifier que le serveur PHP fonctionne
php -S localhost:8000
curl http://localhost:8000/api/health
```

### **Problème : CORS**
```bash
# Vérifier les headers CORS
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS http://localhost:8000/api/payments/create
```

## 🎯 Prochaines Étapes

1. **Choisir une option** : PHP Simple ou Laravel
2. **Installer le backend** selon le guide
3. **Tester la connectivité** avec les commandes curl
4. **Mettre à jour React** pour utiliser le backend
5. **Tester l'intégration complète**

**Cette solution résout définitivement les problèmes d'API REST ! 🚀** 