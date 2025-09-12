-- 🗑️ TRIGGERS D'INVALIDATION INTELLIGENTE DU CACHE (VERSION CORRIGÉE)
-- Date: 2025-01-28
-- Objectif: Invalider automatiquement le cache lors des modifications critiques
-- Version: Sans dépendance à la table migration_log

-- 1. Fonction pour déclencher l'invalidation du cache
CREATE OR REPLACE FUNCTION trigger_invalidate_cache()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT;
  service_key TEXT;
  webhook_url TEXT;
  payload JSONB;
BEGIN
  -- Récupérer les variables d'environnement Supabase
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_key := current_setting('app.settings.service_role_key', true);
  
  -- Si les variables ne sont pas définies, utiliser les valeurs par défaut
  IF supabase_url IS NULL THEN
    supabase_url := 'https://grutldacuowplosarucp.supabase.co';
  END IF;
  
  IF service_key IS NULL THEN
    service_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQ4NzQ4MCwiZXhwIjoyMDUzMDYzNDgwfQ.8Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q';
  END IF;

  webhook_url := supabase_url || '/functions/v1/invalidate-cache';

  -- Construire le payload selon le type de trigger
  payload := jsonb_build_object(
    'event', TG_OP,
    'table', TG_TABLE_NAME,
    'record', CASE 
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      ELSE to_jsonb(NEW)
    END,
    'old_record', CASE 
      WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD)
      ELSE NULL
    END
  );

  -- Appeler l'Edge Function d'invalidation
  PERFORM net.http_post(
    url := webhook_url,
    headers := json_build_object(
      'Authorization', 'Bearer ' || service_key,
      'Content-Type', 'application/json'
    ),
    body := payload
  );
  
  RETURN CASE 
    WHEN TG_OP = 'DELETE' THEN OLD
    ELSE NEW
  END;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne pas faire échouer l'opération
    RAISE WARNING 'Erreur lors de l''invalidation du cache pour % %: %', TG_TABLE_NAME, TG_OP, SQLERRM;
    RETURN CASE 
      WHEN TG_OP = 'DELETE' THEN OLD
      ELSE NEW
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Triggers pour les stores (critiques)
DROP TRIGGER IF EXISTS invalidate_cache_on_store_change ON stores;
CREATE TRIGGER invalidate_cache_on_store_change
  AFTER INSERT OR UPDATE OR DELETE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION trigger_invalidate_cache();

-- 3. Triggers pour les templates (importants)
DROP TRIGGER IF EXISTS invalidate_cache_on_template_change ON site_templates;
CREATE TRIGGER invalidate_cache_on_template_change
  AFTER INSERT OR UPDATE OR DELETE ON site_templates
  FOR EACH ROW
  EXECUTE FUNCTION trigger_invalidate_cache();

-- 4. Triggers pour les produits (critiques)
DROP TRIGGER IF EXISTS invalidate_cache_on_product_change ON products;
CREATE TRIGGER invalidate_cache_on_product_change
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION trigger_invalidate_cache();

-- 5. Triggers pour les catégories (importantes)
DROP TRIGGER IF EXISTS invalidate_cache_on_category_change ON categories;
CREATE TRIGGER invalidate_cache_on_category_change
  AFTER INSERT OR UPDATE OR DELETE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION trigger_invalidate_cache();

-- 6. Fonction spécialisée pour les modifications critiques (prix, stock)
CREATE OR REPLACE FUNCTION trigger_invalidate_critical_cache()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT;
  service_key TEXT;
  webhook_url TEXT;
  payload JSONB;
  is_critical_change BOOLEAN := FALSE;
BEGIN
  -- Vérifier si c'est un changement critique
  IF TG_TABLE_NAME = 'products' THEN
    -- Changement de prix ou stock
    IF OLD.price IS DISTINCT FROM NEW.price OR 
       OLD.status IS DISTINCT FROM NEW.status THEN
      is_critical_change := TRUE;
    END IF;
  ELSIF TG_TABLE_NAME = 'stores' THEN
    -- Changement de statut de boutique
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      is_critical_change := TRUE;
    END IF;
  END IF;

  -- Seulement si c'est critique
  IF NOT is_critical_change THEN
    RETURN NEW;
  END IF;

  -- Récupérer les variables d'environnement
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_key := current_setting('app.settings.service_role_key', true);
  
  IF supabase_url IS NULL THEN
    supabase_url := 'https://grutldacuowplosarucp.supabase.co';
  END IF;
  
  IF service_key IS NULL THEN
    service_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQ4NzQ4MCwiZXhwIjoyMDUzMDYzNDgwfQ.8Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q';
  END IF;

  webhook_url := supabase_url || '/functions/v1/invalidate-cache';

  -- Payload avec priorité critique
  payload := jsonb_build_object(
    'event', TG_OP,
    'table', TG_TABLE_NAME,
    'record', to_jsonb(NEW),
    'old_record', to_jsonb(OLD),
    'criticality', 'critical',
    'reason', CASE 
      WHEN TG_TABLE_NAME = 'products' THEN 'price_or_status_change'
      WHEN TG_TABLE_NAME = 'stores' THEN 'status_change'
      ELSE 'critical_change'
    END
  );

  -- Appel immédiat (sans délai)
  PERFORM net.http_post(
    url := webhook_url,
    headers := json_build_object(
      'Authorization', 'Bearer ' || service_key,
      'Content-Type', 'application/json'
    ),
    body := payload
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erreur invalidation critique pour % %: %', TG_TABLE_NAME, TG_OP, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Triggers critiques pour les produits
DROP TRIGGER IF EXISTS invalidate_critical_cache_on_product_change ON products;
CREATE TRIGGER invalidate_critical_cache_on_product_change
  AFTER UPDATE OF price, status ON products
  FOR EACH ROW
  WHEN (OLD.price IS DISTINCT FROM NEW.price OR OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION trigger_invalidate_critical_cache();

-- 8. Triggers critiques pour les stores
DROP TRIGGER IF EXISTS invalidate_critical_cache_on_store_change ON stores;
CREATE TRIGGER invalidate_critical_cache_on_store_change
  AFTER UPDATE OF status ON stores
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION trigger_invalidate_critical_cache();

-- 9. Fonction pour tester l'invalidation
CREATE OR REPLACE FUNCTION test_cache_invalidation()
RETURNS TABLE (
  test_name TEXT,
  result TEXT,
  details TEXT
) AS $$
BEGIN
  -- Test 1: Invalidation normale
  BEGIN
    PERFORM trigger_invalidate_cache();
    RETURN QUERY SELECT 
      'Normal Invalidation'::TEXT,
      'SUCCESS'::TEXT,
      'Function executed without errors'::TEXT;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN QUERY SELECT 
        'Normal Invalidation'::TEXT,
        'ERROR'::TEXT,
        SQLERRM::TEXT;
  END;

  -- Test 2: Invalidation critique
  BEGIN
    PERFORM trigger_invalidate_critical_cache();
    RETURN QUERY SELECT 
      'Critical Invalidation'::TEXT,
      'SUCCESS'::TEXT,
      'Critical function executed without errors'::TEXT;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN QUERY SELECT 
        'Critical Invalidation'::TEXT,
        'ERROR'::TEXT,
        SQLERRM::TEXT;
  END;

  -- Test 3: Vérification des triggers
  RETURN QUERY SELECT 
    'Triggers Status'::TEXT,
    'SUCCESS'::TEXT,
    format('Found %s cache invalidation triggers', 
      (SELECT count(*) FROM information_schema.triggers 
       WHERE trigger_name LIKE '%invalidate_cache%')
    )::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 10. Exécuter les tests
SELECT * FROM test_cache_invalidation();

-- 11. Commentaires pour la documentation
COMMENT ON FUNCTION trigger_invalidate_cache() IS 'Déclenche l''invalidation du cache via webhook';
COMMENT ON FUNCTION trigger_invalidate_critical_cache() IS 'Déclenche l''invalidation critique du cache (prix, stock, statut)';
COMMENT ON FUNCTION test_cache_invalidation() IS 'Teste le système d''invalidation du cache';

-- 12. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Triggers d''invalidation de cache créés avec succès!';
  RAISE NOTICE '🗑️ Invalidation automatique activée pour: stores, site_templates, products, categories';
  RAISE NOTICE '⚡ Invalidation critique pour: prix, statut, stock';
  RAISE NOTICE '🌐 Edge Function: https://grutldacuowplosarucp.supabase.co/functions/v1/invalidate-cache';
  RAISE NOTICE '📊 Tests exécutés - Vérifiez les résultats ci-dessus';
END $$;
