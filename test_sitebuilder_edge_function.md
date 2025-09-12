# 🧪 TEST SITEBUILDER → EDGE FUNCTION

## 🎯 OBJECTIF
Vérifier que les changements SiteBuilder déclenchent correctement l'Edge Function et invalident le cache.

## 📋 ÉTAPES DE TEST

### 1. 🔧 DÉPLOYER LES TRIGGERS
```sql
-- Copiez-collez le contenu de deploy_sitebuilder_triggers.sql dans Supabase SQL Editor
```

### 2. 🧪 TESTER UNE MODIFICATION SITEBUILDER

**A. Ouvrir la console du navigateur** sur votre boutique publique :
```javascript
// Test de monitoring des événements cache
window.addEventListener('cache-invalidated', (event) => {
    console.log('🎉 Cache invalidé:', event.detail);
});

// Test de monitoring des changements
window.addEventListener('storefront-updated', (event) => {
    console.log('🔄 Storefront mis à jour:', event.detail);
});
```

**B. Modifier un template dans SiteBuilder** :
1. Aller dans SiteBuilder
2. Modifier un bloc, couleur, ou contenu
3. Sauvegarder les changements
4. Observer la console du navigateur

### 3. 📊 RÉSULTATS ATTENDUS

**✅ SUCCÈS** :
- Console affiche : `🔔 SiteBuilder Change: UPDATE sur site_templates (ID: xxx)`
- Console affiche : `🎉 Cache invalidé: {table: 'site_templates', ...}`
- Boutique publique se met à jour automatiquement

**❌ ÉCHEC** :
- Aucun message dans la console
- Boutique publique ne se met pas à jour
- Edge Function ne reçoit pas d'appel

## 🔍 DIAGNOSTIC EN CAS D'ÉCHEC

### Vérifier les triggers :
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%invalidate_cache%';
```

### Vérifier l'Edge Function :
```sql
-- Dans Supabase Dashboard → Edge Functions → Logs
-- Chercher les appels de l'Edge Function
```

### Test manuel Edge Function :
```javascript
// Dans la console du navigateur
fetch('https://grutldacuowplosarucp.supabase.co/functions/v1/invalidate-cache', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTAxNjEsImV4cCI6MjA2NDY2NjE2MX0.cqKxbFdqF589dQBSH3IKNL6kXdRNtS9dpkrYNOHk0Ac'
    },
    body: JSON.stringify({
        table: 'site_templates',
        operation: 'UPDATE',
        id: 'test-id',
        criticality: 'IMPORTANT'
    })
}).then(r => r.json()).then(console.log);
```

## 🚀 RÉSULTAT FINAL

Une fois les triggers déployés :
- ✅ **SiteBuilder** → **Triggers** → **Edge Function** → **Cache Invalidation** → **Storefront Update**
- ✅ **Temps réel** : Changements instantanés sur la boutique publique
- ✅ **Performance** : Cache intelligent maintenu
- ✅ **UX** : Expérience fluide et réactive
