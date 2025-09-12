-- 🔍 DIAGNOSTIC DÉTAILLÉ DES TRIGGERS D'INVALIDATION
-- Date: 2025-01-28
-- Objectif: Afficher tous les détails du diagnostic

-- =====================================================
-- 1. VÉRIFIER L'EXTENSION HTTP (DÉTAILLÉ)
-- =====================================================

SELECT '🔍 VÉRIFICATION EXTENSION HTTP' as "Section";

SELECT 
    extname as "Extension",
    extversion as "Version",
    extrelocatable as "Relocatable"
FROM pg_extension 
WHERE extname IN ('http', 'pg_net', 'net');

-- Si aucune extension trouvée, afficher toutes les extensions
SELECT '📋 TOUTES LES EXTENSIONS DISPONIBLES:' as "Info";
SELECT extname as "Extension", extversion as "Version" 
FROM pg_extension 
ORDER BY extname;

-- =====================================================
-- 2. VÉRIFIER LES TRIGGERS EXISTANTS (DÉTAILLÉ)
-- =====================================================

SELECT '🔍 VÉRIFICATION TRIGGERS' as "Section";

SELECT 
    trigger_name as "Trigger Name",
    event_manipulation as "Event",
    action_statement as "Action",
    action_timing as "Timing",
    action_orientation as "Orientation"
FROM information_schema.triggers 
WHERE trigger_name LIKE '%invalidate%'
ORDER BY trigger_name;

-- Vérifier tous les triggers sur les tables importantes
SELECT '📋 TOUS LES TRIGGERS SUR STORES:' as "Info";
SELECT 
    trigger_name as "Trigger Name",
    event_manipulation as "Event",
    action_timing as "Timing"
FROM information_schema.triggers 
WHERE event_object_table = 'stores'
ORDER BY trigger_name;

-- =====================================================
-- 3. VÉRIFIER LA FONCTION TRIGGER (DÉTAILLÉ)
-- =====================================================

SELECT '🔍 VÉRIFICATION FONCTION TRIGGER' as "Section";

SELECT 
    routine_name as "Function Name",
    routine_type as "Type",
    data_type as "Return Type"
FROM information_schema.routines 
WHERE routine_name LIKE '%invalidate%'
ORDER BY routine_name;

-- Vérifier si la fonction existe avec plus de détails
SELECT '📋 DÉTAILS DE LA FONCTION:' as "Info";
SELECT 
    proname as "Function Name",
    proargnames as "Arguments",
    prorettype::regtype as "Return Type",
    prosecdef as "Security Definer"
FROM pg_proc 
WHERE proname LIKE '%invalidate%';

-- =====================================================
-- 4. TEST SIMPLE DE L'EXTENSION HTTP (DÉTAILLÉ)
-- =====================================================

SELECT '🔍 TEST EXTENSION HTTP' as "Section";

-- Test si l'extension http fonctionne
DO $$
DECLARE
    test_result TEXT;
BEGIN
    BEGIN
        -- Test simple
        SELECT net.http_post(
            url := 'https://httpbin.org/post',
            headers := '{"Content-Type": "application/json"}'::jsonb,
            body := '{"test": "data"}'::text
        ) INTO test_result;
        
        RAISE NOTICE '✅ Extension HTTP fonctionne: %', test_result;
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Extension HTTP ne fonctionne pas: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- 5. VÉRIFIER LES PERMISSIONS (DÉTAILLÉ)
-- =====================================================

SELECT '🔍 VÉRIFICATION PERMISSIONS' as "Section";

SELECT 
    grantee as "User",
    privilege_type as "Privilege",
    is_grantable as "Grantable"
FROM information_schema.role_table_grants 
WHERE table_name IN ('stores', 'products', 'site_templates', 'categories')
ORDER BY grantee, table_name;

-- =====================================================
-- 6. TEST MANUEL DU TRIGGER (DÉTAILLÉ)
-- =====================================================

SELECT '🔍 TEST MANUEL DU TRIGGER' as "Section";

-- Trouver un store pour tester
DO $$
DECLARE
    test_store_id UUID;
    test_store_name TEXT;
BEGIN
    -- Récupérer un store existant
    SELECT id, name INTO test_store_id, test_store_name 
    FROM stores 
    WHERE status = 'active'
    LIMIT 1;
    
    IF test_store_id IS NOT NULL THEN
        RAISE NOTICE '🎯 Store de test trouvé: % (ID: %)', test_store_name, test_store_id;
        
        -- Tester une mise à jour simple
        UPDATE stores 
        SET updated_at = NOW() 
        WHERE id = test_store_id;
        
        RAISE NOTICE '✅ Test de mise à jour effectué sur: %', test_store_name;
    ELSE
        RAISE NOTICE '⚠️ Aucun store actif trouvé pour le test';
    END IF;
END $$;

-- =====================================================
-- 7. VÉRIFIER LA STRUCTURE DES TABLES
-- =====================================================

SELECT '🔍 VÉRIFICATION STRUCTURE TABLES' as "Section";

-- Vérifier la structure de la table stores
SELECT '📋 STRUCTURE TABLE STORES:' as "Info";
SELECT 
    column_name as "Column",
    data_type as "Type",
    is_nullable as "Nullable",
    column_default as "Default"
FROM information_schema.columns 
WHERE table_name = 'stores'
ORDER BY ordinal_position;

-- =====================================================
-- 8. VÉRIFIER LES LOGS DE LA BASE (DÉTAILLÉ)
-- =====================================================

SELECT '🔍 VÉRIFICATION LOGS' as "Section";

-- Vérifier si les logs sont activés
SELECT 
    name as "Setting",
    setting as "Value",
    context as "Context"
FROM pg_settings 
WHERE name IN ('log_statement', 'log_min_messages', 'log_triggers')
ORDER BY name;

-- =====================================================
-- 9. RÉSUMÉ FINAL
-- =====================================================

SELECT 
    '🎯 DIAGNOSTIC DÉTAILLÉ TERMINÉ' as "Status",
    'Tous les détails ont été affichés ci-dessus' as "Instructions";
