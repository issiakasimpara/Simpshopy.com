-- ========================================
-- TEST CORRIGÉ AVEC LES BONS TYPES
-- Corriger le problème de type UUID vs TEXT
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

-- 2. VÉRIFIER LES TYPES DE COLONNES
SELECT 
    'Column Types' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'site_templates'
ORDER BY ordinal_position;

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

-- 4. VÉRIFIER L'UTILISATEUR ACTUEL
SELECT 
    'Current User' as check_type,
    current_user as user_name,
    session_user as session_user,
    current_role as current_role;

-- 5. TROUVER UN TEMPLATE EXISTANT AVEC LE BON TYPE
SELECT 
    'Template to test' as check_type,
    id::text as id_text,
    id as id_uuid,
    store_id::text as store_id_text,
    template_id,
    is_published
FROM site_templates 
LIMIT 1;

-- 6. TESTER LA MISE À JOUR AVEC LE BON TYPE
DO $$
DECLARE
    test_template_id UUID;
    test_store_id UUID;
    update_result TEXT;
BEGIN
    -- Trouver un template existant avec le bon type
    SELECT id, store_id INTO test_template_id, test_store_id
    FROM site_templates 
    LIMIT 1;
    
    IF test_template_id IS NOT NULL THEN
        RAISE NOTICE 'Testing UPDATE on template ID: %', test_template_id;
        RAISE NOTICE 'Store ID: %', test_store_id;
        
        -- Tenter la mise à jour avec le bon type UUID
        UPDATE site_templates 
        SET 
            updated_at = NOW(),
            is_published = is_published  -- Pas de changement réel
        WHERE id = test_template_id;  -- UUID = UUID
        
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
    PERFORM 1;
END $$;

-- 7. TESTER AVEC UN ID EN TEXTE (comme dans l'application)
DO $$
DECLARE
    test_template_id_text TEXT;
    test_template_id_uuid UUID;
    update_result TEXT;
BEGIN
    -- Trouver un template existant
    SELECT id::text, id INTO test_template_id_text, test_template_id_uuid
    FROM site_templates 
    LIMIT 1;
    
    IF test_template_id_uuid IS NOT NULL THEN
        RAISE NOTICE 'Testing UPDATE with TEXT ID: %', test_template_id_text;
        
        -- Tenter la mise à jour avec conversion de type
        UPDATE site_templates 
        SET 
            updated_at = NOW()
        WHERE id = test_template_id_text::uuid;  -- Conversion TEXT vers UUID
        
        IF FOUND THEN
            RAISE NOTICE 'UPDATE SUCCESS with TEXT->UUID conversion';
            update_result := 'SUCCESS with conversion';
        ELSE
            RAISE NOTICE 'UPDATE FAILED with TEXT->UUID conversion';
            update_result := 'FAILED with conversion';
        END IF;
    ELSE
        RAISE NOTICE 'No templates found for testing';
        update_result := 'FAILED - No templates found';
    END IF;
    
    PERFORM 1;
END $$;

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
    'TEST CORRIGÉ TERMINÉ' as status,
    'Vérifiez les messages ci-dessus pour voir si UPDATE fonctionne maintenant' as instruction;
