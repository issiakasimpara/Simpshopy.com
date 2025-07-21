-- ========================================
-- SCRIPT SQL FINAL POUR LES TABLES DE LIVRAISONS
-- À copier-coller dans Supabase SQL Editor
-- ========================================

-- 1. CRÉER LA TABLE shipping_zones
CREATE TABLE public.shipping_zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    countries TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. CRÉER LA TABLE shipping_methods
CREATE TABLE public.shipping_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL,
    shipping_zone_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL DEFAULT '🚚',
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    free_shipping_threshold NUMERIC(10,2),
    estimated_days TEXT NOT NULL DEFAULT '3-5 jours',
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. CRÉER LES INDEX POUR OPTIMISATION
CREATE INDEX idx_shipping_zones_store_id ON public.shipping_zones(store_id);
CREATE INDEX idx_shipping_zones_active ON public.shipping_zones(is_active);
CREATE INDEX idx_shipping_methods_store_id ON public.shipping_methods(store_id);
CREATE INDEX idx_shipping_methods_zone_id ON public.shipping_methods(shipping_zone_id);
CREATE INDEX idx_shipping_methods_active ON public.shipping_methods(is_active);
CREATE INDEX idx_shipping_methods_sort ON public.shipping_methods(sort_order);

-- 4. CRÉER LA FONCTION POUR updated_at AUTOMATIQUE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. CRÉER LES TRIGGERS POUR updated_at
CREATE TRIGGER update_shipping_zones_updated_at
    BEFORE UPDATE ON public.shipping_zones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_methods_updated_at
    BEFORE UPDATE ON public.shipping_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. ACTIVER RLS (ROW LEVEL SECURITY)
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

-- 7. CRÉER LES POLITIQUES RLS POUR shipping_zones
CREATE POLICY "shipping_zones_select_policy" ON public.shipping_zones
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM public.stores WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "shipping_zones_insert_policy" ON public.shipping_zones
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT id FROM public.stores WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "shipping_zones_update_policy" ON public.shipping_zones
    FOR UPDATE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "shipping_zones_delete_policy" ON public.shipping_zones
    FOR DELETE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE user_id = auth.uid()
        )
    );

-- 8. CRÉER LES POLITIQUES RLS POUR shipping_methods
CREATE POLICY "shipping_methods_select_policy" ON public.shipping_methods
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM public.stores WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "shipping_methods_insert_policy" ON public.shipping_methods
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT id FROM public.stores WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "shipping_methods_update_policy" ON public.shipping_methods
    FOR UPDATE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "shipping_methods_delete_policy" ON public.shipping_methods
    FOR DELETE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE user_id = auth.uid()
        )
    );

-- 9. AJOUTER DES COMMENTAIRES AUX TABLES
COMMENT ON TABLE public.shipping_zones IS 'Zones de livraison pour les boutiques';
COMMENT ON TABLE public.shipping_methods IS 'Méthodes de livraison pour les boutiques';

-- 10. AJOUTER DES COMMENTAIRES AUX COLONNES
COMMENT ON COLUMN public.shipping_zones.id IS 'Identifiant unique de la zone';
COMMENT ON COLUMN public.shipping_zones.store_id IS 'ID de la boutique propriétaire';
COMMENT ON COLUMN public.shipping_zones.name IS 'Nom de la zone de livraison';
COMMENT ON COLUMN public.shipping_zones.description IS 'Description de la zone';
COMMENT ON COLUMN public.shipping_zones.countries IS 'Liste des pays de la zone';
COMMENT ON COLUMN public.shipping_zones.is_active IS 'Zone active ou non';

COMMENT ON COLUMN public.shipping_methods.id IS 'Identifiant unique de la méthode';
COMMENT ON COLUMN public.shipping_methods.store_id IS 'ID de la boutique propriétaire';
COMMENT ON COLUMN public.shipping_methods.shipping_zone_id IS 'Zone de livraison associée (optionnel)';
COMMENT ON COLUMN public.shipping_methods.name IS 'Nom de la méthode de livraison';
COMMENT ON COLUMN public.shipping_methods.description IS 'Description de la méthode';
COMMENT ON COLUMN public.shipping_methods.icon IS 'Icône de la méthode (emoji)';
COMMENT ON COLUMN public.shipping_methods.price IS 'Prix de la livraison en CFA';
COMMENT ON COLUMN public.shipping_methods.free_shipping_threshold IS 'Seuil pour livraison gratuite';
COMMENT ON COLUMN public.shipping_methods.estimated_days IS 'Délai estimé de livraison';
COMMENT ON COLUMN public.shipping_methods.is_active IS 'Méthode active ou non';
COMMENT ON COLUMN public.shipping_methods.sort_order IS 'Ordre d''affichage';

-- ========================================
-- SCRIPT TERMINÉ AVEC SUCCÈS
-- Les tables apparaîtront automatiquement dans Table Editor
-- ========================================
