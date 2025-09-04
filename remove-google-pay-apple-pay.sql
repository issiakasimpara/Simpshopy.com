-- Suppression des colonnes Google Pay et Apple Pay de la table payment_configurations
-- Ce script supprime les colonnes inutiles pour simplifier la structure

-- Supprimer les colonnes Google Pay
ALTER TABLE payment_configurations DROP COLUMN IF EXISTS googlepay_enabled;
ALTER TABLE payment_configurations DROP COLUMN IF EXISTS googlepay_test_mode;
ALTER TABLE payment_configurations DROP COLUMN IF EXISTS googlepay_api_key;
ALTER TABLE payment_configurations DROP COLUMN IF EXISTS googlepay_webhook_url;

-- Supprimer les colonnes Apple Pay
ALTER TABLE payment_configurations DROP COLUMN IF EXISTS applepay_enabled;
ALTER TABLE payment_configurations DROP COLUMN IF EXISTS applepay_test_mode;
ALTER TABLE payment_configurations DROP COLUMN IF EXISTS applepay_api_key;
ALTER TABLE payment_configurations DROP COLUMN IF EXISTS applepay_webhook_url;

-- Vérifier la structure de la table après suppression
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'payment_configurations' 
ORDER BY ordinal_position;
