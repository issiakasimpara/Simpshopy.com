-- 🎯 DÉPLOIEMENT DES TRIGGERS POUR SITEBUILDER (CORRIGÉ)
-- Date: 2025-01-28
-- Objectif: Activer l'invalidation automatique pour les changements de templates
-- CORRECTION: Syntaxe JSON corrigée

-- =====================================================
-- 1. VÉRIFIER L'EXTENSION HTTP
-- =====================================================

-- Vérifier si l'extension http est disponible
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http') THEN
        RAISE NOTICE '⚠️ Extension http non trouvée. Installation...';
        CREATE EXTENSION IF NOT EXISTS http;
        RAISE NOTICE '✅ Extension http installée';
    ELSE
        RAISE NOTICE '✅ Extension http déjà disponible';
    END IF;
END $$;

-- =====================================================
-- 2. FONCTION D'INVALIDATION OPTIMISÉE
-- =====================================================

CREATE OR REPLACE FUNCTION invalidate_cache_trigger()
RETURNS TRIGGER AS $$
DECLARE
    table_name TEXT;
    operation TEXT;
    record_id TEXT;
    criticality TEXT;
    payload JSONB;
    record_data JSONB;
    old_record_data JSONB;
    response TEXT;
BEGIN
    -- Déterminer la table et l'opération
    table_name := TG_TABLE_NAME;
    operation := TG_OP;
    
    -- Déterminer l'ID de l'enregistrement
    IF operation = 'DELETE' THEN
        record_id := OLD.id::TEXT;
        record_data := to_jsonb(OLD);
        old_record_data := NULL;
    ELSE
        record_id := NEW.id::TEXT;
        record_data := to_jsonb(NEW);
        old_record_data := CASE WHEN operation = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END;
    END IF;
    
    -- Déterminer la criticité selon la table
    CASE table_name
        WHEN 'stores' THEN
            criticality := CASE 
                WHEN operation = 'UPDATE' AND (OLD.status != NEW.status OR OLD.name != NEW.name) THEN 'CRITICAL'
                ELSE 'IMPORTANT'
            END;
        WHEN 'products' THEN
            criticality := CASE 
                WHEN operation = 'UPDATE' AND (OLD.price != NEW.price OR OLD.stock != NEW.stock) THEN 'CRITICAL'
                ELSE 'IMPORTANT'
            END;
        WHEN 'site_templates' THEN
            criticality := CASE 
                WHEN operation = 'UPDATE' AND OLD.is_published != NEW.is_published THEN 'CRITICAL'
                ELSE 'IMPORTANT'
            END;
        WHEN 'categories' THEN
            criticality := 'IMPORTANT';
        ELSE
            criticality := 'DYNAMIC';
    END CASE;
    
    -- Construire le payload complet
    payload := jsonb_build_object(
        'event', operation,
        'table', table_name,
        'id', record_id,
        'criticality', criticality,
        'record', record_data,
        'old_record', old_record_data,
        'timestamp', NOW()::TEXT
    );
    
    -- Appeler l'Edge Function via HTTP
    BEGIN
        SELECT content INTO response FROM http_post(
            'https://grutldacuowplosarucp.supabase.co/functions/v1/invalidate-cache',
            payload::TEXT,
            'application/json',
            '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTAxNjEsImV4cCI6MjA2NDY2NjE2MX0.cqKxbFdqF589dQBSH3IKNL6kXdRNtS9dpkrYNOHk0Ac"}'
        );
        
        -- Log pour debug
        RAISE NOTICE '🔔 SiteBuilder Change: % % sur % (ID: %) - Réponse: %', operation, table_name, record_id, criticality, response;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- En cas d'erreur HTTP, logger et continuer
            RAISE WARNING '❌ Erreur HTTP trigger: %', SQLERRM;
    END;
    
    -- Retourner le bon enregistrement
    IF operation = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur générale, logger et continuer
        RAISE WARNING '❌ Erreur générale trigger: %', SQLERRM;
        IF operation = 'DELETE' THEN
            RETURN OLD;
        ELSE
            RETURN NEW;
        END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. CRÉER LES TRIGGERS (PRIORITÉ SITE_TEMPLATES)
-- =====================================================

-- Trigger pour site_templates (PRIORITÉ ABSOLUE)
DROP TRIGGER IF EXISTS trigger_invalidate_cache_site_templates ON site_templates;
CREATE TRIGGER trigger_invalidate_cache_site_templates
    AFTER INSERT OR UPDATE OR DELETE ON site_templates
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_cache_trigger();

-- Trigger pour stores
DROP TRIGGER IF EXISTS trigger_invalidate_cache_stores ON stores;
CREATE TRIGGER trigger_invalidate_cache_stores
    AFTER INSERT OR UPDATE OR DELETE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_cache_trigger();

-- Trigger pour products
DROP TRIGGER IF EXISTS trigger_invalidate_cache_products ON products;
CREATE TRIGGER trigger_invalidate_cache_products
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_cache_trigger();

-- Trigger pour categories (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') THEN
        DROP TRIGGER IF EXISTS trigger_invalidate_cache_categories ON categories;
        CREATE TRIGGER trigger_invalidate_cache_categories
            AFTER INSERT OR UPDATE OR DELETE ON categories
            FOR EACH ROW
            EXECUTE FUNCTION invalidate_cache_trigger();
        RAISE NOTICE '✅ Trigger categories créé';
    ELSE
        RAISE NOTICE '⚠️ Table categories non trouvée - trigger ignoré';
    END IF;
END $$;

-- =====================================================
-- 4. TEST SPÉCIFIQUE SITEBUILDER (CORRIGÉ)
-- =====================================================

-- Test avec un template existant
DO $$
DECLARE
    test_template_id UUID;
    test_store_id UUID;
    original_data JSONB;
BEGIN
    -- Trouver un template existant
    SELECT st.id, st.store_id, st.template_data 
    INTO test_template_id, test_store_id, original_data
    FROM site_templates st 
    JOIN stores s ON s.id = st.store_id
    WHERE s.status = 'active'
    LIMIT 1;
    
    IF test_template_id IS NOT NULL THEN
        RAISE NOTICE '🧪 Test SiteBuilder avec template ID: %', test_template_id;
        
        -- Simuler une modification de template (CORRECTION: utiliser jsonb_build_object)
        UPDATE site_templates 
        SET template_data = original_data || jsonb_build_object(
            'test_sitebuilder', 'modification_test',
            'timestamp', NOW()::TEXT
        ),
            updated_at = NOW()
        WHERE id = test_template_id;
        
        RAISE NOTICE '✅ Test SiteBuilder: Modification simulée - Trigger activé';
        
        -- Restaurer l'état original
        UPDATE site_templates 
        SET template_data = original_data,
            updated_at = NOW()
        WHERE id = test_template_id;
        
        RAISE NOTICE '✅ État original restauré';
    ELSE
        RAISE NOTICE '⚠️ Aucun template trouvé pour le test SiteBuilder';
    END IF;
END $$;

-- =====================================================
-- 5. VÉRIFICATION FINALE
-- =====================================================

-- Vérifier que tous les triggers sont créés
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_name LIKE '%invalidate_cache%'
ORDER BY event_object_table;

-- Afficher le résultat
SELECT '🎯 TRIGGERS SITEBUILDER DÉPLOYÉS - Vos changements déclencheront maintenant l''Edge Function !' as status;
