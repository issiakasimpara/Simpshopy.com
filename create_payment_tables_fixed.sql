-- Script pour créer les tables de paiement manquantes (CORRIGÉ)
-- À exécuter dans l'éditeur SQL de Supabase

-- Table pour les statistiques de revenus par boutique
CREATE TABLE IF NOT EXISTS public.store_revenue_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  total_revenue bigint NOT NULL DEFAULT 0,
  today_revenue bigint NOT NULL DEFAULT 0,
  week_revenue bigint NOT NULL DEFAULT 0,
  month_revenue bigint NOT NULL DEFAULT 0,
  total_orders integer NOT NULL DEFAULT 0,
  today_orders integer NOT NULL DEFAULT 0,
  week_orders integer NOT NULL DEFAULT 0,
  month_orders integer NOT NULL DEFAULT 0,
  average_order_value bigint NOT NULL DEFAULT 0,
  conversion_rate decimal(5,2) NOT NULL DEFAULT 0,
  last_updated timestamp with time zone DEFAULT timezone('utc', now()),
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  UNIQUE (store_id)
);

-- Table pour les transactions
CREATE TABLE IF NOT EXISTS public.store_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_id text NOT NULL,
  customer_name text NOT NULL,
  customer_email text,
  amount bigint NOT NULL,
  status text NOT NULL CHECK (status IN ('completed', 'pending', 'failed', 'refunded')),
  payment_method text NOT NULL,
  payment_gateway text NOT NULL,
  currency text NOT NULL DEFAULT 'XOF',
  product_name text,
  product_id uuid,
  transaction_date timestamp with time zone DEFAULT timezone('utc', now()),
  created_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- Table pour les demandes de retrait
CREATE TABLE IF NOT EXISTS public.store_withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  amount bigint NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  bank_account text NOT NULL,
  bank_name text,
  account_number text,
  requested_at timestamp with time zone DEFAULT timezone('utc', now()),
  processed_at timestamp with time zone,
  processed_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- Table pour les comptes bancaires des boutiques
CREATE TABLE IF NOT EXISTS public.store_bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_holder text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  UNIQUE (store_id, account_number)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_store_revenue_stats_store_id ON public.store_revenue_stats(store_id);
CREATE INDEX IF NOT EXISTS idx_store_transactions_store_id ON public.store_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_store_transactions_status ON public.store_transactions(status);
CREATE INDEX IF NOT EXISTS idx_store_transactions_date ON public.store_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_store_withdrawals_store_id ON public.store_withdrawals(store_id);
CREATE INDEX IF NOT EXISTS idx_store_withdrawals_status ON public.store_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_store_bank_accounts_store_id ON public.store_bank_accounts(store_id);

-- Activer RLS
ALTER TABLE public.store_revenue_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_bank_accounts ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view their own store revenue stats" ON public.store_revenue_stats;
DROP POLICY IF EXISTS "Users can update their own store revenue stats" ON public.store_revenue_stats;
DROP POLICY IF EXISTS "Users can view their own store transactions" ON public.store_transactions;
DROP POLICY IF EXISTS "Users can insert their own store transactions" ON public.store_transactions;
DROP POLICY IF EXISTS "Users can view their own store withdrawals" ON public.store_withdrawals;
DROP POLICY IF EXISTS "Users can insert their own store withdrawals" ON public.store_withdrawals;
DROP POLICY IF EXISTS "Users can update their own store withdrawals" ON public.store_withdrawals;
DROP POLICY IF EXISTS "Users can view their own store bank accounts" ON public.store_bank_accounts;
DROP POLICY IF EXISTS "Users can insert their own store bank accounts" ON public.store_bank_accounts;
DROP POLICY IF EXISTS "Users can update their own store bank accounts" ON public.store_bank_accounts;
DROP POLICY IF EXISTS "Users can delete their own store bank accounts" ON public.store_bank_accounts;

-- Politiques RLS pour store_revenue_stats
CREATE POLICY "Users can view their own store revenue stats"
ON public.store_revenue_stats
FOR SELECT
USING (
  store_id IN (
    SELECT s.id FROM public.stores s
    JOIN public.profiles p ON s.merchant_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own store revenue stats"
ON public.store_revenue_stats
FOR UPDATE
USING (
  store_id IN (
    SELECT s.id FROM public.stores s
    JOIN public.profiles p ON s.merchant_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- Politiques RLS pour store_transactions
CREATE POLICY "Users can view their own store transactions"
ON public.store_transactions
FOR SELECT
USING (
  store_id IN (
    SELECT s.id FROM public.stores s
    JOIN public.profiles p ON s.merchant_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own store transactions"
ON public.store_transactions
FOR INSERT
WITH CHECK (
  store_id IN (
    SELECT s.id FROM public.stores s
    JOIN public.profiles p ON s.merchant_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- Politiques RLS pour store_withdrawals
CREATE POLICY "Users can view their own store withdrawals"
ON public.store_withdrawals
FOR SELECT
USING (
  store_id IN (
    SELECT s.id FROM public.stores s
    JOIN public.profiles p ON s.merchant_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own store withdrawals"
ON public.store_withdrawals
FOR INSERT
WITH CHECK (
  store_id IN (
    SELECT s.id FROM public.stores s
    JOIN public.profiles p ON s.merchant_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own store withdrawals"
ON public.store_withdrawals
FOR UPDATE
USING (
  store_id IN (
    SELECT s.id FROM public.stores s
    JOIN public.profiles p ON s.merchant_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- Politiques RLS pour store_bank_accounts
CREATE POLICY "Users can view their own store bank accounts"
ON public.store_bank_accounts
FOR SELECT
USING (
  store_id IN (
    SELECT s.id FROM public.stores s
    JOIN public.profiles p ON s.merchant_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own store bank accounts"
ON public.store_bank_accounts
FOR INSERT
WITH CHECK (
  store_id IN (
    SELECT s.id FROM public.stores s
    JOIN public.profiles p ON s.merchant_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own store bank accounts"
ON public.store_bank_accounts
FOR UPDATE
USING (
  store_id IN (
    SELECT s.id FROM public.stores s
    JOIN public.profiles p ON s.merchant_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own store bank accounts"
ON public.store_bank_accounts
FOR DELETE
USING (
  store_id IN (
    SELECT s.id FROM public.stores s
    JOIN public.profiles p ON s.merchant_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- Fonction pour calculer automatiquement les statistiques de revenus
CREATE OR REPLACE FUNCTION update_store_revenue_stats()
RETURNS trigger AS $$
BEGIN
  -- Mettre à jour les statistiques quand une transaction est ajoutée/modifiée
  INSERT INTO public.store_revenue_stats (
    store_id,
    total_revenue,
    today_revenue,
    week_revenue,
    month_revenue,
    total_orders,
    today_orders,
    week_orders,
    month_orders,
    average_order_value,
    conversion_rate,
    last_updated
  )
  SELECT
    store_id,
    SUM(amount) AS total_revenue,
    SUM(CASE WHEN transaction_date >= date_trunc('day', now()) THEN amount ELSE 0 END) AS today_revenue,
    SUM(CASE WHEN transaction_date >= date_trunc('week', now()) THEN amount ELSE 0 END) AS week_revenue,
    SUM(CASE WHEN transaction_date >= date_trunc('month', now()) THEN amount ELSE 0 END) AS month_revenue,
    COUNT(*) AS total_orders,
    COUNT(CASE WHEN transaction_date >= date_trunc('day', now()) THEN 1 END) AS today_orders,
    COUNT(CASE WHEN transaction_date >= date_trunc('week', now()) THEN 1 END) AS week_orders,
    COUNT(CASE WHEN transaction_date >= date_trunc('month', now()) THEN 1 END) AS month_orders,
    AVG(amount) AS average_order_value,
    0 AS conversion_rate, -- À calculer séparément
    now() AS last_updated
  FROM public.store_transactions
  WHERE store_id = NEW.store_id AND status = 'completed'
  GROUP BY store_id
  ON CONFLICT (store_id) DO UPDATE SET
    total_revenue = EXCLUDED.total_revenue,
    today_revenue = EXCLUDED.today_revenue,
    week_revenue = EXCLUDED.week_revenue,
    month_revenue = EXCLUDED.month_revenue,
    total_orders = EXCLUDED.total_orders,
    today_orders = EXCLUDED.today_orders,
    week_orders = EXCLUDED.week_orders,
    month_orders = EXCLUDED.month_orders,
    average_order_value = EXCLUDED.average_order_value,
    last_updated = EXCLUDED.last_updated;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement les statistiques
DROP TRIGGER IF EXISTS update_revenue_stats_trigger ON public.store_transactions;
CREATE TRIGGER update_revenue_stats_trigger
AFTER INSERT OR UPDATE ON public.store_transactions
FOR EACH ROW
EXECUTE FUNCTION update_store_revenue_stats();

-- Vérifier que les tables ont été créées
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('store_revenue_stats', 'store_transactions', 'store_withdrawals', 'store_bank_accounts')
ORDER BY table_name; 