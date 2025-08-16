-- Script complet pour créer les tables OAuth et corriger les politiques RLS
-- À exécuter manuellement dans le Supabase Dashboard

-- 1. Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view their own oauth integrations" ON oauth_integrations;
DROP POLICY IF EXISTS "Users can insert their own oauth integrations" ON oauth_integrations;
DROP POLICY IF EXISTS "Users can update their own oauth integrations" ON oauth_integrations;
DROP POLICY IF EXISTS "Users can delete their own oauth integrations" ON oauth_integrations;

-- 2. Supprimer les tables si elles existent
DROP TABLE IF EXISTS oauth_sync_logs;
DROP TABLE IF EXISTS oauth_integrations;

-- 3. Créer la table oauth_integrations
CREATE TABLE IF NOT EXISTS oauth_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    provider_user_id VARCHAR(255),
    provider_account_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, store_id, provider)
);

-- 4. Créer la table oauth_sync_logs
CREATE TABLE IF NOT EXISTS oauth_sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    integration_id UUID REFERENCES oauth_integrations(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Activer RLS sur les tables
ALTER TABLE oauth_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_sync_logs ENABLE ROW LEVEL SECURITY;

-- 6. Créer les politiques RLS pour oauth_integrations
CREATE POLICY "Users can view their own oauth integrations" ON oauth_integrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own oauth integrations" ON oauth_integrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own oauth integrations" ON oauth_integrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own oauth integrations" ON oauth_integrations
    FOR DELETE USING (auth.uid() = user_id);

-- 7. Créer les politiques RLS pour oauth_sync_logs
CREATE POLICY "Users can view their own oauth sync logs" ON oauth_sync_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM oauth_integrations 
            WHERE oauth_integrations.id = oauth_sync_logs.integration_id 
            AND oauth_integrations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own oauth sync logs" ON oauth_sync_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM oauth_integrations 
            WHERE oauth_integrations.id = oauth_sync_logs.integration_id 
            AND oauth_integrations.user_id = auth.uid()
        )
    );

-- 8. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_oauth_integrations_user_store_provider ON oauth_integrations(user_id, store_id, provider);
CREATE INDEX IF NOT EXISTS idx_oauth_integrations_active ON oauth_integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_oauth_sync_logs_integration_id ON oauth_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_oauth_sync_logs_created_at ON oauth_sync_logs(created_at);

-- 9. Vérifier que les tables sont créées
SELECT 'oauth_integrations' as table_name, COUNT(*) as row_count FROM oauth_integrations
UNION ALL
SELECT 'oauth_sync_logs' as table_name, COUNT(*) as row_count FROM oauth_sync_logs;
