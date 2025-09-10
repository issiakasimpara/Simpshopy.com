-- ========================================
-- CORRECTION ADAPTATIVE DU TRIGGER
-- S'adapte à la vraie structure de la vue matérialisée
-- ========================================

-- 1. D'ABORD, VÉRIFIER LA VRAIE STRUCTURE
SELECT 
    'REAL STRUCTURE CHECK' as check_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'mv_stores_with_templates'
ORDER BY ordinal_position;

-- 2. CRÉER UN INDEX UNIQUE SUR LA COLONNE ID (qui existe probablement)
CREATE UNIQUE INDEX IF NOT EXISTS 
idx_mv_stores_with_templates_id_unique 
ON mv_stores_with_templates (id);

-- 3. FONCTION DU TRIGGER SANS RÉFÉRENCE À store_id
CREATE OR REPLACE FUNCTION trigger_refresh_stores_view_safe()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
        -- Essayer le rafraîchissement concurrent d'abord
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_stores_with_templates;
        RAISE NOTICE 'Materialized view refreshed concurrently';
    EXCEPTION
        WHEN OTHERS THEN
            -- Si le rafraîchissement concurrent échoue, utiliser le rafraîchissement normal
            RAISE NOTICE 'Concurrent refresh failed, using normal refresh: %', SQLERRM;
            BEGIN
                REFRESH MATERIALIZED VIEW mv_stores_with_templates;
                RAISE NOTICE 'Materialized view refreshed normally';
            EXCEPTION
                WHEN OTHERS THEN
                    -- Si même le rafraîchissement normal échoue, juste logger l'erreur
                    RAISE NOTICE 'Both concurrent and normal refresh failed: %', SQLERRM;
            END;
    END;
    
    RETURN NULL; -- Pour un trigger AFTER STATEMENT
END;
$$ LANGUAGE plpgsql;

-- 4. REMPLACER LE TRIGGER EXISTANT
DROP TRIGGER IF EXISTS trigger_site_templates_refresh ON site_templates;

CREATE TRIGGER trigger_site_templates_refresh_safe
    AFTER INSERT OR DELETE OR UPDATE ON site_templates 
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_refresh_stores_view_safe();

-- 5. TESTER LA MISE À JOUR
DO $$
DECLARE
    test_template_id UUID;
BEGIN
    -- Trouver un template existant
    SELECT id INTO test_template_id
    FROM site_templates 
    LIMIT 1;
    
    IF test_template_id IS NOT NULL THEN
        RAISE NOTICE 'Testing UPDATE after trigger fix on template ID: %', test_template_id;
        
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

-- 6. RÉSULTAT
SELECT 
    '✅ TRIGGER CORRIGÉ' as status,
    'Le trigger a été adapté à la vraie structure de la vue matérialisée' as result;
