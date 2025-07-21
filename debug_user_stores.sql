-- Script de debug pour comprendre la structure utilisateur/stores
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier l'utilisateur actuel
SELECT 
    'Utilisateur actuel' as info,
    auth.uid() as user_id,
    auth.email() as email;

-- 2. Vérifier les profiles
SELECT 
    'Profiles' as info,
    id,
    user_id,
    email,
    created_at
FROM public.profiles 
WHERE user_id = auth.uid();

-- 3. Vérifier les stores
SELECT 
    'Stores' as info,
    id,
    name,
    merchant_id,
    created_at
FROM public.stores 
WHERE merchant_id = auth.uid();

-- 4. Vérifier s'il y a des stores avec merchant_id via profiles
SELECT 
    'Stores via profiles' as info,
    s.id,
    s.name,
    s.merchant_id,
    p.user_id,
    p.email
FROM public.stores s
JOIN public.profiles p ON s.merchant_id = p.id
WHERE p.user_id = auth.uid();

-- 5. Vérifier la table markets existante
SELECT 
    'Markets existants' as info,
    m.*
FROM public.markets m
JOIN public.stores s ON m.store_id = s.id
WHERE s.merchant_id = auth.uid();

-- 6. Test de création manuelle d'un market
-- (Remplacez 'VOTRE_STORE_ID' par l'ID de votre store)
-- INSERT INTO public.markets (store_id, name, countries, is_active)
-- VALUES ('VOTRE_STORE_ID', 'Test Market', ARRAY['ML', 'CI'], true);

-- 7. Vérifier les contraintes de la table markets
SELECT 
    'Contraintes markets' as info,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.markets'::regclass;

-- 8. Vérifier les politiques RLS actives
SELECT 
    'Politiques RLS' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'markets';

-- 9. Tester la politique manuellement
SELECT 
    'Test politique manuelle' as info,
    EXISTS(
        SELECT 1 FROM public.stores 
        WHERE id = (SELECT id FROM public.stores WHERE merchant_id = auth.uid() LIMIT 1)
        AND merchant_id = auth.uid()
    ) as can_access_store;
