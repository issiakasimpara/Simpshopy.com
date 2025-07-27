-- =====================================================
-- CRÉATION SIMPLE DU SYSTÈME D'EMAILS
-- =====================================================

-- 1. Créer la table email_logs en premier
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID,
  store_id UUID,
  email_type VARCHAR(50) NOT NULL, -- 'admin' ou 'customer'
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'sent', 'failed', 'pending'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ajouter les contraintes de clés étrangères si les tables existent
DO $$
BEGIN
  -- Vérifier si la table orders existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    ALTER TABLE email_logs ADD CONSTRAINT IF NOT EXISTS fk_email_logs_order_id 
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
  END IF;
  
  -- Vérifier si la table stores existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stores') THEN
    ALTER TABLE email_logs ADD CONSTRAINT IF NOT EXISTS fk_email_logs_store_id 
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Créer les index
CREATE INDEX IF NOT EXISTS idx_email_logs_order_id ON email_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_store_id ON email_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- 4. Activer RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques RLS
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

-- 6. Ajouter les colonnes nécessaires dans orders (si la table existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
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
  END IF;
END $$;

-- 7. Ajouter les colonnes nécessaires dans stores (si la table existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stores') THEN
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
  END IF;
END $$;

-- 8. Créer la vue recent_email_logs (seulement si les tables existent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stores') THEN
    DROP VIEW IF EXISTS recent_email_logs;
    
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
  END IF;
END $$;

-- 9. Créer les fonctions utilitaires
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

-- 10. Créer la fonction trigger (seulement si la table orders existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
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

    -- Créer le trigger
    DROP TRIGGER IF EXISTS send_order_emails_trigger ON orders;
    CREATE TRIGGER send_order_emails_trigger
      AFTER INSERT ON orders
      FOR EACH ROW
      EXECUTE FUNCTION trigger_order_emails();
  END IF;
END $$;

-- 11. Test et confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Table email_logs créée avec succès';
  RAISE NOTICE '✅ Index créés avec succès';
  RAISE NOTICE '✅ Politiques RLS configurées';
  RAISE NOTICE '✅ Fonctions utilitaires créées';
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stores') THEN
    RAISE NOTICE '✅ Vue recent_email_logs créée';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    RAISE NOTICE '✅ Trigger d''emails configuré';
  END IF;
  
  RAISE NOTICE '🎉 Système d''emails configuré avec succès !';
END $$; 