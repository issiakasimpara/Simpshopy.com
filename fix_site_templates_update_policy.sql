-- ========================================
-- FIX: ERREUR 403 SUR UPDATE site_templates
-- Corriger spécifiquement la politique UPDATE qui bloque la sauvegarde
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

-- 2. Supprimer UNIQUEMENT la politique UPDATE problématique
DROP POLICY IF EXISTS "Allow all authenticated users to update templates" ON public.site_templates;

-- 3. Créer une politique UPDATE plus permissive
CREATE POLICY "Allow authenticated users to update any template" ON public.site_templates
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Alternative : Désactiver temporairement RLS pour les tests
-- ALTER TABLE public.site_templates DISABLE ROW LEVEL SECURITY;

-- 5. Vérifier que la nouvelle politique est créée
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

-- 6. Test de vérification
SELECT 'Politique UPDATE corrigée pour site_templates' as status;
