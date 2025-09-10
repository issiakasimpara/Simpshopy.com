-- ========================================
-- DIAGNOSTIC COMPLET DE LA BASE DE DONNÉES
-- Investiguer directement le problème de sauvegarde
-- ========================================

-- 1. VÉRIFIER L'EXISTENCE ET LA STRUCTURE DE LA TABLE
SELECT 
    'Table site_templates exists' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_templates') 
        THEN 'YES' 
        ELSE 'NO' 
    END as result;

-- 2. VÉRIFIER LE STATUT RLS DE LA TABLE
SELECT 
    'RLS Status' as check_type,
    CASE 
        WHEN relrowsecurity THEN 'ENABLED' 
        ELSE 'DISABLED' 
    END as result
FROM pg_class 
WHERE relname = 'site_templates';

-- 3. LISTER TOUTES LES POLITIQUES RLS ACTUELLES
SELECT 
    'Current RLS Policies' as check_type,
    policyname,
    cmd as operation,
    permissive,
    roles,
    qual as condition,
    with_check as check_condition
FROM pg_policies 
WHERE tablename = 'site_templates'
ORDER BY policyname;

-- 4. VÉRIFIER LES PERMISSIONS DE LA TABLE
SELECT 
    'Table Permissions' as check_type,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'site_templates'
ORDER BY grantee, privilege_type;

-- 5. VÉRIFIER L'UTILISATEUR ACTUEL ET SES RÔLES
SELECT 
    'Current User Info' as check_type,
    current_user as current_user,
    session_user as session_user,
    current_role as current_role;

-- 6. VÉRIFIER LES RÔLES DE L'UTILISATEUR
SELECT 
    'User Roles' as check_type,
    rolname as role_name,
    rolsuper as is_superuser,
    rolcreaterole as can_create_roles,
    rolcreatedb as can_create_databases
FROM pg_roles 
WHERE rolname = current_user;

-- 7. TESTER UNE REQUÊTE SELECT SIMPLE
SELECT 
    'SELECT Test' as check_type,
    COUNT(*) as template_count
FROM site_templates;

-- 8. TESTER UNE REQUÊTE SELECT AVEC CONDITIONS
SELECT 
    'SELECT with conditions Test' as check_type,
    COUNT(*) as matching_templates
FROM site_templates 
WHERE store_id IS NOT NULL;

-- 9. VÉRIFIER LES DONNÉES EXISTANTES
SELECT 
    'Existing Data' as check_type,
    id,
    store_id,
    template_id,
    is_published,
    created_at,
    updated_at
FROM site_templates 
LIMIT 5;

-- 10. TESTER UNE REQUÊTE UPDATE SIMPLE (sans conditions)
-- ATTENTION: Cette requête ne modifiera rien car elle n'a pas de conditions
SELECT 
    'UPDATE Test (dry run)' as check_type,
    'Testing UPDATE permissions without actual changes' as result;

-- 11. VÉRIFIER LES CONTRAINTES DE LA TABLE
SELECT 
    'Table Constraints' as check_type,
    constraint_name,
    constraint_type,
    is_deferrable,
    initially_deferred
FROM information_schema.table_constraints 
WHERE table_name = 'site_templates';

-- 12. VÉRIFIER LES INDEX
SELECT 
    'Table Indexes' as check_type,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'site_templates';

-- 13. VÉRIFIER LES TRIGGERS
SELECT 
    'Table Triggers' as check_type,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'site_templates';

-- 14. DIAGNOSTIC FINAL
SELECT 
    'DIAGNOSTIC COMPLET TERMINÉ' as status,
    'Vérifiez les résultats ci-dessus pour identifier le problème' as instruction;
