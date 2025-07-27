-- Script pour ajouter une contrainte unique sur store_transactions
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter une contrainte unique pour éviter les doublons de transactions
ALTER TABLE public.store_transactions 
ADD CONSTRAINT unique_transaction_order_store 
UNIQUE (order_id, store_id);

-- Ajouter un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_store_transactions_order_store 
ON public.store_transactions(order_id, store_id);

-- Vérifier que la contrainte a été ajoutée
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'store_transactions' 
AND constraint_type = 'UNIQUE'; 