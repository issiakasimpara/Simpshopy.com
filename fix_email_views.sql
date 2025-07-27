-- =====================================================
-- CORRECTION DU SYSTÈME D'EMAILS - VUES ET FONCTIONS
-- =====================================================

-- 1. Supprimer la vue si elle existe (pour la recréer)
DROP VIEW IF EXISTS recent_email_logs;

-- 2. Recréer la vue correctement
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
ORDER BY el.sent_at DESC;

-- 3. Supprimer les politiques RLS sur la vue (elles ne fonctionnent pas sur les vues)
DROP POLICY IF EXISTS "Admins can view recent email logs" ON recent_email_logs;

-- 4. Vérifier que la fonction get_email_stats existe, sinon la créer
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
    CASE 
      WHEN COUNT(el.id) > 0 THEN 
        ROUND(
          (COUNT(CASE WHEN el.status = 'sent' THEN 1 END)::NUMERIC / COUNT(el.id)::NUMERIC) * 100, 
          2
        )
      ELSE 0
    END as success_rate,
    MAX(el.sent_at) as last_email_sent
  FROM stores s
  LEFT JOIN email_logs el ON s.id = el.store_id
  WHERE (p_store_id IS NULL OR s.id = p_store_id)
  GROUP BY s.id, s.name
  ORDER BY s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Vérifier que la fonction cleanup_old_email_logs existe
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

-- 6. Vérifier que la fonction log_email_sent existe
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

-- 7. Vérifier que le trigger existe
DO $$
BEGIN
  -- Vérifier si le trigger existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'send_order_emails_trigger'
  ) THEN
    -- Recréer le trigger
    CREATE TRIGGER send_order_emails_trigger
      AFTER INSERT ON orders
      FOR EACH ROW
      EXECUTE FUNCTION trigger_order_emails();
  END IF;
END $$;

-- 8. Vérifier que la fonction trigger_order_emails existe
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

-- 9. Vérifier que toutes les colonnes nécessaires existent dans orders
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

-- 10. Vérifier que toutes les colonnes nécessaires existent dans stores
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

-- 11. Vérifier que la table email_logs existe
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

-- 12. Créer les index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_email_logs_order_id ON email_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_store_id ON email_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- 13. Activer RLS sur email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- 14. Créer les politiques RLS pour email_logs
DROP POLICY IF EXISTS "Admins can view email logs for their stores" ON email_logs;
CREATE POLICY "Admins can view email logs for their stores" ON email_logs
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM stores 
      WHERE merchant_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service can insert email logs" ON email_logs;
CREATE POLICY "Service can insert email logs" ON email_logs
  FOR INSERT WITH CHECK (true);

-- 15. Test de la vue
DO $$
BEGIN
  -- Test simple de la vue
  PERFORM 1 FROM recent_email_logs LIMIT 1;
  RAISE NOTICE '✅ Vue recent_email_logs créée avec succès';
  
  -- Test de la fonction get_email_stats
  PERFORM 1 FROM get_email_stats() LIMIT 1;
  RAISE NOTICE '✅ Fonction get_email_stats créée avec succès';
  
  -- Test de la fonction cleanup_old_email_logs
  PERFORM cleanup_old_email_logs();
  RAISE NOTICE '✅ Fonction cleanup_old_email_logs créée avec succès';
  
  RAISE NOTICE '🎉 Toutes les corrections ont été appliquées avec succès !';
END $$; 