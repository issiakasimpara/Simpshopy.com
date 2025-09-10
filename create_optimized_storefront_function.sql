-- 🚀 FONCTION OPTIMISÉE POUR LE STOREFRONT
-- Date: 2025-01-28
-- Objectif: Récupérer toutes les données d'une boutique avec une seule requête utilisant le slug

-- =====================================================
-- 1. FONCTION OPTIMISÉE POUR RÉCUPÉRER TOUT AVEC LE SLUG
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
                'currency', ms.currency,
                'language', ms.language,
                'timezone', ms.timezone,
                'settings', ms.settings,
                'created_at', ms.created_at,
                'updated_at', ms.updated_at
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
-- 2. FONCTION SIMPLE POUR VÉRIFIER L'EXISTENCE D'UNE BOUTIQUE
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
-- 3. FONCTION POUR RÉCUPÉRER UNIQUEMENT LES INFOS DE BASE
-- =====================================================

CREATE OR REPLACE FUNCTION get_store_basic_info_by_slug(store_slug TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    logo_url TEXT,
    slug TEXT,
    status TEXT,
    primary_color TEXT,
    currency TEXT
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
-- 4. CRÉER LES INDEX OPTIMISÉS
-- =====================================================

-- Index unique sur slug (déjà créé, mais on s'assure qu'il existe)
CREATE UNIQUE INDEX IF NOT EXISTS idx_stores_slug_unique 
ON public.stores(slug) 
WHERE status = 'active';

-- Index composite pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_stores_status_slug 
ON public.stores(status, slug);

-- Index sur site_templates pour les requêtes de template
CREATE INDEX IF NOT EXISTS idx_site_templates_store_published 
ON public.site_templates(store_id, is_published, updated_at DESC);

-- Index sur products pour les requêtes de produits
CREATE INDEX IF NOT EXISTS idx_products_store_status_created 
ON public.products(store_id, status, created_at DESC);

-- Index sur market_settings pour les requêtes de paramètres
CREATE INDEX IF NOT EXISTS idx_market_settings_store 
ON public.market_settings(store_id);

-- =====================================================
-- 5. TESTER LES FONCTIONS
-- =====================================================

-- Test de la fonction principale
-- SELECT get_storefront_by_slug('test-slug');

-- Test de la fonction d'existence
-- SELECT store_exists_by_slug('test-slug');

-- Test de la fonction d'infos de base
-- SELECT * FROM get_store_basic_info_by_slug('test-slug');

-- =====================================================
-- 6. COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION get_storefront_by_slug(TEXT) IS 'Récupère toutes les données d''une boutique (store, template, products, market_settings) avec une seule requête utilisant le slug';
COMMENT ON FUNCTION store_exists_by_slug(TEXT) IS 'Vérifie si une boutique existe et est active en utilisant son slug';
COMMENT ON FUNCTION get_store_basic_info_by_slug(TEXT) IS 'Récupère uniquement les informations de base d''une boutique en utilisant son slug';

-- =====================================================
-- 7. RÉSUMÉ
-- =====================================================

SELECT 
    'Résumé' as check_type,
    'Fonctions optimisées créées avec succès' as message,
    NOW() as timestamp;
