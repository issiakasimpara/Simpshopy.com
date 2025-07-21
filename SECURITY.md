# 🔐 GUIDE DE SÉCURITÉ - MALIBA SHOP

## 🚨 ACTIONS URGENTES EFFECTUÉES

### ✅ Clés API Sécurisées
- [x] Clés Supabase déplacées vers `.env`
- [x] Clés Cloudflare supprimées du frontend
- [x] Variables d'environnement validées
- [x] `.gitignore` mis à jour

### ✅ Validation Automatique
- [x] Validateur de sécurité créé
- [x] Vérifications au démarrage
- [x] Rapport de sécurité en console

## 🔐 CONFIGURATION SÉCURISÉE

### Variables d'Environnement
```bash
# ✅ Variables publiques (frontend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# ❌ JAMAIS dans le frontend !
SUPABASE_SERVICE_ROLE_KEY=secret_key
CLOUDFLARE_API_TOKEN=secret_token
```

### Règles de Sécurité

#### ✅ À FAIRE
- Utiliser les variables d'environnement pour toutes les clés
- Préfixer les variables frontend par `VITE_`
- Valider toutes les entrées utilisateur
- Utiliser HTTPS en production
- Activer RLS sur toutes les tables Supabase
- Logger les erreurs sans exposer les secrets

#### ❌ À NE JAMAIS FAIRE
- Commiter des clés API dans Git
- Exposer des clés privées côté client
- Désactiver la validation TypeScript
- Utiliser HTTP en production
- Logger des informations sensibles

## 🔍 VÉRIFICATIONS AUTOMATIQUES

Le système vérifie automatiquement :
- ✅ Présence des variables d'environnement
- ✅ Absence de clés hardcodées
- ✅ Configuration HTTPS
- ✅ Format des URLs Supabase

## 🚨 ALERTES DE SÉCURITÉ

### Niveau CRITIQUE
- Clés API exposées dans le code
- Variables d'environnement manquantes
- HTTP utilisé en production

### Niveau WARNING
- Headers de sécurité manquants
- Validation TypeScript désactivée
- Logs excessifs en production

## 📋 CHECKLIST DÉPLOIEMENT

Avant chaque déploiement :

- [ ] Variables d'environnement configurées
- [ ] Aucune clé hardcodée dans le code
- [ ] HTTPS activé
- [ ] RLS activé sur Supabase
- [ ] Tests de sécurité passés
- [ ] Logs de production nettoyés

## 🔧 OUTILS DE SÉCURITÉ

### Validation Automatique
```typescript
import { validateSecurity } from '@/utils/securityValidator';
const report = validateSecurity();
```

### Configuration Cloudflare Sécurisée
```typescript
import { callCloudflareAPI } from '@/utils/cloudflareConfig';
// Utilise les Edge Functions pour sécuriser les appels
```

## 📞 CONTACT SÉCURITÉ

En cas de faille de sécurité détectée :
1. Ne pas exposer la faille publiquement
2. Corriger immédiatement
3. Documenter l'incident
4. Mettre à jour ce guide

## 🔄 MISES À JOUR

Ce guide doit être mis à jour à chaque :
- Ajout de nouvelle API
- Changement de configuration
- Découverte de vulnérabilité
- Mise à jour des dépendances

---

**🎯 RAPPEL** : La sécurité est la responsabilité de tous les développeurs !
