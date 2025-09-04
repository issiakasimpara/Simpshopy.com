# 🏦 Guide du Système de Paiement SimpShopy

## 📋 Vue d'ensemble

SimpShopy a été refondé pour adopter une approche **professionnelle et éthique** des paiements. Désormais, chaque boutique peut configurer ses propres fournisseurs de paiement avec leurs clés API.

### 🎯 Avantages de cette approche

- ✅ **Sécurité maximale** : Nous n'avons jamais accès aux fonds des utilisateurs
- ✅ **Flexibilité** : Chaque boutique choisit ses fournisseurs de paiement
- ✅ **Conformité** : Moins de restrictions de la part de PayPal/Stripe
- ✅ **Indépendance** : Les utilisateurs gèrent directement leurs comptes de paiement
- ✅ **Transparence** : Les paiements sont visibles directement chez le fournisseur

## 🚀 Déploiement

### Étape 1 : Créer la table de configuration

Exécutez le script SQL `create_payment_configurations_table.sql` dans votre dashboard Supabase :

1. Ouvrez votre dashboard Supabase
2. Allez dans l'onglet "SQL Editor"
3. Copiez-collez le contenu du fichier `create_payment_configurations_table.sql`
4. Cliquez sur "Run"

### Étape 2 : Vérifier la création

Le script crée :
- ✅ Table `payment_configurations`
- ✅ Index pour les performances
- ✅ Politiques RLS pour la sécurité
- ✅ Trigger pour `updated_at`

## 💳 Fournisseurs Supportés

### 1. **Stripe** 💳
- **Description** : Paiements par carte bancaire, Apple Pay, Google Pay
- **Frais** : 2.9% + 0.30€ par transaction
- **Devises** : EUR, USD, GBP, XOF
- **Setup** : https://dashboard.stripe.com/apikeys

### 2. **PayPal** 🔵
- **Description** : Paiements sécurisés via PayPal
- **Frais** : 3.4% + 0.35€ par transaction
- **Devises** : EUR, USD, GBP
- **Setup** : https://developer.paypal.com/dashboard/

### 3. **Moneroo** 📱
- **Description** : Paiements mobiles en Afrique de l'Ouest
- **Frais** : 1.5% par transaction
- **Devises** : XOF, XAF, NGN
- **Setup** : https://dashboard.moneroo.com/


## 🔧 Configuration

### Interface d'administration

1. **Accédez à l'onglet "Paiements"** dans le dashboard
2. **Choisissez un fournisseur** à configurer
3. **Récupérez vos clés API** depuis le dashboard du fournisseur
4. **Configurez les clés** dans l'interface SimpShopy
5. **Testez la configuration** avec le bouton "Tester"
6. **Activez le fournisseur** avec le switch

### Sécurité des clés

- 🔒 **Clés masquées** : Les clés secrètes sont masquées par défaut
- 🔒 **Chiffrement** : Les clés sont stockées de manière sécurisée
- 🔒 **RLS** : Chaque utilisateur ne voit que ses propres configurations
- 🔒 **Validation** : Tests automatiques des clés API

## 🛒 Intégration dans le Checkout

### Comportement automatique

1. **Vérification** : Le système vérifie automatiquement les moyens de paiement configurés
2. **Affichage** : Seuls les fournisseurs configurés et activés sont affichés
3. **Fallback** : Si aucun moyen de paiement n'est configuré, un message informatif s'affiche

### Messages d'erreur

- **Aucun moyen de paiement** : "Aucun moyen de paiement n'est configuré pour cette boutique. Veuillez contacter le propriétaire de la boutique pour configurer les paiements."
- **Problème fournisseur** : "Un problème a été détecté avec votre compte [Fournisseur]. Veuillez contacter votre fournisseur de paiement pour résoudre ce problème."

## 📊 Statistiques et Monitoring

### Dashboard de paiements

- 📈 **Fournisseurs configurés** : Nombre de fournisseurs configurés
- 📈 **Fournisseurs actifs** : Nombre de fournisseurs prêts à accepter les paiements
- 📈 **Statut global** : Actif/Inactif selon la configuration

### Onglets de gestion

- **Tous les fournisseurs** : Vue complète de tous les fournisseurs disponibles
- **Configurés** : Seulement les fournisseurs avec des clés API configurées
- **Actifs** : Seulement les fournisseurs activés et prêts

## 🔄 Migration depuis l'ancien système

### Pour les utilisateurs existants

1. **Accédez à l'onglet "Paiements"**
2. **Configurez vos fournisseurs préférés**
3. **Testez les configurations**
4. **Activez les fournisseurs souhaités**

### Ancien système Moneroo

- ❌ **Plus de paiements automatiques** via SimpShopy
- ✅ **Configuration manuelle** de Moneroo (ou autre fournisseur)
- ✅ **Gestion directe** des fonds chez le fournisseur

## 🛠️ Développement

### Structure des fichiers

```
src/
├── hooks/
│   └── usePaymentConfigurations.tsx    # Hook de gestion des configurations
├── services/
│   └── paymentService.ts               # Service de paiement principal
├── pages/
│   └── Payments.tsx                    # Interface d'administration
└── types/
    └── payment.ts                      # Types TypeScript (à créer)
```

### Extensibilité

Le système est conçu pour être facilement extensible :

1. **Ajouter un fournisseur** : Modifier `PAYMENT_PROVIDERS` dans le hook
2. **Nouvelle méthode** : Implémenter les méthodes dans `PaymentService`
3. **Interface** : Ajouter les champs dans la table de configuration

## 🔍 Dépannage

### Problèmes courants

1. **"Configuration non trouvée"**
   - Vérifiez que la table `payment_configurations` existe
   - Vérifiez les politiques RLS

2. **"Clé API invalide"**
   - Vérifiez que la clé est correcte
   - Vérifiez le mode test/production
   - Testez la clé dans le dashboard du fournisseur

3. **"Fournisseur non activé"**
   - Configurez d'abord les clés API
   - Activez ensuite le fournisseur

### Logs et debugging

- 📝 **Console** : Vérifiez les logs dans la console du navigateur
- 📝 **Supabase** : Vérifiez les logs dans le dashboard Supabase
- 📝 **Fournisseur** : Vérifiez les logs dans le dashboard du fournisseur

## 📞 Support

### En cas de problème

1. **Vérifiez la configuration** dans l'onglet Paiements
2. **Testez les clés API** avec le bouton "Tester"
3. **Contactez le fournisseur** directement si le problème persiste
4. **Consultez la documentation** du fournisseur

### Ressources utiles

- 📖 **Stripe** : https://stripe.com/docs
- 📖 **PayPal** : https://developer.paypal.com/docs
- 📖 **Moneroo** : https://docs.moneroo.com
- 📖 **Google Pay** : https://developers.google.com/pay/api
- 📖 **Apple Pay** : https://developer.apple.com/apple-pay/

---

## 🎉 Conclusion

Ce nouveau système de paiement offre une approche **professionnelle, sécurisée et flexible** qui respecte les meilleures pratiques de l'industrie. Chaque boutique peut maintenant gérer ses propres paiements de manière indépendante, tout en bénéficiant de la simplicité d'utilisation de SimpShopy.
