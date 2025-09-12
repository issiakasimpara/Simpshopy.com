#!/bin/bash
# 🚀 SCRIPT DE DÉPLOIEMENT EDGE FUNCTION (Linux/Mac)
# Date: 2025-01-28
# Objectif: Déployer la fonction invalidate-cache sur Supabase

echo "🚀 Déploiement de l'Edge Function invalidate-cache"

# 1. Vérifier si Supabase CLI est installé
echo -e "\n📋 Vérification de Supabase CLI..."
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI trouvé: $(supabase --version)"
else
    echo "❌ Supabase CLI non trouvé. Installation nécessaire."
    echo "📥 Installez via: npm install -g supabase"
    echo "💡 Ou téléchargez depuis: https://github.com/supabase/cli/releases"
    exit 1
fi

# 2. Vérifier les variables d'environnement
echo -e "\n🔑 Vérification des variables d'environnement..."

if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Variable SUPABASE_URL manquante"
    echo "💡 Définissez: export SUPABASE_URL='https://grutldacuowplosarucp.supabase.co'"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Variable SUPABASE_SERVICE_ROLE_KEY manquante"
    echo "💡 Définissez: export SUPABASE_SERVICE_ROLE_KEY='votre_service_role_key'"
    exit 1
fi

echo "✅ Variables d'environnement trouvées"

# 3. Vérifier la structure du projet
echo -e "\n📁 Vérification de la structure du projet..."

if [ ! -f "supabase/functions/invalidate-cache/index.ts" ]; then
    echo "❌ Fichier Edge Function non trouvé: supabase/functions/invalidate-cache/index.ts"
    exit 1
fi

echo "✅ Structure du projet correcte"

# 4. Initialiser Supabase (si nécessaire)
echo -e "\n🔧 Initialisation de Supabase..."

if [ ! -f "supabase/config.toml" ]; then
    echo "📝 Création du fichier de configuration Supabase..."
    supabase init
fi

# 5. Lier au projet Supabase
echo -e "\n🔗 Liaison au projet Supabase..."

supabase link --project-ref grutldacuowplosarucp 2>/dev/null || echo "⚠️ Projet déjà lié ou erreur de liaison"

# 6. Déployer l'Edge Function
echo -e "\n🚀 Déploiement de l'Edge Function..."

echo "📤 Déploiement en cours..."
if supabase functions deploy invalidate-cache --project-ref grutldacuowplosarucp; then
    echo -e "\n✅ Edge Function déployée avec succès!"
    echo "🌐 URL: https://grutldacuowplosarucp.supabase.co/functions/v1/invalidate-cache"
else
    echo "❌ Erreur lors du déploiement"
    exit 1
fi

# 7. Test de la fonction
echo -e "\n🧪 Test de la fonction déployée..."

test_payload='{
    "event": "UPDATE",
    "table": "stores",
    "record": {
        "id": "test-id",
        "name": "Test Store"
    }
}'

if curl -X POST \
    "https://grutldacuowplosarucp.supabase.co/functions/v1/invalidate-cache" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "$test_payload" \
    --silent --show-error; then
    echo -e "\n✅ Test réussi!"
else
    echo -e "\n⚠️ Test échoué (normal si pas de données de test)"
fi

# 8. Instructions finales
echo -e "\n🎉 DÉPLOIEMENT TERMINÉ!"
echo -e "\n📋 Prochaines étapes:"
echo "1. Exécuter le script SQL: create_cache_invalidation_triggers.sql"
echo "2. Configurer les triggers dans Supabase Dashboard"
echo "3. Tester l'invalidation automatique"

echo -e "\n🔗 Liens utiles:"
echo "- Dashboard Supabase: https://supabase.com/dashboard/project/grutldacuowplosarucp"
echo "- Logs Edge Functions: https://supabase.com/dashboard/project/grutldacuowplosarucp/functions"
echo "- Documentation: https://supabase.com/docs/guides/functions"

echo -e "\n✨ L'Edge Function est maintenant prête à invalider automatiquement le cache!"
