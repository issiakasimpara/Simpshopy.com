import { supabase } from '@/integrations/supabase/client';

export async function diagnosticDatabase() {
  console.log('🔍 DIAGNOSTIC DE LA BASE DE DONNÉES');
  console.log('=====================================');

  try {
    // 1. Vérifier la table african_countries
    console.log('\n1. Vérification de la table african_countries...');
    const { data: countries, error: countriesError } = await supabase
      .from('african_countries')
      .select('*')
      .limit(5);

    if (countriesError) {
      console.error('❌ Erreur african_countries:', countriesError);
      console.error('Détails:', countriesError.message);
      console.error('Code:', countriesError.code);
    } else {
      console.log('✅ Table african_countries OK:', countries?.length, 'pays trouvés');
      console.log('Exemple:', countries?.[0]);
    }

    // 2. Vérifier la table market_settings
    console.log('\n2. Vérification de la table market_settings...');
    const { data: marketSettings, error: marketError } = await supabase
      .from('market_settings')
      .select('*')
      .limit(5);

    if (marketError) {
      console.error('❌ Erreur market_settings:', marketError);
      console.error('Détails:', marketError.message);
      console.error('Code:', marketError.code);
    } else {
      console.log('✅ Table market_settings OK:', marketSettings?.length, 'entrées trouvées');
    }

    // 3. Vérifier la table shipping_methods
    console.log('\n3. Vérification de la table shipping_methods...');
    const { data: shippingMethods, error: shippingError } = await supabase
      .from('shipping_methods')
      .select('*')
      .limit(5);

    if (shippingError) {
      console.error('❌ Erreur shipping_methods:', shippingError);
    } else {
      console.log('✅ Table shipping_methods OK:', shippingMethods?.length, 'méthodes trouvées');
    }

    // 4. Vérifier la table stores
    console.log('\n4. Vérification de la table stores...');
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, name')
      .limit(5);

    if (storesError) {
      console.error('❌ Erreur stores:', storesError);
    } else {
      console.log('✅ Table stores OK:', stores?.length, 'boutiques trouvées');
      console.log('Boutiques:', stores);
    }

    console.log('\n🎯 RÉSUMÉ DU DIAGNOSTIC');
    console.log('======================');
    console.log('african_countries:', countriesError ? '❌' : '✅');
    console.log('market_settings:', marketError ? '❌' : '✅');
    console.log('shipping_methods:', shippingError ? '❌' : '✅');
    console.log('stores:', storesError ? '❌' : '✅');

    return {
      success: !countriesError && !marketError && !shippingError && !storesError,
      errors: {
        countries: countriesError,
        market: marketError,
        shipping: shippingError,
        stores: storesError
      }
    };

  } catch (error) {
    console.error('💥 Erreur générale:', error);
    return { success: false, error };
  }
}

// Fonction pour réparer la base de données si nécessaire
export async function repairDatabase() {
  console.log('🔧 RÉPARATION DE LA BASE DE DONNÉES');
  console.log('===================================');

  try {
    // Script de réparation complet
    const repairSQL = `
      -- 1. Créer la table des pays africains si elle n'existe pas
      CREATE TABLE IF NOT EXISTS public.african_countries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code TEXT NOT NULL UNIQUE,
          name_fr TEXT NOT NULL,
          name_en TEXT NOT NULL,
          flag TEXT NOT NULL,
          currency TEXT NOT NULL DEFAULT 'XOF',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 2. Insérer les pays s'ils n'existent pas
      INSERT INTO public.african_countries (code, name_fr, name_en, flag, currency) VALUES
      ('BF', 'Burkina Faso', 'Burkina Faso', '🇧🇫', 'XOF'),
      ('BJ', 'Bénin', 'Benin', '🇧🇯', 'XOF'),
      ('CI', 'Côte d''Ivoire', 'Ivory Coast', '🇨🇮', 'XOF'),
      ('ML', 'Mali', 'Mali', '🇲🇱', 'XOF'),
      ('NE', 'Niger', 'Niger', '🇳🇪', 'XOF'),
      ('SN', 'Sénégal', 'Senegal', '🇸🇳', 'XOF'),
      ('TG', 'Togo', 'Togo', '🇹🇬', 'XOF'),
      ('GW', 'Guinée-Bissau', 'Guinea-Bissau', '🇬🇼', 'XOF'),
      ('CM', 'Cameroun', 'Cameroon', '🇨🇲', 'XAF'),
      ('CF', 'République Centrafricaine', 'Central African Republic', '🇨🇫', 'XAF'),
      ('TD', 'Tchad', 'Chad', '🇹🇩', 'XAF'),
      ('CG', 'République du Congo', 'Republic of the Congo', '🇨🇬', 'XAF'),
      ('GA', 'Gabon', 'Gabon', '🇬🇦', 'XAF'),
      ('GQ', 'Guinée Équatoriale', 'Equatorial Guinea', '🇬🇶', 'XAF'),
      ('CD', 'République Démocratique du Congo', 'Democratic Republic of the Congo', '🇨🇩', 'CDF'),
      ('DJ', 'Djibouti', 'Djibouti', '🇩🇯', 'DJF'),
      ('KM', 'Comores', 'Comoros', '🇰🇲', 'KMF'),
      ('MG', 'Madagascar', 'Madagascar', '🇲🇬', 'MGA'),
      ('MU', 'Maurice', 'Mauritius', '🇲🇺', 'MUR'),
      ('SC', 'Seychelles', 'Seychelles', '🇸🇨', 'SCR')
      ON CONFLICT (code) DO NOTHING;

      -- 3. Créer les autres tables si nécessaires
      CREATE TABLE IF NOT EXISTS public.market_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          store_id UUID NOT NULL,
          enabled_countries TEXT[] NOT NULL DEFAULT '{}',
          default_currency TEXT NOT NULL DEFAULT 'XOF',
          tax_settings JSONB DEFAULT '{"includeTax": false, "taxRate": 0, "taxLabel": "TVA"}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(store_id)
      );

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
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 4. Désactiver RLS
      ALTER TABLE public.african_countries DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.market_settings DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.shipping_methods DISABLE ROW LEVEL SECURITY;
    `;

    console.log('Exécution du script de réparation...');
    
    // Note: Cette fonction nécessiterait une fonction RPC côté Supabase
    // Pour l'instant, on retourne le SQL à exécuter manuellement
    return {
      success: true,
      sql: repairSQL,
      message: 'Script de réparation généré. Exécutez-le dans l\'éditeur SQL de Supabase.'
    };

  } catch (error) {
    console.error('💥 Erreur lors de la réparation:', error);
    return { success: false, error };
  }
}
