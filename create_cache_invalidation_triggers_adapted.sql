-- 🔥 TRIGGERS D'INVALIDATION DE CACHE ADAPTÉS À VOTRE SYSTÈME
-- Date: 2025-01-28
-- Basé sur l'analyse de votre base de données existante

-- =====================================================
-- 1. FONCTION D'INVALIDATION DE CACHE (sans migration_log)
-- =====================================================

CREATE OR REPLACE FUNCTION invalidate_cache_trigger()
RETURNS TRIGGER AS $$
DECLARE
    table_name TEXT;
    operation TEXT;
    record_id TEXT;
    criticality TEXT;
    payload JSONB;
    webhook_url TEXT;
BEGIN
    -- Déterminer la table et l'opération
    table_name := TG_TABLE_NAME;
    operation := TG_OP;
    
    -- Déterminer l'ID de l'enregistrement
    IF operation = 'DELETE' THEN
        record_id := OLD.id::TEXT;
    ELSE
        record_id := NEW.id::TEXT;
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
    
    -- Construire le payload
    payload := jsonb_build_object(
        'table', table_name,
        'operation', operation,
        'id', record_id,
        'criticality', criticality,
        'timestamp', NOW()
    );
    
    -- URL de l'Edge Function (à adapter selon votre déploiement)
    webhook_url := 'https://grutldacuowplosarucp.supabase.co/functions/v1/invalidate-cache';
    
    -- Appel HTTP à l'Edge Function
    BEGIN
        PERFORM net.http_post(
            url := webhook_url,
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key', true)
            ),
            body := payload::text
        );
        
        RAISE NOTICE 'Cache invalidé pour % % sur % (criticité: %)', operation, table_name, record_id, criticality;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erreur lors de l''invalidation du cache: %', SQLERRM;
    END;
    
    -- Retourner le bon enregistrement
    IF operation = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. TRIGGERS POUR CHAQUE TABLE CRITIQUE
-- =====================================================

-- Trigger pour la table stores
DROP TRIGGER IF EXISTS trigger_invalidate_cache_stores ON stores;
CREATE TRIGGER trigger_invalidate_cache_stores
    AFTER INSERT OR UPDATE OR DELETE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_cache_trigger();

-- Trigger pour la table products
DROP TRIGGER IF EXISTS trigger_invalidate_cache_products ON products;
CREATE TRIGGER trigger_invalidate_cache_products
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_cache_trigger();

-- Trigger pour la table site_templates
DROP TRIGGER IF EXISTS trigger_invalidate_cache_site_templates ON site_templates;
CREATE TRIGGER trigger_invalidate_cache_site_templates
    AFTER INSERT OR UPDATE OR DELETE ON site_templates
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_cache_trigger();

-- Trigger pour la table categories (si elle existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS trigger_invalidate_cache_categories ON categories;
        CREATE TRIGGER trigger_invalidate_cache_categories
            AFTER INSERT OR UPDATE OR DELETE ON categories
            FOR EACH ROW
            EXECUTE FUNCTION invalidate_cache_trigger();
        
        RAISE NOTICE '✅ Trigger créé pour la table categories';
    ELSE
        RAISE NOTICE '⚠️ Table categories non trouvée - trigger ignoré';
    END IF;
END $$;

-- =====================================================
-- 3. FONCTION DE TEST DES TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION test_cache_invalidation()
RETURNS TABLE(test_name TEXT, result TEXT) AS $$
BEGIN
    -- Test 1: Vérifier que les triggers existent
    RETURN QUERY
    SELECT 
        'Triggers créés' as test_name,
        CASE 
            WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_invalidate_cache_stores')
                AND EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_invalidate_cache_products')
                AND EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_invalidate_cache_site_templates')
            THEN '✅ TOUS LES TRIGGERS CRÉÉS'
            ELSE '❌ TRIGGERS MANQUANTS'
        END as result;
    
    -- Test 2: Vérifier la fonction
    RETURN QUERY
    SELECT 
        'Fonction invalidate_cache_trigger' as test_name,
        CASE 
            WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'invalidate_cache_trigger')
            THEN '✅ FONCTION CRÉÉE'
            ELSE '❌ FONCTION MANQUANTE'
        END as result;
    
    -- Test 3: Vérifier l'extension HTTP
    RETURN QUERY
    SELECT 
        'Extension HTTP' as test_name,
        CASE 
            WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http')
            THEN '✅ EXTENSION DISPONIBLE'
            ELSE '❌ EXTENSION MANQUANTE'
        END as result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. SCRIPT DE VÉRIFICATION FINALE
-- =====================================================

-- Exécuter les tests
SELECT * FROM test_cache_invalidation();

-- Afficher un résumé
SELECT 
    '🎉 INSTALLATION TERMINÉE' as status,
    'Triggers d''invalidation de cache créés avec succès' as message,
    'Votre système de cache intelligent est maintenant opérationnel' as details;
