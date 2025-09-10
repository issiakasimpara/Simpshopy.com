-- 🔧 CORRECTION DE LA FONCTION GET_STORE_BASIC_INFO_BY_SLUG
-- Date: 2025-01-28
-- Objectif: Supprimer et recréer la fonction get_store_basic_info_by_slug avec les bons types

-- =====================================================
-- 1. SUPPRIMER LA FONCTION EXISTANTE
-- =====================================================

DROP FUNCTION IF EXISTS get_store_basic_info_by_slug(TEXT);

-- =====================================================
-- 2. CRÉER LA FONCTION AVEC LES BONS TYPES
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
-- 3. TESTER LA FONCTION CORRIGÉE
-- =====================================================

-- Test avec un slug existant
SELECT 
    'Test fonction infos de base' as test_type,
    'Test avec slug existant' as description,
    * FROM get_store_basic_info_by_slug('isco');

-- =====================================================
-- 4. VÉRIFIER QUE LA FONCTION EST CRÉÉE
-- =====================================================

SELECT 
    'Vérification fonction' as test_type,
    proname as function_name
FROM pg_proc 
WHERE proname = 'get_store_basic_info_by_slug';

-- =====================================================
-- 5. RÉSUMÉ
-- =====================================================

SELECT 
    'Résumé' as check_type,
    'Fonction get_store_basic_info_by_slug supprimée et recréée avec les bons types' as message,
    NOW() as timestamp;
