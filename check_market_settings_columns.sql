-- 🔍 VÉRIFICATION COMPLÈTE DES COLONNES DE MARKET_SETTINGS
-- Date: 2025-01-28
-- Objectif: Voir toutes les colonnes de la table market_settings

-- =====================================================
-- 1. VÉRIFIER TOUTES LES COLONNES
-- =====================================================

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'market_settings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 2. AFFICHER UN ÉCHANTILLON DES DONNÉES
-- =====================================================

SELECT 
    'Échantillon des données' as check_type,
    *
FROM public.market_settings
LIMIT 1;
