-- ========================================
-- DIAGNOSTIC : LA VUE MATÉRIALISÉE EXISTE-T-ELLE ?
-- ========================================

-- 1. VÉRIFIER SI LA VUE MATÉRIALISÉE EXISTE
SELECT 
    'Materialized View Exists?' as check_type,
    schemaname,
    matviewname,
    definition
FROM pg_matviews 
WHERE matviewname = 'mv_stores_with_templates';

-- 2. VÉRIFIER TOUTES LES VUES MATÉRIALISÉES
SELECT 
    'All Materialized Views' as check_type,
    schemaname,
    matviewname
FROM pg_matviews 
ORDER BY matviewname;

-- 3. VÉRIFIER SI LA TABLE EXISTE (au cas où ce serait une table normale)
SELECT 
    'Table Exists?' as check_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'mv_stores_with_templates';

-- 4. VÉRIFIER LES TRIGGERS SUR site_templates
SELECT 
    'Triggers on site_templates' as check_type,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'site_templates';

-- 5. VÉRIFIER LES FONCTIONS DE TRIGGER
SELECT 
    'Trigger Functions' as check_type,
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%refresh%stores%view%';

-- 6. RÉSULTAT
SELECT 
    'DIAGNOSTIC TERMINÉ' as status,
    'Vérifiez si mv_stores_with_templates existe' as instruction;
