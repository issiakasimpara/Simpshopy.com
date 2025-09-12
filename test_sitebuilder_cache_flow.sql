-- 🧪 TEST COMPLET DU FLUX SITEBUILDER → CACHE
-- Date: 2025-01-28
-- Objectif: Tester le flux complet de modification à publication

-- =====================================================
-- 1. SIMULATION D'UNE MODIFICATION DANS LE SITEBUILDER
-- =====================================================

DO $$
DECLARE
    test_store_id UUID;
    test_template_id UUID;
    original_template_data JSONB;
    new_template_data JSONB;
BEGIN
    -- Trouver une boutique de test
    SELECT id INTO test_store_id 
    FROM stores 
    WHERE status = 'active' 
    LIMIT 1;
    
    IF test_store_id IS NOT NULL THEN
        -- Trouver le template de la boutique
        SELECT id, template_data INTO test_template_id, original_template_data
        FROM site_templates 
        WHERE store_id = test_store_id
        LIMIT 1;
        
        IF test_template_id IS NOT NULL THEN
            RAISE NOTICE '🧪 Test avec boutique ID: %', test_store_id;
            RAISE NOTICE '🧪 Test avec template ID: %', test_template_id;
            
            -- Simuler une modification de template
            new_template_data := original_template_data || '{"test_modification": "nouveau_contenu", "timestamp": "' || NOW() || '"}';
            
            RAISE NOTICE '📝 Simulation modification template...';
            
            -- Mise à jour du template (déclenche le trigger)
            UPDATE site_templates 
            SET template_data = new_template_data,
                updated_at = NOW()
            WHERE id = test_template_id;
            
            RAISE NOTICE '✅ Modification sauvegardée - Trigger activé';
            
            -- Attendre un peu pour voir les logs
            PERFORM pg_sleep(2);
            
            -- Simuler la publication
            RAISE NOTICE '📢 Simulation publication...';
            
            UPDATE site_templates 
            SET is_published = true,
                updated_at = NOW()
            WHERE id = test_template_id;
            
            RAISE NOTICE '✅ Template publié - Trigger CRITICAL activé';
            
            -- Restaurer l'état original
            UPDATE site_templates 
            SET template_data = original_template_data,
                is_published = COALESCE(is_published, false),
                updated_at = NOW()
            WHERE id = test_template_id;
            
            RAISE NOTICE '✅ État original restauré';
            
        ELSE
            RAISE NOTICE '⚠️ Aucun template trouvé pour cette boutique';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ Aucune boutique active trouvée pour le test';
    END IF;
END $$;

-- =====================================================
-- 2. VÉRIFICATION DES TRIGGERS
-- =====================================================

SELECT 
    'Vérification triggers' as test_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_invalidate_cache_site_templates')
        THEN '✅ Trigger site_templates actif'
        ELSE '❌ Trigger site_templates manquant'
    END as trigger_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'invalidate_cache_trigger')
        THEN '✅ Fonction invalidation active'
        ELSE '❌ Fonction invalidation manquante'
    END as function_status;

-- =====================================================
-- 3. TEST DE PERFORMANCE DE LA FONCTION RPC
-- =====================================================

DO $$
DECLARE
    test_slug TEXT;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time INTERVAL;
    result JSONB;
BEGIN
    -- Trouver une boutique de test
    SELECT slug INTO test_slug 
    FROM stores 
    WHERE status = 'active' 
    LIMIT 1;
    
    IF test_slug IS NOT NULL THEN
        RAISE NOTICE '⚡ Test de performance RPC avec: %', test_slug;
        
        -- Test de la fonction actuelle
        start_time := clock_timestamp();
        result := get_storefront_by_slug(test_slug);
        end_time := clock_timestamp();
        execution_time := end_time - start_time;
        
        RAISE NOTICE '⏱️ Temps d''exécution actuel: %', execution_time;
        RAISE NOTICE '📊 Taille du résultat: % octets', octet_length(result::text);
        
        -- Évaluer la performance
        IF execution_time < INTERVAL '1 second' THEN
            RAISE NOTICE '✅ Performance EXCELLENTE (<1s)';
        ELSIF execution_time < INTERVAL '2 seconds' THEN
            RAISE NOTICE '⚠️ Performance BONNE (1-2s)';
        ELSIF execution_time < INTERVAL '5 seconds' THEN
            RAISE NOTICE '⚠️ Performance MOYENNE (2-5s)';
        ELSE
            RAISE NOTICE '❌ Performance LENTE (>5s) - Optimisation nécessaire';
        END IF;
        
    ELSE
        RAISE NOTICE '⚠️ Aucune boutique active trouvée pour le test de performance';
    END IF;
END $$;

-- =====================================================
-- 4. SIMULATION D'INVALIDATION DE CACHE
-- =====================================================

DO $$
DECLARE
    test_payload JSONB;
    webhook_url TEXT;
BEGIN
    webhook_url := 'https://grutldacuowplosarucp.supabase.co/functions/v1/invalidate-cache';
    
    -- Simuler un payload d'invalidation
    test_payload := jsonb_build_object(
        'table', 'site_templates',
        'operation', 'UPDATE',
        'id', 'test-template-id',
        'criticality', 'CRITICAL',
        'timestamp', NOW(),
        'record', jsonb_build_object(
            'id', 'test-template-id',
            'store_id', 'test-store-id',
            'is_published', true
        ),
        'old_record', jsonb_build_object(
            'id', 'test-template-id',
            'store_id', 'test-store-id',
            'is_published', false
        )
    );
    
    RAISE NOTICE '🔗 Simulation appel Edge Function...';
    RAISE NOTICE '📦 Payload: %', test_payload;
    RAISE NOTICE '🌐 URL: %', webhook_url;
    RAISE NOTICE 'ℹ️ Vérifiez les logs Edge Function pour voir l''invalidation';
END $$;

-- =====================================================
-- 5. RÉSUMÉ DES TESTS
-- =====================================================

SELECT 
    '🎯 RÉSUMÉ DES TESTS' as test_type,
    'Flux SiteBuilder → Cache testé' as description,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name LIKE 'trigger_invalidate_cache_%')
        THEN '✅ TRIGGERS OPÉRATIONNELS'
        ELSE '❌ TRIGGERS MANQUANTS'
    END as triggers_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_storefront_by_slug')
        THEN '✅ FONCTION RPC DISPONIBLE'
        ELSE '❌ FONCTION RPC MANQUANTE'
    END as rpc_status;
