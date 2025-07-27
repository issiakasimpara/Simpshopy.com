-- =====================================================
-- CORRECTION DE LA FONCTION get_email_stats
-- =====================================================

-- Supprimer la fonction existante
DROP FUNCTION IF EXISTS get_email_stats(UUID);

-- Recréer la fonction avec les bons types
CREATE OR REPLACE FUNCTION get_email_stats(p_store_id UUID DEFAULT NULL)
RETURNS TABLE (
  store_name TEXT,
  total_emails BIGINT,
  sent_emails BIGINT,
  failed_emails BIGINT,
  success_rate NUMERIC(5,2),
  last_email_sent TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.name::TEXT as store_name,
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

-- Test de la fonction
SELECT '✅ Fonction get_email_stats corrigée avec succès !' as status;

-- Test de la fonction
SELECT * FROM get_email_stats(); 