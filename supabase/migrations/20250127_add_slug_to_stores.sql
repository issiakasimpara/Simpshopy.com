-- Migration pour ajouter le champ slug à la table stores
-- Créé le 27 janvier 2025

-- Ajouter le champ slug à la table stores
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Créer un index pour le slug
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);

-- Créer une contrainte unique pour le slug
ALTER TABLE public.stores 
ADD CONSTRAINT stores_slug_unique UNIQUE (slug);

-- Fonction pour générer automatiquement le slug
CREATE OR REPLACE FUNCTION generate_store_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Générer le slug à partir du nom de la boutique
  NEW.slug = LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9\s]', '', 'g'));
  NEW.slug = REGEXP_REPLACE(NEW.slug, '\s+', '-', 'g');
  NEW.slug = TRIM(BOTH '-' FROM NEW.slug);
  
  -- S'assurer que le slug n'est pas vide
  IF NEW.slug = '' THEN
    NEW.slug = 'boutique-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour générer automatiquement le slug
DROP TRIGGER IF EXISTS generate_store_slug_trigger ON public.stores;
CREATE TRIGGER generate_store_slug_trigger
  BEFORE INSERT OR UPDATE ON public.stores
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_store_slug();

-- Mettre à jour les boutiques existantes avec des slugs
UPDATE public.stores 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'))
WHERE slug IS NULL OR slug = '';

UPDATE public.stores 
SET slug = REGEXP_REPLACE(slug, '\s+', '-', 'g')
WHERE slug IS NOT NULL;

UPDATE public.stores 
SET slug = TRIM(BOTH '-' FROM slug)
WHERE slug IS NOT NULL;

-- S'assurer qu'il n'y a pas de slugs vides
UPDATE public.stores 
SET slug = 'boutique-' || id::TEXT
WHERE slug = '' OR slug IS NULL; 