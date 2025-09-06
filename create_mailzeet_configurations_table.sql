-- Créer la table pour stocker les configurations Mailzeet
CREATE TABLE IF NOT EXISTS mailzeet_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  server_name TEXT NOT NULL,
  from_email TEXT NOT NULL DEFAULT 'noreply@simpshopy.com',
  from_name TEXT NOT NULL DEFAULT 'Simpshopy',
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte unique : une seule configuration par boutique
  UNIQUE(store_id)
);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_mailzeet_configurations_store_id ON mailzeet_configurations(store_id);
CREATE INDEX IF NOT EXISTS idx_mailzeet_configurations_enabled ON mailzeet_configurations(enabled);

-- Activer RLS (Row Level Security)
ALTER TABLE mailzeet_configurations ENABLE ROW LEVEL SECURITY;

-- Politique RLS : Les propriétaires de boutique peuvent gérer leur configuration
CREATE POLICY "Store owners can manage their mailzeet configuration" ON mailzeet_configurations
  FOR ALL USING (
    store_id IN (
      SELECT id FROM stores WHERE merchant_id = auth.uid()
    )
  );

-- Politique RLS : Lecture publique pour les Edge Functions
CREATE POLICY "Public read access for edge functions" ON mailzeet_configurations
  FOR SELECT USING (enabled = true);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_mailzeet_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER trigger_update_mailzeet_configurations_updated_at
  BEFORE UPDATE ON mailzeet_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_mailzeet_configurations_updated_at();

-- Commentaires pour la documentation
COMMENT ON TABLE mailzeet_configurations IS 'Configuration Mailzeet pour chaque boutique';
COMMENT ON COLUMN mailzeet_configurations.store_id IS 'ID de la boutique';
COMMENT ON COLUMN mailzeet_configurations.api_key IS 'Clé API Mailzeet (chiffrée)';
COMMENT ON COLUMN mailzeet_configurations.server_name IS 'Nom du serveur SMTP configuré dans Mailzeet';
COMMENT ON COLUMN mailzeet_configurations.from_email IS 'Email expéditeur par défaut';
COMMENT ON COLUMN mailzeet_configurations.from_name IS 'Nom expéditeur par défaut';
COMMENT ON COLUMN mailzeet_configurations.enabled IS 'Activation de Mailzeet pour cette boutique';
