# 🚀 GUIDE DE DÉPLOIEMENT EDGE FUNCTION

## 📋 **MÉTHODES DE DÉPLOIEMENT**

### **1. 🔧 Méthode Automatique (Recommandée)**

#### **Windows (PowerShell):**
```powershell
# Exécuter le script automatique
.\deploy-edge-function.ps1
```

#### **Linux/Mac (Bash):**
```bash
# Exécuter le script automatique
./deploy-edge-function.sh
```

### **2. 📝 Méthode Manuelle (Étape par étape)**

#### **Étape 1: Installation Supabase CLI**

**Option A - Via npm:**
```bash
npm install -g supabase
```

**Option B - Téléchargement direct:**
1. Aller sur https://github.com/supabase/cli/releases
2. Télécharger la version pour votre OS
3. Extraire et ajouter au PATH

#### **Étape 2: Configuration des Variables d'Environnement**

```bash
# Windows (PowerShell)
$env:SUPABASE_URL = "https://grutldacuowplosarucp.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "votre_service_role_key_ici"

# Linux/Mac (Bash)
export SUPABASE_URL="https://grutldacuowplosarucp.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="votre_service_role_key_ici"
```

#### **Étape 3: Initialisation du Projet**

```bash
# Initialiser Supabase (si pas déjà fait)
supabase init

# Lier au projet existant
supabase link --project-ref grutldacuowplosarucp
```

#### **Étape 4: Déploiement de la Fonction**

```bash
# Déployer l'Edge Function
supabase functions deploy invalidate-cache --project-ref grutldacuowplosarucp
```

#### **Étape 5: Test de la Fonction**

```bash
# Test avec curl
curl -X POST \
  "https://grutldacuowplosarucp.supabase.co/functions/v1/invalidate-cache" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "UPDATE",
    "table": "stores",
    "record": {
      "id": "test-id",
      "name": "Test Store"
    }
  }'
```

### **3. 🌐 Déploiement via Dashboard Supabase**

#### **Étape 1: Accéder au Dashboard**
1. Aller sur https://supabase.com/dashboard/project/grutldacuowplosarucp
2. Cliquer sur "Edge Functions" dans le menu

#### **Étape 2: Créer la Fonction**
1. Cliquer sur "Create a new function"
2. Nom: `invalidate-cache`
3. Copier le contenu de `supabase/functions/invalidate-cache/index.ts`

#### **Étape 3: Configurer les Variables d'Environnement**
Dans les paramètres de la fonction, ajouter:
- `SUPABASE_URL`: `https://grutldacuowplosarucp.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: Votre clé service role

#### **Étape 4: Déployer**
1. Cliquer sur "Deploy function"
2. Attendre la confirmation de déploiement

## 🔧 **CONFIGURATION POST-DÉPLOIEMENT**

### **1. Exécuter les Triggers SQL**

```bash
# Exécuter le script SQL pour créer les triggers
psql "postgresql://postgres:[YOUR_PASSWORD]@db.grutldacuowplosarucp.supabase.co:5432/postgres" -f create_cache_invalidation_triggers.sql
```

### **2. Vérifier le Déploiement**

#### **Vérifier l'URL de la fonction:**
```
https://grutldacuowplosarucp.supabase.co/functions/v1/invalidate-cache
```

#### **Vérifier les logs:**
1. Dashboard Supabase → Edge Functions → invalidate-cache → Logs
2. Ou via CLI: `supabase functions logs invalidate-cache`

### **3. Test Complet**

```bash
# Test avec un vrai changement de produit
curl -X POST \
  "https://grutldacuowplosarucp.supabase.co/functions/v1/invalidate-cache" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "UPDATE",
    "table": "products",
    "record": {
      "id": "product-123",
      "name": "Produit Test",
      "price": 29.99,
      "store_id": "store-456"
    },
    "old_record": {
      "id": "product-123",
      "name": "Produit Test",
      "price": 19.99,
      "store_id": "store-456"
    }
  }'
```

## 🚨 **DÉPANNAGE**

### **Erreur: "Function not found"**
- Vérifier que la fonction est bien déployée
- Vérifier l'URL (doit finir par `/functions/v1/invalidate-cache`)

### **Erreur: "Unauthorized"**
- Vérifier la clé service role
- Vérifier que l'en-tête Authorization est correct

### **Erreur: "Internal server error"**
- Vérifier les logs de la fonction
- Vérifier que les triggers SQL sont installés

### **Erreur: "CLI not found"**
- Réinstaller Supabase CLI
- Vérifier le PATH système

## 📊 **MONITORING**

### **Logs en Temps Réel**
```bash
# Surveiller les logs
supabase functions logs invalidate-cache --follow
```

### **Métriques**
- Dashboard Supabase → Edge Functions → invalidate-cache → Metrics
- Voir les appels, erreurs, temps de réponse

## ✅ **VÉRIFICATION DU SUCCÈS**

La fonction est correctement déployée si :

1. ✅ **URL accessible** : https://grutldacuowplosarucp.supabase.co/functions/v1/invalidate-cache
2. ✅ **Test réussi** : Réponse JSON avec `{"success": true}`
3. ✅ **Triggers installés** : SQL exécuté sans erreur
4. ✅ **Logs visibles** : Activité dans les logs Supabase

## 🎉 **FÉLICITATIONS !**

Votre Edge Function d'invalidation de cache est maintenant déployée et prête à invalider automatiquement le cache lors des modifications de données critiques ! 🚀
