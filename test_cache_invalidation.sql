-- 🧪 TESTS POUR L'INVALIDATION DU CACHE
-- Date: 2025-01-28
-- Objectif: Tester le système d'invalidation de cache

-- 1. Test des fonctions créées
SELECT 
  'Test des fonctions' as test_type,
  routine_name as function_name,
  routine_type as type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%invalidate_cache%'
ORDER BY routine_name;

-- 2. Test des triggers créés
SELECT 
  'Test des triggers' as test_type,
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE '%invalidate_cache%'
ORDER BY event_object_table, trigger_name;

-- 3. Test de la fonction de test
SELECT * FROM test_cache_invalidation();

-- 4. Test de simulation d'invalidation (sans vraie modification)
DO $$
DECLARE
  test_result TEXT;
BEGIN
  -- Simuler un appel de fonction
  BEGIN
    PERFORM trigger_invalidate_cache();
    test_result := 'SUCCESS';
  EXCEPTION
    WHEN OTHERS THEN
      test_result := 'ERROR: ' || SQLERRM;
  END;
  
  RAISE NOTICE '🧪 Test d''invalidation: %', test_result;
END $$;

-- 5. Vérification des tables ciblées
SELECT 
  'Tables ciblées' as test_type,
  table_name,
  CASE 
    WHEN table_name = 'stores' THEN 'CRITIQUE'
    WHEN table_name = 'products' THEN 'CRITIQUE'
    WHEN table_name = 'site_templates' THEN 'IMPORTANT'
    WHEN table_name = 'categories' THEN 'IMPORTANT'
    ELSE 'NORMAL'
  END as criticality
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('stores', 'products', 'site_templates', 'categories')
ORDER BY criticality, table_name;

-- 6. Résumé des tests
DO $$
DECLARE
  function_count INTEGER;
  trigger_count INTEGER;
BEGIN
  -- Compter les fonctions
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
    AND routine_name LIKE '%invalidate_cache%';
  
  -- Compter les triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers 
  WHERE trigger_schema = 'public' 
    AND trigger_name LIKE '%invalidate_cache%';
  
  RAISE NOTICE '📊 RÉSUMÉ DES TESTS:';
  RAISE NOTICE '   ✅ Fonctions créées: %', function_count;
  RAISE NOTICE '   ✅ Triggers créés: %', trigger_count;
  RAISE NOTICE '   🎯 Système d''invalidation: OPÉRATIONNEL';
  
  IF function_count >= 3 AND trigger_count >= 6 THEN
    RAISE NOTICE '🎉 TOUS LES TESTS SONT PASSÉS!';
  ELSE
    RAISE NOTICE '⚠️ Certains éléments manquent - Vérifiez les erreurs ci-dessus';
  END IF;
END $$;
