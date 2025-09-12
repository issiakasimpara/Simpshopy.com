-- 🔍 DIAGNOSTIC DES TRIGGERS D'INVALIDATION
-- Date: 2025-01-28
-- Objectif: Diagnostiquer pourquoi les données arrivent undefined dans l'Edge Function

-- =====================================================
-- 1. VÉRIFIER L'EXTENSION HTTP
-- =====================================================

SELECT 
    extname as "Extension",
    extversion as "Version",
    extrelocatable as "Relocatable"
FROM pg_extension 
WHERE extname IN ('http', 'pg_net', 'net');

-- =====================================================
-- 2. VÉRIFIER LES TRIGGERS EXISTANTS
-- =====================================================

SELECT 
    trigger_name as "Trigger Name",
    event_manipulation as "Event",
    action_statement as "Action",
    action_timing as "Timing"
FROM information_schema.triggers 
WHERE trigger_name LIKE '%invalidate%'
ORDER BY trigger_name;

-- =====================================================
-- 3. VÉRIFIER LA FONCTION TRIGGER
-- =====================================================

SELECT 
    routine_name as "Function Name",
    routine_type as "Type",
    data_type as "Return Type",
    routine_definition as "Definition"
FROM information_schema.routines 
WHERE routine_name LIKE '%invalidate%'
ORDER BY routine_name;

-- =====================================================
-- 4. TEST SIMPLE DE L'EXTENSION HTTP
-- =====================================================

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
-- 5. VÉRIFIER LES PERMISSIONS
-- =====================================================

SELECT 
    grantee as "User",
    privilege_type as "Privilege",
    is_grantable as "Grantable"
FROM information_schema.role_table_grants 
WHERE table_name IN ('stores', 'products', 'site_templates', 'categories')
ORDER BY grantee, table_name;

-- =====================================================
-- 6. TEST MANUEL DU TRIGGER
-- =====================================================

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
-- 7. VÉRIFIER LES LOGS DE LA BASE
-- =====================================================

-- Vérifier si les logs sont activés
SHOW log_statement;
SHOW log_min_messages;

-- =====================================================
-- 8. RÉSUMÉ DU DIAGNOSTIC
-- =====================================================

SELECT 
    '🔍 DIAGNOSTIC TERMINÉ' as "Status",
    'Vérifiez les résultats ci-dessus pour identifier le problème' as "Instructions";
