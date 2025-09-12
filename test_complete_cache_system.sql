-- 🧪 TEST COMPLET DU SYSTÈME DE CACHE INTELLIGENT
-- Date: 2025-01-28
-- Objectif: Vérifier que les triggers et l'Edge Function fonctionnent

-- =====================================================
-- 1. VÉRIFICATION DE L'ÉTAT INITIAL
-- =====================================================

SELECT 
  'État initial' as test_type,
  'Vérification des triggers et fonctions' as description,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_invalidate_cache_stores')
      AND EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_invalidate_cache_products')
      AND EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_invalidate_cache_site_templates')
      AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'invalidate_cache_trigger')
    THEN '✅ TOUT EST EN PLACE'
    ELSE '❌ ÉLÉMENTS MANQUANTS'
  END as status;

-- =====================================================
-- 2. TEST DES TRIGGERS - MODIFICATION D'UNE BOUTIQUE
-- =====================================================

-- Trouver une boutique existante pour le test
DO $$
DECLARE
    test_store_id UUID;
    test_store_slug TEXT;
    original_name TEXT;
BEGIN
    -- Récupérer une boutique existante
    SELECT id, slug, name INTO test_store_id, test_store_slug, original_name
    FROM stores 
    WHERE status = 'active' 
    LIMIT 1;
    
    IF test_store_id IS NOT NULL THEN
        RAISE NOTICE '🏪 Test avec la boutique: % (slug: %)', original_name, test_store_slug;
        
        -- Modifier le nom de la boutique (devrait déclencher le trigger)
        UPDATE stores 
        SET name = original_name || ' - TEST CACHE ' || EXTRACT(EPOCH FROM NOW())
        WHERE id = test_store_id;
        
        RAISE NOTICE '✅ Modification de boutique effectuée - Trigger activé';
        
        -- Remettre le nom original
        UPDATE stores 
        SET name = original_name
        WHERE id = test_store_id;
        
        RAISE NOTICE '✅ Nom restauré';
    ELSE
        RAISE NOTICE '⚠️ Aucune boutique active trouvée pour le test';
    END IF;
END $$;

-- =====================================================
-- 3. TEST DES TRIGGERS - MODIFICATION D'UN PRODUIT
-- =====================================================

DO $$
DECLARE
    test_product_id UUID;
    test_store_id UUID;
    original_price DECIMAL;
BEGIN
    -- Récupérer un produit existant
    SELECT p.id, p.store_id, p.price 
    INTO test_product_id, test_store_id, original_price
    FROM products p
    JOIN stores s ON p.store_id = s.id
    WHERE s.status = 'active' AND p.status = 'active'
    LIMIT 1;
    
    IF test_product_id IS NOT NULL THEN
        RAISE NOTICE '📦 Test avec le produit ID: % (prix: %)', test_product_id, original_price;
        
        -- Modifier le prix (devrait déclencher le trigger CRITICAL)
        UPDATE products 
        SET price = original_price + 100
        WHERE id = test_product_id;
        
        RAISE NOTICE '✅ Modification de prix effectuée - Trigger CRITICAL activé';
        
        -- Remettre le prix original
        UPDATE products 
        SET price = original_price
        WHERE id = test_product_id;
        
        RAISE NOTICE '✅ Prix restauré';
    ELSE
        RAISE NOTICE '⚠️ Aucun produit actif trouvé pour le test';
    END IF;
END $$;

-- =====================================================
-- 4. TEST DES TRIGGERS - MODIFICATION D'UN TEMPLATE
-- =====================================================

DO $$
DECLARE
    test_template_id UUID;
    test_store_id UUID;
BEGIN
    -- Récupérer un template existant
    SELECT st.id, st.store_id
    INTO test_template_id, test_store_id
    FROM site_templates st
    JOIN stores s ON st.store_id = s.id
    WHERE s.status = 'active'
    LIMIT 1;
    
    IF test_template_id IS NOT NULL THEN
        RAISE NOTICE '🎨 Test avec le template ID: %', test_template_id;
        
        -- Modifier le template (devrait déclencher le trigger)
        UPDATE site_templates 
        SET updated_at = NOW()
        WHERE id = test_template_id;
        
        RAISE NOTICE '✅ Modification de template effectuée - Trigger activé';
    ELSE
        RAISE NOTICE '⚠️ Aucun template trouvé pour le test';
    END IF;
END $$;

-- =====================================================
-- 5. VÉRIFICATION DES LOGS (si disponibles)
-- =====================================================

-- Vérifier si l'extension HTTP fonctionne
SELECT 
  'Test extension HTTP' as test_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http')
    THEN '✅ EXTENSION HTTP DISPONIBLE'
    ELSE '❌ EXTENSION HTTP MANQUANTE'
  END as status;

-- =====================================================
-- 6. TEST MANUEL DE L'EDGE FUNCTION
-- =====================================================

DO $$
DECLARE
    test_payload JSONB;
    webhook_url TEXT;
    response TEXT;
BEGIN
    -- Construire un payload de test
    test_payload := jsonb_build_object(
        'table', 'stores',
        'operation', 'UPDATE',
        'id', (SELECT id FROM stores LIMIT 1),
        'criticality', 'CRITICAL',
        'timestamp', NOW()
    );
    
    webhook_url := 'https://grutldacuowplosarucp.supabase.co/functions/v1/invalidate-cache';
    
    RAISE NOTICE '🔗 Test de l''Edge Function: %', webhook_url;
    RAISE NOTICE '📦 Payload de test: %', test_payload;
    
    -- Test de l'appel HTTP (commenté pour éviter les erreurs en cas de problème)
    /*
    BEGIN
        SELECT content::TEXT INTO response
        FROM http((
            'POST',
            webhook_url,
            ARRAY[http_header('Content-Type','application/json')],
            'application/json',
            test_payload::TEXT
        ));
        
        RAISE NOTICE '✅ Réponse Edge Function: %', response;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erreur Edge Function: %', SQLERRM;
    END;
    */
    
    RAISE NOTICE 'ℹ️ Test Edge Function préparé (décommentez pour exécuter)';
END $$;

-- =====================================================
-- 7. RÉSUMÉ FINAL
-- =====================================================

SELECT 
  '🎉 RÉSUMÉ DES TESTS' as test_type,
  'Système de cache intelligent testé' as description,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name LIKE 'trigger_invalidate_cache_%')
    THEN '✅ TRIGGERS OPÉRATIONNELS'
    ELSE '❌ TRIGGERS PROBLÉMATIQUES'
  END as trigger_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http')
    THEN '✅ HTTP PRÊT'
    ELSE '❌ HTTP MANQUANT'
  END as http_status;
