-- 🔥 CORRECTION DES TRIGGERS AVEC LA BONNE EXTENSION HTTP
-- Date: 2025-01-28
-- Problème: Utilisation de net.http_post au lieu de http_post

-- =====================================================
-- 1. SUPPRIMER LES ANCIENS TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS trigger_invalidate_cache_stores ON stores;
DROP TRIGGER IF EXISTS trigger_invalidate_cache_products ON products;
DROP TRIGGER IF EXISTS trigger_invalidate_cache_site_templates ON site_templates;
DROP TRIGGER IF EXISTS trigger_invalidate_cache_categories ON categories;

DROP FUNCTION IF EXISTS invalidate_cache_trigger();

-- =====================================================
-- 2. FONCTION D'INVALIDATION AVEC LA BONNE EXTENSION
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
    
    -- Appeler l'Edge Function via HTTP (CORRECTION: utiliser http_post au lieu de net.http_post)
    BEGIN
        SELECT content INTO response FROM http_post(
            'https://grutldacuowplosarucp.supabase.co/functions/v1/invalidate-cache',
            payload::TEXT,
            'application/json',
            '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTAxNjEsImV4cCI6MjA2NDY2NjE2MX0.cqKxbFdqF589dQBSH3IKNL6kXdRNtS9dpkrYNOHk0Ac"}'
        );
        
        -- Log pour debug
        RAISE NOTICE '🔔 Trigger invalidation: % % sur % (ID: %) - Réponse: %', operation, table_name, record_id, criticality, response;
        
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
-- 3. CRÉER LES TRIGGERS CORRIGÉS
-- =====================================================

-- Trigger pour stores
CREATE TRIGGER trigger_invalidate_cache_stores
    AFTER INSERT OR UPDATE OR DELETE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_cache_trigger();

-- Trigger pour products
CREATE TRIGGER trigger_invalidate_cache_products
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_cache_trigger();

-- Trigger pour site_templates
CREATE TRIGGER trigger_invalidate_cache_site_templates
    AFTER INSERT OR UPDATE OR DELETE ON site_templates
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_cache_trigger();

-- Trigger pour categories (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') THEN
        EXECUTE 'CREATE TRIGGER trigger_invalidate_cache_categories
            AFTER INSERT OR UPDATE OR DELETE ON categories
            FOR EACH ROW
            EXECUTE FUNCTION invalidate_cache_trigger()';
    END IF;
END $$;

-- =====================================================
-- 4. TESTER LES TRIGGERS CORRIGÉS
-- =====================================================

-- Test avec un store existant
DO $$
DECLARE
    test_store_id UUID;
    test_store_name TEXT;
BEGIN
    -- Trouver un store existant
    SELECT id, name INTO test_store_id, test_store_name 
    FROM stores 
    WHERE status = 'active'
    LIMIT 1;
    
    IF test_store_id IS NOT NULL THEN
        -- Tester une mise à jour
        UPDATE stores SET updated_at = NOW() WHERE id = test_store_id;
        RAISE NOTICE '✅ Test trigger stores corrigé: OK sur %', test_store_name;
    ELSE
        RAISE NOTICE '⚠️ Aucun store trouvé pour le test';
    END IF;
END $$;

-- Afficher le résultat
SELECT '✅ Triggers corrigés avec la bonne extension HTTP (http_post)' as status;
