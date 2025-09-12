-- 🧠 FONCTION SQL POUR POLLING INTELLIGENT
-- Date: 2025-01-28
-- Objectif: Vérifier rapidement si les données d'une boutique ont changé

-- =====================================================
-- 1. FONCTION DE VÉRIFICATION ULTRA-RAPIDE
-- =====================================================

CREATE OR REPLACE FUNCTION check_storefront_last_modified(store_slug TEXT)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    store_id UUID;
    last_modified TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Récupérer l'ID de la boutique (avec index optimisé)
    SELECT id INTO store_id
    FROM stores 
    WHERE slug = store_slug 
      AND status = 'active'
    LIMIT 1;

    -- Si la boutique n'existe pas
    IF store_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Calculer la dernière modification (tables critiques)
    SELECT GREATEST(
        COALESCE(s.updated_at, '1970-01-01'::timestamp with time zone),
        COALESCE(st.updated_at, '1970-01-01'::timestamp with time zone),
        COALESCE(p.updated_at, '1970-01-01'::timestamp with time zone),
        COALESCE(c.updated_at, '1970-01-01'::timestamp with time zone),
        COALESCE(ms.updated_at, '1970-01-01'::timestamp with time zone)
    ) INTO last_modified
    FROM stores s
    LEFT JOIN site_templates st ON s.id = st.store_id AND st.is_published = true
    LEFT JOIN products p ON s.id = p.store_id AND p.status = 'active'
    LEFT JOIN categories c ON s.id = c.store_id
    LEFT JOIN market_settings ms ON s.id = ms.store_id
    WHERE s.id = store_id;

    RETURN COALESCE(last_modified, '1970-01-01'::timestamp with time zone);
END;
$$;

-- =====================================================
-- 2. FONCTION DE VÉRIFICATION DÉTAILLÉE (pour debug)
-- =====================================================

CREATE OR REPLACE FUNCTION check_storefront_changes_detailed(store_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    store_id UUID;
    result JSONB;
BEGIN
    -- Récupérer l'ID de la boutique
    SELECT id INTO store_id
    FROM stores 
    WHERE slug = store_slug 
      AND status = 'active'
    LIMIT 1;

    IF store_id IS NULL THEN
        RETURN jsonb_build_object('error', 'Store not found');
    END IF;

    -- Construire le résultat détaillé
    result := jsonb_build_object(
        'store_slug', store_slug,
        'store_id', store_id,
        'last_modified', (
            SELECT GREATEST(
                COALESCE(s.updated_at, '1970-01-01'::timestamp with time zone),
                COALESCE(st.updated_at, '1970-01-01'::timestamp with time zone),
                COALESCE(p.updated_at, '1970-01-01'::timestamp with time zone),
                COALESCE(c.updated_at, '1970-01-01'::timestamp with time zone),
                COALESCE(ms.updated_at, '1970-01-01'::timestamp with time zone)
            )
            FROM stores s
            LEFT JOIN site_templates st ON s.id = st.store_id AND st.is_published = true
            LEFT JOIN products p ON s.id = p.store_id AND p.status = 'active'
            LEFT JOIN categories c ON s.id = c.store_id
            LEFT JOIN market_settings ms ON s.id = ms.store_id
            WHERE s.id = store_id
        ),
        'tables', jsonb_build_object(
            'stores', (SELECT updated_at FROM stores WHERE id = store_id),
            'site_templates', (SELECT MAX(updated_at) FROM site_templates WHERE store_id = store_id),
            'products', (SELECT MAX(updated_at) FROM products WHERE store_id = store_id AND status = 'active'),
            'categories', (SELECT MAX(updated_at) FROM categories WHERE store_id = store_id),
            'market_settings', (SELECT updated_at FROM market_settings WHERE store_id = store_id)
        )
    );

    RETURN result;
END;
$$;

-- =====================================================
-- 3. OPTIMISER LES INDEX POUR LA PERFORMANCE
-- =====================================================

-- Index sur stores.slug (déjà existant probablement)
CREATE INDEX IF NOT EXISTS idx_stores_slug_active 
ON stores (slug) 
WHERE status = 'active';

-- Index sur site_templates pour les requêtes de vérification
CREATE INDEX IF NOT EXISTS idx_site_templates_store_published_updated 
ON site_templates (store_id, is_published, updated_at DESC) 
WHERE is_published = true;

-- Index sur products pour les requêtes de vérification
CREATE INDEX IF NOT EXISTS idx_products_store_active_updated 
ON products (store_id, status, updated_at DESC) 
WHERE status = 'active';

-- Index sur categories pour les requêtes de vérification
CREATE INDEX IF NOT EXISTS idx_categories_store_updated 
ON categories (store_id, updated_at DESC);

-- Index sur market_settings pour les requêtes de vérification
CREATE INDEX IF NOT EXISTS idx_market_settings_store_updated 
ON market_settings (store_id, updated_at DESC);

-- =====================================================
-- 4. TEST DE PERFORMANCE
-- =====================================================

DO $$
DECLARE
    test_slug TEXT;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time INTERVAL;
    result TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Trouver une boutique de test
    SELECT slug INTO test_slug 
    FROM stores 
    WHERE status = 'active' 
    LIMIT 1;
    
    IF test_slug IS NOT NULL THEN
        RAISE NOTICE '🧪 Test de performance avec: %', test_slug;
        
        -- Test de la fonction rapide
        start_time := clock_timestamp();
        result := check_storefront_last_modified(test_slug);
        end_time := clock_timestamp();
        execution_time := end_time - start_time;
        
        RAISE NOTICE '⚡ Temps d''exécution: %', execution_time;
        RAISE NOTICE '📅 Dernière modification: %', result;
        
        -- Évaluer la performance
        IF execution_time < INTERVAL '10 milliseconds' THEN
            RAISE NOTICE '✅ Performance EXCELLENTE (<10ms)';
        ELSIF execution_time < INTERVAL '50 milliseconds' THEN
            RAISE NOTICE '✅ Performance BONNE (<50ms)';
        ELSIF execution_time < INTERVAL '100 milliseconds' THEN
            RAISE NOTICE '⚠️ Performance MOYENNE (<100ms)';
        ELSE
            RAISE NOTICE '❌ Performance LENTE (>100ms) - Optimisation nécessaire';
        END IF;
        
        -- Test de la fonction détaillée
        start_time := clock_timestamp();
        PERFORM check_storefront_changes_detailed(test_slug);
        end_time := clock_timestamp();
        execution_time := end_time - start_time;
        
        RAISE NOTICE '📊 Fonction détaillée: %', execution_time;
        
    ELSE
        RAISE NOTICE '⚠️ Aucune boutique active trouvée pour le test';
    END IF;
END $$;

-- =====================================================
-- 5. VÉRIFICATION DES FONCTIONS CRÉÉES
-- =====================================================

SELECT 
    'Fonctions créées' as test_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'check_storefront_last_modified')
        THEN '✅ Fonction rapide créée'
        ELSE '❌ Fonction rapide manquante'
    END as fast_function_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'check_storefront_changes_detailed')
        THEN '✅ Fonction détaillée créée'
        ELSE '❌ Fonction détaillée manquante'
    END as detailed_function_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stores_slug_active')
        THEN '✅ Index optimisés créés'
        ELSE '❌ Index manquants'
    END as indexes_status;
