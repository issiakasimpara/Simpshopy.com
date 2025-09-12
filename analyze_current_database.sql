-- 🔍 ANALYSE COMPLÈTE DE LA BASE DE DONNÉES EXISTANTE
-- Date: 2025-01-28
-- Objectif: Comprendre la structure avant de créer les triggers

-- =====================================================
-- 1. VÉRIFICATION DE L'EXISTENCE DES TABLES PRINCIPALES
-- =====================================================

SELECT 
  'Tables principales' as section,
  table_name,
  'EXISTE' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'stores', 'products', 'site_templates', 'categories',
    'orders', 'users', 'profiles', 'cart_sessions'
  )
ORDER BY table_name;

-- =====================================================
-- 2. STRUCTURE DES TABLES CRITIQUES POUR LE CACHE
-- =====================================================

-- Structure de la table stores
SELECT 
  'stores' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'stores' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Structure de la table products  
SELECT 
  'products' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Structure de la table site_templates
SELECT 
  'site_templates' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'site_templates' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 3. TRIGGERS EXISTANTS (pour éviter les conflits)
-- =====================================================

SELECT 
  'Triggers existants' as section,
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND event_object_table IN ('stores', 'products', 'site_templates', 'categories')
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 4. FONCTIONS EXISTANTES (pour éviter les conflits)
-- =====================================================

SELECT 
  'Fonctions existantes' as section,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%cache%'
ORDER BY routine_name;

-- =====================================================
-- 5. VÉRIFICATION DES EXTENSIONS (pour net.http_post)
-- =====================================================

SELECT 
  'Extensions disponibles' as section,
  extname as extension_name,
  extversion as version
FROM pg_extension 
WHERE extname IN ('http', 'pgsql_http')
ORDER BY extname;

-- =====================================================
-- 6. VARIABLES D'ENVIRONNEMENT CONFIGURÉES
-- =====================================================

SELECT 
  'Variables configurées' as section,
  name,
  setting,
  category
FROM pg_settings 
WHERE name LIKE '%app.%'
ORDER BY name;

-- =====================================================
-- 7. TEST DE CONNEXION HTTP (si extension disponible)
-- =====================================================

DO $$
BEGIN
  -- Vérifier si l'extension http est disponible
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http') THEN
    RAISE NOTICE '✅ Extension http disponible - Triggers HTTP possibles';
  ELSE
    RAISE NOTICE '⚠️ Extension http non disponible - Alternative nécessaire';
  END IF;
  
  -- Vérifier les tables critiques
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stores' AND table_schema = 'public') THEN
    RAISE NOTICE '✅ Table stores trouvée';
  ELSE
    RAISE NOTICE '❌ Table stores manquante';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
    RAISE NOTICE '✅ Table products trouvée';
  ELSE
    RAISE NOTICE '❌ Table products manquante';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_templates' AND table_schema = 'public') THEN
    RAISE NOTICE '✅ Table site_templates trouvée';
  ELSE
    RAISE NOTICE '❌ Table site_templates manquante';
  END IF;
END $$;

-- =====================================================
-- 8. RÉSUMÉ POUR DÉCISION
-- =====================================================

SELECT 
  'RÉSUMÉ' as section,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stores' AND table_schema = 'public')
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public')
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_templates' AND table_schema = 'public')
    THEN 'TABLES PRINCIPALES OK'
    ELSE 'TABLES MANQUANTES'
  END as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http')
    THEN 'EXTENSION HTTP OK'
    ELSE 'EXTENSION HTTP MANQUANTE'
  END as http_status;
