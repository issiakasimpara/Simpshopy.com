-- 🔧 CORRECTION DE LA FONCTION STOREFRONT
-- Date: 2025-01-28
-- Objectif: Corriger la fonction get_storefront_by_slug avec les bonnes colonnes

-- =====================================================
-- 1. FONCTION CORRIGÉE POUR RÉCUPÉRER TOUT AVEC LE SLUG
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
                'default_currency', ms.default_currency,
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
-- 2. TESTER LA FONCTION CORRIGÉE
-- =====================================================

-- Test avec un slug existant
SELECT 
    'Test fonction corrigée' as test_type,
    'Test avec slug existant' as description,
    get_storefront_by_slug('isco') as result;

-- =====================================================
-- 3. VÉRIFIER QUE LA FONCTION EST CRÉÉE
-- =====================================================

SELECT 
    'Vérification fonction' as test_type,
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'get_storefront_by_slug';

-- =====================================================
-- 4. RÉSUMÉ
-- =====================================================

SELECT 
    'Résumé' as check_type,
    'Fonction corrigée avec les bonnes colonnes' as message,
    NOW() as timestamp;
