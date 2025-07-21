-- ========================================
-- SCRIPT SQL POUR CRÉER LES TABLES DE LIVRAISONS
-- À copier-coller dans Supabase SQL Editor et EXÉCUTER
-- ========================================

-- 1. CRÉER LA TABLE shipping_zones
CREATE TABLE IF NOT EXISTS public.shipping_zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    countries TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. CRÉER LA TABLE shipping_methods
CREATE TABLE IF NOT EXISTS public.shipping_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    shipping_zone_id UUID REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '🚚',
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    free_shipping_threshold DECIMAL(10,2),
    estimated_days TEXT DEFAULT '3-5 jours',
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. CRÉER LES INDEX POUR LES PERFORMANCES
CREATE INDEX IF NOT EXISTS idx_shipping_zones_store_id ON public.shipping_zones(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_store_id ON public.shipping_methods(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_zone_id ON public.shipping_methods(shipping_zone_id);

-- 4. ACTIVER RLS (Row Level Security)
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

-- 5. CRÉER LES POLITIQUES RLS
DROP POLICY IF EXISTS "Allow all operations on shipping_zones" ON public.shipping_zones;
CREATE POLICY "Allow all operations on shipping_zones" ON public.shipping_zones
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on shipping_methods" ON public.shipping_methods;
CREATE POLICY "Allow all operations on shipping_methods" ON public.shipping_methods
FOR ALL USING (true) WITH CHECK (true);

-- 6. DONNER LES PERMISSIONS
GRANT ALL ON public.shipping_zones TO anon, authenticated;
GRANT ALL ON public.shipping_methods TO anon, authenticated;

-- 7. INSÉRER DES DONNÉES DE TEST
DO $$
DECLARE
    first_store_id UUID;
    zone_ouest_id UUID;
    zone_centrale_id UUID;
BEGIN
    -- Récupérer le premier store
    SELECT id INTO first_store_id FROM public.stores LIMIT 1;
    
    IF first_store_id IS NOT NULL THEN
        -- Supprimer les anciennes données
        DELETE FROM public.shipping_methods WHERE store_id = first_store_id;
        DELETE FROM public.shipping_zones WHERE store_id = first_store_id;
        
        -- Créer les zones
        INSERT INTO public.shipping_zones (store_id, name, countries) VALUES
        (first_store_id, 'Afrique de l''Ouest', ARRAY['Mali', 'Burkina Faso', 'Sénégal', 'Côte d''Ivoire', 'Niger', 'Guinée', 'Bénin', 'Togo'])
        RETURNING id INTO zone_ouest_id;
        
        INSERT INTO public.shipping_zones (store_id, name, countries) VALUES
        (first_store_id, 'Afrique Centrale', ARRAY['Cameroun', 'Tchad', 'République centrafricaine', 'Gabon', 'République du Congo'])
        RETURNING id INTO zone_centrale_id;
        
        -- Créer les méthodes pour l'Afrique de l'Ouest
        INSERT INTO public.shipping_methods (store_id, shipping_zone_id, name, description, price, estimated_days, sort_order) VALUES
        (first_store_id, zone_ouest_id, 'Livraison Standard', 'Livraison standard en 3-5 jours ouvrables', 2500, '3-5 jours ouvrables', 1),
        (first_store_id, zone_ouest_id, 'Livraison Express', 'Livraison rapide en 24-48h', 5000, '1-2 jours ouvrables', 2),
        (first_store_id, zone_ouest_id, 'Livraison Gratuite', 'Livraison gratuite (commandes +50k CFA)', 0, '5-7 jours ouvrables', 3);
        
        -- Créer les méthodes pour l'Afrique Centrale
        INSERT INTO public.shipping_methods (store_id, shipping_zone_id, name, description, price, estimated_days, sort_order) VALUES
        (first_store_id, zone_centrale_id, 'Livraison Standard Centrale', 'Livraison en Afrique Centrale', 3500, '5-7 jours ouvrables', 1),
        (first_store_id, zone_centrale_id, 'Livraison Express Centrale', 'Livraison rapide en Afrique Centrale', 6000, '2-3 jours ouvrables', 2);
        
        -- Retrait en magasin (sans zone)
        INSERT INTO public.shipping_methods (store_id, shipping_zone_id, name, description, price, estimated_days, sort_order) VALUES
        (first_store_id, NULL, 'Retrait en magasin', 'Récupérez votre commande directement en magasin', 0, 'Immédiat', 0);
        
        RAISE NOTICE 'Tables et données de test créées avec succès pour le store: %', first_store_id;
    ELSE
        RAISE NOTICE 'Aucun store trouvé. Créez d''abord une boutique.';
    END IF;
END $$;
