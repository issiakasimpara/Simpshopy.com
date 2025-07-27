# 📧 GUIDE DE CONFIGURATION DU SYSTÈME D'EMAILS AUTOMATIQUES

## 🎯 **Vue d'ensemble**

Ce guide vous accompagne dans la configuration complète du système d'emails automatiques de Simpshopy, incluant :
- ✅ **Emails automatiques** via Resend
- ✅ **Templates personnalisés** par boutique
- ✅ **Notifications push** en temps réel
- ✅ **Devise CFA** (Franc CFA)
- ✅ **Langue française**

---

## 🚀 **ÉTAPE 1 : CONFIGURATION RESEND**

### **1.1 Créer un compte Resend**
1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit (3,000 emails/mois)
3. Vérifiez votre domaine ou utilisez le domaine par défaut

### **1.2 Obtenir la clé API**
1. Dans le dashboard Resend, allez dans "API Keys"
2. Créez une nouvelle clé API
3. Copiez la clé (format : `re_xxxxxxxxxx`)

### **1.3 Configurer dans Supabase**
1. Allez dans votre projet Supabase
2. **Settings** → **Edge Functions**
3. Ajoutez la variable d'environnement :
   ```
   RESEND_API_KEY=re_votre_cle_api_ici
   ```

---

## 🗄️ **ÉTAPE 2 : CONFIGURATION DE LA BASE DE DONNÉES**

### **2.1 Exécuter le script SQL**
1. Allez dans **SQL Editor** de Supabase
2. Copiez et exécutez le contenu de `create_email_triggers.sql`
3. Vérifiez que toutes les tables et fonctions sont créées

### **2.2 Vérifier les colonnes ajoutées**
```sql
-- Vérifier les colonnes dans orders
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('customer_email', 'customer_name', 'payment_method', 'shipping_address');

-- Vérifier les colonnes dans stores
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stores' 
AND column_name IN ('logo_url', 'primary_color', 'contact_email', 'domain');
```

---

## ⚡ **ÉTAPE 3 : DÉPLOIEMENT DE L'EDGE FUNCTION**

### **3.1 Installer Supabase CLI**
```bash
npm install -g supabase
```

### **3.2 Se connecter à votre projet**
```bash
supabase login
supabase link --project-ref votre_project_ref
```

### **3.3 Déployer l'Edge Function**
```bash
supabase functions deploy send-order-emails
```

### **3.4 Vérifier le déploiement**
```bash
supabase functions list
```

---

## 🔔 **ÉTAPE 4 : CONFIGURATION DES NOTIFICATIONS PUSH**

### **4.1 Service Worker**
Le Service Worker est déjà créé dans `public/sw.js`. Il sera automatiquement enregistré.

### **4.2 Permissions**
Les utilisateurs devront autoriser les notifications dans leur navigateur.

### **4.3 Test des notifications**
Utilisez le composant `NotificationManager` pour tester les notifications.

---

## 🧪 **ÉTAPE 5 : TESTS ET VÉRIFICATION**

### **5.1 Test de l'Edge Function**
```bash
# Test direct de l'Edge Function
curl -X POST https://votre_project_ref.supabase.co/functions/v1/send-order-emails \
  -H "Authorization: Bearer votre_anon_key" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "test-order-id"}'
```

### **5.2 Test avec une commande réelle**
```sql
-- Créer une commande de test
INSERT INTO orders (
  store_id, 
  customer_email, 
  customer_name, 
  total_amount, 
  status,
  payment_method,
  shipping_address
) VALUES (
  'votre_store_id',
  'test@example.com',
  'Utilisateur Test',
  15000,
  'pending',
  'Carte bancaire',
  '{"address": "123 Rue Test", "city": "Abidjan", "country": "Côte d''Ivoire"}'
);
```

### **5.3 Vérifier les logs**
```sql
-- Vérifier les logs d'emails
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 10;

-- Vérifier les statistiques
SELECT * FROM get_email_stats();
```

---

## 🎨 **ÉTAPE 6 : PERSONNALISATION DES TEMPLATES**

### **6.1 Templates par défaut**
Les templates sont inclus dans l'Edge Function avec :
- 🎨 **Design moderne** et responsive
- 🇫🇷 **Langue française**
- 💰 **Devise CFA**
- 🏪 **Logo et couleurs de la boutique**

### **6.2 Personnalisation avancée**
Pour personnaliser les templates :

1. **Modifier l'Edge Function** :
   ```typescript
   // Dans supabase/functions/send-order-emails/index.ts
   function generateAdminEmailTemplate(orderData, storeData) {
     // Personnalisez le template ici
   }
   ```

2. **Variables disponibles** :
   - `orderData.id` - ID de la commande
   - `orderData.customer_name` - Nom du client
   - `orderData.total_amount` - Montant total
   - `storeData.name` - Nom de la boutique
   - `storeData.logo_url` - Logo de la boutique
   - `storeData.primary_color` - Couleur principale

---

## 📊 **ÉTAPE 7 : MONITORING ET ANALYTICS**

### **7.1 Logs d'emails**
```sql
-- Voir tous les logs
SELECT * FROM recent_email_logs;

-- Statistiques par boutique
SELECT * FROM get_email_stats('store_id');

-- Taux de succès
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
  ROUND(COUNT(CASE WHEN status = 'sent' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100, 2) as success_rate
FROM email_logs;
```

### **7.2 Nettoyage automatique**
```sql
-- Nettoyer les anciens logs (30 jours)
SELECT cleanup_old_email_logs();
```

---

## 🔧 **ÉTAPE 8 : INTÉGRATION DANS L'APPLICATION**

### **8.1 Composant NotificationManager**
Ajoutez le composant dans vos pages :
```tsx
import NotificationManager from '@/components/NotificationManager'

// Dans votre composant
<NotificationManager />
```

### **8.2 Service Email**
Utilisez le service dans vos composants :
```tsx
import { useEmailService } from '@/services/emailService'

const { sendOrderEmail, getEmailLogs, testEmailService } = useEmailService()
```

### **8.3 Notifications Push**
```tsx
import { usePushNotifications } from '@/utils/pushNotifications'

const { sendOrderNotification, requestPermission } = usePushNotifications()
```

---

## 🚨 **DÉPANNAGE**

### **Problème : Emails non envoyés**
1. Vérifiez `RESEND_API_KEY` dans Supabase
2. Vérifiez les logs de l'Edge Function
3. Testez avec `testEmailService()`

### **Problème : Notifications push non reçues**
1. Vérifiez les permissions du navigateur
2. Vérifiez que le Service Worker est enregistré
3. Testez avec `sendTestNotification()`

### **Problème : Templates non personnalisés**
1. Vérifiez les colonnes `logo_url`, `primary_color` dans la table `stores`
2. Vérifiez que les données sont bien remplies
3. Testez avec une boutique complète

### **Problème : Trigger non déclenché**
1. Vérifiez que le trigger existe :
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'send_order_emails_trigger';
   ```
2. Vérifiez les logs de la base de données
3. Testez avec une insertion manuelle

---

## 📋 **CHECKLIST DE VÉRIFICATION**

- [ ] Compte Resend créé et clé API obtenue
- [ ] `RESEND_API_KEY` configuré dans Supabase
- [ ] Script SQL exécuté avec succès
- [ ] Edge Function déployée
- [ ] Service Worker enregistré
- [ ] Test d'email réussi
- [ ] Test de notification push réussi
- [ ] Templates personnalisés fonctionnels
- [ ] Logs d'emails visibles
- [ ] Statistiques calculées

---

## 🎉 **FÉLICITATIONS !**

Votre système d'emails automatiques est maintenant configuré et fonctionnel ! 

**Fonctionnalités activées :**
- ✅ Emails automatiques à chaque commande
- ✅ Templates personnalisés par boutique
- ✅ Notifications push en temps réel
- ✅ Devise CFA et langue française
- ✅ Monitoring et analytics
- ✅ Logs détaillés

**Prochaines étapes :**
1. Tester avec de vraies commandes
2. Personnaliser les templates selon vos besoins
3. Configurer des alertes pour les échecs
4. Optimiser les performances

---

## 📞 **SUPPORT**

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans la console Supabase
2. Testez chaque composant individuellement
3. Consultez la documentation Resend
4. Vérifiez les permissions et configurations

**Bon développement ! 🚀** 