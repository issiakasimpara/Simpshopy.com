-- =====================================================
-- CRÉATION FINALE DU SYSTÈME D'EMAILS - VERSION SIMPLE
-- =====================================================

-- 1. Créer la table email_logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID,
  store_id UUID,
  email_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer les index
CREATE INDEX IF NOT EXISTS idx_email_logs_order_id ON email_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_store_id ON email_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- 3. Activer RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
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

-- 5. Ajouter les colonnes dans orders (si la table existe)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;

-- 6. Ajouter les colonnes dans stores (si la table existe)
ALTER TABLE stores ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#6366f1';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS domain VARCHAR(255);

-- 7. Créer la vue recent_email_logs
DROP VIEW IF EXISTS recent_email_logs;
CREATE VIEW recent_email_logs AS
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

-- 8. Créer la fonction get_email_stats
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

-- 9. Créer la fonction cleanup_old_email_logs
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

-- 10. Créer la fonction log_email_sent
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

-- 11. Créer la fonction trigger_order_emails
CREATE OR REPLACE FUNCTION trigger_order_emails()
RETURNS TRIGGER AS $$
BEGIN
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

-- 12. Créer le trigger
DROP TRIGGER IF EXISTS send_order_emails_trigger ON orders;
CREATE TRIGGER send_order_emails_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_order_emails();

-- 13. Message de confirmation
SELECT '✅ Système d''emails configuré avec succès !' as status; 