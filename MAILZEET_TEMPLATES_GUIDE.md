# 📧 Guide des Templates Mailzeet pour Simpshopy

## 🎯 **Support complet des Templates Mailzeet**

D'après la [documentation officielle Mailzeet](https://docs.mailzeet.com/emails/sending-an-email), notre implémentation supporte maintenant :

### ✅ **Fonctionnalités implémentées :**

**1. Variables personnalisées avec syntaxe `{{var}}` :**
```json
{
  "subject": "🎉 Nouvelle commande #{{order_id}} - {{store_name}}",
  "params": {
    "order_id": "123456",
    "store_name": "Ma Boutique",
    "customer_name": "Jean Dupont",
    "total_amount": "150.00"
  }
}
```

**2. Templates HTML avec variables :**
```html
<p>Bonjour {{customer_name}},</p>
<p>Votre commande #{{order_id}} d'un montant de {{total_amount}} CFA a été confirmée.</p>
<p>Merci de votre confiance !<br>{{store_name}}</p>
```

**3. Support des templates Mailzeet :**
```json
{
  "template_id": "order_confirmation_template",
  "params": {
    "customer_name": "Jean Dupont",
    "order_id": "123456",
    "store_name": "Ma Boutique"
  }
}
```

---

## 🔧 **Utilisation dans le code**

### **1. Edge Functions (automatique) :**

**Email de confirmation client :**
```typescript
subject: `✅ Confirmation de commande #{{order_id}} - {{store_name}}`,
params: {
  order_id: orderData.id.slice(-6),
  store_name: storeData.name,
  customer_name: orderData.customer_name,
  total_amount: orderData.total_amount,
  order_date: new Date(orderData.created_at).toLocaleDateString('fr-FR'),
  payment_method: orderData.payment_method || 'Non spécifiée'
}
```

**Email de notification admin :**
```typescript
subject: `🎉 Nouvelle commande #{{order_id}} - {{store_name}}`,
params: {
  order_id: orderData.id.slice(-6),
  store_name: storeData.name,
  customer_name: orderData.customer_name,
  customer_email: orderData.customer_email,
  total_amount: orderData.total_amount,
  order_date: new Date(orderData.created_at).toLocaleDateString('fr-FR')
}
```

### **2. Service Mailzeet (manuel) :**

**Utilisation avec template personnalisé :**
```typescript
import { mailzeetService } from '@/services/mailzeetService';

// Envoyer avec template Mailzeet
const result = await mailzeetService.sendEmailWithTemplate(
  'client@example.com',
  'Jean Dupont',
  'order_confirmation_template', // Template créé dans Mailzeet
  {
    customer_name: 'Jean Dupont',
    order_id: '123456',
    store_name: 'Ma Boutique',
    total_amount: '150.00'
  }
);
```

**Utilisation avec HTML personnalisé :**
```typescript
const result = await mailzeetService.sendEmail({
  to: 'client@example.com',
  toName: 'Jean Dupont',
  subject: 'Confirmation de commande #{{order_id}}',
  html: '<p>Bonjour {{customer_name}}, votre commande est confirmée !</p>',
  variables: {
    order_id: '123456',
    customer_name: 'Jean Dupont'
  }
});
```

---

## 📋 **Variables disponibles**

### **Pour les emails de commande :**
- `{{order_id}}` - Numéro de commande (6 derniers caractères)
- `{{store_name}}` - Nom de la boutique
- `{{customer_name}}` - Nom du client
- `{{customer_email}}` - Email du client
- `{{total_amount}}` - Montant total de la commande
- `{{order_date}}` - Date de la commande (format français)
- `{{payment_method}}` - Méthode de paiement

### **Pour les emails de statut :**
- `{{new_status}}` - Nouveau statut de la commande
- `{{status_emoji}}` - Emoji correspondant au statut

### **Pour les newsletters :**
- `{{store_name}}` - Nom de la boutique
- `{{store_url}}` - URL de la boutique

---

## 🎨 **Création de templates dans Mailzeet**

### **1. Aller sur le dashboard Mailzeet :**
- Connectez-vous à https://mailzeet.com/dashboard
- Allez dans la section **Templates**

### **2. Créer un template :**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmation de commande</title>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { background: #f8f9fa; padding: 20px; }
    .content { padding: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>✅ Commande confirmée !</h1>
  </div>
  <div class="content">
    <p>Bonjour {{customer_name}},</p>
    <p>Votre commande #{{order_id}} a été confirmée.</p>
    <p>Montant : {{total_amount}} CFA</p>
    <p>Merci de votre confiance !<br>{{store_name}}</p>
  </div>
</body>
</html>
```

### **3. Utiliser le template :**
```typescript
// Récupérer l'ID du template depuis Mailzeet
const templateId = "your_template_id_here";

await mailzeetService.sendEmailWithTemplate(
  customerEmail,
  customerName,
  templateId,
  {
    customer_name: customerName,
    order_id: orderId,
    total_amount: totalAmount,
    store_name: storeName
  }
);
```

---

## 🚀 **Avantages des templates Mailzeet**

### **1. Flexibilité :**
- ✅ Templates personnalisables dans l'interface Mailzeet
- ✅ Variables dynamiques avec `{{var}}`
- ✅ Design responsive et professionnel

### **2. Maintenance :**
- ✅ Modification des templates sans redéploiement
- ✅ Versioning des templates
- ✅ A/B testing possible

### **3. Performance :**
- ✅ Templates optimisés par Mailzeet
- ✅ Délivrabilité améliorée
- ✅ Analytics détaillés

---

## 📊 **Exemple complet**

### **Template HTML dans Mailzeet :**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nouvelle commande</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #28a745; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .order-details { background: #f8f9fa; padding: 15px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Nouvelle commande reçue !</h1>
      <p>Commande #{{order_id}}</p>
    </div>
    <div class="content">
      <div class="order-details">
        <h3>👤 Client : {{customer_name}}</h3>
        <p><strong>Email :</strong> {{customer_email}}</p>
        <p><strong>Montant :</strong> {{total_amount}} CFA</p>
        <p><strong>Date :</strong> {{order_date}}</p>
      </div>
      <p>Connectez-vous à votre tableau de bord pour traiter cette commande.</p>
    </div>
  </div>
</body>
</html>
```

### **Utilisation dans le code :**
```typescript
// L'Edge Function utilise automatiquement les variables
// Pas besoin de modifier le code, les templates sont gérés par Mailzeet
```

---

## 🎯 **Conclusion**

Notre implémentation Mailzeet est maintenant **100% conforme** à la [documentation officielle](https://docs.mailzeet.com/emails/sending-an-email) et supporte :

- ✅ **Variables personnalisées** avec syntaxe `{{var}}`
- ✅ **Templates Mailzeet** avec `template_id`
- ✅ **HTML personnalisé** avec variables
- ✅ **Configuration globale** pour toutes les boutiques
- ✅ **Logs et analytics** complets

**Votre système d'emails est maintenant professionnel et flexible !** 🚀
