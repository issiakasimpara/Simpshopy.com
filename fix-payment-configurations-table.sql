-- Script pour vérifier et corriger la table payment_configurations

-- 1. Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS payment_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- Stripe Configuration
    stripe_enabled BOOLEAN DEFAULT false,
    stripe_test_mode BOOLEAN DEFAULT true,
    stripe_api_key TEXT,
    stripe_secret_key TEXT,
    stripe_webhook_url TEXT,
    
    -- PayPal Configuration
    paypal_enabled BOOLEAN DEFAULT false,
    paypal_test_mode BOOLEAN DEFAULT true,
    paypal_api_key TEXT,
    paypal_secret_key TEXT,
    paypal_webhook_url TEXT,
    
    -- Moneroo Configuration
    moneroo_enabled BOOLEAN DEFAULT false,
    moneroo_test_mode BOOLEAN DEFAULT true,
    moneroo_api_key TEXT,
    moneroo_secret_key TEXT,
    moneroo_webhook_url TEXT,
    
    -- Google Pay Configuration
    googlepay_enabled BOOLEAN DEFAULT false,
    googlepay_test_mode BOOLEAN DEFAULT true,
    googlepay_api_key TEXT,
    googlepay_webhook_url TEXT,
    
    -- Apple Pay Configuration
    applepay_enabled BOOLEAN DEFAULT false,
    applepay_test_mode BOOLEAN DEFAULT true,
    applepay_api_key TEXT,
    applepay_webhook_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer les index
CREATE INDEX IF NOT EXISTS idx_payment_configurations_store_id ON payment_configurations(store_id);

-- 3. Supprimer l'ancienne contrainte d'unicité si elle existe
DROP INDEX IF EXISTS idx_payment_configurations_unique_store;

-- 4. Créer la contrainte d'unicité
CREATE UNIQUE INDEX idx_payment_configurations_unique_store ON payment_configurations(store_id);

-- 5. Activer RLS
ALTER TABLE payment_configurations ENABLE ROW LEVEL SECURITY;

-- 6. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view their own payment configurations" ON payment_configurations;
DROP POLICY IF EXISTS "Users can update their own payment configurations" ON payment_configurations;
DROP POLICY IF EXISTS "Users can insert their own payment configurations" ON payment_configurations;

-- 7. Créer les nouvelles politiques RLS (utilise la structure correcte avec merchant_id)
CREATE POLICY "Users can view their own payment configurations" ON payment_configurations
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM stores 
            WHERE merchant_id IN (
                SELECT id FROM profiles 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own payment configurations" ON payment_configurations
    FOR UPDATE USING (
        store_id IN (
            SELECT id FROM stores 
            WHERE merchant_id IN (
                SELECT id FROM profiles 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert their own payment configurations" ON payment_configurations
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT id FROM stores 
            WHERE merchant_id IN (
                SELECT id FROM profiles 
                WHERE user_id = auth.uid()
            )
        )
    );

-- 8. Créer la fonction pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Créer le trigger
DROP TRIGGER IF EXISTS update_payment_configurations_updated_at ON payment_configurations;
CREATE TRIGGER update_payment_configurations_updated_at 
    BEFORE UPDATE ON payment_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Afficher le statut final
SELECT 
    'payment_configurations' as table_name,
    'Table créée avec succès' as status,
    (SELECT COUNT(*) FROM payment_configurations) as total_configurations;
