-- ========================================
-- SCRIPT DE RÉPARATION COMPLÈTE DE LA BASE DE DONNÉES
-- À exécuter dans l'éditeur SQL de Supabase
-- ========================================

-- 1. CRÉER LA TABLE DES PAYS AFRICAINS FRANCOPHONES
CREATE TABLE IF NOT EXISTS public.african_countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name_fr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    flag TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'XOF',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INSÉRER LES 24 PAYS AFRICAINS FRANCOPHONES
INSERT INTO public.african_countries (code, name_fr, name_en, flag, currency) VALUES
('BF', 'Burkina Faso', 'Burkina Faso', '🇧🇫', 'XOF'),
('BJ', 'Bénin', 'Benin', '🇧🇯', 'XOF'),
('CI', 'Côte d''Ivoire', 'Ivory Coast', '🇨🇮', 'XOF'),
('ML', 'Mali', 'Mali', '🇲🇱', 'XOF'),
('NE', 'Niger', 'Niger', '🇳🇪', 'XOF'),
('SN', 'Sénégal', 'Senegal', '🇸🇳', 'XOF'),
('TG', 'Togo', 'Togo', '🇹🇬', 'XOF'),
('GW', 'Guinée-Bissau', 'Guinea-Bissau', '🇬🇼', 'XOF'),
('CM', 'Cameroun', 'Cameroon', '🇨🇲', 'XAF'),
('CF', 'République Centrafricaine', 'Central African Republic', '🇨🇫', 'XAF'),
('TD', 'Tchad', 'Chad', '🇹🇩', 'XAF'),
('CG', 'République du Congo', 'Republic of the Congo', '🇨🇬', 'XAF'),
('GA', 'Gabon', 'Gabon', '🇬🇦', 'XAF'),
('GQ', 'Guinée Équatoriale', 'Equatorial Guinea', '🇬🇶', 'XAF'),
('CD', 'République Démocratique du Congo', 'Democratic Republic of the Congo', '🇨🇩', 'CDF'),
('DJ', 'Djibouti', 'Djibouti', '🇩🇯', 'DJF'),
('KM', 'Comores', 'Comoros', '🇰🇲', 'KMF'),
('MG', 'Madagascar', 'Madagascar', '🇲🇬', 'MGA'),
('MU', 'Maurice', 'Mauritius', '🇲🇺', 'MUR'),
('SC', 'Seychelles', 'Seychelles', '🇸🇨', 'SCR'),
('DZ', 'Algérie', 'Algeria', '🇩🇿', 'DZD'),
('MA', 'Maroc', 'Morocco', '🇲🇦', 'MAD'),
('TN', 'Tunisie', 'Tunisia', '🇹🇳', 'TND'),
('MR', 'Mauritanie', 'Mauritania', '🇲🇷', 'MRU')
ON CONFLICT (code) DO NOTHING;

-- 3. CRÉER LA TABLE MARKET_SETTINGS
CREATE TABLE IF NOT EXISTS public.market_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    enabled_countries TEXT[] NOT NULL DEFAULT '{}',
    default_currency TEXT NOT NULL DEFAULT 'XOF',
    tax_settings JSONB DEFAULT '{"includeTax": false, "taxRate": 0, "taxLabel": "TVA"}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id)
);

-- 4. CRÉER LA TABLE SHIPPING_METHODS
CREATE TABLE IF NOT EXISTS public.shipping_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    estimated_days TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '📦',
    is_active BOOLEAN NOT NULL DEFAULT true,
    available_countries TEXT[] DEFAULT '{}',
    conditions JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CRÉER LA TABLE SHIPPING_ZONES
CREATE TABLE IF NOT EXISTS public.shipping_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    name TEXT NOT NULL,
    countries TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FONCTION POUR METTRE À JOUR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. CRÉER LES TRIGGERS
CREATE TRIGGER update_market_settings_updated_at 
  BEFORE UPDATE ON public.market_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_methods_updated_at 
  BEFORE UPDATE ON public.shipping_methods 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_zones_updated_at 
  BEFORE UPDATE ON public.shipping_zones 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. DÉSACTIVER RLS (Row Level Security) POUR LES TESTS
ALTER TABLE public.african_countries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones DISABLE ROW LEVEL SECURITY;

-- 9. CRÉER DES INDEX POUR LES PERFORMANCES
CREATE INDEX IF NOT EXISTS idx_market_settings_store_id ON public.market_settings(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_store_id ON public.shipping_methods(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_active ON public.shipping_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_store_id ON public.shipping_zones(store_id);
CREATE INDEX IF NOT EXISTS idx_african_countries_code ON public.african_countries(code);
CREATE INDEX IF NOT EXISTS idx_african_countries_active ON public.african_countries(is_active);

-- 10. VÉRIFICATION FINALE
SELECT 'african_countries' as table_name, count(*) as row_count FROM public.african_countries
UNION ALL
SELECT 'market_settings' as table_name, count(*) as row_count FROM public.market_settings
UNION ALL
SELECT 'shipping_methods' as table_name, count(*) as row_count FROM public.shipping_methods
UNION ALL
SELECT 'shipping_zones' as table_name, count(*) as row_count FROM public.shipping_zones;

-- FIN DU SCRIPT
