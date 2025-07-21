import { supabase } from '@/integrations/supabase/client';

// Fonction pour créer les tables directement via Supabase
export async function setupMarketsShippingTables() {
  try {
    console.log('🚀 Configuration des tables Markets & Shipping...');

    // Créer la table market_settings
    const marketSettingsSQL = `
      CREATE TABLE IF NOT EXISTS market_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL,
        enabled_countries TEXT[] NOT NULL DEFAULT '{}',
        default_currency TEXT NOT NULL DEFAULT 'XOF',
        tax_settings JSONB DEFAULT '{"includeTax": false, "taxRate": 0, "taxLabel": "TVA"}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(store_id)
      );
    `;

    // Créer la table shipping_methods
    const shippingMethodsSQL = `
      CREATE TABLE IF NOT EXISTS shipping_methods (
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
    `;

    // Essayer de créer les tables via une requête directe
    try {
      // Utiliser une approche différente - créer via l'API REST
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey
        },
        body: JSON.stringify({
          sql: marketSettingsSQL + shippingMethodsSQL
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Tables créées avec succès');
      return true;
    } catch (error) {
      console.log('⚠️ Impossible de créer les tables via SQL, tentative alternative...');
      
      // Alternative : essayer d'insérer des données de test pour forcer la création
      await createTestData();
      return true;
    }

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    throw error;
  }
}

// Fonction alternative pour créer des données de test
async function createTestData() {
  try {
    console.log('🧪 Création de données de test...');

    // Récupérer la première boutique
    const { data: stores, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .limit(1);

    if (storeError || !stores || stores.length === 0) {
      throw new Error('Aucune boutique trouvée');
    }

    const storeId = stores[0].id;

    // Essayer d'insérer des paramètres de marché
    const { error: marketError } = await supabase
      .from('market_settings')
      .upsert({
        store_id: storeId,
        enabled_countries: ['BF', 'CI', 'SN'],
        default_currency: 'XOF',
        tax_settings: {
          includeTax: false,
          taxRate: 0,
          taxLabel: 'TVA'
        }
      });

    if (marketError) {
      console.error('❌ Erreur market_settings:', marketError);
      throw marketError;
    }

    // Essayer d'insérer des méthodes de livraison
    const { error: shippingError } = await supabase
      .from('shipping_methods')
      .insert([
        {
          store_id: storeId,
          name: 'Livraison standard',
          description: 'Livraison par transporteur local',
          price: 2500,
          estimated_days: '3-7 jours',
          icon: '📦',
          is_active: true,
          available_countries: ['BF', 'CI', 'SN']
        }
      ]);

    if (shippingError) {
      console.error('❌ Erreur shipping_methods:', shippingError);
      throw shippingError;
    }

    console.log('✅ Données de test créées');
    return true;

  } catch (error) {
    console.error('❌ Erreur création données test:', error);
    throw error;
  }
}

// Fonction pour vérifier l'état des tables
export async function checkTablesStatus() {
  try {
    const { data: marketData, error: marketError } = await supabase
      .from('market_settings')
      .select('count')
      .limit(1);

    const { data: shippingData, error: shippingError } = await supabase
      .from('shipping_methods')
      .select('count')
      .limit(1);

    return {
      marketSettings: !marketError,
      shippingMethods: !shippingError,
      marketError: marketError?.message,
      shippingError: shippingError?.message
    };
  } catch (error) {
    console.error('❌ Erreur vérification:', error);
    return {
      marketSettings: false,
      shippingMethods: false,
      error: error
    };
  }
}
