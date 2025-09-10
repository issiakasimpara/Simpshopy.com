-- ========================================
-- FIX: ERREUR 403 FORBIDDEN SUR site_templates
-- Corriger les politiques RLS pour permettre la sauvegarde des templates
-- ========================================

-- 1. Vérifier l'état actuel des politiques
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'site_templates'
ORDER BY policyname;

-- 2. Supprimer TOUTES les politiques existantes pour site_templates
DROP POLICY IF EXISTS "Public can view published templates from active stores" ON public.site_templates;
DROP POLICY IF EXISTS "Users can manage their own templates" ON public.site_templates;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.site_templates;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.site_templates;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.site_templates;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.site_templates;

-- 3. Créer des politiques PERMISSIVES pour permettre la sauvegarde
-- Politique pour la lecture (SELECT)
CREATE POLICY "Allow all authenticated users to read templates" ON public.site_templates
    FOR SELECT 
    TO authenticated
    USING (true);

-- Politique pour l'insertion (INSERT)
CREATE POLICY "Allow all authenticated users to insert templates" ON public.site_templates
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Politique pour la mise à jour (UPDATE)
CREATE POLICY "Allow all authenticated users to update templates" ON public.site_templates
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Politique pour la suppression (DELETE)
CREATE POLICY "Allow all authenticated users to delete templates" ON public.site_templates
    FOR DELETE 
    TO authenticated
    USING (true);

-- 4. Vérifier que les nouvelles politiques sont créées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'site_templates'
ORDER BY policyname;

-- 5. Test de vérification
SELECT 'Politiques RLS corrigées pour site_templates' as status;
