-- Script pour ajouter le champ customer_image à la table testimonials
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter la colonne customer_image
ALTER TABLE public.testimonials 
ADD COLUMN customer_image TEXT;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.testimonials.customer_image IS 'URL de l''image/avatar du client (optionnel)';
