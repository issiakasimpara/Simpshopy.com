-- Script SQL pour créer les tables de livraisons
-- À exécuter dans Supabase SQL Editor AVANT d'importer les CSV

-- 1. Créer la table shipping_zones
CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  countries TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Créer la table shipping_methods
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL,
  shipping_zone_id UUID,
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
