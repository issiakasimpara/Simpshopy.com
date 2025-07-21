-- Script pour créer la table testimonials directement dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer la table testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.public_orders(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Créer les index
CREATE INDEX IF NOT EXISTS idx_testimonials_store_id ON public.testimonials(store_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON public.testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON public.testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_testimonials_product_id ON public.testimonials(product_id);

-- 3. Activer RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques de sécurité

-- Les clients peuvent créer des témoignages
CREATE POLICY "Anyone can create testimonials" 
ON public.testimonials 
FOR INSERT 
WITH CHECK (true);

-- Les clients peuvent voir les témoignages approuvés
CREATE POLICY "Anyone can view approved testimonials" 
ON public.testimonials 
FOR SELECT 
USING (is_approved = true);

-- Les propriétaires de boutique peuvent gérer leurs témoignages
CREATE POLICY "Store owners can manage their testimonials" 
ON public.testimonials 
FOR ALL 
USING (store_id IN (
    SELECT stores.id 
    FROM stores 
    WHERE stores.merchant_id IN (
        SELECT profiles.id 
        FROM profiles 
        WHERE profiles.user_id = auth.uid()
    )
));

-- 5. Créer le trigger pour updated_at (si la fonction existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_testimonials_updated_at 
    BEFORE UPDATE ON public.testimonials 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. Fonctions utilitaires
CREATE OR REPLACE FUNCTION get_store_average_rating(store_uuid UUID)
RETURNS NUMERIC AS $$
BEGIN
    RETURN (
        SELECT ROUND(AVG(rating), 1)
        FROM public.testimonials 
        WHERE store_id = store_uuid 
        AND is_approved = true
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_store_testimonials_count(store_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.testimonials 
        WHERE store_id = store_uuid 
        AND is_approved = true
    );
END;
$$ LANGUAGE plpgsql;

-- 7. Insérer quelques témoignages de test (optionnel)
-- Remplacez 'YOUR_STORE_ID' par un vrai ID de boutique
/*
INSERT INTO public.testimonials (store_id, customer_name, customer_email, rating, title, content, is_approved, is_featured) VALUES
('YOUR_STORE_ID', 'Marie Dupont', 'marie@example.com', 5, 'Excellent service !', 'Très satisfaite de mon achat, livraison rapide et produit de qualité.', true, true),
('YOUR_STORE_ID', 'Jean Martin', 'jean@example.com', 4, 'Bon produit', 'Conforme à la description, je recommande.', true, false),
('YOUR_STORE_ID', 'Sophie Bernard', 'sophie@example.com', 5, 'Parfait !', 'Rien à redire, je reviendrai !', true, false);
*/
