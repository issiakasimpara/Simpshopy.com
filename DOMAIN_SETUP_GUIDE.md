# 🌐 GUIDE COMPLET : CONFIGURATION DOMAINE SIMPSHOPY.COM

## 📋 **PRÉREQUIS**
- ✅ Domaine `simpshopy.com` acheté chez OVH
- ✅ Application déployée sur Vercel
- ✅ Tables Supabase configurées
- ✅ Compte Cloudflare (à créer)

---

## 🎯 **ÉTAPE 1 : CONFIGURATION OVH (DNS)**

### **1.1 - Connexion à OVH**
1. **Ouvre ton navigateur**
2. **Va sur** [ovh.com](https://ovh.com)
3. **Clique sur** "Se connecter" (en haut à droite)
4. **Saisis** ton email et mot de passe OVH
5. **Clique sur** "Se connecter"

### **1.2 - Accès à la gestion du domaine**
1. **Dans le dashboard OVH**, cherche **"Domaines"**
2. **Clique sur** "Domaines" dans le menu de gauche
3. **Trouve** `simpshopy.com` dans la liste
4. **Clique sur** `simpshopy.com`

### **1.3 - Configuration DNS**
1. **Dans la page du domaine**, cherche **"Zone DNS"**
2. **Clique sur** "Zone DNS" dans le menu
3. **Clique sur** "Modifier la zone"

### **1.4 - Ajout des enregistrements DNS**
1. **Cherche** la section "Enregistrements DNS"
2. **Clique sur** "Ajouter un enregistrement"

#### **Enregistrement A (domaine principal) :**
- **Type** : A
- **Nom** : @ (laisse vide)
- **Valeur** : 76.76.19.36
- **TTL** : 3600
- **Clique sur** "Suivant"
- **Clique sur** "Valider"

#### **Enregistrement CNAME (www) :**
- **Clique sur** "Ajouter un enregistrement"
- **Type** : CNAME
- **Nom** : www
- **Valeur** : cname.vercel-dns.com
- **TTL** : 3600
- **Clique sur** "Suivant"
- **Clique sur** "Valider"

### **1.5 - Vérification**
1. **Attends** 5-10 minutes pour la propagation
2. **Vérifie** que les enregistrements sont bien ajoutés
3. **Note** les nameservers OVH (seront nécessaires pour Cloudflare)

---

## 🎯 **ÉTAPE 2 : CONFIGURATION CLOUDFLARE**

### **2.1 - Création du compte Cloudflare**
1. **Va sur** [cloudflare.com](https://cloudflare.com)
2. **Clique sur** "Sign up" (en haut à droite)
3. **Saisis** ton email
4. **Saisis** un mot de passe
5. **Clique sur** "Create Account"
6. **Vérifie** ton email si demandé

### **2.2 - Ajout du domaine**
1. **Dans le dashboard Cloudflare**, clique sur **"Add a Site"**
2. **Saisis** `simpshopy.com`
3. **Clique sur** "Add Site"
4. **Sélectionne** le plan "Free" (gratuit)
5. **Clique sur** "Continue"

### **2.3 - Configuration des nameservers**
1. **Cloudflare va te donner** 2 nameservers
2. **Note-les** quelque part (exemple) :
   - `nina.ns.cloudflare.com`
   - `rick.ns.cloudflare.com`

### **2.4 - Modification des nameservers OVH**
1. **Retourne sur OVH**
2. **Va dans** la gestion de `simpshopy.com`
3. **Clique sur** "Serveurs DNS" dans le menu
4. **Clique sur** "Modifier les serveurs DNS"
5. **Remplace** les nameservers actuels par ceux de Cloudflare
6. **Clique sur** "Valider"

### **2.5 - Configuration Cloudflare**
1. **Retourne sur Cloudflare**
2. **Attends** que le domaine soit actif (5-10 minutes)
3. **Clique sur** `simpshopy.com` dans ton dashboard

### **2.6 - Configuration DNS Cloudflare**
1. **Clique sur** "DNS" dans le menu de gauche
2. **Vérifie** que les enregistrements sont présents
3. **Pour chaque enregistrement**, clique sur le **nuage orange** (Proxy activé)
4. **Clique sur** "Save"

### **2.7 - Configuration SSL/TLS**
1. **Clique sur** "SSL/TLS" dans le menu
2. **Sélectionne** "Full (strict)" dans "Encryption mode"
3. **Clique sur** "Save"

### **2.8 - Configuration Page Rules**
1. **Clique sur** "Page Rules" dans le menu
2. **Clique sur** "Create Page Rule"
3. **URL** : `*.simpshopy.com/*`
4. **Settings** : "Always Use HTTPS"
5. **Clique sur** "Save and Deploy"

---

## 🎯 **ÉTAPE 3 : CONFIGURATION VERCEL**

### **3.1 - Accès aux paramètres du projet**
1. **Va sur** [vercel.com](https://vercel.com)
2. **Connecte-toi** à ton compte
3. **Clique sur** ton projet `Simpshopy.com`
4. **Clique sur** "Settings" dans le menu

### **3.2 - Ajout du domaine**
1. **Clique sur** "Domains" dans le menu de gauche
2. **Clique sur** "Add Domain"
3. **Saisis** `simpshopy.com`
4. **Clique sur** "Add"

### **3.3 - Configuration des sous-domaines**
1. **Clique sur** "Add Domain" à nouveau
2. **Saisis** `*.simpshopy.com`
3. **Clique sur** "Add"

### **3.4 - Vérification**
1. **Attends** 5-10 minutes
2. **Vérifie** que les domaines sont "Valid"
3. **Teste** l'accès à `simpshopy.com`

---

## 🎯 **ÉTAPE 4 : CONFIGURATION SUPABASE**

### **4.1 - Vérification des tables**
1. **Va sur** [supabase.com](https://supabase.com)
2. **Connecte-toi** à ton projet
3. **Clique sur** "Table Editor"
4. **Vérifie** que ces tables existent :
   - `domains`
   - `custom_domains`
   - `store_domains`

### **4.2 - Configuration des Edge Functions**
1. **Clique sur** "Edge Functions" dans le menu
2. **Vérifie** que ces fonctions existent :
   - `domain-router`
   - `cloudflare-domains`

### **4.3 - Variables d'environnement**
1. **Clique sur** "Settings" → "API"
2. **Vérifie** que ces variables sont configurées :
   - `CLOUDFLARE_API_TOKEN`
   - `VERCEL_API_TOKEN`

---

## 🎯 **ÉTAPE 5 : TEST ET VÉRIFICATION**

### **5.1 - Test du domaine principal**
1. **Ouvre** un nouvel onglet
2. **Va sur** `https://simpshopy.com`
3. **Vérifie** que l'app se charge correctement
4. **Vérifie** que le favicon apparaît

### **5.2 - Test des sous-domaines**
1. **Teste** `https://www.simpshopy.com`
2. **Vérifie** que ça redirige vers `simpshopy.com`

### **5.3 - Test SSL**
1. **Vérifie** que le cadenas vert apparaît
2. **Vérifie** que `http://` redirige vers `https://`

---

## 🎯 **ÉTAPE 6 : CONFIGURATION DES DOMAINES PERSONNALISÉS**

### **6.1 - Test d'un domaine personnalisé**
1. **Dans ton app**, va dans les paramètres
2. **Ajoute** un domaine personnalisé de test
3. **Vérifie** que la vérification fonctionne

### **6.2 - Configuration Cloudflare pour domaines personnalisés**
1. **Dans Cloudflare**, ajoute le domaine personnalisé
2. **Configure** les DNS comme pour `simpshopy.com`
3. **Active** le proxy (nuage orange)

---

## ✅ **CHECKLIST FINALE**

- [ ] OVH DNS configuré
- [ ] Cloudflare actif et configuré
- [ ] Vercel domaines ajoutés
- [ ] Supabase tables vérifiées
- [ ] SSL/TLS activé
- [ ] Domaines personnalisés testés
- [ ] Sous-domaines fonctionnels

---

## 🆘 **EN CAS DE PROBLÈME**

### **DNS ne se propage pas :**
- Attends 24-48 heures
- Vérifie les nameservers
- Contacte OVH support

### **SSL ne fonctionne pas :**
- Vérifie la configuration Cloudflare
- Attends 1-2 heures
- Vérifie les certificats

### **Domaines personnalisés ne marchent pas :**
- Vérifie la configuration Supabase
- Teste les Edge Functions
- Vérifie les variables d'environnement

---

## 📞 **SUPPORT**

- **OVH** : [support.ovh.com](https://support.ovh.com)
- **Cloudflare** : [support.cloudflare.com](https://support.cloudflare.com)
- **Vercel** : [vercel.com/support](https://vercel.com/support)
- **Supabase** : [supabase.com/support](https://supabase.com/support)

---

**🎉 FÉLICITATIONS ! Ton domaine `simpshopy.com` est maintenant configuré pour les sous-domaines et domaines personnalisés !** 