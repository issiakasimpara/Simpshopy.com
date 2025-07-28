# GUIDE DE CONFIGURATION DES DOMAINES SIMPSHOPY

## 🚀 CONFIGURATION COMPLÈTE AVEC VERCEL

### **📋 PRÉREQUIS :**

#### **1. 🏠 Configuration Vercel :**
- ✅ Projet déployé sur Vercel
- ✅ Domaine principal configuré (`simpshopy.com`)
- ✅ API Token Vercel généré

#### **2. 🔧 Variables d'environnement Supabase :**

**Dans Supabase Dashboard → Settings → Environment Variables :**

```
VERCEL_API_TOKEN=vercel_xxxxxxxxxxxxxxxxxxxx
VERCEL_TEAM_ID=team_xxxxxxxxxxxxxxxxxxxx (optionnel)
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxxxxxxxxx
```

### **🎯 OBTENIR LES VALEURS VERCEL :**

#### **1. VERCEL_API_TOKEN :**
1. **Va sur** [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. **Clique sur** "Create Token"
3. **Nom** : `simpshopy-domain-manager`
4. **Scope** : `Full Account`
5. **Copie** le token généré

#### **2. VERCEL_PROJECT_ID :**
1. **Va sur** [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Sélectionne** ton projet `simpshopy-com`
3. **Va dans** "Settings" → "General"
4. **Copie** le "Project ID"

#### **3. VERCEL_TEAM_ID (optionnel) :**
1. **Si tu as une équipe** Vercel
2. **Va dans** "Settings" → "General"
3. **Copie** le "Team ID"

### **🔧 CONFIGURATION AUTOMATIQUE :**

#### **✅ Ce qui se passe automatiquement :**

1. **Ajout de domaine** :
   - ✅ **Sauvegarde** en base de données
   - ✅ **Ajout automatique** dans Vercel
   - ✅ **Configuration DNS** automatique
   - ✅ **SSL automatique** activé

2. **Vérification de domaine** :
   - ✅ **Vérification DNS** réelle
   - ✅ **Vérification SSL** automatique
   - ✅ **Mise à jour** du statut

3. **Suppression de domaine** :
   - ✅ **Suppression** de la base de données
   - ✅ **Suppression** de Vercel
   - ✅ **Nettoyage** DNS automatique

### **🚀 AVANTAGES :**

#### **✅ Pour l'utilisateur :**
- **Configuration zéro** : Tout est automatique
- **SSL automatique** : Certificats gratuits
- **DNS automatique** : Pas de configuration manuelle
- **Vérification instantanée** : Statut en temps réel

#### **✅ Pour toi (développeur) :**
- **Moins de support** : Tout est automatisé
- **Moins d'erreurs** : Pas de configuration manuelle
- **Expérience utilisateur** : Setup en 1 clic
- **Professionnalisme** : Niveau Shopify

### **📝 EXEMPLE D'UTILISATION :**

#### **1. Utilisateur ajoute un domaine :**
```
Input: zeluxo.co
→ Sauvegarde en base
→ Ajout automatique Vercel
→ Configuration DNS automatique
→ SSL automatique activé
→ Statut: "Actif et sécurisé"
```

#### **2. Vérification automatique :**
```
Clic sur "Vérifier"
→ Vérification DNS réelle
→ Vérification SSL automatique
→ Mise à jour statut
→ Notification: "Domaine vérifié !"
```

### **🎯 PROCHAINES ÉTAPES :**

1. **Configure** les variables d'environnement
2. **Redéploie** l'Edge Function
3. **Teste** avec un vrai domaine
4. **Profite** de l'automatisation !

---

## 📚 CONFIGURATION MANUELLE (FALLBACK)

Si l'automatisation Vercel n'est pas configurée, le système fonctionne toujours en mode manuel :

### **🔧 Configuration DNS manuelle :**

#### **Enregistrement CNAME :**
```
Type: CNAME
Nom: @ (ou www)
Valeur: cname.vercel-dns.com
TTL: 3600
```

#### **Enregistrement TXT (vérification) :**
```
Type: TXT
Nom: @
Valeur: simpshopy-xxxxxxxxx-xxxxxxxxx
TTL: 3600
```

### **✅ Vérification manuelle :**
1. **Configure** les DNS chez ton registrar
2. **Attends** la propagation (1-24h)
3. **Clique** sur "Vérifier" dans l'app
4. **Statut** mis à jour automatiquement

---

**🎉 Ton système est maintenant prêt pour l'automatisation complète !** 