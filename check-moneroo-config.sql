-- Script pour vérifier la configuration Moneroo
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier si la table payment_configurations existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'payment_configurations'
) as table_exists;

-- 2. Vérifier la structure de la table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'payment_configurations'
ORDER BY ordinal_position;

-- 3. Vérifier les configurations existantes
SELECT 
    id,
    store_id,
    moneroo_enabled,
    moneroo_test_mode,
    CASE 
        WHEN moneroo_api_key IS NOT NULL THEN 'CONFIGURÉ'
        ELSE 'NON CONFIGURÉ'
    END as api_key_status,
    CASE 
        WHEN moneroo_api_key IS NOT NULL THEN 
            LEFT(moneroo_api_key, 10) || '...'
        ELSE 'NULL'
    END as api_key_preview,
    created_at,
    updated_at
FROM payment_configurations
ORDER BY created_at DESC;

-- 4. Vérifier spécifiquement pour le store d6d0e01a-0283-4a87-8da0-b248c36e37d5
SELECT 
    id,
    store_id,
    moneroo_enabled,
    moneroo_test_mode,
    CASE 
        WHEN moneroo_api_key IS NOT NULL THEN 'CONFIGURÉ'
        ELSE 'NON CONFIGURÉ'
    END as api_key_status,
    CASE 
        WHEN moneroo_api_key IS NOT NULL THEN 
            LEFT(moneroo_api_key, 10) || '...'
        ELSE 'NULL'
    END as api_key_preview,
    created_at,
    updated_at
FROM payment_configurations
WHERE store_id = 'd6d0e01a-0283-4a87-8da0-b248c36e37d5';

-- 5. Compter le nombre total de configurations
SELECT COUNT(*) as total_configurations FROM payment_configurations;

-- 6. Compter les configurations Moneroo activées
SELECT COUNT(*) as moneroo_enabled_count 
FROM payment_configurations 
WHERE moneroo_enabled = true;
