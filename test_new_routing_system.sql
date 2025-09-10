-- 🧪 TEST DU NOUVEAU SYSTÈME DE ROUTAGE
-- Date: 2025-01-28
-- Objectif: Tester le nouveau système de routage direct par slug

-- =====================================================
-- 1. VÉRIFIER QUE LES FONCTIONS EXISTENT
-- =====================================================

SELECT 
    'Vérification fonctions' as test_type,
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname IN ('get_storefront_by_slug', 'store_exists_by_slug', 'get_store_basic_info_by_slug')
ORDER BY proname;

-- =====================================================
-- 2. TESTER LA FONCTION PRINCIPALE
-- =====================================================

-- Tester avec un slug existant
SELECT 
    'Test fonction principale' as test_type,
    'Test avec slug existant' as description,
    get_storefront_by_slug('isco') as result;

-- =====================================================
-- 3. TESTER LA FONCTION D'EXISTENCE
-- =====================================================

-- Tester si une boutique existe
SELECT 
    'Test existence' as test_type,
    'Test avec slug existant' as description,
    store_exists_by_slug('isco') as exists;

-- Tester avec un slug inexistant
SELECT 
    'Test existence' as test_type,
    'Test avec slug inexistant' as description,
    store_exists_by_slug('boutique-inexistante') as exists;

-- =====================================================
-- 4. TESTER LA FONCTION D'INFOS DE BASE
-- =====================================================

-- Tester la récupération d'infos de base
SELECT 
    'Test infos de base' as test_type,
    'Test avec slug existant' as description,
    * FROM get_store_basic_info_by_slug('isco');

-- =====================================================
-- 5. VÉRIFIER LES INDEX
-- =====================================================

SELECT 
    'Vérification index' as test_type,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'stores'
  AND indexname LIKE '%slug%';

-- =====================================================
-- 6. TESTER LES PERFORMANCES
-- =====================================================

-- Mesurer le temps d'exécution de la fonction principale
EXPLAIN (ANALYZE, BUFFERS) 
SELECT get_storefront_by_slug('isco');

-- =====================================================
-- 7. VÉRIFIER LES DONNÉES DE TEST
-- =====================================================

-- Afficher quelques boutiques avec leurs slugs
SELECT 
    'Données de test' as test_type,
    name,
    slug,
    status,
    created_at
FROM public.stores
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- 8. TESTER LA GÉNÉRATION DE SLUG
-- =====================================================

-- Tester la fonction de génération de slug
SELECT 
    'Test génération slug' as test_type,
    'Test avec nom simple' as description,
    generate_store_slug() as generated_slug;

-- =====================================================
-- 9. VÉRIFIER LES TRIGGERS
-- =====================================================

SELECT 
    'Vérification triggers' as test_type,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'stores'
  AND event_object_schema = 'public'
ORDER BY trigger_name;

-- =====================================================
-- 10. RÉSUMÉ DES TESTS
-- =====================================================

SELECT 
    'Résumé des tests' as test_type,
    'Tests du nouveau système de routage terminés' as message,
    NOW() as timestamp;
