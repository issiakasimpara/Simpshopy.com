-- 🧪 TEST FINAL DES TRIGGERS (après correction CORS)
-- Date: 2025-01-28

-- =====================================================
-- 1. VÉRIFIER QUE LES TRIGGERS EXISTENT
-- =====================================================

SELECT '🔍 VÉRIFICATION DES TRIGGERS' as "Test";

SELECT 
    trigger_name as "Trigger Name",
    event_manipulation as "Event",
    action_timing as "Timing"
FROM information_schema.triggers 
WHERE trigger_name LIKE '%invalidate%'
ORDER BY trigger_name;

-- =====================================================
-- 2. TESTER UNE MISE À JOUR QUI DEVRAIT DÉCLENCHER LE TRIGGER
-- =====================================================

DO $$
DECLARE
    test_store_id UUID;
    test_store_name TEXT;
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
        RAISE NOTICE '🔔 Le trigger devrait avoir appelé l''Edge Function';
        RAISE NOTICE '📋 Vérifiez les logs de l''Edge Function dans Supabase';
        
    ELSE
        RAISE NOTICE '⚠️ Aucun store actif trouvé pour le test';
    END IF;
END $$;

-- =====================================================
-- 3. TESTER UNE MODIFICATION CRITIQUE
-- =====================================================

DO $$
DECLARE
    test_store_id UUID;
    test_store_name TEXT;
BEGIN
    -- Trouver un store existant
    SELECT id, name INTO test_store_id, test_store_name 
    FROM stores 
    WHERE status = 'active'
    LIMIT 1;
    
    IF test_store_id IS NOT NULL THEN
        RAISE NOTICE '🎯 Test modification critique sur: % (ID: %)', test_store_name, test_store_id;
        
        -- Tester une modification critique (nom)
        UPDATE stores 
        SET name = name || ' - Test Trigger'
        WHERE id = test_store_id;
        
        -- Remettre le nom original
        UPDATE stores 
        SET name = REPLACE(name, ' - Test Trigger', '')
        WHERE id = test_store_id;
        
        RAISE NOTICE '✅ Test de modification critique effectué';
        RAISE NOTICE '🔔 Le trigger devrait avoir détecté une modification CRITICAL';
        
    ELSE
        RAISE NOTICE '⚠️ Aucun store actif trouvé pour le test critique';
    END IF;
END $$;

-- =====================================================
-- 4. RÉSUMÉ
-- =====================================================

SELECT 
    '🎯 TESTS TERMINÉS' as "Status",
    'Vérifiez les logs de l''Edge Function dans Supabase Dashboard' as "Instructions";
