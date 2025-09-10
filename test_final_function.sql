-- 🧪 TEST FINAL DE LA FONCTION STOREFRONT
-- Date: 2025-01-28
-- Objectif: Tester la fonction get_storefront_by_slug avec la structure correcte

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
-- 6. RÉSUMÉ DES TESTS
-- =====================================================

SELECT 
    'Résumé des tests' as test_type,
    'Tests de la fonction finale terminés' as message,
    NOW() as timestamp;
