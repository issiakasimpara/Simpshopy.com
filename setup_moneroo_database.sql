-- =====================================================
-- SCRIPT DE CONFIGURATION MONEROO - SUPABASE
-- =====================================================

-- 1. Table des statistiques de revenus
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
    
    UNIQUE(store_id, order_id)
);

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
CREATE INDEX IF NOT EXISTS idx_store_revenue_stats_store_id ON store_revenue_stats(store_id);
CREATE INDEX IF NOT EXISTS idx_store_transactions_store_id ON store_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_store_transactions_status ON store_transactions(status);
CREATE INDEX IF NOT EXISTS idx_store_transactions_transaction_date ON store_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_store_withdrawals_store_id ON store_withdrawals(store_id);
CREATE INDEX IF NOT EXISTS idx_store_bank_accounts_store_id ON store_bank_accounts(store_id);

-- Activer RLS
ALTER TABLE store_revenue_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_bank_accounts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS simplifiées
DROP POLICY IF EXISTS "Users can view their own store revenue stats" ON store_revenue_stats;
CREATE POLICY "Users can view their own store revenue stats" ON store_revenue_stats
    FOR SELECT USING (
        store_id IN (
            SELECT s.id FROM stores s 
            JOIN profiles p ON s.owner_id = p.id 
            WHERE p.id = auth.uid()
        )
    );

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

-- Message de succès
DO $$
BEGIN
    RAISE NOTICE '✅ Tables Moneroo créées avec succès!';
    RAISE NOTICE '📊 Tables: store_revenue_stats, store_transactions, store_withdrawals, store_bank_accounts';
    RAISE NOTICE '🔒 RLS activé et configuré';
    RAISE NOTICE '🎯 Prêt pour l''intégration Moneroo!';
END $$; 