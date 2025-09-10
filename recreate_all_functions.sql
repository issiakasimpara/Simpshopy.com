-- 🔧 RECRÉATION DE TOUTES LES FONCTIONS
-- Date: 2025-01-28
-- Objectif: Supprimer et recréer toutes les fonctions du système de routage

-- =====================================================
-- 1. SUPPRIMER TOUTES LES FONCTIONS EXISTANTES
-- =====================================================

DROP FUNCTION IF EXISTS get_storefront_by_slug(TEXT);
DROP FUNCTION IF EXISTS store_exists_by_slug(TEXT);
DROP FUNCTION IF EXISTS get_store_basic_info_by_slug(TEXT);

-- =====================================================
-- 2. CRÉER LA FONCTION PRINCIPALE
-- =====================================================

CREATE OR REPLACE FUNCTION get_storefront_by_slug(store_slug TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'store', json_build_object(
            'id', s.id,
            'name', s.name,
            'description', s.description,
            'domain', s.domain,
            'logo_url', s.logo_url,
            'merchant_id', s.merchant_id,
            'slug', s.slug,
            'status', s.status,
            'settings', s.settings,
            'created_at', s.created_at,
            'updated_at', s.updated_at,
            'primary_color', s.primary_color,
            'contact_email', s.contact_email,
            'currency', s.currency
        ),
        'template', (
            SELECT json_build_object(
                'template_data', st.template_data,
                'is_published', st.is_published,
                'updated_at', st.updated_at
            )
            FROM public.site_templates st
            WHERE st.store_id = s.id
              AND st.is_published = true
            ORDER BY st.updated_at DESC
            LIMIT 1
        ),
        'products', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', p.id,
                    'name', p.name,
                    'description', p.description,
                    'price', p.price,
                    'images', p.images,
                    'status', p.status,
                    'category_id', p.category_id,
                    'created_at', p.created_at,
                    'updated_at', p.updated_at,
                    'category', json_build_object(
                        'name', p.category_name
                    )
                ) ORDER BY p.created_at DESC
            ), '[]'::json)
            FROM (
                SELECT p.*, c.name as category_name
                FROM public.products p
                LEFT JOIN public.categories c ON p.category_id = c.id
                WHERE p.store_id = s.id
                  AND p.status = 'active'
                ORDER BY p.created_at DESC
            ) p
        ),
        'market_settings', (
            SELECT json_build_object(
                'id', ms.id,
                'store_id', ms.store_id,
                'enabled_countries', ms.enabled_countries,
                'default_currency', ms.default_currency,
                'tax_settings', ms.tax_settings,
                'created_at', ms.created_at,
                'updated_at', ms.updated_at,
                'enabled_currencies', ms.enabled_currencies,
                'currency_format', ms.currency_format,
                'decimal_places', ms.decimal_places,
                'exchange_rates', ms.exchange_rates,
                'auto_currency_detection', ms.auto_currency_detection
            )
            FROM public.market_settings ms
            WHERE ms.store_id = s.id
            LIMIT 1
        )
    ) INTO result
    FROM public.stores s
    WHERE s.slug = store_slug
      AND s.status = 'active';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. CRÉER LA FONCTION D'EXISTENCE
-- =====================================================

CREATE OR REPLACE FUNCTION store_exists_by_slug(store_slug TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    store_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO store_count
    FROM public.stores
    WHERE slug = store_slug
      AND status = 'active';
    
    RETURN store_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. CRÉER LA FONCTION D'INFOS DE BASE
-- =====================================================

CREATE OR REPLACE FUNCTION get_store_basic_info_by_slug(store_slug TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    logo_url TEXT,
    slug TEXT,
    status TEXT,
    primary_color CHARACTER VARYING(7),
    currency CHARACTER VARYING(3)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.description,
        s.logo_url,
        s.slug,
        s.status,
        s.primary_color,
        s.currency
    FROM public.stores s
    WHERE s.slug = store_slug
      AND s.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. TESTER TOUTES LES FONCTIONS
-- =====================================================

-- Test de la fonction principale
SELECT 
    'Test fonction principale' as test_type,
    'Test avec slug existant' as description,
    get_storefront_by_slug('isco') as result;

-- Test de la fonction d'existence
SELECT 
    'Test existence' as test_type,
    'Test avec slug existant' as description,
    store_exists_by_slug('isco') as exists;

-- Test de la fonction d'infos de base
SELECT 
    'Test infos de base' as test_type,
    'Test avec slug existant' as description,
    * FROM get_store_basic_info_by_slug('isco');

-- =====================================================
-- 6. VÉRIFIER QUE TOUTES LES FONCTIONS EXISTENT
-- =====================================================

SELECT 
    'Vérification fonctions' as test_type,
    proname as function_name
FROM pg_proc 
WHERE proname IN ('get_storefront_by_slug', 'store_exists_by_slug', 'get_store_basic_info_by_slug')
ORDER BY proname;

-- =====================================================
-- 7. RÉSUMÉ
-- =====================================================

SELECT 
    'Résumé' as check_type,
    'Toutes les fonctions supprimées et recréées avec succès' as message,
    NOW() as timestamp;
