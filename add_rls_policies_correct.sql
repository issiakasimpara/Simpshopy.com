-- Script pour ajouter les politiques RLS avec la bonne colonne
-- À exécuter APRÈS avoir créé les tables

-- 1. ACTIVER RLS
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

-- 2. POLITIQUES POUR shipping_zones
CREATE POLICY "shipping_zones_select_policy" ON public.shipping_zones
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

CREATE POLICY "shipping_zones_insert_policy" ON public.shipping_zones
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

CREATE POLICY "shipping_zones_update_policy" ON public.shipping_zones
    FOR UPDATE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

CREATE POLICY "shipping_zones_delete_policy" ON public.shipping_zones
    FOR DELETE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

-- 3. POLITIQUES POUR shipping_methods
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
