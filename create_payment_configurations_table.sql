-- Création de la table payment_configurations
-- Cette table stocke les configurations des fournisseurs de paiement pour chaque boutique

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

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_payment_configurations_store_id ON payment_configurations(store_id);

-- Contrainte d'unicité : une seule configuration par boutique
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_configurations_unique_store ON payment_configurations(store_id);

-- RLS (Row Level Security) pour la sécurité
ALTER TABLE payment_configurations ENABLE ROW LEVEL SECURITY;

-- Politique RLS : les utilisateurs ne peuvent voir que leurs propres configurations
CREATE POLICY "Users can view their own payment configurations" ON payment_configurations
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM stores WHERE merchant_id = auth.uid()
        )
    );

-- Politique RLS : les utilisateurs ne peuvent insérer que pour leurs propres boutiques
CREATE POLICY "Users can insert their own payment configurations" ON payment_configurations
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT id FROM stores WHERE merchant_id = auth.uid()
        )
    );

-- Politique RLS : les utilisateurs ne peuvent mettre à jour que leurs propres configurations
CREATE POLICY "Users can update their own payment configurations" ON payment_configurations
    FOR UPDATE USING (
        store_id IN (
            SELECT id FROM stores WHERE merchant_id = auth.uid()
        )
    );

-- Politique RLS : les utilisateurs ne peuvent supprimer que leurs propres configurations
CREATE POLICY "Users can delete their own payment configurations" ON payment_configurations
    FOR DELETE USING (
        store_id IN (
            SELECT id FROM stores WHERE merchant_id = auth.uid()
        )
    );

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_payment_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payment_configurations_updated_at
    BEFORE UPDATE ON payment_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_configurations_updated_at();

-- Commentaires pour la documentation
COMMENT ON TABLE payment_configurations IS 'Configuration des fournisseurs de paiement pour chaque boutique';
COMMENT ON COLUMN payment_configurations.store_id IS 'ID de la boutique associée';
COMMENT ON COLUMN payment_configurations.stripe_enabled IS 'Stripe activé pour cette boutique';
COMMENT ON COLUMN payment_configurations.stripe_test_mode IS 'Mode test pour Stripe';
COMMENT ON COLUMN payment_configurations.stripe_api_key IS 'Clé API publique Stripe';
COMMENT ON COLUMN payment_configurations.stripe_secret_key IS 'Clé secrète Stripe (chiffrée)';
COMMENT ON COLUMN payment_configurations.paypal_enabled IS 'PayPal activé pour cette boutique';
COMMENT ON COLUMN payment_configurations.paypal_test_mode IS 'Mode test pour PayPal';
COMMENT ON COLUMN payment_configurations.paypal_api_key IS 'Clé API PayPal';
COMMENT ON COLUMN payment_configurations.paypal_secret_key IS 'Clé secrète PayPal (chiffrée)';
COMMENT ON COLUMN payment_configurations.moneroo_enabled IS 'Moneroo activé pour cette boutique';
COMMENT ON COLUMN payment_configurations.moneroo_test_mode IS 'Mode test pour Moneroo';
COMMENT ON COLUMN payment_configurations.moneroo_api_key IS 'Clé API Moneroo';
COMMENT ON COLUMN payment_configurations.moneroo_secret_key IS 'Clé secrète Moneroo (chiffrée)';
COMMENT ON COLUMN payment_configurations.googlepay_enabled IS 'Google Pay activé pour cette boutique';
COMMENT ON COLUMN payment_configurations.googlepay_test_mode IS 'Mode test pour Google Pay';
COMMENT ON COLUMN payment_configurations.googlepay_api_key IS 'Clé API Google Pay';
COMMENT ON COLUMN payment_configurations.applepay_enabled IS 'Apple Pay activé pour cette boutique';
COMMENT ON COLUMN payment_configurations.applepay_test_mode IS 'Mode test pour Apple Pay';
COMMENT ON COLUMN payment_configurations.applepay_api_key IS 'Clé API Apple Pay';
