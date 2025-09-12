-- 🧪 TEST DIRECT DES TRIGGERS (sans passer par l'Edge Function)
-- Date: 2025-01-28

-- =====================================================
-- 1. TESTER UNE MISE À JOUR SIMPLE
-- =====================================================

DO $$
DECLARE
    test_store_id UUID;
    test_store_name TEXT;
    test_result TEXT;
BEGIN
    -- Trouver un store existant
    SELECT id, name INTO test_store_id, test_store_name 
    FROM stores 
    WHERE status = 'active'
    LIMIT 1;
    
    IF test_store_id IS NOT NULL THEN
        RAISE NOTICE '🎯 Store de test trouvé: % (ID: %)', test_store_name, test_store_id;
        
        -- Tester une mise à jour qui devrait déclencher le trigger
        UPDATE stores 
        SET updated_at = NOW() 
        WHERE id = test_store_id;
        
        RAISE NOTICE '✅ Test de mise à jour effectué sur: %', test_store_name;
        RAISE NOTICE '🔔 Le trigger devrait avoir été déclenché et avoir appelé l''Edge Function';
        
    ELSE
        RAISE NOTICE '⚠️ Aucun store actif trouvé pour le test';
    END IF;
END $$;

-- =====================================================
-- 2. VÉRIFIER QUE LE TRIGGER EXISTE
-- =====================================================

SELECT '🔍 VÉRIFICATION DU TRIGGER' as "Test";

SELECT 
    trigger_name as "Trigger Name",
    event_manipulation as "Event",
    action_timing as "Timing",
    action_orientation as "Orientation"
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_invalidate_cache_stores'
AND event_object_table = 'stores';

-- =====================================================
-- 3. VÉRIFIER QUE LA FONCTION EXISTE
-- =====================================================

SELECT '🔍 VÉRIFICATION DE LA FONCTION' as "Test";

SELECT 
    routine_name as "Function Name",
    routine_type as "Type",
    data_type as "Return Type"
FROM information_schema.routines 
WHERE routine_name = 'invalidate_cache_trigger';

-- =====================================================
-- 4. RÉSUMÉ
-- =====================================================

SELECT 
    '🎯 TEST TERMINÉ' as "Status",
    'Vérifiez les logs de l''Edge Function pour voir si le trigger a fonctionné' as "Instructions";
