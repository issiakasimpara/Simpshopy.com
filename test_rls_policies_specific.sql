-- ========================================
-- TEST SPÉCIFIQUE DES POLITIQUES RLS
-- Identifier exactement pourquoi UPDATE échoue
-- ========================================

-- 1. VÉRIFIER LE STATUT RLS DE LA TABLE
SELECT 
    'RLS Status' as check_type,
    CASE 
        WHEN relrowsecurity THEN 'ENABLED' 
        ELSE 'DISABLED' 
    END as result
FROM pg_class 
WHERE relname = 'site_templates';

-- 2. LISTER TOUTES LES POLITIQUES RLS ACTUELLES
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

-- 3. VÉRIFIER L'UTILISATEUR ACTUEL
SELECT 
    'Current User' as check_type,
    current_user as user_name,
    session_user as session_user,
    current_role as current_role;

-- 4. TESTER UNE REQUÊTE UPDATE SIMPLE
-- D'abord, trouvons un template existant
SELECT 
    'Template to test' as check_type,
    id,
    store_id,
    template_id,
    is_published
FROM site_templates 
LIMIT 1;

-- 5. TESTER LA MISE À JOUR RÉELLE
-- ATTENTION: Cette requête va modifier les données
DO $$
DECLARE
    test_template_id TEXT;
    test_store_id TEXT;
    update_result TEXT;
BEGIN
    -- Trouver un template existant
    SELECT id, store_id INTO test_template_id, test_store_id
    FROM site_templates 
    LIMIT 1;
    
    IF test_template_id IS NOT NULL THEN
        RAISE NOTICE 'Testing UPDATE on template ID: %', test_template_id;
        RAISE NOTICE 'Store ID: %', test_store_id;
        
        -- Tenter la mise à jour exacte comme dans l'application
        UPDATE site_templates 
        SET 
            updated_at = NOW(),
            is_published = is_published  -- Pas de changement réel
        WHERE id = test_template_id;
        
        IF FOUND THEN
            RAISE NOTICE 'UPDATE SUCCESS: Template updated successfully';
            update_result := 'SUCCESS';
        ELSE
            RAISE NOTICE 'UPDATE FAILED: No rows affected';
            update_result := 'FAILED - No rows affected';
        END IF;
    ELSE
        RAISE NOTICE 'No templates found for testing';
        update_result := 'FAILED - No templates found';
    END IF;
    
    -- Retourner le résultat
    PERFORM 1; -- Pour que le DO block retourne quelque chose
END $$;

-- 6. VÉRIFIER LES PERMISSIONS POUR L'UTILISATEUR AUTHENTIFIÉ
SELECT 
    'Authenticated User Permissions' as check_type,
    has_table_privilege('authenticated', 'site_templates', 'SELECT') as can_select,
    has_table_privilege('authenticated', 'site_templates', 'INSERT') as can_insert,
    has_table_privilege('authenticated', 'site_templates', 'UPDATE') as can_update,
    has_table_privilege('authenticated', 'site_templates', 'DELETE') as can_delete;

-- 7. TESTER AVEC UN UTILISATEUR SPÉCIFIQUE
-- Vérifier si le problème vient du rôle
SELECT 
    'Role Permissions' as check_type,
    has_table_privilege('postgres', 'site_templates', 'UPDATE') as postgres_can_update,
    has_table_privilege('service_role', 'site_templates', 'UPDATE') as service_role_can_update,
    has_table_privilege('anon', 'site_templates', 'UPDATE') as anon_can_update;

-- 8. VÉRIFIER LES POLITIQUES RLS SPÉCIFIQUES POUR UPDATE
SELECT 
    'UPDATE RLS Policies' as check_type,
    policyname,
    permissive,
    roles,
    qual as condition,
    with_check as check_condition
FROM pg_policies 
WHERE tablename = 'site_templates' 
AND cmd = 'UPDATE';

-- 9. RÉSULTAT FINAL
SELECT 
    'TEST RLS TERMINÉ' as status,
    'Vérifiez les messages ci-dessus et les résultats' as instruction;
