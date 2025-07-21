-- Script pour ajouter les images aux témoignages
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Ajouter la colonne pour les images des témoignages
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- 2. Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.testimonials.images IS 'URLs des images jointes au témoignage (maximum 3 images)';

-- 3. Créer un index pour améliorer les performances si nécessaire
CREATE INDEX IF NOT EXISTS idx_testimonials_with_images ON public.testimonials(id) WHERE images IS NOT NULL AND array_length(images, 1) > 0;

-- 4. Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'testimonials' 
AND column_name = 'images';
