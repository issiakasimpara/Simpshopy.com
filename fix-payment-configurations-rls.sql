-- Script pour corriger les politiques RLS de payment_configurations
-- Ce script permet l'accès public en lecture seule pour le checkout

-- 1. Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view their own payment configurations" ON payment_configurations;
DROP POLICY IF EXISTS "Users can update their own payment configurations" ON payment_configurations;
DROP POLICY IF EXISTS "Users can insert their own payment configurations" ON payment_configurations;
DROP POLICY IF EXISTS "Public can view payment configurations" ON payment_configurations;

-- 2. Créer une politique publique pour la lecture (nécessaire pour le checkout)
CREATE POLICY "Public can view payment configurations" ON payment_configurations
    FOR SELECT USING (true);

-- 3. Créer une politique pour les propriétaires de boutique (pour l'admin)
CREATE POLICY "Store owners can manage their payment configurations" ON payment_configurations
    FOR ALL USING (
        store_id IN (
            SELECT id FROM stores 
            WHERE merchant_id IN (
                SELECT id FROM profiles 
                WHERE user_id = auth.uid()
            )
        )
    );

-- 4. Vérifier que les politiques sont créées
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
WHERE tablename = 'payment_configurations';

-- 5. Tester l'accès public
SELECT 
    id,
    store_id,
    moneroo_enabled,
    moneroo_test_mode,
    CASE 
        WHEN moneroo_api_key IS NOT NULL THEN 'CONFIGURÉ'
        ELSE 'NON CONFIGURÉ'
    END as api_key_status
FROM payment_configurations
WHERE store_id = 'd6d0e01a-0283-4a87-8da0-b248c36e37d5';
