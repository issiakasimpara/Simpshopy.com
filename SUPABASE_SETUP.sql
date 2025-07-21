-- ========================================
-- SCRIPT SQL POUR CRÉER LES TABLES MARKETS & SHIPPING
-- À exécuter dans l'éditeur SQL de Supabase
-- ========================================

-- 1. Créer la table market_settings
CREATE TABLE IF NOT EXISTS public.market_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    enabled_countries TEXT[] NOT NULL DEFAULT '{}',
    default_currency TEXT NOT NULL DEFAULT 'XOF',
    tax_settings JSONB DEFAULT '{"includeTax": false, "taxRate": 0, "taxLabel": "TVA"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id)
);

-- 2. Créer la table shipping_methods
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

-- 3. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_market_settings_store_id ON public.market_settings(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_store_id ON public.shipping_methods(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_active ON public.shipping_methods(is_active);

-- 4. Activer RLS (Row Level Security)
ALTER TABLE public.market_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques RLS pour market_settings
DROP POLICY IF EXISTS "Users can manage their store market settings" ON public.market_settings;
CREATE POLICY "Users can manage their store market settings" ON public.market_settings
FOR ALL USING (
    store_id IN (
        SELECT id FROM public.stores 
        WHERE user_id = auth.uid()
    )
);

-- 6. Créer les politiques RLS pour shipping_methods
DROP POLICY IF EXISTS "Users can manage their store shipping methods" ON public.shipping_methods;
CREATE POLICY "Users can manage their store shipping methods" ON public.shipping_methods
FOR ALL USING (
    store_id IN (
        SELECT id FROM public.stores 
        WHERE user_id = auth.uid()
    )
);

-- 7. Politique pour permettre la lecture publique des méthodes de livraison actives
DROP POLICY IF EXISTS "Public can read active shipping methods" ON public.shipping_methods;
CREATE POLICY "Public can read active shipping methods" ON public.shipping_methods
FOR SELECT USING (is_active = true);

-- 8. Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Triggers pour updated_at
DROP TRIGGER IF EXISTS update_market_settings_updated_at ON public.market_settings;
CREATE TRIGGER update_market_settings_updated_at
    BEFORE UPDATE ON public.market_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipping_methods_updated_at ON public.shipping_methods;
CREATE TRIGGER update_shipping_methods_updated_at
    BEFORE UPDATE ON public.shipping_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Insérer des données de test (optionnel)
-- Remplacez 'YOUR_STORE_ID' par l'ID réel de votre boutique
/*
INSERT INTO public.market_settings (store_id, enabled_countries, default_currency, tax_settings)
VALUES (
    'YOUR_STORE_ID',
    ARRAY['BF', 'CI', 'SN'],
    'XOF',
    '{"includeTax": false, "taxRate": 0, "taxLabel": "TVA"}'::jsonb
) ON CONFLICT (store_id) DO NOTHING;

INSERT INTO public.shipping_methods (store_id, name, description, price, estimated_days, icon, is_active, available_countries)
VALUES 
    ('YOUR_STORE_ID', 'Livraison standard', 'Livraison par transporteur local', 2500, '3-7 jours', '📦', true, ARRAY['BF', 'CI', 'SN']),
    ('YOUR_STORE_ID', 'Livraison express', 'Livraison rapide en 24-48h', 5000, '1-2 jours', '⚡', true, ARRAY['BF', 'CI', 'SN']),
    ('YOUR_STORE_ID', 'Retrait en magasin', 'Récupération directe en boutique', 0, 'Immédiat', '🏪', true, ARRAY['BF', 'CI', 'SN']);
*/
