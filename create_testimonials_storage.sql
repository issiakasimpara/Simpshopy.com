-- Script pour créer le storage bucket pour les images de témoignages
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer le bucket pour les images de témoignages
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'testimonials',
  'testimonials',
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 2. Politique pour permettre l'upload d'images (lecture publique)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'testimonials');

-- 3. Politique pour permettre l'upload d'images (écriture pour tous)
CREATE POLICY "Anyone can upload testimonial images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'testimonials');

-- 4. Politique pour permettre la suppression (optionnel - pour les admins)
CREATE POLICY "Authenticated users can delete testimonial images" ON storage.objects FOR DELETE USING (bucket_id = 'testimonials' AND auth.role() = 'authenticated');

-- 5. Vérifier que le bucket a été créé
SELECT * FROM storage.buckets WHERE id = 'testimonials';
