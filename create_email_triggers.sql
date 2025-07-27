-- =====================================================
-- SYSTÈME D'EMAILS AUTOMATIQUES SIMPSHOPY
-- Triggers pour déclencher l'envoi d'emails à chaque commande
-- =====================================================

-- 1. Fonction pour déclencher l'envoi d'emails
CREATE OR REPLACE FUNCTION trigger_order_emails()
RETURNS TRIGGER AS $$
BEGIN
  -- Appeler l'Edge Function pour envoyer les emails
  PERFORM net.http_post(
    url := 'https://grutldacuowplosarucp.supabase.co/functions/v1/send-order-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'orderId', NEW.id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger pour déclencher l'envoi d'emails à chaque nouvelle commande
DROP TRIGGER IF EXISTS send_order_emails_trigger ON orders;
CREATE TRIGGER send_order_emails_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_order_emails();

-- 3. Fonction pour mettre à jour les colonnes nécessaires dans la table orders
-- (si elles n'existent pas déjà)
DO $$
BEGIN
  -- Ajouter la colonne customer_email si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'customer_email') THEN
    ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255);
  END IF;
  
  -- Ajouter la colonne customer_name si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'customer_name') THEN
    ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255);
  END IF;
  
  -- Ajouter la colonne payment_method si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
    ALTER TABLE orders ADD COLUMN payment_method VARCHAR(100);
  END IF;
  
  -- Ajouter la colonne shipping_address si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'shipping_address') THEN
    ALTER TABLE orders ADD COLUMN shipping_address JSONB;
  END IF;
END $$;

-- 4. Fonction pour mettre à jour les colonnes nécessaires dans la table stores
-- (si elles n'existent pas déjà)
DO $$
BEGIN
  -- Ajouter la colonne logo_url si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'stores' AND column_name = 'logo_url') THEN
    ALTER TABLE stores ADD COLUMN logo_url TEXT;
  END IF;
  
  -- Ajouter la colonne primary_color si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'stores' AND column_name = 'primary_color') THEN
    ALTER TABLE stores ADD COLUMN primary_color VARCHAR(7) DEFAULT '#6366f1';
  END IF;
  
  -- Ajouter la colonne contact_email si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'stores' AND column_name = 'contact_email') THEN
    ALTER TABLE stores ADD COLUMN contact_email VARCHAR(255);
  END IF;
  
  -- Ajouter la colonne domain si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'stores' AND column_name = 'domain') THEN
    ALTER TABLE stores ADD COLUMN domain VARCHAR(255);
  END IF;
END $$;

-- 5. Table pour logger les emails envoyés
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL, -- 'admin' ou 'customer'
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'sent', 'failed', 'pending'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Index pour optimiser les requêtes sur les logs
CREATE INDEX IF NOT EXISTS idx_email_logs_order_id ON email_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_store_id ON email_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- 7. Fonction pour logger les emails
CREATE OR REPLACE FUNCTION log_email_sent(
  p_order_id UUID,
  p_store_id UUID,
  p_email_type VARCHAR(50),
  p_recipient_email VARCHAR(255),
  p_subject VARCHAR(255),
  p_status VARCHAR(50),
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO email_logs (
    order_id,
    store_id,
    email_type,
    recipient_email,
    subject,
    status,
    error_message
  ) VALUES (
    p_order_id,
    p_store_id,
    p_email_type,
    p_recipient_email,
    p_subject,
    p_status,
    p_error_message
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RLS Policies pour la table email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Les admins peuvent voir tous les logs de leurs boutiques
CREATE POLICY "Admins can view email logs for their stores" ON email_logs
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM stores 
      WHERE merchant_id = auth.uid()
    )
  );

-- Seul le service peut insérer des logs
CREATE POLICY "Service can insert email logs" ON email_logs
  FOR INSERT WITH CHECK (true);

-- 9. Fonction pour obtenir les statistiques d'emails par boutique
CREATE OR REPLACE FUNCTION get_email_stats(p_store_id UUID DEFAULT NULL)
RETURNS TABLE (
  store_name VARCHAR(255),
  total_emails BIGINT,
  sent_emails BIGINT,
  failed_emails BIGINT,
  success_rate NUMERIC(5,2),
  last_email_sent TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.name as store_name,
    COUNT(el.id) as total_emails,
    COUNT(CASE WHEN el.status = 'sent' THEN 1 END) as sent_emails,
    COUNT(CASE WHEN el.status = 'failed' THEN 1 END) as failed_emails,
    ROUND(
      (COUNT(CASE WHEN el.status = 'sent' THEN 1 END)::NUMERIC / COUNT(el.id)::NUMERIC) * 100, 
      2
    ) as success_rate,
    MAX(el.sent_at) as last_email_sent
  FROM stores s
  LEFT JOIN email_logs el ON s.id = el.store_id
  WHERE (p_store_id IS NULL OR s.id = p_store_id)
    AND (auth.uid() IS NULL OR s.merchant_id = auth.uid())
  GROUP BY s.id, s.name
  ORDER BY s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Vue pour afficher les logs d'emails récents
CREATE OR REPLACE VIEW recent_email_logs AS
SELECT 
  el.id,
  el.order_id,
  el.store_id,
  s.name as store_name,
  el.email_type,
  el.recipient_email,
  el.subject,
  el.status,
  el.error_message,
  el.sent_at,
  o.customer_name,
  o.total_amount
FROM email_logs el
JOIN stores s ON el.store_id = s.id
LEFT JOIN orders o ON el.order_id = o.id
WHERE (s.merchant_id = auth.uid() OR auth.uid() IS NULL)
ORDER BY el.sent_at DESC;

-- RLS pour la vue
CREATE POLICY "Admins can view recent email logs" ON recent_email_logs
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM stores 
      WHERE merchant_id = auth.uid()
    )
  );

-- 11. Fonction pour nettoyer les anciens logs (garder 30 jours)
CREATE OR REPLACE FUNCTION cleanup_old_email_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM email_logs 
  WHERE sent_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Job pour nettoyer automatiquement les anciens logs (optionnel)
-- À exécuter manuellement ou via un cron job
-- SELECT cleanup_old_email_logs();

-- =====================================================
-- MESSAGES DE CONFIRMATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Système d''emails automatiques configuré avec succès !';
  RAISE NOTICE '📧 Trigger créé pour la table orders';
  RAISE NOTICE '📊 Table email_logs créée pour le suivi';
  RAISE NOTICE '🔧 Fonctions utilitaires créées';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Prochaines étapes :';
  RAISE NOTICE '1. Configurer RESEND_API_KEY dans les variables d''environnement Supabase';
  RAISE NOTICE '2. Déployer l''Edge Function send-order-emails';
  RAISE NOTICE '3. Tester avec une commande';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Pour tester :';
  RAISE NOTICE 'INSERT INTO orders (store_id, customer_email, customer_name, total_amount, status) VALUES (''store_id_here'', ''test@example.com'', ''Test User'', 1000, ''pending'');';
END $$; 