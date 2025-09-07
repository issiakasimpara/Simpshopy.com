-- Triggers PostgreSQL pour envoi automatique d'emails ZeptoMail
-- Ce script crée les triggers qui envoient automatiquement des emails
-- quand une commande est créée ou mise à jour

-- 1. Fonction pour déclencher l'envoi d'emails
CREATE OR REPLACE FUNCTION trigger_send_order_emails()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Récupérer les variables d'environnement Supabase
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_key := current_setting('app.settings.service_role_key', true);
  
  -- Si les variables ne sont pas définies, utiliser les valeurs par défaut
  IF supabase_url IS NULL THEN
    supabase_url := 'https://grutldacuowplosarucp.supabase.co';
  END IF;
  
  IF service_key IS NULL THEN
    service_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQ4NzQ4MCwiZXhwIjoyMDUzMDYzNDgwfQ.8Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q';
  END IF;

  -- Appeler l'Edge Function pour envoyer les emails
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/send-order-emails',
    headers := json_build_object(
      'Authorization', 'Bearer ' || service_key,
      'Content-Type', 'application/json'
    ),
    body := json_build_object('orderId', NEW.id)::jsonb
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne pas faire échouer l'insertion
    RAISE WARNING 'Erreur lors de l''envoi d''emails pour la commande %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger pour les nouvelles commandes
DROP TRIGGER IF EXISTS send_emails_on_order_creation ON public_orders;
CREATE TRIGGER send_emails_on_order_creation
  AFTER INSERT ON public_orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_send_order_emails();

-- 3. Trigger pour les mises à jour de statut
DROP TRIGGER IF EXISTS send_emails_on_order_update ON public_orders;
CREATE TRIGGER send_emails_on_order_update
  AFTER UPDATE OF status ON public_orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION trigger_send_order_emails();

-- 4. Fonction pour envoyer des emails de changement de statut
CREATE OR REPLACE FUNCTION trigger_send_status_update_emails()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Récupérer les variables d'environnement Supabase
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_key := current_setting('app.settings.service_role_key', true);
  
  -- Si les variables ne sont pas définies, utiliser les valeurs par défaut
  IF supabase_url IS NULL THEN
    supabase_url := 'https://grutldacuowplosarucp.supabase.co';
  END IF;
  
  IF service_key IS NULL THEN
    service_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydXRsZGFjdW93cGxvc2FydWNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQ4NzQ4MCwiZXhwIjoyMDUzMDYzNDgwfQ.8Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q';
  END IF;

  -- Appeler l'Edge Function pour envoyer les emails de changement de statut
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/send-status-update-emails',
    headers := json_build_object(
      'Authorization', 'Bearer ' || service_key,
      'Content-Type', 'application/json'
    ),
    body := json_build_object(
      'orderId', NEW.id,
      'oldStatus', OLD.status,
      'newStatus', NEW.status
    )::jsonb
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne pas faire échouer la mise à jour
    RAISE WARNING 'Erreur lors de l''envoi d''emails de changement de statut pour la commande %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger pour les changements de statut (expédition, livraison, etc.)
DROP TRIGGER IF EXISTS send_status_update_emails ON public_orders;
CREATE TRIGGER send_status_update_emails
  AFTER UPDATE OF status ON public_orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('shipped', 'delivered', 'cancelled'))
  EXECUTE FUNCTION trigger_send_status_update_emails();

-- 6. Table pour les logs d'emails
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public_orders(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL, -- 'confirmation', 'admin_notification', 'status_update'
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_email_logs_order_id ON email_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

-- 8. Fonction pour logger les envois d'emails
CREATE OR REPLACE FUNCTION log_email_send(
  p_order_id UUID,
  p_email_type VARCHAR(50),
  p_recipient_email TEXT,
  p_subject TEXT,
  p_status VARCHAR(20),
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO email_logs (
    order_id,
    email_type,
    recipient_email,
    subject,
    status,
    error_message,
    sent_at
  ) VALUES (
    p_order_id,
    p_email_type,
    p_recipient_email,
    p_subject,
    p_status,
    p_error_message,
    CASE WHEN p_status = 'sent' THEN NOW() ELSE NULL END
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Politique RLS pour les logs d'emails
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can view their email logs" ON email_logs
  FOR SELECT USING (
    order_id IN (
      SELECT public_orders.id 
      FROM public_orders 
      WHERE public_orders.store_id IN (
        SELECT stores.id 
        FROM stores 
        WHERE stores.merchant_id IN (
          SELECT profiles.id 
          FROM profiles 
          WHERE profiles.user_id = auth.uid()
        )
      )
    )
  );

-- 10. Commentaires pour la documentation
COMMENT ON FUNCTION trigger_send_order_emails() IS 'Déclenche l''envoi d''emails automatiques lors de la création d''une commande';
COMMENT ON FUNCTION trigger_send_status_update_emails() IS 'Déclenche l''envoi d''emails automatiques lors du changement de statut d''une commande';
COMMENT ON FUNCTION log_email_send(UUID, VARCHAR(50), TEXT, TEXT, VARCHAR(20), TEXT) IS 'Enregistre les logs d''envoi d''emails';
COMMENT ON TABLE email_logs IS 'Logs des envois d''emails pour traçabilité et debugging';
