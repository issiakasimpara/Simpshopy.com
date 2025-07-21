-- Script à exécuter dans Supabase SQL Editor
-- Ajouter les informations de livraison à la table public_orders

-- Ajouter les colonnes pour les informations de livraison
ALTER TABLE public.public_orders 
ADD COLUMN IF NOT EXISTS shipping_method JSONB,
ADD COLUMN IF NOT EXISTS shipping_country TEXT,
ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(10,2) DEFAULT 0;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_public_orders_shipping_country ON public.public_orders(shipping_country);
CREATE INDEX IF NOT EXISTS idx_public_orders_shipping_cost ON public.public_orders(shipping_cost);

-- Commentaires pour documenter les nouvelles colonnes
COMMENT ON COLUMN public.public_orders.shipping_method IS 'Informations sur la méthode de livraison sélectionnée (JSON: {id, name, delivery_time, price})';
COMMENT ON COLUMN public.public_orders.shipping_country IS 'Code pays de livraison (ex: ML, SN, CI)';
COMMENT ON COLUMN public.public_orders.shipping_cost IS 'Coût de livraison en CFA';

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'public_orders' 
AND column_name IN ('shipping_method', 'shipping_country', 'shipping_cost')
ORDER BY column_name;
