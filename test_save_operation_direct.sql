-- ========================================
-- TEST DIRECT DE L'OPÉRATION DE SAUVEGARDE
-- Simuler exactement ce que fait l'application
-- ========================================

-- 1. VÉRIFIER L'UTILISATEUR ACTUEL
SELECT 
    'Current User' as info,
    current_user as user_name,
    session_user as session_user;

-- 2. TROUVER UN TEMPLATE EXISTANT POUR LE TEST
SELECT 
    'Template to test' as info,
    id,
    store_id,
    template_id,
    is_published
FROM site_templates 
LIMIT 1;

-- 3. TESTER LA REQUÊTE SELECT EXACTE DE L'APPLICATION
-- (Celle qui fonctionne dans siteTemplateService.ts ligne 65-70)
WITH test_template AS (
    SELECT id, store_id, template_id
    FROM site_templates 
    LIMIT 1
)
SELECT 
    'SELECT Test (app query)' as test_type,
    id,
    store_id,
    template_id
FROM test_template;

-- 4. TESTER LA REQUÊTE UPDATE EXACTE DE L'APPLICATION
-- (Celle qui échoue dans siteTemplateService.ts ligne 79-88)
-- ATTENTION: Cette requête va réellement modifier les données
-- Nous allons d'abord faire un test sans modification

-- 4a. Test de la structure de la requête UPDATE (sans exécution)
SELECT 
    'UPDATE Test Structure' as test_type,
    'Testing UPDATE query structure without execution' as result;

-- 4b. Vérifier si on peut faire un UPDATE simple
-- (Nous allons juste tester les permissions, pas modifier les données)
SELECT 
    'UPDATE Permission Test' as test_type,
    CASE 
        WHEN has_table_privilege(current_user, 'site_templates', 'UPDATE') 
        THEN 'UPDATE permission: YES' 
        ELSE 'UPDATE permission: NO' 
    END as result;

-- 5. TESTER AVEC UN UTILISATEUR SPÉCIFIQUE
-- Vérifier les permissions pour l'utilisateur authentifié
SELECT 
    'Authenticated User Permissions' as test_type,
    has_table_privilege('authenticated', 'site_templates', 'SELECT') as can_select,
    has_table_privilege('authenticated', 'site_templates', 'INSERT') as can_insert,
    has_table_privilege('authenticated', 'site_templates', 'UPDATE') as can_update,
    has_table_privilege('authenticated', 'site_templates', 'DELETE') as can_delete;

-- 6. VÉRIFIER LES POLITIQUES RLS SPÉCIFIQUES
SELECT 
    'RLS Policy Details' as test_type,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'site_templates' 
AND cmd = 'UPDATE';

-- 7. TESTER UNE MISE À JOUR SIMPLE (SÉCURISÉE)
-- Nous allons tester avec un template qui existe vraiment
DO $$
DECLARE
    test_template_id TEXT;
    test_store_id TEXT;
BEGIN
    -- Trouver un template existant
    SELECT id, store_id INTO test_template_id, test_store_id
    FROM site_templates 
    LIMIT 1;
    
    IF test_template_id IS NOT NULL THEN
        RAISE NOTICE 'Testing UPDATE on template ID: %', test_template_id;
        RAISE NOTICE 'Store ID: %', test_store_id;
        
        -- Tenter la mise à jour (juste updated_at pour être sûr)
        UPDATE site_templates 
        SET updated_at = NOW()
        WHERE id = test_template_id;
        
        IF FOUND THEN
            RAISE NOTICE 'UPDATE SUCCESS: Template updated successfully';
        ELSE
            RAISE NOTICE 'UPDATE FAILED: No rows affected';
        END IF;
    ELSE
        RAISE NOTICE 'No templates found for testing';
    END IF;
END $$;

-- 8. RÉSULTAT DU TEST
SELECT 
    'TEST COMPLET TERMINÉ' as status,
    'Vérifiez les messages ci-dessus pour voir si UPDATE fonctionne' as instruction;
