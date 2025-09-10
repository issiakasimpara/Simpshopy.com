-- ========================================
-- VÉRIFICATION DE LA STRUCTURE DE LA VUE MATÉRIALISÉE
-- ========================================

-- 1. VÉRIFIER LA DÉFINITION DE LA VUE MATÉRIALISÉE
SELECT 
    'Materialized View Definition' as check_type,
    definition
FROM pg_matviews 
WHERE matviewname = 'mv_stores_with_templates';

-- 2. VÉRIFIER LES COLONNES DE LA VUE MATÉRIALISÉE
SELECT 
    'Materialized View Columns' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'mv_stores_with_templates'
ORDER BY ordinal_position;

-- 3. VÉRIFIER LES INDEX EXISTANTS SUR LA VUE MATÉRIALISÉE
SELECT 
    'Existing Indexes' as check_type,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'mv_stores_with_templates';

-- 4. VÉRIFIER LES DONNÉES DANS LA VUE MATÉRIALISÉE
SELECT 
    'Sample Data' as check_type,
    *
FROM mv_stores_with_templates
LIMIT 3;

-- 5. VÉRIFIER LA STRUCTURE DE LA TABLE STORES
SELECT 
    'Stores Table Columns' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'stores'
ORDER BY ordinal_position;

-- 6. VÉRIFIER LA STRUCTURE DE LA TABLE SITE_TEMPLATES
SELECT 
    'Site Templates Table Columns' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'site_templates'
ORDER BY ordinal_position;
