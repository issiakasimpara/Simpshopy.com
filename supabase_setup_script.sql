-- Script de création des tables Markets & Shipping pour MalibaShopy
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer la table pour les paramètres de marché
CREATE TABLE IF NOT EXISTS public.market_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  enabled_countries TEXT[] NOT NULL DEFAULT '{}',
  default_currency TEXT NOT NULL DEFAULT 'XOF',
  tax_settings JSONB DEFAULT '{
    "includeTax": false,
    "taxRate": 0,
    "taxLabel": "TVA"
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id)
);

-- Créer la table pour les méthodes de livraison
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  estimated_days TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📦',
  is_active BOOLEAN NOT NULL DEFAULT true,
  available_countries TEXT[] DEFAULT '{}',
  conditions JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_market_settings_store_id ON public.market_settings(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_store_id ON public.shipping_methods(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_active ON public.shipping_methods(store_id, is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_available_countries ON public.shipping_methods USING GIN (available_countries);

-- Activer RLS (Row Level Security)
ALTER TABLE public.market_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can manage their own market settings" ON public.market_settings;
DROP POLICY IF EXISTS "Users can manage their own shipping methods" ON public.shipping_methods;
DROP POLICY IF EXISTS "Anyone can view active shipping methods" ON public.shipping_methods;

-- Créer les politiques RLS pour market_settings
CREATE POLICY "Users can manage their own market settings" ON public.market_settings
  FOR ALL USING (
    store_id IN (
      SELECT id FROM public.stores WHERE merchant_id = auth.uid()
    )
  );

-- Créer les politiques RLS pour shipping_methods (pour les admins)
CREATE POLICY "Users can manage their own shipping methods" ON public.shipping_methods
  FOR ALL USING (
    store_id IN (
      SELECT id FROM public.stores WHERE merchant_id = auth.uid()
    )
  );

-- Politique pour permettre aux clients de voir les méthodes de livraison actives (sans authentification)
CREATE POLICY "Anyone can view active shipping methods" ON public.shipping_methods
  FOR SELECT USING (is_active = true);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer les triggers pour updated_at
DROP TRIGGER IF EXISTS update_market_settings_updated_at ON public.market_settings;
CREATE TRIGGER update_market_settings_updated_at 
  BEFORE UPDATE ON public.market_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipping_methods_updated_at ON public.shipping_methods;
CREATE TRIGGER update_shipping_methods_updated_at 
  BEFORE UPDATE ON public.shipping_methods 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Message de confirmation
SELECT 'Tables market_settings et shipping_methods créées avec succès!' as message;
