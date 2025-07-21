-- Script pour corriger les politiques RLS de la table markets
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier la structure de la table stores
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'stores' 
ORDER BY ordinal_position;

-- 2. Supprimer toutes les anciennes politiques pour markets
DROP POLICY IF EXISTS "Users can view markets of their stores" ON public.markets;
DROP POLICY IF EXISTS "Users can manage markets of their stores" ON public.markets;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.markets;
DROP POLICY IF EXISTS "markets_select_policy" ON public.markets;
DROP POLICY IF EXISTS "markets_insert_policy" ON public.markets;
DROP POLICY IF EXISTS "markets_update_policy" ON public.markets;
DROP POLICY IF EXISTS "markets_delete_policy" ON public.markets;

-- 3. Supprimer toutes les anciennes politiques pour shipping_methods
DROP POLICY IF EXISTS "Users can view shipping methods of their stores" ON public.shipping_methods;
DROP POLICY IF EXISTS "Users can manage shipping methods of their stores" ON public.shipping_methods;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.shipping_methods;
DROP POLICY IF EXISTS "shipping_methods_select_policy" ON public.shipping_methods;
DROP POLICY IF EXISTS "shipping_methods_insert_policy" ON public.shipping_methods;
DROP POLICY IF EXISTS "shipping_methods_update_policy" ON public.shipping_methods;
DROP POLICY IF EXISTS "shipping_methods_delete_policy" ON public.shipping_methods;

-- 4. Créer des politiques RLS simples et efficaces pour markets
-- Politique SELECT
CREATE POLICY "markets_select_policy" ON public.markets
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

-- Politique INSERT
CREATE POLICY "markets_insert_policy" ON public.markets
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

-- Politique UPDATE
CREATE POLICY "markets_update_policy" ON public.markets
    FOR UPDATE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    ) WITH CHECK (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

-- Politique DELETE
CREATE POLICY "markets_delete_policy" ON public.markets
    FOR DELETE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

-- 5. Créer des politiques RLS pour shipping_methods
-- Politique SELECT
CREATE POLICY "shipping_methods_select_policy" ON public.shipping_methods
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

-- Politique INSERT
CREATE POLICY "shipping_methods_insert_policy" ON public.shipping_methods
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

-- Politique UPDATE
CREATE POLICY "shipping_methods_update_policy" ON public.shipping_methods
    FOR UPDATE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    ) WITH CHECK (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

-- Politique DELETE
CREATE POLICY "shipping_methods_delete_policy" ON public.shipping_methods
    FOR DELETE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE merchant_id = auth.uid()
        )
    );

-- 6. Vérifier que les politiques ont été créées
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

-- 7. Test de la politique avec l'utilisateur actuel
-- Cette requête devrait retourner les stores de l'utilisateur connecté
SELECT 
    'Test politique' as test,
    id,
    name,
    merchant_id
FROM public.stores 
WHERE merchant_id = auth.uid();

-- 8. Message de confirmation
SELECT 'Politiques RLS corrigées avec succès!' as status;
