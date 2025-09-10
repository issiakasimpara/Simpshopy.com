-- 🧪 TEST DE LA GÉNÉRATION AUTOMATIQUE DE SLUG
-- Date: 2025-01-28
-- Objectif: Tester que le système de génération de slug fonctionne correctement

-- =====================================================
-- 1. VÉRIFIER L'ÉTAT ACTUEL
-- =====================================================

SELECT 
    'État actuel' as test_type,
    COUNT(*) as total_stores,
    COUNT(CASE WHEN slug IS NOT NULL AND slug != '' THEN 1 END) as stores_with_slug,
    COUNT(CASE WHEN slug IS NULL OR slug = '' THEN 1 END) as stores_without_slug
FROM public.stores
WHERE status = 'active';

-- =====================================================
-- 2. AFFICHER QUELQUES EXEMPLES DE SLUGS
-- =====================================================

SELECT 
    'Exemples de slugs' as test_type,
    name,
    slug,
    created_at
FROM public.stores
WHERE status = 'active' 
  AND slug IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 3. VÉRIFIER LES DOUBLONS
-- =====================================================

SELECT 
    'Vérification doublons' as test_type,
    slug,
    COUNT(*) as count,
    STRING_AGG(name, ', ') as store_names
FROM public.stores 
WHERE status = 'active' 
  AND slug IS NOT NULL
GROUP BY slug 
HAVING COUNT(*) > 1;

-- =====================================================
-- 4. TESTER LA FONCTION DE GÉNÉRATION
-- =====================================================

-- Tester la fonction avec différents noms
SELECT 
    'Test fonction' as test_type,
    'Test Boutique' as input_name,
    generate_store_slug() as generated_slug;

-- =====================================================
-- 5. VÉRIFIER LES TRIGGERS
-- =====================================================

SELECT 
    'Triggers actifs' as test_type,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'stores'
  AND event_object_schema = 'public'
ORDER BY trigger_name;

-- =====================================================
-- 6. VÉRIFIER LES INDEX
-- =====================================================

SELECT 
    'Index sur slug' as test_type,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'stores'
  AND indexname LIKE '%slug%';

-- =====================================================
-- 7. TESTER LA CRÉATION D'UNE NOUVELLE BOUTIQUE
-- =====================================================

-- Note: Ce test nécessite un merchant_id valide
-- Vous pouvez l'exécuter avec un ID de profil existant

/*
-- Remplacer 'merchant-id-here' par un ID de profil valide
INSERT INTO public.stores (name, description, merchant_id, status)
VALUES ('Test Boutique Auto Slug', 'Boutique de test pour le trigger', 'merchant-id-here', 'active')
RETURNING id, name, slug, status;
*/

-- =====================================================
-- 8. VÉRIFIER LES CONTRAINTES
-- =====================================================

SELECT 
    'Contraintes' as test_type,
    constraint_name,
    constraint_type,
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'stores'
  AND tc.table_schema = 'public'
  AND kcu.column_name = 'slug';

-- =====================================================
-- 9. ANALYSER LES PERFORMANCES
-- =====================================================

-- Vérifier les statistiques des index
SELECT 
    'Statistiques index' as test_type,
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename = 'stores'
  AND indexname LIKE '%slug%';

-- =====================================================
-- 10. RÉSUMÉ DES TESTS
-- =====================================================

SELECT 
    'Résumé des tests' as test_type,
    'Tests de génération de slug terminés' as message,
    NOW() as timestamp;
