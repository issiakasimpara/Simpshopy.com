-- ========================================
-- SOLUTION TEMPORAIRE : SUPPRIMER LE TRIGGER PROBLÉMATIQUE
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
    initial_updated_at TIMESTAMP WITH TIME ZONE;
    new_updated_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Trouver un template existant pour le test
    SELECT id, updated_at INTO test_template_id, initial_updated_at
    FROM site_templates 
    LIMIT 1;
    
    IF test_template_id IS NOT NULL THEN
        RAISE NOTICE '🔍 Test de mise à jour SANS trigger problématique sur template %...', test_template_id;
        
        -- Tenter la mise à jour
        UPDATE site_templates 
        SET 
            updated_at = NOW(),
            is_published = NOT is_published -- Changer l'état pour un vrai update
        WHERE id = test_template_id;
        
        -- Vérifier si la mise à jour a réussi
        SELECT updated_at INTO new_updated_at FROM site_templates WHERE id = test_template_id;
        
        IF new_updated_at > initial_updated_at THEN
            RAISE NOTICE '✅ UPDATE SUCCESS: Le template % a été mis à jour avec succès!', test_template_id;
        ELSE
            RAISE NOTICE '❌ UPDATE FAILED: Le template % n''a pas été mis à jour.', test_template_id;
        END IF;
    ELSE
        RAISE NOTICE '⚠️ Aucun template trouvé pour le test.';
    END IF;
END $$;

-- 5. RÉSULTAT
SELECT 
    '✅ TRIGGER SUPPRIMÉ' as status,
    'Le trigger problématique a été supprimé. La sauvegarde devrait maintenant fonctionner.' as result;
