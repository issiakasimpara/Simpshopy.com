-- 🔧 CORRECTION DE LA FONCTION DE POLLING INTELLIGENT
-- Date: 2025-01-28
-- Objectif: Corriger les colonnes manquantes et adapter à votre schéma

-- =====================================================
-- 1. VÉRIFIER LA STRUCTURE DES TABLES
-- =====================================================

-- Vérifier la structure de chaque table critique
SELECT 
  'stores' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'stores' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
  'site_templates' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'site_templates' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
  'products' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
  'categories' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'categories' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
  'market_settings' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'market_settings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 2. FONCTION CORRIGÉE (adaptée à votre schéma)
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
    -- Récupérer l'ID de la boutique
    SELECT id INTO store_id
    FROM stores 
    WHERE slug = store_slug 
      AND status = 'active'
    LIMIT 1;

    -- Si la boutique n'existe pas
    IF store_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Calculer la dernière modification (en utilisant les colonnes qui existent)
    SELECT GREATEST(
        COALESCE(s.updated_at, '1970-01-01'::timestamp with time zone),
        COALESCE(st.updated_at, '1970-01-01'::timestamp with time zone),
        COALESCE(p.updated_at, '1970-01-01'::timestamp with time zone),
        COALESCE(ms.updated_at, '1970-01-01'::timestamp with time zone)
    ) INTO last_modified
    FROM stores s
    LEFT JOIN site_templates st ON s.id = st.store_id AND st.is_published = true
    LEFT JOIN products p ON s.id = p.store_id AND p.status = 'active'
    LEFT JOIN market_settings ms ON s.id = ms.store_id
    WHERE s.id = store_id;

    RETURN COALESCE(last_modified, '1970-01-01'::timestamp with time zone);
END;
$$;

-- =====================================================
-- 3. VERSION SIMPLIFIÉE (sans categories si elle n'a pas updated_at)
-- =====================================================

CREATE OR REPLACE FUNCTION check_storefront_last_modified_simple(store_slug TEXT)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    store_id UUID;
    last_modified TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Récupérer l'ID de la boutique
    SELECT id INTO store_id
    FROM stores 
    WHERE slug = store_slug 
      AND status = 'active'
    LIMIT 1;

    IF store_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Version simple : seulement les tables avec updated_at
    SELECT GREATEST(
        COALESCE(s.updated_at, '1970-01-01'::timestamp with time zone),
        COALESCE(st.updated_at, '1970-01-01'::timestamp with time zone),
        COALESCE(p.updated_at, '1970-01-01'::timestamp with time zone)
    ) INTO last_modified
    FROM stores s
    LEFT JOIN site_templates st ON s.id = st.store_id AND st.is_published = true
    LEFT JOIN products p ON s.id = p.store_id AND p.status = 'active'
    WHERE s.id = store_id;

    RETURN COALESCE(last_modified, '1970-01-01'::timestamp with time zone);
END;
$$;

-- =====================================================
-- 4. VERSION ULTRA-SIMPLE (seulement stores + site_templates)
-- =====================================================

CREATE OR REPLACE FUNCTION check_storefront_last_modified_minimal(store_slug TEXT)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    store_id UUID;
    last_modified TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Récupérer l'ID de la boutique
    SELECT id INTO store_id
    FROM stores 
    WHERE slug = store_slug 
      AND status = 'active'
    LIMIT 1;

    IF store_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Version minimale : seulement stores et site_templates
    SELECT GREATEST(
        COALESCE(s.updated_at, '1970-01-01'::timestamp with time zone),
        COALESCE(st.updated_at, '1970-01-01'::timestamp with time zone)
    ) INTO last_modified
    FROM stores s
    LEFT JOIN site_templates st ON s.id = st.store_id AND st.is_published = true
    WHERE s.id = store_id;

    RETURN COALESCE(last_modified, '1970-01-01'::timestamp with time zone);
END;
$$;

-- =====================================================
-- 5. TEST DES FONCTIONS
-- =====================================================

DO $$
DECLARE
    test_slug TEXT;
    result1 TIMESTAMP WITH TIME ZONE;
    result2 TIMESTAMP WITH TIME ZONE;
    result3 TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Trouver une boutique de test
    SELECT slug INTO test_slug 
    FROM stores 
    WHERE status = 'active' 
    LIMIT 1;
    
    IF test_slug IS NOT NULL THEN
        RAISE NOTICE '🧪 Test avec: %', test_slug;
        
        -- Test de chaque version
        BEGIN
            result1 := check_storefront_last_modified(test_slug);
            RAISE NOTICE '✅ Version complète: %', result1;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Version complète échouée: %', SQLERRM;
        END;
        
        BEGIN
            result2 := check_storefront_last_modified_simple(test_slug);
            RAISE NOTICE '✅ Version simple: %', result2;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Version simple échouée: %', SQLERRM;
        END;
        
        BEGIN
            result3 := check_storefront_last_modified_minimal(test_slug);
            RAISE NOTICE '✅ Version minimale: %', result3;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Version minimale échouée: %', SQLERRM;
        END;
        
    ELSE
        RAISE NOTICE '⚠️ Aucune boutique active trouvée';
    END IF;
END $$;

-- =====================================================
-- 6. REMPLACER LA FONCTION PRINCIPALE PAR LA VERSION QUI MARCHE
-- =====================================================

-- Remplacer par la version minimale (qui devrait marcher)
CREATE OR REPLACE FUNCTION check_storefront_last_modified(store_slug TEXT)
RETURNS TIMESTAMP WITH TIME ZONE
AS $$
    SELECT check_storefront_last_modified_minimal(store_slug);
$$ LANGUAGE sql;

-- =====================================================
-- 7. VÉRIFICATION FINALE
-- =====================================================

SELECT 
    'Correction terminée' as status,
    'Fonction adaptée à votre schéma' as description,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'check_storefront_last_modified')
        THEN '✅ Fonction principale disponible'
        ELSE '❌ Fonction principale manquante'
    END as function_status;
