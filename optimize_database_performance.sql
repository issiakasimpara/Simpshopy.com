-- =====================================================
-- OPTIMISATIONS DE PERFORMANCE POUR SIMPSHOPY
-- =====================================================

-- 1. INDEX POUR CART_SESSIONS (URGENT - 138,773 appels!)
-- =====================================================

-- Index composite pour les requêtes les plus fréquentes
CREATE INDEX IF NOT EXISTS idx_cart_sessions_session_store_composite 
ON cart_sessions(session_id, store_id);

-- Index pour les requêtes par store_id
CREATE INDEX IF NOT EXISTS idx_cart_sessions_store_id_created 
ON cart_sessions(store_id, created_at DESC);

-- Index pour les sessions expirées
CREATE INDEX IF NOT EXISTS idx_cart_sessions_expires_at 
ON cart_sessions(expires_at) WHERE expires_at < NOW();

-- 2. INDEX POUR PRODUCTS (URGENT - 40 secondes en moyenne!)
-- =====================================================

-- Index composite pour les requêtes de produits par boutique
CREATE INDEX IF NOT EXISTS idx_products_store_status_created 
ON products(store_id, status, created_at DESC);

-- Index pour les recherches par catégorie
CREATE INDEX IF NOT EXISTS idx_products_category_store 
ON products(category_id, store_id) WHERE category_id IS NOT NULL;

-- Index pour les produits actifs
CREATE INDEX IF NOT EXISTS idx_products_active_store 
ON products(store_id, status) WHERE status = 'active';

-- Index pour les recherches par SKU
CREATE INDEX IF NOT EXISTS idx_products_sku_store 
ON products(sku, store_id) WHERE sku IS NOT NULL;

-- 3. INDEX POUR CATEGORIES
-- =====================================================

-- Index pour les catégories par boutique
CREATE INDEX IF NOT EXISTS idx_categories_store_id 
ON categories(store_id);

-- 4. INDEX POUR ORDERS
-- =====================================================

-- Index pour les commandes par boutique
CREATE INDEX IF NOT EXISTS idx_orders_store_status_created 
ON public_orders(store_id, status, created_at DESC);

-- Index pour les commandes par email client
CREATE INDEX IF NOT EXISTS idx_orders_customer_email 
ON public_orders(customer_email) WHERE customer_email IS NOT NULL;

-- 5. INDEX POUR STORES
-- =====================================================

-- Index pour les recherches par slug
CREATE INDEX IF NOT EXISTS idx_stores_slug 
ON stores(slug) WHERE slug IS NOT NULL;

-- Index pour les stores par merchant
CREATE INDEX IF NOT EXISTS idx_stores_merchant_id 
ON stores(merchant_id);

-- 6. ANALYSE DES TABLES POUR OPTIMISER LES STATISTIQUES
-- =====================================================

-- Mettre à jour les statistiques des tables
ANALYZE cart_sessions;
ANALYZE products;
ANALYZE categories;
ANALYZE public_orders;
ANALYZE stores;

-- 7. CONFIGURATION POSTGRESQL POUR DE MEILLEURES PERFORMANCES
-- =====================================================

-- Augmenter la mémoire partagée (à ajuster selon votre plan Supabase)
-- ALTER SYSTEM SET shared_buffers = '256MB';
-- ALTER SYSTEM SET effective_cache_size = '1GB';
-- ALTER SYSTEM SET work_mem = '4MB';
-- ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- 8. NETTOYAGE DES SESSIONS EXPIREES
-- =====================================================

-- Fonction pour nettoyer automatiquement les sessions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_cart_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM cart_sessions 
  WHERE expires_at < NOW();
  
  -- Log du nettoyage
  RAISE NOTICE 'Nettoyage des sessions expirées terminé';
END;
$$ LANGUAGE plpgsql;

-- 9. VUES OPTIMISEES POUR LES REQUÊTES FRÉQUENTES
-- =====================================================

-- Vue pour les produits actifs avec catégories
CREATE OR REPLACE VIEW active_products_with_categories AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.price,
  p.compare_price,
  p.cost_price,
  p.sku,
  p.inventory_quantity,
  p.status,
  p.images,
  p.tags,
  p.weight,
  p.dimensions,
  p.track_inventory,
  p.created_at,
  p.updated_at,
  p.store_id,
  c.name as category_name,
  c.id as category_id
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.status = 'active'
ORDER BY p.created_at DESC;

-- 10. MONITORING DES PERFORMANCES
-- =====================================================

-- Fonction pour surveiller les requêtes lentes
CREATE OR REPLACE FUNCTION log_slow_queries()
RETURNS void AS $$
BEGIN
  -- Log des requêtes prenant plus de 1 seconde
  INSERT INTO query_log (query_text, execution_time, created_at)
  SELECT 
    query,
    mean_time,
    NOW()
  FROM pg_stat_statements 
  WHERE mean_time > 1000  -- Plus de 1 seconde
  AND calls > 10;         -- Au moins 10 appels
END;
$$ LANGUAGE plpgsql;

-- Table pour le log des requêtes lentes
CREATE TABLE IF NOT EXISTS query_log (
  id SERIAL PRIMARY KEY,
  query_text TEXT,
  execution_time NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour le log
CREATE INDEX IF NOT EXISTS idx_query_log_created_at 
ON query_log(created_at DESC);

-- =====================================================
-- VÉRIFICATION DES INDEX CRÉÉS
-- =====================================================

-- Vérifier les index existants
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('cart_sessions', 'products', 'categories', 'public_orders', 'stores')
ORDER BY tablename, indexname;

-- =====================================================
-- RECOMMANDATIONS ADDITIONNELLES
-- =====================================================

/*
1. MONITORING CONTINU :
   - Surveiller pg_stat_statements régulièrement
   - Alerter sur les requêtes > 5 secondes
   - Nettoyer les sessions expirées quotidiennement

2. CACHE APPLICATION :
   - Implémenter Redis pour les données fréquemment accédées
   - Cache des produits par boutique (5 minutes)
   - Cache des sessions de panier (2 minutes)

3. OPTIMISATION REQUÊTES :
   - Utiliser des requêtes préparées
   - Limiter les colonnes sélectionnées
   - Paginer les résultats

4. MAINTENANCE :
   - VACUUM ANALYZE hebdomadaire
   - Nettoyage des logs mensuel
   - Révision des index trimestrielle
*/
