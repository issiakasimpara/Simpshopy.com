-- Script SQL simple pour créer les tables Markets & Shipping
-- À copier-coller dans l'éditeur SQL de Supabase

-- 1. TABLE MARKETS (Zones de vente)
CREATE TABLE IF NOT EXISTS public.markets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    countries TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLE SHIPPING_METHODS (Méthodes de livraison)
CREATE TABLE IF NOT EXISTS public.shipping_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    market_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    estimated_min_days INTEGER DEFAULT 1,
    estimated_max_days INTEGER DEFAULT 7,
    is_active BOOLEAN DEFAULT TRUE,
    conditions JSONB DEFAULT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INDEXES pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_markets_store_id ON public.markets(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_store_id ON public.shipping_methods(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_market_id ON public.shipping_methods(market_id);

-- 4. Ajouter les contraintes de clés étrangères si les tables stores existent
DO $$
BEGIN
    -- Vérifier si la table stores existe avant d'ajouter la contrainte
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stores' AND table_schema = 'public') THEN
        -- Ajouter la contrainte pour markets
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'markets_store_id_fkey') THEN
            ALTER TABLE public.markets ADD CONSTRAINT markets_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
        END IF;
        
        -- Ajouter la contrainte pour shipping_methods
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'shipping_methods_store_id_fkey') THEN
            ALTER TABLE public.shipping_methods ADD CONSTRAINT shipping_methods_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Ajouter la contrainte entre shipping_methods et markets
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'shipping_methods_market_id_fkey') THEN
        ALTER TABLE public.shipping_methods ADD CONSTRAINT shipping_methods_market_id_fkey FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Activer RLS (Row Level Security) - optionnel
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

-- 6. Politiques RLS basiques (permettre tout pour commencer)
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.markets;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.shipping_methods;

CREATE POLICY "Enable all for authenticated users" ON public.markets FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all for authenticated users" ON public.shipping_methods FOR ALL USING (auth.uid() IS NOT NULL);

-- 7. Fonction utilitaire pour récupérer les méthodes de livraison disponibles
CREATE OR REPLACE FUNCTION get_available_shipping_methods(
    p_store_id UUID,
    p_country TEXT
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10,2),
    estimated_min_days INTEGER,
    estimated_max_days INTEGER,
    estimated_days TEXT,
    market_name VARCHAR(255)
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sm.id,
        sm.name,
        sm.description,
        sm.price,
        sm.estimated_min_days,
        sm.estimated_max_days,
        CASE 
            WHEN sm.estimated_min_days = sm.estimated_max_days THEN 
                sm.estimated_min_days::TEXT || ' jour' || CASE WHEN sm.estimated_min_days > 1 THEN 's' ELSE '' END
            ELSE 
                sm.estimated_min_days::TEXT || '-' || sm.estimated_max_days::TEXT || ' jours'
        END as estimated_days,
        m.name as market_name
    FROM public.shipping_methods sm
    JOIN public.markets m ON sm.market_id = m.id
    WHERE sm.store_id = p_store_id
      AND sm.is_active = TRUE
      AND m.is_active = TRUE
      AND p_country = ANY(m.countries)
    ORDER BY sm.sort_order, sm.price;
END;
$$;
