-- ========================================
-- SCRIPT COMPLET LIVRAISONS AFRIQUE
-- SOLUTION DÉFINITIVE DE A À Z
-- TOUS LES PAYS D'AFRIQUE INDÉPENDANTS
-- ========================================

-- 1. NETTOYAGE COMPLET
DROP TABLE IF EXISTS public.shipping_methods CASCADE;
DROP TABLE IF EXISTS public.shipping_zones CASCADE;
DROP TABLE IF EXISTS public.african_countries CASCADE;

-- 2. CRÉER LA TABLE DES PAYS AFRICAINS
CREATE TABLE public.african_countries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(2) NOT NULL UNIQUE,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    region VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INSÉRER TOUS LES PAYS D'AFRIQUE
INSERT INTO public.african_countries (code, name_fr, name_en, currency, region) VALUES
-- Afrique du Nord
('DZ', 'Algérie', 'Algeria', 'DZD', 'Nord'),
('EG', 'Égypte', 'Egypt', 'EGP', 'Nord'),
('LY', 'Libye', 'Libya', 'LYD', 'Nord'),
('MA', 'Maroc', 'Morocco', 'MAD', 'Nord'),
('SD', 'Soudan', 'Sudan', 'SDG', 'Nord'),
('TN', 'Tunisie', 'Tunisia', 'TND', 'Nord'),

-- Afrique de l'Ouest
('BJ', 'Bénin', 'Benin', 'XOF', 'Ouest'),
('BF', 'Burkina Faso', 'Burkina Faso', 'XOF', 'Ouest'),
('CV', 'Cap-Vert', 'Cape Verde', 'CVE', 'Ouest'),
('CI', 'Côte d''Ivoire', 'Ivory Coast', 'XOF', 'Ouest'),
('GM', 'Gambie', 'Gambia', 'GMD', 'Ouest'),
('GH', 'Ghana', 'Ghana', 'GHS', 'Ouest'),
('GN', 'Guinée', 'Guinea', 'GNF', 'Ouest'),
('GW', 'Guinée-Bissau', 'Guinea-Bissau', 'XOF', 'Ouest'),
('LR', 'Libéria', 'Liberia', 'LRD', 'Ouest'),
('ML', 'Mali', 'Mali', 'XOF', 'Ouest'),
('MR', 'Mauritanie', 'Mauritania', 'MRU', 'Ouest'),
('NE', 'Niger', 'Niger', 'XOF', 'Ouest'),
('NG', 'Nigéria', 'Nigeria', 'NGN', 'Ouest'),
('SN', 'Sénégal', 'Senegal', 'XOF', 'Ouest'),
('SL', 'Sierra Leone', 'Sierra Leone', 'SLL', 'Ouest'),
('TG', 'Togo', 'Togo', 'XOF', 'Ouest'),

-- Afrique Centrale
('AO', 'Angola', 'Angola', 'AOA', 'Centrale'),
('CM', 'Cameroun', 'Cameroon', 'XAF', 'Centrale'),
('CF', 'République Centrafricaine', 'Central African Republic', 'XAF', 'Centrale'),
('TD', 'Tchad', 'Chad', 'XAF', 'Centrale'),
('CG', 'Congo', 'Republic of the Congo', 'XAF', 'Centrale'),
('CD', 'République Démocratique du Congo', 'Democratic Republic of the Congo', 'CDF', 'Centrale'),
('GQ', 'Guinée Équatoriale', 'Equatorial Guinea', 'XAF', 'Centrale'),
('GA', 'Gabon', 'Gabon', 'XAF', 'Centrale'),
('ST', 'São Tomé-et-Príncipe', 'Sao Tome and Principe', 'STN', 'Centrale'),

-- Afrique de l'Est
('BI', 'Burundi', 'Burundi', 'BIF', 'Est'),
('KM', 'Comores', 'Comoros', 'KMF', 'Est'),
('DJ', 'Djibouti', 'Djibouti', 'DJF', 'Est'),
('ER', 'Érythrée', 'Eritrea', 'ERN', 'Est'),
('ET', 'Éthiopie', 'Ethiopia', 'ETB', 'Est'),
('KE', 'Kenya', 'Kenya', 'KES', 'Est'),
('MG', 'Madagascar', 'Madagascar', 'MGA', 'Est'),
('MW', 'Malawi', 'Malawi', 'MWK', 'Est'),
('MU', 'Maurice', 'Mauritius', 'MUR', 'Est'),
('MZ', 'Mozambique', 'Mozambique', 'MZN', 'Est'),
('RW', 'Rwanda', 'Rwanda', 'RWF', 'Est'),
('SC', 'Seychelles', 'Seychelles', 'SCR', 'Est'),
('SO', 'Somalie', 'Somalia', 'SOS', 'Est'),
('SS', 'Soudan du Sud', 'South Sudan', 'SSP', 'Est'),
('TZ', 'Tanzanie', 'Tanzania', 'TZS', 'Est'),
('UG', 'Ouganda', 'Uganda', 'UGX', 'Est'),
('ZM', 'Zambie', 'Zambia', 'ZMW', 'Est'),
('ZW', 'Zimbabwe', 'Zimbabwe', 'ZWL', 'Est'),

-- Afrique Australe
('BW', 'Botswana', 'Botswana', 'BWP', 'Australe'),
('SZ', 'Eswatini', 'Eswatini', 'SZL', 'Australe'),
('LS', 'Lesotho', 'Lesotho', 'LSL', 'Australe'),
('NA', 'Namibie', 'Namibia', 'NAD', 'Australe'),
('ZA', 'Afrique du Sud', 'South Africa', 'ZAR', 'Australe');

-- 4. CRÉER LA TABLE DES ZONES DE LIVRAISON
CREATE TABLE public.shipping_zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    countries TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CRÉER LA TABLE DES MÉTHODES DE LIVRAISON
CREATE TABLE public.shipping_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    shipping_zone_id UUID REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    estimated_days VARCHAR(50) NOT NULL DEFAULT '3-5 jours',
    icon VARCHAR(10) DEFAULT '🚚',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    conditions JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CRÉER LES INDEX POUR LES PERFORMANCES
CREATE INDEX idx_african_countries_code ON public.african_countries(code);
CREATE INDEX idx_african_countries_region ON public.african_countries(region);
CREATE INDEX idx_shipping_zones_store_id ON public.shipping_zones(store_id);
CREATE INDEX idx_shipping_zones_countries ON public.shipping_zones USING GIN(countries);
CREATE INDEX idx_shipping_methods_store_id ON public.shipping_methods(store_id);
CREATE INDEX idx_shipping_methods_zone_id ON public.shipping_methods(shipping_zone_id);
CREATE INDEX idx_shipping_methods_active ON public.shipping_methods(is_active);

-- 7. DÉSACTIVER RLS POUR LES TESTS
ALTER TABLE public.african_countries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods DISABLE ROW LEVEL SECURITY;

-- 8. FONCTION POUR CRÉER LES ZONES ET MÉTHODES PAR DÉFAUT
CREATE OR REPLACE FUNCTION create_default_shipping_for_store(store_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    zone_afrique_ouest_id UUID;
    zone_afrique_centrale_id UUID;
    zone_afrique_nord_id UUID;
    zone_afrique_est_id UUID;
    zone_afrique_australe_id UUID;
    result_text TEXT := '';
BEGIN
    -- Supprimer les anciennes données pour ce store
    DELETE FROM public.shipping_methods WHERE store_id = store_uuid;
    DELETE FROM public.shipping_zones WHERE store_id = store_uuid;
    
    -- Créer les zones par région
    INSERT INTO public.shipping_zones (store_id, name, description, countries) VALUES
    (store_uuid, 'Afrique de l''Ouest', 'Pays d''Afrique de l''Ouest', 
     ARRAY['BJ','BF','CV','CI','GM','GH','GN','GW','LR','ML','MR','NE','NG','SN','SL','TG'])
    RETURNING id INTO zone_afrique_ouest_id;
    
    INSERT INTO public.shipping_zones (store_id, name, description, countries) VALUES
    (store_uuid, 'Afrique Centrale', 'Pays d''Afrique Centrale', 
     ARRAY['AO','CM','CF','TD','CG','CD','GQ','GA','ST'])
    RETURNING id INTO zone_afrique_centrale_id;
    
    INSERT INTO public.shipping_zones (store_id, name, description, countries) VALUES
    (store_uuid, 'Afrique du Nord', 'Pays d''Afrique du Nord', 
     ARRAY['DZ','EG','LY','MA','SD','TN'])
    RETURNING id INTO zone_afrique_nord_id;
    
    INSERT INTO public.shipping_zones (store_id, name, description, countries) VALUES
    (store_uuid, 'Afrique de l''Est', 'Pays d''Afrique de l''Est', 
     ARRAY['BI','KM','DJ','ER','ET','KE','MG','MW','MU','MZ','RW','SC','SO','SS','TZ','UG','ZM','ZW'])
    RETURNING id INTO zone_afrique_est_id;
    
    INSERT INTO public.shipping_zones (store_id, name, description, countries) VALUES
    (store_uuid, 'Afrique Australe', 'Pays d''Afrique Australe', 
     ARRAY['BW','SZ','LS','NA','ZA'])
    RETURNING id INTO zone_afrique_australe_id;
    
    -- Créer les méthodes de livraison
    
    -- Méthodes globales (toute l'Afrique)
    INSERT INTO public.shipping_methods (store_id, name, description, price, estimated_days, icon, sort_order) VALUES
    (store_uuid, 'Livraison Standard Afrique', 'Livraison dans toute l''Afrique', 5000, '7-14 jours', '🌍', 1),
    (store_uuid, 'Livraison Express Afrique', 'Livraison rapide dans toute l''Afrique', 10000, '3-7 jours', '⚡', 2);
    
    -- Méthodes spécifiques Afrique de l'Ouest
    INSERT INTO public.shipping_methods (store_id, shipping_zone_id, name, description, price, estimated_days, icon, sort_order) VALUES
    (store_uuid, zone_afrique_ouest_id, 'Livraison Ouest Standard', 'Livraison en Afrique de l''Ouest', 2500, '3-7 jours', '🚚', 3),
    (store_uuid, zone_afrique_ouest_id, 'Livraison Ouest Express', 'Livraison rapide en Afrique de l''Ouest', 4000, '1-3 jours', '🏃', 4),
    (store_uuid, zone_afrique_ouest_id, 'Livraison Ouest Économique', 'Livraison économique en Afrique de l''Ouest', 1500, '5-10 jours', '💰', 5);
    
    -- Méthodes spécifiques Afrique Centrale
    INSERT INTO public.shipping_methods (store_id, shipping_zone_id, name, description, price, estimated_days, icon, sort_order) VALUES
    (store_uuid, zone_afrique_centrale_id, 'Livraison Centrale Standard', 'Livraison en Afrique Centrale', 3500, '5-10 jours', '🚛', 6),
    (store_uuid, zone_afrique_centrale_id, 'Livraison Centrale Express', 'Livraison rapide en Afrique Centrale', 6000, '2-5 jours', '🚁', 7);
    
    -- Méthodes spécifiques Afrique du Nord
    INSERT INTO public.shipping_methods (store_id, shipping_zone_id, name, description, price, estimated_days, icon, sort_order) VALUES
    (store_uuid, zone_afrique_nord_id, 'Livraison Nord Standard', 'Livraison en Afrique du Nord', 4000, '5-12 jours', '🐪', 8),
    (store_uuid, zone_afrique_nord_id, 'Livraison Nord Express', 'Livraison rapide en Afrique du Nord', 7000, '3-7 jours', '✈️', 9);
    
    -- Méthodes spécifiques Afrique de l'Est
    INSERT INTO public.shipping_methods (store_id, shipping_zone_id, name, description, price, estimated_days, icon, sort_order) VALUES
    (store_uuid, zone_afrique_est_id, 'Livraison Est Standard', 'Livraison en Afrique de l''Est', 4500, '7-14 jours', '🦁', 10),
    (store_uuid, zone_afrique_est_id, 'Livraison Est Express', 'Livraison rapide en Afrique de l''Est', 8000, '3-8 jours', '🦅', 11);
    
    -- Méthodes spécifiques Afrique Australe
    INSERT INTO public.shipping_methods (store_id, shipping_zone_id, name, description, price, estimated_days, icon, sort_order) VALUES
    (store_uuid, zone_afrique_australe_id, 'Livraison Australe Standard', 'Livraison en Afrique Australe', 6000, '10-20 jours', '🦏', 12),
    (store_uuid, zone_afrique_australe_id, 'Livraison Australe Express', 'Livraison rapide en Afrique Australe', 12000, '5-12 jours', '💎', 13);
    
    result_text := 'Zones et méthodes créées avec succès pour le store: ' || store_uuid;
    RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- 9. CRÉER LES ZONES ET MÉTHODES POUR LA PREMIÈRE BOUTIQUE
DO $$
DECLARE
    first_store_id UUID;
    result_msg TEXT;
BEGIN
    SELECT id INTO first_store_id FROM public.stores LIMIT 1;
    
    IF first_store_id IS NOT NULL THEN
        SELECT create_default_shipping_for_store(first_store_id) INTO result_msg;
        RAISE NOTICE '%', result_msg;
    ELSE
        RAISE NOTICE 'Aucune boutique trouvée';
    END IF;
END $$;

-- 10. VÉRIFICATIONS FINALES
SELECT 'Pays africains' as table_name, count(*) as count FROM public.african_countries;
SELECT 'Zones de livraison' as table_name, count(*) as count FROM public.shipping_zones;
SELECT 'Méthodes de livraison' as table_name, count(*) as count FROM public.shipping_methods;

-- 11. TEST POUR LE MALI
SELECT 
    sm.name,
    sm.price,
    sm.estimated_days,
    sz.name as zone_name,
    CASE 
        WHEN sz.id IS NULL THEN 'Global (toute l''Afrique)'
        WHEN 'ML' = ANY(sz.countries) THEN 'Disponible au Mali'
        ELSE 'Non disponible au Mali'
    END as availability
FROM public.shipping_methods sm
LEFT JOIN public.shipping_zones sz ON sm.shipping_zone_id = sz.id
WHERE sm.shipping_zone_id IS NULL OR 'ML' = ANY(sz.countries)
ORDER BY sm.sort_order;

-- FIN DU SCRIPT
-- Résultat attendu: 54 pays, 5 zones par store, 13 méthodes par store
