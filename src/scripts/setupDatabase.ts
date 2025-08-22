import { supabase } from '@/integrations/supabase/client';

const createTablesSQL = `
-- Créer la table pour les paramètres de marché
CREATE TABLE IF NOT EXISTS public.market_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  enabled_countries TEXT[] NOT NULL DEFAULT '{}',
  default_currency TEXT NOT NULL DEFAULT 'XOF',
  tax_settings JSONB DEFAULT '{
    "includeTax": false,
    "taxRate": 0,
    "taxLabel": "TVA"
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id)
);

-- Créer la table pour les méthodes de livraison
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  estimated_days TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📦',
  is_active BOOLEAN NOT NULL DEFAULT true,
  available_countries TEXT[] DEFAULT '{}',
  conditions JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_market_settings_store_id ON public.market_settings(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_store_id ON public.shipping_methods(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_active ON public.shipping_methods(store_id, is_active);

-- Activer RLS
ALTER TABLE public.market_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;
`;

const createPoliciesSQL = `
-- Politiques pour market_settings
DROP POLICY IF EXISTS "Users can view their own market settings" ON public.market_settings;
CREATE POLICY "Users can view their own market settings" ON public.market_settings
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM public.stores WHERE merchant_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own market settings" ON public.market_settings;
CREATE POLICY "Users can insert their own market settings" ON public.market_settings
  FOR INSERT WITH CHECK (
    store_id IN (
      SELECT id FROM public.stores WHERE merchant_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own market settings" ON public.market_settings;
CREATE POLICY "Users can update their own market settings" ON public.market_settings
  FOR UPDATE USING (
    store_id IN (
      SELECT id FROM public.stores WHERE merchant_id = auth.uid()
    )
  );

-- Politiques pour shipping_methods
DROP POLICY IF EXISTS "Users can view their own shipping methods" ON public.shipping_methods;
CREATE POLICY "Users can view their own shipping methods" ON public.shipping_methods
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM public.stores WHERE merchant_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own shipping methods" ON public.shipping_methods;
CREATE POLICY "Users can insert their own shipping methods" ON public.shipping_methods
  FOR INSERT WITH CHECK (
    store_id IN (
      SELECT id FROM public.stores WHERE merchant_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own shipping methods" ON public.shipping_methods;
CREATE POLICY "Users can update their own shipping methods" ON public.shipping_methods
  FOR UPDATE USING (
    store_id IN (
      SELECT id FROM public.stores WHERE merchant_id = auth.uid()
    )
  );

-- Politique pour les clients (lecture seule des méthodes actives)
DROP POLICY IF EXISTS "Anyone can view active shipping methods" ON public.shipping_methods;
CREATE POLICY "Anyone can view active shipping methods" ON public.shipping_methods
  FOR SELECT USING (is_active = true);
`;

export async function setupDatabase() {
  try {
    console.log('🔧 Configuration de la base de données...');

    // Créer la table market_settings
    console.log('📋 Création table market_settings...');
    const { error: marketError } = await supabase.from('market_settings').select('id').limit(1);

    if (marketError && marketError.code === '42P01') {
      // Table n'existe pas, on doit la créer manuellement
      console.log('❌ Table market_settings manquante. Veuillez exécuter le script SQL manuellement.');
      alert('Les tables de base de données sont manquantes. Veuillez contacter l\'administrateur pour configurer la base de données.');
      return false;
    }

    // Créer la table shipping_methods
    console.log('📋 Vérification table shipping_methods...');
    const { error: shippingError } = await supabase.from('shipping_methods').select('id').limit(1);

    if (shippingError && shippingError.code === '42P01') {
      console.log('❌ Table shipping_methods manquante. Veuillez exécuter le script SQL manuellement.');
      alert('Les tables de base de données sont manquantes. Veuillez contacter l\'administrateur pour configurer la base de données.');
      return false;
    }

    console.log('✅ Tables vérifiées avec succès !');
    return true;
  } catch (error) {
    console.error('❌ Erreur configuration base de données:', error);
    alert('Erreur lors de la vérification de la base de données. Consultez la console pour plus de détails.');
    return false;
  }
}

// Fonction pour vérifier si les tables existent
export async function checkTables() {
  try {
    console.log('🔍 Vérification des tables...');
    
    const { data: marketSettings, error: marketError } = await supabase
      .from('market_settings')
      .select('count')
      .limit(1);

    const { data: shippingMethods, error: shippingError } = await supabase
      .from('shipping_methods')
      .select('count')
      .limit(1);

    if (marketError || shippingError) {
      console.log('❌ Tables manquantes, création nécessaire');
      return false;
    }

    console.log('✅ Tables existantes');
    return true;
  } catch (error) {
    console.log('❌ Tables manquantes:', error);
    return false;
  }
}

// Auto-exécution si appelé directement
if (typeof window !== 'undefined') {
  (window as any).setupDatabase = setupDatabase;
  (window as any).checkTables = checkTables;
}
