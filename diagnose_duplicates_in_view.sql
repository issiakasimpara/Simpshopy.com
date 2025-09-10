-- ========================================
-- DIAGNOSTIC : DOUBLONS DANS LA VUE MATÉRIALISÉE
-- ========================================

-- 1. VÉRIFIER LES DOUBLONS DANS LA VUE MATÉRIALISÉE
SELECT 
    'Duplicates in Materialized View' as check_type,
    id,
    COUNT(*) as duplicate_count
FROM mv_stores_with_templates
GROUP BY id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 2. VÉRIFIER LE NOMBRE TOTAL D'ENTRÉES
SELECT 
    'Total Entries' as check_type,
    COUNT(*) as total_count,
    COUNT(DISTINCT id) as unique_ids
FROM mv_stores_with_templates;

-- 3. VÉRIFIER LES DONNÉES COMPLÈTES POUR L'ID DOUBLONNÉ
SELECT 
    'Duplicate Data Details' as check_type,
    id,
    name,
    slug,
    created_at,
    template_data,
    template_updated_at
FROM mv_stores_with_templates
WHERE id = '0ca5be54-d062-4807-a824-6e3a1fb2c292'
ORDER BY created_at;

-- 4. VÉRIFIER LA DÉFINITION DE LA VUE MATÉRIALISÉE
SELECT 
    'Materialized View Definition' as check_type,
    definition
FROM pg_matviews 
WHERE matviewname = 'mv_stores_with_templates';

-- 5. VÉRIFIER LES DONNÉES SOURCES (stores et site_templates)
SELECT 
    'Source Data Check' as check_type,
    s.id as store_id,
    s.name as store_name,
    s.slug as store_slug,
    COUNT(st.id) as template_count
FROM stores s
LEFT JOIN site_templates st ON s.id = st.store_id
WHERE s.id = '0ca5be54-d062-4807-a824-6e3a1fb2c292'
GROUP BY s.id, s.name, s.slug;

-- 6. RÉSULTAT
SELECT 
    'DIAGNOSTIC TERMINÉ' as status,
    'Vérifiez les doublons et la définition de la vue' as instruction;
