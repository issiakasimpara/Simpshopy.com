-- 🧪 TEST COMPLET DE TOUTES LES FONCTIONS
-- Date: 2025-01-28
-- Objectif: Tester toutes les fonctions du nouveau système de routage

-- =====================================================
-- 1. TESTER LA FONCTION PRINCIPALE
-- =====================================================

-- Test avec un slug existant
SELECT 
    'Test fonction principale' as test_type,
    'Test avec slug existant' as description,
    get_storefront_by_slug('isco') as result;

-- =====================================================
-- 2. TESTER LA FONCTION D'EXISTENCE
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
-- 3. TESTER LA FONCTION D'INFOS DE BASE
-- =====================================================

-- Tester la récupération d'infos de base
SELECT 
    'Test infos de base' as test_type,
    'Test avec slug existant' as description,
    * FROM get_store_basic_info_by_slug('isco');

-- =====================================================
-- 4. VÉRIFIER LES DONNÉES DE TEST
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
-- 5. TESTER LES PERFORMANCES
-- =====================================================

-- Mesurer le temps d'exécution de la fonction principale
EXPLAIN (ANALYZE, BUFFERS) 
SELECT get_storefront_by_slug('isco');

-- =====================================================
-- 6. VÉRIFIER QUE TOUTES LES FONCTIONS EXISTENT
-- =====================================================

SELECT 
    'Vérification fonctions' as test_type,
    proname as function_name
FROM pg_proc 
WHERE proname IN ('get_storefront_by_slug', 'store_exists_by_slug', 'get_store_basic_info_by_slug')
ORDER BY proname;

-- =====================================================
-- 7. RÉSUMÉ DES TESTS
-- =====================================================

SELECT 
    'Résumé des tests' as test_type,
    'Tests complets de toutes les fonctions terminés' as message,
    NOW() as timestamp;
