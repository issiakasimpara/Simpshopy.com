-- 🚀 SCRIPT D'OPTIMISATION DES PERFORMANCES SIMPSHOPY (CORRIGÉ)
-- Date: 2025-01-28
-- Objectif: Optimiser les requêtes les plus coûteuses identifiées
-- Correction: Suppression des index partiels avec fonctions non-IMMUTABLE

-- =====================================================
-- 1. FONCTION POUR CONFIGURER LES SESSIONS EN UNE SEULE FOIS
-- =====================================================

CREATE OR REPLACE FUNCTION configure_session(
  p_search_path TEXT DEFAULT 'public',
  p_role TEXT DEFAULT 'authenticated',
  p_jwt_claims TEXT DEFAULT '{}',
  p_method TEXT DEFAULT 'GET',
  p_path TEXT DEFAULT '/',
  p_headers TEXT DEFAULT '{}',
  p_cookies TEXT DEFAULT '{}'
) RETURNS void AS $$
BEGIN
  -- Configurer tous les paramètres en une seule fonction
  PERFORM set_config('search_path', p_search_path, true);
  PERFORM set_config('role', p_role, true);
  PERFORM set_config('request.jwt.claims', p_jwt_claims, true);
  PERFORM set_config('request.method', p_method, true);
  PERFORM set_config('request.path', p_path, true);
  PERFORM set_config('request.headers', p_headers, true);
  PERFORM set_config('request.cookies', p_cookies, true);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. INDEX OPTIMISÉS POUR CART_SESSIONS
-- =====================================================

-- Index composite pour les requêtes les plus fréquentes
CREATE INDEX IF NOT EXISTS idx_cart_sessions_session_store_composite 
ON cart_sessions(session_id, store_id);

-- Index pour les requêtes par date
CREATE INDEX IF NOT EXISTS idx_cart_sessions_updated_at_desc 
ON cart_sessions(updated_at DESC);

-- Index pour les sessions expirées (sans fonction dans le prédicat)
CREATE INDEX IF NOT EXISTS idx_cart_sessions_expires_at 
ON cart_sessions(expires_at);

-- Index pour les sessions avec items (approche alternative)
CREATE INDEX IF NOT EXISTS idx_cart_sessions_items_gin 
ON cart_sessions USING GIN (items);

-- Index pour les sessions non vides (approche alternative)
CREATE INDEX IF NOT EXISTS idx_cart_sessions_non_empty 
ON cart_sessions(session_id, store_id) 
WHERE items::text != '[]';

-- =====================================================
-- 3. OPTIMISATION DES TABLES PRINCIPALES
-- =====================================================

-- Index pour stores (requête fréquente)
CREATE INDEX IF NOT EXISTS idx_stores_merchant_created 
ON stores(merchant_id, created_at DESC);

-- Index pour profiles (requête fréquente)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
ON profiles(user_id);

-- Index pour site_templates (requête coûteuse)
CREATE INDEX IF NOT EXISTS idx_site_templates_store_updated 
ON site_templates(store_id, updated_at DESC);

-- =====================================================
-- 4. FONCTION DE NETTOYAGE AUTOMATIQUE
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  -- Nettoyer les sessions de panier expirées
  DELETE FROM cart_sessions 
  WHERE expires_at < NOW() - INTERVAL '1 day';
  
  -- Nettoyer les sessions de plus de 30 jours
  DELETE FROM cart_sessions 
  WHERE updated_at < NOW() - INTERVAL '30 days';
  
  -- Log du nettoyage
  RAISE NOTICE 'Nettoyage des sessions expirées terminé';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TRIGGER POUR MAINTENIR LES INDEX
-- =====================================================

-- Fonction pour maintenir les statistiques
CREATE OR REPLACE FUNCTION maintain_cart_sessions_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour les statistiques si nécessaire
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Forcer l'analyse de la table après modifications importantes
    IF (SELECT COUNT(*) FROM cart_sessions) % 1000 = 0 THEN
      ANALYZE cart_sessions;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour maintenir les statistiques
DROP TRIGGER IF EXISTS trigger_maintain_cart_sessions_stats ON cart_sessions;
CREATE TRIGGER trigger_maintain_cart_sessions_stats
  AFTER INSERT OR UPDATE OR DELETE ON cart_sessions
  FOR EACH ROW EXECUTE FUNCTION maintain_cart_sessions_stats();

-- =====================================================
-- 6. VUES OPTIMISÉES POUR LES REQUÊTES FRÉQUENTES
-- =====================================================

-- Vue pour les sessions de panier actives
CREATE OR REPLACE VIEW active_cart_sessions AS
SELECT 
  cs.id,
  cs.session_id,
  cs.store_id,
  cs.items,
  cs.customer_info,
  cs.created_at,
  cs.updated_at,
  cs.expires_at,
  s.name as store_name,
  s.slug as store_slug
FROM cart_sessions cs
LEFT JOIN stores s ON cs.store_id = s.id
WHERE cs.expires_at > NOW()
  AND cs.items::text != '[]'
  AND cs.items IS NOT NULL;

-- Vue pour les statistiques des paniers abandonnés
CREATE OR REPLACE VIEW abandoned_cart_stats AS
SELECT 
  store_id,
  COUNT(*) as total_abandoned,
  COUNT(DISTINCT session_id) as unique_sessions,
  AVG(
    CASE 
      WHEN items::text != '[]' THEN 
        (SELECT SUM((value->>'price')::numeric * (value->>'quantity')::integer)
         FROM jsonb_array_elements(items) as value)
      ELSE 0 
    END
  ) as average_cart_value,
  MAX(updated_at) as last_activity
FROM cart_sessions
WHERE expires_at > NOW() - INTERVAL '7 days'
  AND items::text != '[]'
  AND items IS NOT NULL
GROUP BY store_id;

-- =====================================================
-- 7. CONFIGURATION DES PARAMÈTRES POSTGRES
-- =====================================================

-- Optimiser les paramètres pour les performances
-- (À exécuter avec les privilèges appropriés)

-- Augmenter la mémoire partagée pour les requêtes
-- ALTER SYSTEM SET shared_buffers = '256MB';
-- ALTER SYSTEM SET effective_cache_size = '1GB';

-- Optimiser les paramètres de requête
-- ALTER SYSTEM SET work_mem = '4MB';
-- ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- Optimiser les paramètres de WAL
-- ALTER SYSTEM SET wal_buffers = '16MB';

-- =====================================================
-- 8. FONCTION DE MONITORING DES PERFORMANCES (CORRIGÉE)
-- =====================================================

CREATE OR REPLACE FUNCTION get_performance_stats()
RETURNS TABLE (
  table_name TEXT,
  total_rows BIGINT,
  table_size TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||relname as table_name,
    n_tup_ins + n_tup_upd + n_tup_del as total_rows,
    pg_size_pretty(pg_relation_size(relid)) as table_size
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY total_rows DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. CRÉATION D'UN JOB DE MAINTENANCE
-- =====================================================

-- Fonction pour la maintenance automatique
CREATE OR REPLACE FUNCTION perform_maintenance()
RETURNS void AS $$
BEGIN
  -- Nettoyer les sessions expirées
  PERFORM cleanup_expired_sessions();
  
  -- Analyser les tables principales
  ANALYZE cart_sessions;
  ANALYZE stores;
  ANALYZE profiles;
  ANALYZE site_templates;
  
  -- Vider les statistiques de requêtes (optionnel)
  -- SELECT pg_stat_statements_reset();
  
  RAISE NOTICE 'Maintenance terminée à %', NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. FONCTION POUR ANALYSER LES REQUÊTES LENTES
-- =====================================================

CREATE OR REPLACE FUNCTION analyze_slow_queries()
RETURNS TABLE (
  query_text TEXT,
  call_count BIGINT,
  total_time NUMERIC,
  mean_time NUMERIC,
  row_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    query as query_text,
    calls as call_count,
    total_time,
    mean_time,
    rows as row_count
  FROM pg_stat_statements 
  WHERE query LIKE '%cart_sessions%' 
     OR query LIKE '%stores%'
     OR query LIKE '%profiles%'
     OR query LIKE '%site_templates%'
  ORDER BY total_time DESC 
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. VÉRIFICATION DES OPTIMISATIONS
-- =====================================================

-- Vérifier que tous les index sont créés
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('cart_sessions', 'stores', 'profiles', 'site_templates')
ORDER BY tablename, indexname;

-- Vérifier les statistiques de performance
SELECT * FROM get_performance_stats();

-- Vérifier les requêtes les plus lentes
SELECT * FROM analyze_slow_queries();

-- =====================================================
-- 12. RÉINITIALISATION DES STATISTIQUES
-- =====================================================

-- Réinitialiser les statistiques pour avoir des données propres
-- SELECT pg_stat_statements_reset();

-- Analyser toutes les tables pour mettre à jour les statistiques
ANALYZE;

-- =====================================================
-- 13. COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION configure_session(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) IS 'Fonction optimisée pour configurer les sessions en une seule requête';
COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Nettoie automatiquement les sessions expirées';
COMMENT ON FUNCTION perform_maintenance() IS 'Effectue la maintenance automatique de la base de données';
COMMENT ON FUNCTION analyze_slow_queries() IS 'Analyse les requêtes les plus lentes pour le debugging';

-- =====================================================
-- 14. SCRIPT DE TEST DES OPTIMISATIONS
-- =====================================================

-- Test de performance pour cart_sessions
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM cart_sessions 
WHERE session_id = 'test_session' 
  AND store_id = '00000000-0000-0000-0000-000000000000'::uuid;

-- Test de performance pour stores
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM stores 
WHERE merchant_id = '00000000-0000-0000-0000-000000000000'::uuid 
ORDER BY created_at DESC;

-- Test de performance pour profiles
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM profiles 
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid;

-- =====================================================
-- 15. RAPPORT FINAL
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=== RAPPORT D''OPTIMISATION ===';
  RAISE NOTICE 'Index créés pour cart_sessions: %', (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'cart_sessions');
  RAISE NOTICE 'Index créés pour stores: %', (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'stores');
  RAISE NOTICE 'Index créés pour profiles: %', (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'profiles');
  RAISE NOTICE 'Index créés pour site_templates: %', (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'site_templates');
  RAISE NOTICE 'Fonctions créées: configure_session, cleanup_expired_sessions, perform_maintenance, analyze_slow_queries';
  RAISE NOTICE 'Vues créées: active_cart_sessions, abandoned_cart_stats';
  RAISE NOTICE 'Optimisation terminée avec succès!';
END $$;
