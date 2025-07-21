-- Script pour diagnostiquer et corriger la table markets
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier si la table markets existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'markets' 
ORDER BY ordinal_position;

-- 2. Créer la table markets si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.markets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    countries TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte unique pour éviter les doublons
    UNIQUE(store_id, name)
);

-- 3. Créer la table shipping_methods si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.shipping_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    estimated_min_days INTEGER NOT NULL DEFAULT 1,
    estimated_max_days INTEGER NOT NULL DEFAULT 7,
    is_active BOOLEAN DEFAULT TRUE,
    conditions JSONB DEFAULT '{}'::jsonb,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte unique pour éviter les doublons
    UNIQUE(market_id, name)
);

-- 4. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_markets_store_id ON public.markets(store_id);
CREATE INDEX IF NOT EXISTS idx_markets_active ON public.markets(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_store_id ON public.shipping_methods(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_market_id ON public.shipping_methods(market_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_active ON public.shipping_methods(is_active);

-- 5. Activer RLS (Row Level Security)
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

-- 6. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view markets of their stores" ON public.markets;
DROP POLICY IF EXISTS "Users can manage markets of their stores" ON public.markets;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.markets;
DROP POLICY IF EXISTS "Users can view shipping methods of their stores" ON public.shipping_methods;
DROP POLICY IF EXISTS "Users can manage shipping methods of their stores" ON public.shipping_methods;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.shipping_methods;

-- 7. Créer les nouvelles politiques RLS pour markets
CREATE POLICY "markets_select_policy" ON public.markets
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

CREATE POLICY "markets_insert_policy" ON public.markets
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

CREATE POLICY "markets_update_policy" ON public.markets
    FOR UPDATE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

CREATE POLICY "markets_delete_policy" ON public.markets
    FOR DELETE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

-- 8. Créer les politiques RLS pour shipping_methods
CREATE POLICY "shipping_methods_select_policy" ON public.shipping_methods
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

CREATE POLICY "shipping_methods_insert_policy" ON public.shipping_methods
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

CREATE POLICY "shipping_methods_update_policy" ON public.shipping_methods
    FOR UPDATE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

CREATE POLICY "shipping_methods_delete_policy" ON public.shipping_methods
    FOR DELETE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

-- 9. Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_markets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_shipping_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Triggers pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_markets_updated_at_trigger ON public.markets;
CREATE TRIGGER update_markets_updated_at_trigger
    BEFORE UPDATE ON public.markets
    FOR EACH ROW
    EXECUTE FUNCTION update_markets_updated_at();

DROP TRIGGER IF EXISTS update_shipping_methods_updated_at_trigger ON public.shipping_methods;
CREATE TRIGGER update_shipping_methods_updated_at_trigger
    BEFORE UPDATE ON public.shipping_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_shipping_methods_updated_at();

-- 11. Vérification finale
SELECT 'Tables créées avec succès!' as status;

-- Vérifier les politiques
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('markets', 'shipping_methods')
ORDER BY tablename, policyname;
