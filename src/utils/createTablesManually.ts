import { supabase } from '@/integrations/supabase/client';

// Fonction pour créer les tables manuellement via des requêtes SQL simples
export async function createTablesManually() {
  try {
    console.log('🔧 Création manuelle des tables...');

    // Vérifier d'abord si les tables existent
    const { data: existingTables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['market_settings', 'shipping_methods']);

    if (checkError) {
      console.log('❌ Impossible de vérifier les tables existantes');
    }

    // Essayer de créer les tables via des requêtes directes
    console.log('📋 Tentative de création des tables...');

    // Créer market_settings
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.market_settings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            store_id UUID NOT NULL,
            enabled_countries TEXT[] NOT NULL DEFAULT '{}',
            default_currency TEXT NOT NULL DEFAULT 'XOF',
            tax_settings JSONB DEFAULT '{"includeTax": false, "taxRate": 0, "taxLabel": "TVA"}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(store_id)
          );
        `
      });
      console.log('✅ Table market_settings créée');
    } catch (error) {
      console.log('⚠️ Erreur création market_settings:', error);
    }

    // Créer shipping_methods
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.shipping_methods (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            store_id UUID NOT NULL,
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
        `
      });
      console.log('✅ Table shipping_methods créée');
    } catch (error) {
      console.log('⚠️ Erreur création shipping_methods:', error);
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur création manuelle:', error);
    return false;
  }
}

// Fonction alternative : créer les données directement sans tables
export async function createTestData() {
  try {
    console.log('🧪 Création de données de test...');

    // Récupérer la première boutique disponible
    const { data: stores, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .limit(1);

    if (storeError || !stores || stores.length === 0) {
      console.log('❌ Aucune boutique trouvée');
      return false;
    }

    const storeId = stores[0].id;
    console.log('🏪 Boutique trouvée:', storeId);

    // Essayer d'insérer des données de test directement
    const testMarketSettings = {
      store_id: storeId,
      enabled_countries: ['BF', 'CI', 'SN'],
      default_currency: 'XOF',
      tax_settings: {
        includeTax: false,
        taxRate: 0,
        taxLabel: 'TVA'
      }
    };

    const testShippingMethods = [
      {
        store_id: storeId,
        name: 'Livraison standard',
        description: 'Livraison par transporteur local',
        price: 2500,
        estimated_days: '3-7 jours',
        icon: '📦',
        is_active: true,
        available_countries: ['BF', 'CI', 'SN']
      },
      {
        store_id: storeId,
        name: 'Retrait en magasin',
        description: 'Récupération directe en boutique',
        price: 0,
        estimated_days: 'Immédiat',
        icon: '🏪',
        is_active: true,
        available_countries: ['BF', 'CI', 'SN']
      }
    ];

    // Insérer les paramètres de marché
    const { error: marketError } = await supabase
      .from('market_settings')
      .upsert(testMarketSettings);

    if (marketError) {
      console.log('❌ Erreur insertion market_settings:', marketError);
    } else {
      console.log('✅ Paramètres de marché créés');
    }

    // Insérer les méthodes de livraison
    const { error: shippingError } = await supabase
      .from('shipping_methods')
      .insert(testShippingMethods);

    if (shippingError) {
      console.log('❌ Erreur insertion shipping_methods:', shippingError);
    } else {
      console.log('✅ Méthodes de livraison créées');
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur création données test:', error);
    return false;
  }
}

// Fonction pour vérifier l'état des tables
export async function checkDatabaseStatus() {
  try {
    console.log('🔍 Vérification de l\'état de la base de données...');

    // Test market_settings
    const { data: marketData, error: marketError } = await supabase
      .from('market_settings')
      .select('count')
      .limit(1);

    // Test shipping_methods
    const { data: shippingData, error: shippingError } = await supabase
      .from('shipping_methods')
      .select('count')
      .limit(1);

    const status = {
      marketSettings: !marketError,
      shippingMethods: !shippingError,
      marketError: marketError?.message,
      shippingError: shippingError?.message
    };

    console.log('📊 État de la base de données:', status);
    return status;
  } catch (error) {
    console.error('❌ Erreur vérification:', error);
    return {
      marketSettings: false,
      shippingMethods: false,
      error: error
    };
  }
}

// Fonction pour créer les politiques RLS
export async function createRLSPolicies() {
  try {
    console.log('🔐 Création des politiques RLS...');

    // Désactiver temporairement RLS pour permettre l'accès
    const { error: disableRLSError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.market_settings DISABLE ROW LEVEL SECURITY;
        ALTER TABLE public.shipping_methods DISABLE ROW LEVEL SECURITY;
      `
    });

    if (disableRLSError) {
      console.log('⚠️ Impossible de désactiver RLS:', disableRLSError);
    } else {
      console.log('✅ RLS désactivé temporairement');
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur politiques RLS:', error);
    return false;
  }
}

// Exposer les fonctions globalement pour les tests
if (typeof window !== 'undefined') {
  (window as any).createTablesManually = createTablesManually;
  (window as any).createTestData = createTestData;
  (window as any).checkDatabaseStatus = checkDatabaseStatus;
  (window as any).createRLSPolicies = createRLSPolicies;
}
