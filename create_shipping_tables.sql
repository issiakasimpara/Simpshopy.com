-- Script SQL pour créer les tables de livraisons
-- À exécuter dans Supabase SQL Editor

-- 1. Créer la table shipping_zones (zones de livraison)
CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  countries TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Créer la table shipping_methods (méthodes de livraison)
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  shipping_zone_id UUID REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT '🚚',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  free_shipping_threshold DECIMAL(10,2),
  estimated_days VARCHAR(50) DEFAULT '3-5 jours',
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

-- 4. Créer les triggers pour updated_at
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

-- 5. Activer RLS
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

-- 6. Politiques pour shipping_zones
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

-- 7. Politiques pour shipping_methods
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
