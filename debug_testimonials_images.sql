-- Script de debug pour vérifier les images dans les témoignages
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier la structure de la table testimonials
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'testimonials' 
ORDER BY ordinal_position;

-- 2. Vérifier s'il y a des témoignages avec des images
SELECT 
  id,
  customer_name,
  content,
  images,
  array_length(images, 1) as nb_images,
  created_at
FROM testimonials 
WHERE images IS NOT NULL 
AND array_length(images, 1) > 0
ORDER BY created_at DESC
LIMIT 10;

-- 3. Compter les témoignages avec et sans images
SELECT 
  CASE 
    WHEN images IS NULL OR array_length(images, 1) = 0 THEN 'Sans images'
    ELSE 'Avec images'
  END as type_testimonial,
  COUNT(*) as nombre
FROM testimonials 
GROUP BY 
  CASE 
    WHEN images IS NULL OR array_length(images, 1) = 0 THEN 'Sans images'
    ELSE 'Avec images'
  END;

-- 4. Voir tous les témoignages récents (avec ou sans images)
SELECT 
  id,
  customer_name,
  content,
  images,
  is_approved,
  created_at
FROM testimonials 
ORDER BY created_at DESC
LIMIT 5;
