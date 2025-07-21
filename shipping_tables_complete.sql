-- Script SQL complet pour créer les tables de livraisons
-- À copier-coller dans Supabase SQL Editor et exécuter

-- 1. Créer la table shipping_zones (zones de livraison)
CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  countries TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Créer la table shipping_methods (méthodes de livraison)
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL,
  shipping_zone_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🚚',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  free_shipping_threshold NUMERIC(10,2),
  estimated_days TEXT DEFAULT '3-5 jours',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_shipping_zones_store_id ON public.shipping_zones(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_active ON public.shipping_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_store_id ON public.shipping_methods(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_zone_id ON public.shipping_methods(shipping_zone_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_active ON public.shipping_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_sort ON public.shipping_methods(sort_order);

-- 4. Créer les triggers pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_shipping_zones_updated_at ON public.shipping_zones;
CREATE TRIGGER update_shipping_zones_updated_at
  BEFORE UPDATE ON public.shipping_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipping_methods_updated_at ON public.shipping_methods;
CREATE TRIGGER update_shipping_methods_updated_at
  BEFORE UPDATE ON public.shipping_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Activer RLS (Row Level Security)
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

-- 6. Créer les politiques RLS pour shipping_zones
DROP POLICY IF EXISTS "Users can view shipping zones for their stores" ON public.shipping_zones;
CREATE POLICY "Users can view shipping zones for their stores" ON public.shipping_zones
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM public.stores WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert shipping zones for their stores" ON public.shipping_zones;
CREATE POLICY "Users can insert shipping zones for their stores" ON public.shipping_zones
  FOR INSERT WITH CHECK (
    store_id IN (
      SELECT id FROM public.stores WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update shipping zones for their stores" ON public.shipping_zones;
CREATE POLICY "Users can update shipping zones for their stores" ON public.shipping_zones
  FOR UPDATE USING (
    store_id IN (
      SELECT id FROM public.stores WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete shipping zones for their stores" ON public.shipping_zones;
CREATE POLICY "Users can delete shipping zones for their stores" ON public.shipping_zones
  FOR DELETE USING (
    store_id IN (
      SELECT id FROM public.stores WHERE user_id = auth.uid()
    )
  );

-- 7. Créer les politiques RLS pour shipping_methods
DROP POLICY IF EXISTS "Users can view shipping methods for their stores" ON public.shipping_methods;
CREATE POLICY "Users can view shipping methods for their stores" ON public.shipping_methods
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM public.stores WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert shipping methods for their stores" ON public.shipping_methods;
CREATE POLICY "Users can insert shipping methods for their stores" ON public.shipping_methods
  FOR INSERT WITH CHECK (
    store_id IN (
      SELECT id FROM public.stores WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update shipping methods for their stores" ON public.shipping_methods;
CREATE POLICY "Users can update shipping methods for their stores" ON public.shipping_methods
  FOR UPDATE USING (
    store_id IN (
      SELECT id FROM public.stores WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete shipping methods for their stores" ON public.shipping_methods;
CREATE POLICY "Users can delete shipping methods for their stores" ON public.shipping_methods
  FOR DELETE USING (
    store_id IN (
      SELECT id FROM public.stores WHERE user_id = auth.uid()
    )
  );

-- 8. Ajouter les contraintes de clés étrangères (optionnel)
-- Décommentez ces lignes si vous voulez des contraintes strictes
/*
ALTER TABLE public.shipping_zones 
ADD CONSTRAINT fk_shipping_zones_store_id 
FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;

ALTER TABLE public.shipping_methods 
ADD CONSTRAINT fk_shipping_methods_store_id 
FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;

ALTER TABLE public.shipping_methods 
ADD CONSTRAINT fk_shipping_methods_zone_id 
FOREIGN KEY (shipping_zone_id) REFERENCES public.shipping_zones(id) ON DELETE CASCADE;
*/

-- 9. Insérer des données de test (remplacez YOUR_STORE_ID par votre vrai Store ID)
/*
-- Exemple de zone de test
INSERT INTO public.shipping_zones (store_id, name, description, countries, is_active) VALUES
('YOUR_STORE_ID', 'Afrique de l''Ouest', 'Zone de livraison pour l''Afrique de l''Ouest francophone', 
 ARRAY['Sénégal', 'Mali', 'Burkina Faso', 'Côte d''Ivoire', 'Niger', 'Guinée', 'Bénin', 'Togo'], true);

-- Exemple de méthodes de test
INSERT INTO public.shipping_methods (store_id, name, description, icon, price, free_shipping_threshold, estimated_days, is_active, sort_order) VALUES
('YOUR_STORE_ID', 'Livraison Standard', 'Livraison standard en 3-5 jours', '📦', 2500.00, 50000.00, '3-5 jours ouvrables', true, 1),
('YOUR_STORE_ID', 'Livraison Express', 'Livraison rapide en 24-48h', '⚡', 5000.00, NULL, '1-2 jours ouvrables', true, 2),
('YOUR_STORE_ID', 'Retrait en magasin', 'Récupération directe en magasin', '🏪', 0.00, NULL, 'Immédiat', true, 3);
*/
