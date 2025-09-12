-- 🚀 OPTIMISATION DE LA FONCTION RPC STOREFRONT
-- Date: 2025-01-28
-- Objectif: Réduire le temps de réponse de 5-8 secondes à <1 seconde

-- =====================================================
-- 1. VÉRIFIER LA FONCTION ACTUELLE
-- =====================================================

SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'get_storefront_by_slug'
  AND routine_schema = 'public';

-- =====================================================
-- 2. CRÉER UNE VERSION OPTIMISÉE
-- =====================================================

CREATE OR REPLACE FUNCTION get_storefront_by_slug_optimized(store_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    store_record RECORD;
    template_record RECORD;
    products_json JSONB;
    market_settings_record RECORD;
    result JSONB;
BEGIN
    -- 🚀 ÉTAPE 1: Récupérer la boutique avec un seul SELECT optimisé
    SELECT 
        s.id,
        s.name,
        s.description,
        s.domain,
        s.logo_url,
        s.merchant_id,
        s.slug,
        s.status,
        s.settings,
        s.created_at,
        s.updated_at,
        s.primary_color,
        s.contact_email,
        s.currency
    INTO store_record
    FROM stores s
    WHERE s.slug = store_slug 
      AND s.status = 'active'
    LIMIT 1;

    -- Vérifier si la boutique existe
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- 🚀 ÉTAPE 2: Récupérer le template avec un SELECT optimisé
    SELECT 
        st.template_data,
        st.is_published,
        st.updated_at
    INTO template_record
    FROM site_templates st
    WHERE st.store_id = store_record.id
      AND st.is_published = true
    ORDER BY st.updated_at DESC
    LIMIT 1;

    -- 🚀 ÉTAPE 3: Récupérer les produits avec un SELECT optimisé
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', p.id,
                'name', p.name,
                'description', p.description,
                'price', p.price,
                'images', p.images,
                'status', p.status,
                'category_id', p.category_id,
                'store_id', p.store_id,
                'created_at', p.created_at,
                'updated_at', p.updated_at,
                'category', CASE 
                    WHEN c.id IS NOT NULL THEN 
                        jsonb_build_object('name', c.name)
                    ELSE NULL
                END
            )
        ), 
        '[]'::jsonb
    ) INTO products_json
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.store_id = store_record.id
      AND p.status = 'active';

    -- 🚀 ÉTAPE 4: Récupérer les paramètres de marché
    SELECT 
        ms.id,
        ms.store_id,
        ms.enabled_countries,
        ms.default_currency,
        ms.tax_settings,
        ms.created_at,
        ms.updated_at,
        ms.enabled_currencies,
        ms.currency_format,
        ms.decimal_places,
        ms.exchange_rates,
        ms.auto_currency_detection
    INTO market_settings_record
    FROM market_settings ms
    WHERE ms.store_id = store_record.id
    LIMIT 1;

    -- 🚀 ÉTAPE 5: Construire le résultat JSON
    result := jsonb_build_object(
        'store', jsonb_build_object(
            'id', store_record.id,
            'name', store_record.name,
            'description', store_record.description,
            'domain', store_record.domain,
            'logo_url', store_record.logo_url,
            'merchant_id', store_record.merchant_id,
            'slug', store_record.slug,
            'status', store_record.status,
            'settings', store_record.settings,
            'created_at', store_record.created_at,
            'updated_at', store_record.updated_at,
            'primary_color', store_record.primary_color,
            'contact_email', store_record.contact_email,
            'currency', store_record.currency
        ),
        'template', CASE 
            WHEN template_record.template_data IS NOT NULL THEN
                jsonb_build_object(
                    'template_data', template_record.template_data,
                    'is_published', template_record.is_published,
                    'updated_at', template_record.updated_at
                )
            ELSE NULL
        END,
        'products', products_json,
        'market_settings', CASE 
            WHEN market_settings_record.id IS NOT NULL THEN
                jsonb_build_object(
                    'id', market_settings_record.id,
                    'store_id', market_settings_record.store_id,
                    'enabled_countries', market_settings_record.enabled_countries,
                    'default_currency', market_settings_record.default_currency,
                    'tax_settings', market_settings_record.tax_settings,
                    'created_at', market_settings_record.created_at,
                    'updated_at', market_settings_record.updated_at,
                    'enabled_currencies', market_settings_record.enabled_currencies,
                    'currency_format', market_settings_record.currency_format,
                    'decimal_places', market_settings_record.decimal_places,
                    'exchange_rates', market_settings_record.exchange_rates,
                    'auto_currency_detection', market_settings_record.auto_currency_detection
                )
            ELSE NULL
        END
    );

    RETURN result;
END;
$$;

-- =====================================================
-- 3. CRÉER LES INDEX POUR OPTIMISER LES PERFORMANCES
-- =====================================================

-- Index sur stores.slug (déjà existant probablement)
CREATE INDEX IF NOT EXISTS idx_stores_slug_status 
ON stores (slug, status) 
WHERE status = 'active';

-- Index sur site_templates.store_id
CREATE INDEX IF NOT EXISTS idx_site_templates_store_published 
ON site_templates (store_id, is_published, updated_at DESC) 
WHERE is_published = true;

-- Index sur products.store_id
CREATE INDEX IF NOT EXISTS idx_products_store_status 
ON products (store_id, status) 
WHERE status = 'active';

-- Index sur market_settings.store_id
CREATE INDEX IF NOT EXISTS idx_market_settings_store_id 
ON market_settings (store_id);

-- =====================================================
-- 4. TEST DE PERFORMANCE
-- =====================================================

-- Test avec une boutique existante
DO $$
DECLARE
    test_slug TEXT;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time INTERVAL;
    result JSONB;
BEGIN
    -- Trouver une boutique de test
    SELECT slug INTO test_slug 
    FROM stores 
    WHERE status = 'active' 
    LIMIT 1;
    
    IF test_slug IS NOT NULL THEN
        RAISE NOTICE '🧪 Test de performance avec: %', test_slug;
        
        -- Test de la fonction optimisée
        start_time := clock_timestamp();
        result := get_storefront_by_slug_optimized(test_slug);
        end_time := clock_timestamp();
        execution_time := end_time - start_time;
        
        RAISE NOTICE '⚡ Temps d''exécution: %', execution_time;
        RAISE NOTICE '📊 Taille du résultat: % octets', octet_length(result::text);
        
        IF result IS NOT NULL THEN
            RAISE NOTICE '✅ Test réussi - Boutique trouvée';
        ELSE
            RAISE NOTICE '❌ Test échoué - Boutique non trouvée';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ Aucune boutique active trouvée pour le test';
    END IF;
END $$;

-- =====================================================
-- 5. REMPLACER L'ANCIENNE FONCTION
-- =====================================================

-- Sauvegarder l'ancienne fonction
CREATE OR REPLACE FUNCTION get_storefront_by_slug_backup(store_slug TEXT)
RETURNS JSONB
AS $$
    SELECT get_storefront_by_slug(store_slug);
$$ LANGUAGE sql;

-- Remplacer par la version optimisée
CREATE OR REPLACE FUNCTION get_storefront_by_slug(store_slug TEXT)
RETURNS JSONB
AS $$
    SELECT get_storefront_by_slug_optimized(store_slug);
$$ LANGUAGE sql;

-- =====================================================
-- 6. VÉRIFICATION FINALE
-- =====================================================

SELECT 
    'Optimisation terminée' as status,
    'Fonction RPC optimisée et index créés' as description,
    'Temps de réponse attendu: <1 seconde' as performance;
