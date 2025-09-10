-- 🔍 VÉRIFICATION SIMPLE DE LA TABLE MARKET_SETTINGS
-- Date: 2025-01-28
-- Objectif: Vérifier la structure de la table market_settings

-- =====================================================
-- 1. VÉRIFIER LA STRUCTURE DE LA TABLE MARKET_SETTINGS
-- =====================================================

SELECT 
    'Structure table market_settings' as check_type,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'market_settings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 2. VÉRIFIER LES DONNÉES EXISTANTES
-- =====================================================

SELECT 
    'Données existantes' as check_type,
    COUNT(*) as total_records
FROM public.market_settings;

-- =====================================================
-- 3. AFFICHER UN ÉCHANTILLON DES DONNÉES
-- =====================================================

SELECT 
    'Échantillon des données' as check_type,
    *
FROM public.market_settings
LIMIT 3;
