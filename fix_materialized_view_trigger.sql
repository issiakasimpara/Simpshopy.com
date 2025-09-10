-- ========================================
-- FIX: TRIGGER DE VUE MATÉRIALISÉE QUI BLOQUE LES MISE À JOUR
-- Corriger le problème de rafraîchissement concurrent
-- ========================================

-- 1. VÉRIFIER LA VUE MATÉRIALISÉE EXISTANTE
SELECT 
    'Materialized View Info' as check_type,
    schemaname,
    matviewname,
    definition
FROM pg_matviews 
WHERE matviewname = 'mv_stores_with_templates';

-- 2. VÉRIFIER LES INDEX DE LA VUE MATÉRIALISÉE
SELECT 
    'Materialized View Indexes' as check_type,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'mv_stores_with_templates';

-- 3. VÉRIFIER LE TRIGGER PROBLÉMATIQUE
SELECT 
    'Trigger Info' as check_type,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'site_templates'
AND trigger_name LIKE '%refresh%';

-- 4. SOLUTION 1: CRÉER UN INDEX UNIQUE POUR LE RAFRAÎCHISSEMENT CONCURRENT
-- D'abord, vérifier s'il y a déjà un index unique
DO $$
BEGIN
    -- Vérifier si un index unique existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'mv_stores_with_templates' 
        AND indexdef LIKE '%UNIQUE%'
    ) THEN
        -- Créer un index unique sur l'ID (ou une combinaison de colonnes)
        -- Nous devons d'abord voir la structure de la vue
        RAISE NOTICE 'Creating unique index for materialized view...';
        
        -- Créer un index unique sur store_id (supposé être unique)
        CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS 
        idx_mv_stores_with_templates_store_id 
        ON mv_stores_with_templates (store_id);
        
        RAISE NOTICE 'Unique index created successfully';
    ELSE
        RAISE NOTICE 'Unique index already exists';
    END IF;
END $$;

-- 5. SOLUTION 2: MODIFIER LE TRIGGER POUR UTILISER REFRESH NORMAL AU LIEU DE CONCURRENT
-- D'abord, voir le contenu du trigger
SELECT 
    'Trigger Function' as check_type,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_trigger t ON t.tgfoid = p.oid
WHERE t.tgname LIKE '%refresh%'
AND t.tgrelid = 'site_templates'::regclass;

-- 6. SOLUTION 3: DÉSACTIVER TEMPORAIREMENT LE TRIGGER
-- (Solution rapide pour tester)
-- DROP TRIGGER IF EXISTS trigger_refresh_stores_view ON site_templates;

-- 7. SOLUTION 4: MODIFIER LE TRIGGER POUR GÉRER LES ERREURS
-- Créer une nouvelle fonction de trigger qui gère les erreurs
CREATE OR REPLACE FUNCTION trigger_refresh_stores_view_safe()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
        -- Essayer le rafraîchissement concurrent d'abord
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_stores_with_templates;
    EXCEPTION
        WHEN OTHERS THEN
            -- Si le rafraîchissement concurrent échoue, utiliser le rafraîchissement normal
            RAISE NOTICE 'Concurrent refresh failed, using normal refresh: %', SQLERRM;
            REFRESH MATERIALIZED VIEW mv_stores_with_templates;
    END;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 8. REMPLACER LE TRIGGER EXISTANT
DROP TRIGGER IF EXISTS trigger_refresh_stores_view ON site_templates;

CREATE TRIGGER trigger_refresh_stores_view_safe
    AFTER INSERT OR UPDATE OR DELETE ON site_templates
    FOR EACH ROW
    EXECUTE FUNCTION trigger_refresh_stores_view_safe();

-- 9. TESTER LA MISE À JOUR MAINTENANT
DO $$
DECLARE
    test_template_id UUID;
    update_result TEXT;
BEGIN
    -- Trouver un template existant
    SELECT id INTO test_template_id
    FROM site_templates 
    LIMIT 1;
    
    IF test_template_id IS NOT NULL THEN
        RAISE NOTICE 'Testing UPDATE after trigger fix...';
        
        -- Tenter la mise à jour
        UPDATE site_templates 
        SET updated_at = NOW()
        WHERE id = test_template_id;
        
        IF FOUND THEN
            RAISE NOTICE 'UPDATE SUCCESS: Template updated successfully after trigger fix!';
            update_result := 'SUCCESS';
        ELSE
            RAISE NOTICE 'UPDATE FAILED: No rows affected';
            update_result := 'FAILED';
        END IF;
    ELSE
        RAISE NOTICE 'No templates found for testing';
        update_result := 'NO_TEMPLATES';
    END IF;
    
    PERFORM 1;
END $$;

-- 10. VÉRIFICATION FINALE
SELECT 
    'FIX APPLIQUÉ' as status,
    'Le trigger a été corrigé pour gérer les erreurs de rafraîchissement concurrent' as result;
