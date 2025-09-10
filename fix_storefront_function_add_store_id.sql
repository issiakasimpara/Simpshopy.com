-- 🔧 CORRECTION : AJOUTER store_id DANS LES PRODUITS
-- Date: 2025-01-28
-- Objectif: Ajouter le store_id dans les données des produits retournées par get_storefront_by_slug

-- =====================================================
-- 1. FONCTION CORRIGÉE AVEC store_id DANS LES PRODUITS
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
                    'store_id', p.store_id,  -- 🚀 AJOUT DU store_id !
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
-- 2. TESTER LA FONCTION CORRIGÉE
-- =====================================================

-- Test avec un slug existant pour vérifier que store_id est présent
SELECT 
    'Test fonction avec store_id' as test_type,
    'Vérification que store_id est présent dans les produits' as description,
    jsonb_pretty(
        (get_storefront_by_slug('maman') -> 'products' -> 0)::jsonb
    ) as first_product_with_store_id;

-- =====================================================
-- 3. VÉRIFICATION RAPIDE
-- =====================================================

-- Vérifier que la fonction retourne bien le store_id
SELECT 
    'Vérification store_id' as check_type,
    CASE 
        WHEN (get_storefront_by_slug('maman') -> 'products' -> 0 ->> 'store_id') IS NOT NULL 
        THEN '✅ store_id présent dans les produits'
        ELSE '❌ store_id manquant dans les produits'
    END as result;

-- =====================================================
-- 4. RÉSUMÉ
-- =====================================================

SELECT 
    'Résumé' as check_type,
    'Fonction corrigée avec store_id ajouté dans les produits' as message,
    NOW() as timestamp;
