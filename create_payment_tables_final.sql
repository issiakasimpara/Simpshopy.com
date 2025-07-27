-- =====================================================
-- SCRIPT DE CRÉATION DES TABLES DE PAIEMENT MONEROO
-- Basé sur la documentation officielle Moneroo
-- =====================================================

-- 1. Table des statistiques de revenus par magasin
CREATE TABLE IF NOT EXISTS store_revenue_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    monthly_revenue DECIMAL(15,2) DEFAULT 0,
    weekly_revenue DECIMAL(15,2) DEFAULT 0,
    daily_revenue DECIMAL(15,2) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    successful_transactions INTEGER DEFAULT 0,
    failed_transactions INTEGER DEFAULT 0,
    average_order_value DECIMAL(15,2) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_store_revenue_stats_store_id ON store_revenue_stats(store_id);
CREATE INDEX IF NOT EXISTS idx_store_revenue_stats_last_updated ON store_revenue_stats(last_updated);

-- 2. Table des transactions
CREATE TABLE IF NOT EXISTS store_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    order_id VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    payment_method VARCHAR(100) NOT NULL,
    payment_gateway VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'XOF',
    product_name VARCHAR(255),
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte unique pour éviter les doublons
    UNIQUE(store_id, order_id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_store_transactions_store_id ON store_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_store_transactions_status ON store_transactions(status);
CREATE INDEX IF NOT EXISTS idx_store_transactions_transaction_date ON store_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_store_transactions_payment_gateway ON store_transactions(payment_gateway);

-- 3. Table des demandes de retrait
CREATE TABLE IF NOT EXISTS store_withdrawals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'XOF',
    bank_account_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    reason TEXT,
    gateway_withdrawal_id VARCHAR(255),
    gateway_response JSONB,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_store_withdrawals_store_id ON store_withdrawals(store_id);
CREATE INDEX IF NOT EXISTS idx_store_withdrawals_status ON store_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_store_withdrawals_created_at ON store_withdrawals(created_at);

-- 4. Table des comptes bancaires
CREATE TABLE IF NOT EXISTS store_bank_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    bank_code VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_store_bank_accounts_store_id ON store_bank_accounts(store_id);
CREATE INDEX IF NOT EXISTS idx_store_bank_accounts_is_default ON store_bank_accounts(is_default);

-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE store_revenue_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_bank_accounts ENABLE ROW LEVEL SECURITY;

-- Politiques pour store_revenue_stats
DROP POLICY IF EXISTS "Users can view their own store revenue stats" ON store_revenue_stats;
CREATE POLICY "Users can view their own store revenue stats" ON store_revenue_stats
    FOR SELECT USING (
        store_id IN (
            SELECT s.id FROM stores s 
            JOIN profiles p ON s.owner_id = p.id 
            WHERE p.id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own store revenue stats" ON store_revenue_stats;
CREATE POLICY "Users can update their own store revenue stats" ON store_revenue_stats
    FOR UPDATE USING (
        store_id IN (
            SELECT s.id FROM stores s 
            JOIN profiles p ON s.owner_id = p.id 
            WHERE p.id = auth.uid()
        )
    );

-- Politiques pour store_transactions
DROP POLICY IF EXISTS "Users can view their own store transactions" ON store_transactions;
CREATE POLICY "Users can view their own store transactions" ON store_transactions
    FOR SELECT USING (
        store_id IN (
            SELECT s.id FROM stores s 
            JOIN profiles p ON s.owner_id = p.id 
            WHERE p.id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own store transactions" ON store_transactions;
CREATE POLICY "Users can insert their own store transactions" ON store_transactions
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT s.id FROM stores s 
            JOIN profiles p ON s.owner_id = p.id 
            WHERE p.id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own store transactions" ON store_transactions;
CREATE POLICY "Users can update their own store transactions" ON store_transactions
    FOR UPDATE USING (
        store_id IN (
            SELECT s.id FROM stores s 
            JOIN profiles p ON s.owner_id = p.id 
            WHERE p.id = auth.uid()
        )
    );

-- Politiques pour store_withdrawals
DROP POLICY IF EXISTS "Users can view their own store withdrawals" ON store_withdrawals;
CREATE POLICY "Users can view their own store withdrawals" ON store_withdrawals
    FOR SELECT USING (
        store_id IN (
            SELECT s.id FROM stores s 
            JOIN profiles p ON s.owner_id = p.id 
            WHERE p.id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own store withdrawals" ON store_withdrawals;
CREATE POLICY "Users can insert their own store withdrawals" ON store_withdrawals
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT s.id FROM stores s 
            JOIN profiles p ON s.owner_id = p.id 
            WHERE p.id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own store withdrawals" ON store_withdrawals;
CREATE POLICY "Users can update their own store withdrawals" ON store_withdrawals
    FOR UPDATE USING (
        store_id IN (
            SELECT s.id FROM stores s 
            JOIN profiles p ON s.owner_id = p.id 
            WHERE p.id = auth.uid()
        )
    );

-- Politiques pour store_bank_accounts
DROP POLICY IF EXISTS "Users can view their own store bank accounts" ON store_bank_accounts;
CREATE POLICY "Users can view their own store bank accounts" ON store_bank_accounts
    FOR SELECT USING (
        store_id IN (
            SELECT s.id FROM stores s 
            JOIN profiles p ON s.owner_id = p.id 
            WHERE p.id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own store bank accounts" ON store_bank_accounts;
CREATE POLICY "Users can insert their own store bank accounts" ON store_bank_accounts
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT s.id FROM stores s 
            JOIN profiles p ON s.owner_id = p.id 
            WHERE p.id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own store bank accounts" ON store_bank_accounts;
CREATE POLICY "Users can update their own store bank accounts" ON store_bank_accounts
    FOR UPDATE USING (
        store_id IN (
            SELECT s.id FROM stores s 
            JOIN profiles p ON s.owner_id = p.id 
            WHERE p.id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own store bank accounts" ON store_bank_accounts;
CREATE POLICY "Users can delete their own store bank accounts" ON store_bank_accounts
    FOR DELETE USING (
        store_id IN (
            SELECT s.id FROM stores s 
            JOIN profiles p ON s.owner_id = p.id 
            WHERE p.id = auth.uid()
        )
    );

-- =====================================================
-- FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour les statistiques de revenus
CREATE OR REPLACE FUNCTION update_store_revenue_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculer les nouvelles statistiques
    WITH stats AS (
        SELECT 
            store_id,
            COUNT(*) as total_transactions,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_transactions,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
            COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
            COALESCE(AVG(CASE WHEN status = 'completed' THEN amount END), 0) as average_order_value,
            COALESCE(SUM(CASE WHEN status = 'completed' AND transaction_date >= NOW() - INTERVAL '30 days' THEN amount ELSE 0 END), 0) as monthly_revenue,
            COALESCE(SUM(CASE WHEN status = 'completed' AND transaction_date >= NOW() - INTERVAL '7 days' THEN amount ELSE 0 END), 0) as weekly_revenue,
            COALESCE(SUM(CASE WHEN status = 'completed' AND transaction_date >= NOW() - INTERVAL '1 day' THEN amount ELSE 0 END), 0) as daily_revenue
        FROM store_transactions
        WHERE store_id = COALESCE(NEW.store_id, OLD.store_id)
        GROUP BY store_id
    )
    INSERT INTO store_revenue_stats (
        store_id, 
        total_revenue, 
        monthly_revenue, 
        weekly_revenue, 
        daily_revenue,
        total_transactions, 
        successful_transactions, 
        failed_transactions, 
        average_order_value,
        last_updated
    )
    SELECT 
        store_id,
        total_revenue,
        monthly_revenue,
        weekly_revenue,
        daily_revenue,
        total_transactions,
        successful_transactions,
        failed_transactions,
        average_order_value,
        NOW()
    FROM stats
    ON CONFLICT (store_id) DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        monthly_revenue = EXCLUDED.monthly_revenue,
        weekly_revenue = EXCLUDED.weekly_revenue,
        daily_revenue = EXCLUDED.daily_revenue,
        total_transactions = EXCLUDED.total_transactions,
        successful_transactions = EXCLUDED.successful_transactions,
        failed_transactions = EXCLUDED.failed_transactions,
        average_order_value = EXCLUDED.average_order_value,
        last_updated = NOW(),
        updated_at = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour les stats automatiquement
DROP TRIGGER IF EXISTS update_revenue_stats_trigger ON store_transactions;
CREATE TRIGGER update_revenue_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON store_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_store_revenue_stats();

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_store_revenue_stats_updated_at ON store_revenue_stats;
CREATE TRIGGER update_store_revenue_stats_updated_at
    BEFORE UPDATE ON store_revenue_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_transactions_updated_at ON store_transactions;
CREATE TRIGGER update_store_transactions_updated_at
    BEFORE UPDATE ON store_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_withdrawals_updated_at ON store_withdrawals;
CREATE TRIGGER update_store_withdrawals_updated_at
    BEFORE UPDATE ON store_withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_bank_accounts_updated_at ON store_bank_accounts;
CREATE TRIGGER update_store_bank_accounts_updated_at
    BEFORE UPDATE ON store_bank_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONNÉES DE TEST (optionnel)
-- =====================================================

-- Insérer des données de test si nécessaire
-- INSERT INTO store_revenue_stats (store_id, total_revenue, total_transactions) 
-- SELECT id, 0, 0 FROM stores LIMIT 1;

-- =====================================================
-- MESSAGE DE SUCCÈS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Tables de paiement Moneroo créées avec succès!';
    RAISE NOTICE '📊 Tables créées: store_revenue_stats, store_transactions, store_withdrawals, store_bank_accounts';
    RAISE NOTICE '🔒 RLS activé et configuré';
    RAISE NOTICE '⚡ Triggers automatiques configurés';
    RAISE NOTICE '🎯 Prêt pour l''intégration Moneroo!';
END $$; 