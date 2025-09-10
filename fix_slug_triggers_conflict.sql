-- 🔧 CORRECTION DES CONFLITS DE TRIGGERS SLUG
-- Date: 2025-01-28
-- Objectif: Nettoyer les triggers en conflit et optimiser la génération de slug

-- =====================================================
-- 1. SUPPRIMER LES ANCIENS TRIGGERS EN CONFLIT
-- =====================================================

-- Supprimer l'ancien trigger de génération de slug
DROP TRIGGER IF EXISTS generate_store_slug_trigger ON public.stores;

-- Supprimer l'ancien trigger auto_generate_store_slug
DROP TRIGGER IF EXISTS trigger_auto_generate_store_slug ON public.stores;

-- =====================================================
-- 2. VÉRIFIER LES FONCTIONS EXISTANTES
-- =====================================================

-- Vérifier quelles fonctions existent
SELECT 
    'Fonctions existantes' as check_type,
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname IN ('generate_store_slug', 'auto_generate_store_slug', 'generate_unique_slug')
ORDER BY proname;

-- =====================================================
-- 3. CRÉER UNE FONCTION UNIQUE ET OPTIMISÉE
-- =====================================================

-- Fonction optimisée pour générer un slug unique
CREATE OR REPLACE FUNCTION generate_store_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
    exists_count INTEGER;
BEGIN
    -- Générer le slug seulement si il n'est pas fourni ou vide
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        -- Générer le slug de base
        base_slug := LOWER(REGEXP_REPLACE(TRIM(NEW.name), '[^a-zA-Z0-9\s]+', '', 'g'));
        base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
        base_slug := TRIM(base_slug, '-');
        
        -- S'assurer que le slug n'est pas vide
        IF base_slug = '' OR base_slug IS NULL THEN
            base_slug := 'boutique';
        END IF;
        
        -- Vérifier l'unicité
        final_slug := base_slug;
        
        LOOP
            -- Compter les occurrences (exclure le store actuel si on fait une mise à jour)
            IF TG_OP = 'UPDATE' THEN
                SELECT COUNT(*) INTO exists_count
                FROM public.stores 
                WHERE slug = final_slug AND id != NEW.id AND status = 'active';
            ELSE
                SELECT COUNT(*) INTO exists_count
                FROM public.stores 
                WHERE slug = final_slug AND status = 'active';
            END IF;
            
            -- Si unique, on peut l'utiliser
            IF exists_count = 0 THEN
                EXIT;
            END IF;
            
            -- Sinon, ajouter un numéro
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;
        
        NEW.slug := final_slug;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. CRÉER LE TRIGGER UNIQUE ET OPTIMISÉ
-- =====================================================

-- Créer le trigger unique pour la génération de slug
CREATE TRIGGER generate_store_slug_trigger
    BEFORE INSERT OR UPDATE ON public.stores
    FOR EACH ROW
    WHEN (NEW.slug IS NULL OR NEW.slug = '')
    EXECUTE FUNCTION generate_store_slug();

-- =====================================================
-- 5. OPTIMISER LES INDEX
-- =====================================================

-- Supprimer les index en double
DROP INDEX IF EXISTS idx_stores_slug;
DROP INDEX IF EXISTS idx_stores_slug_active;

-- Créer un seul index unique optimisé
CREATE UNIQUE INDEX idx_stores_slug_unique 
ON public.stores(slug) 
WHERE status = 'active';

-- Garder l'index composite pour les requêtes
-- (il existe déjà : idx_stores_status_slug)

-- =====================================================
-- 6. VÉRIFIER QUE LE TRIGGER EST CRÉÉ
-- =====================================================

SELECT 
    'Vérification trigger' as check_type,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'stores'
  AND event_object_schema = 'public'
  AND trigger_name = 'generate_store_slug_trigger';

-- =====================================================
-- 7. TESTER LE SYSTÈME
-- =====================================================

-- Vérifier l'état actuel des boutiques
SELECT 
    'État actuel' as check_type,
    COUNT(*) as total_stores,
    COUNT(CASE WHEN slug IS NOT NULL AND slug != '' THEN 1 END) as stores_with_slug,
    COUNT(CASE WHEN slug IS NULL OR slug = '' THEN 1 END) as stores_without_slug
FROM public.stores
WHERE status = 'active';

-- =====================================================
-- 8. CORRIGER LES BOUTIQUES SANS SLUG
-- =====================================================

-- Mettre à jour les boutiques qui n'ont pas de slug
UPDATE public.stores 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(TRIM(name), '[^a-zA-Z0-9\s]+', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Nettoyer les slugs (supprimer les tirets en début/fin)
UPDATE public.stores 
SET slug = TRIM(slug, '-')
WHERE slug LIKE '-%' OR slug LIKE '%-';

-- Gérer les slugs vides
UPDATE public.stores 
SET slug = 'boutique-' || EXTRACT(EPOCH FROM created_at)::INTEGER
WHERE slug = '' OR slug IS NULL;

-- =====================================================
-- 9. VÉRIFIER LES DOUBLONS
-- =====================================================

-- Trouver les slugs en double
SELECT 
    'Slugs en double' as check_type,
    slug,
    COUNT(*) as count,
    STRING_AGG(name, ', ') as store_names
FROM public.stores 
WHERE status = 'active' 
  AND slug IS NOT NULL
GROUP BY slug 
HAVING COUNT(*) > 1;

-- =====================================================
-- 10. CORRIGER LES DOUBLONS
-- =====================================================

-- Corriger les slugs en double en ajoutant un suffixe
WITH duplicate_slugs AS (
    SELECT slug, COUNT(*) as count
    FROM public.stores 
    WHERE status = 'active' 
      AND slug IS NOT NULL
    GROUP BY slug 
    HAVING COUNT(*) > 1
),
stores_to_update AS (
    SELECT s.id, s.slug, s.name, ROW_NUMBER() OVER (PARTITION BY s.slug ORDER BY s.created_at) as rn
    FROM public.stores s
    JOIN duplicate_slugs d ON s.slug = d.slug
    WHERE s.status = 'active'
)
UPDATE public.stores 
SET slug = slug || '-' || (rn - 1)
FROM stores_to_update
WHERE stores.id = stores_to_update.id AND stores_to_update.rn > 1;

-- =====================================================
-- 11. VÉRIFICATION FINALE
-- =====================================================

-- Vérifier que tous les slugs sont uniques
SELECT 
    'Vérification finale' as check_type,
    COUNT(*) as total_stores,
    COUNT(DISTINCT slug) as unique_slugs,
    CASE 
        WHEN COUNT(*) = COUNT(DISTINCT slug) THEN '✅ Tous les slugs sont uniques'
        ELSE '❌ Il y a encore des doublons'
    END as status
FROM public.stores
WHERE status = 'active' AND slug IS NOT NULL;

-- =====================================================
-- 12. RÉSUMÉ
-- =====================================================

SELECT 
    'Résumé' as check_type,
    'Triggers de slug optimisés et conflits résolus' as message,
    NOW() as timestamp;
