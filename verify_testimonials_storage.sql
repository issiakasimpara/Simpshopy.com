-- Script de vérification et création du storage pour les témoignages
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier si le bucket existe déjà
SELECT * FROM storage.buckets WHERE id = 'testimonials';

-- 2. Si le bucket n'existe pas, le créer
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'testimonials',
  'testimonials',
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 3. Vérifier les politiques existantes
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%testimonial%';

-- 4. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload testimonial images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete testimonial images" ON storage.objects;

-- 5. Créer les nouvelles politiques
CREATE POLICY "Testimonials: Public read access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'testimonials');

CREATE POLICY "Testimonials: Anyone can upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'testimonials');

CREATE POLICY "Testimonials: Anyone can update their uploads" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'testimonials');

CREATE POLICY "Testimonials: Anyone can delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'testimonials');

-- 6. Vérification finale
SELECT 
  b.id as bucket_id,
  b.name as bucket_name,
  b.public,
  b.file_size_limit,
  b.allowed_mime_types
FROM storage.buckets b 
WHERE b.id = 'testimonials';

-- 7. Vérifier les politiques créées
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%Testimonials%';
