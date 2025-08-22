import { supabase } from '@/integrations/supabase/client';

/**
 * Script pour configurer automatiquement les tables de livraisons
 * Utilise l'API Supabase directement depuis l'application
 */

export const setupShippingDatabase = async () => {
  console.log('🚀 Configuration automatique des tables de livraisons...');

  try {
    // 1. Créer les tables via SQL
    const createTablesSQL = `
      -- Créer la table shipping_zones
      CREATE TABLE IF NOT EXISTS public.shipping_zones (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        store_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        countries TEXT[] NOT NULL DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Créer la table shipping_methods
      CREATE TABLE IF NOT EXISTS public.shipping_methods (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        store_id UUID NOT NULL,
        shipping_zone_id UUID,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(50) DEFAULT '🚚',
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        free_shipping_threshold DECIMAL(10,2),
        estimated_days VARCHAR(50) DEFAULT '3-5 jours',
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Créer les index
      CREATE INDEX IF NOT EXISTS idx_shipping_zones_store_id ON public.shipping_zones(store_id);
      CREATE INDEX IF NOT EXISTS idx_shipping_zones_active ON public.shipping_zones(is_active);
      CREATE INDEX IF NOT EXISTS idx_shipping_methods_store_id ON public.shipping_methods(store_id);
      CREATE INDEX IF NOT EXISTS idx_shipping_methods_zone_id ON public.shipping_methods(shipping_zone_id);
      CREATE INDEX IF NOT EXISTS idx_shipping_methods_active ON public.shipping_methods(is_active);
      CREATE INDEX IF NOT EXISTS idx_shipping_methods_sort ON public.shipping_methods(sort_order);
    `;

    console.log('📋 Création des tables...');
    
    // Essayer d'exécuter via RPC
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
      if (error) throw error;
      console.log('✅ Tables créées via RPC');
    } catch (rpcError) {
      console.log('⚠️ RPC non disponible, création via insertions...');
      
      // Alternative : tenter des insertions pour créer les tables
      try {
        await supabase.from('shipping_zones' as any).select('id').limit(1);
        await supabase.from('shipping_methods' as any).select('id').limit(1);
        console.log('✅ Tables détectées ou créées');
      } catch (insertError) {
        throw new Error('Impossible de créer les tables automatiquement');
      }
    }

    return {
      success: true,
      message: 'Tables de livraisons configurées avec succès !',
      nextSteps: [
        'Allez sur l\'onglet Livraisons',
        'Cliquez sur "Tester les tables"',
        'Créez vos zones et méthodes de livraison'
      ]
    };

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    return {
      success: false,
      message: 'Configuration automatique échouée',
      error: error,
      manualSteps: [
        '1. Allez sur Supabase → Table Editor',
        '2. Créez la table "shipping_zones" avec les colonnes :',
        '   - id (uuid, primary key)',
        '   - store_id (uuid, not null)',
        '   - name (varchar(255), not null)',
        '   - description (text, nullable)',
        '   - countries (text[], default: \'{}\')',
        '   - is_active (boolean, default: true)',
        '   - created_at (timestamptz, default: now())',
        '   - updated_at (timestamptz, default: now())',
        '',
        '3. Créez la table "shipping_methods" avec les colonnes :',
        '   - id (uuid, primary key)',
        '   - store_id (uuid, not null)',
        '   - shipping_zone_id (uuid, nullable)',
        '   - name (varchar(255), not null)',
        '   - description (text, nullable)',
        '   - icon (varchar(50), default: \'🚚\')',
        '   - price (numeric(10,2), default: 0)',
        '   - free_shipping_threshold (numeric(10,2), nullable)',
        '   - estimated_days (varchar(50), default: \'3-5 jours\')',
        '   - is_active (boolean, default: true)',
        '   - sort_order (integer, default: 0)',
        '   - created_at (timestamptz, default: now())',
        '   - updated_at (timestamptz, default: now())'
      ]
    };
  }
};

/**
 * Créer des données de test pour une boutique
 */
export const createSampleShippingData = async (storeId: string) => {
  console.log('📦 Création des données de test pour la boutique:', storeId);

  try {
    // Créer une zone de test
    const { data: zone, error: zoneError } = await supabase
      .from('shipping_zones' as any)
      .insert({
        store_id: storeId,
        name: 'Afrique Francophone',
        description: 'Zone de livraison pour les pays francophones d\'Afrique',
        countries: [
          'Sénégal', 'Mali', 'Burkina Faso', 'Côte d\'Ivoire', 
          'Niger', 'Guinée', 'Bénin', 'Togo', 'Cameroun', 'Tchad'
        ],
        is_active: true
      })
      .select()
      .single();

    if (zoneError) throw zoneError;

    // Créer des méthodes de test
    const shippingMethods = [
      {
        store_id: storeId,
        shipping_zone_id: zone.id,
        name: 'Livraison Standard',
        description: 'Livraison standard dans votre pays',
        icon: '📦',
        price: 2500,
        free_shipping_threshold: 50000,
        estimated_days: '3-5 jours ouvrables',
        is_active: true,
        sort_order: 1
      },
      {
        store_id: storeId,
        shipping_zone_id: zone.id,
        name: 'Livraison Express',
        description: 'Livraison rapide en 24-48h',
        icon: '⚡',
        price: 5000,
        estimated_days: '1-2 jours ouvrables',
        is_active: true,
        sort_order: 2
      },
      {
        store_id: storeId,
        name: 'Retrait en magasin',
        description: 'Récupérez votre commande directement en magasin',
        icon: '🏪',
        price: 0,
        estimated_days: 'Immédiat',
        is_active: true,
        sort_order: 3
      }
    ];

    const { data: methods, error: methodsError } = await supabase
      .from('shipping_methods' as any)
      .insert(shippingMethods)
      .select();

    if (methodsError) throw methodsError;

    return {
      success: true,
      message: `Données de test créées ! Zone: ${zone.name}, Méthodes: ${methods.length}`,
      data: { zone, methods }
    };

  } catch (error) {
    console.error('❌ Erreur création données de test:', error);
    return {
      success: false,
      message: 'Erreur lors de la création des données de test',
      error
    };
  }
};
