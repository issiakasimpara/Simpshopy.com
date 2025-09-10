-- ========================================
-- SOLUTION SIMPLE : SUPPRIMER LE TRIGGER PROBLÉMATIQUE
-- ========================================

-- 1. SUPPRIMER LE TRIGGER QUI CAUSE LE PROBLÈME
DROP TRIGGER IF EXISTS trigger_site_templates_refresh ON site_templates;

-- 2. SUPPRIMER LA FONCTION DU TRIGGER (si elle existe)
DROP FUNCTION IF EXISTS trigger_refresh_stores_view() CASCADE;

-- 3. VÉRIFIER QUE LE TRIGGER A BIEN ÉTÉ SUPPRIMÉ
SELECT 
    'Triggers Remaining' as check_type,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'site_templates';

-- 4. TESTER LA MISE À JOUR SANS TRIGGER
DO $$
DECLARE
    test_template_id UUID;
BEGIN
    -- Trouver un template existant
    SELECT id INTO test_template_id
    FROM site_templates 
    LIMIT 1;
    
    IF test_template_id IS NOT NULL THEN
        RAISE NOTICE 'Testing UPDATE without problematic trigger on template ID: %', test_template_id;
        
        -- Tenter la mise à jour
        UPDATE site_templates 
        SET 
            updated_at = NOW()
        WHERE id = test_template_id;
        
        IF FOUND THEN
            RAISE NOTICE '✅ UPDATE SUCCESS: Template updated successfully!';
        ELSE
            RAISE NOTICE '❌ UPDATE FAILED: No rows affected';
        END IF;
    ELSE
        RAISE NOTICE 'No templates found for testing';
    END IF;
END $$;

-- 5. RÉSULTAT
SELECT 
    '✅ TRIGGER SUPPRIMÉ' as status,
    'Le trigger problématique a été supprimé. La sauvegarde devrait maintenant fonctionner.' as result;
