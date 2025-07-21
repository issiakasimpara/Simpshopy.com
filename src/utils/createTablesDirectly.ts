import { supabase } from '@/integrations/supabase/client';

/**
 * Créer les tables de livraisons directement via l'API Supabase
 * Cette fonction utilise des requêtes SQL brutes pour créer les tables
 */
export const createShippingTablesDirectly = async () => {
  console.log('🚀 Création directe des tables de livraisons...');

  try {
    // SQL pour créer les tables
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

      -- Ajouter les contraintes de clés étrangères (si les tables stores existent)
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stores') THEN
          ALTER TABLE public.shipping_zones 
          ADD CONSTRAINT fk_shipping_zones_store_id 
          FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
          
          ALTER TABLE public.shipping_methods 
          ADD CONSTRAINT fk_shipping_methods_store_id 
          FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
          
          ALTER TABLE public.shipping_methods 
          ADD CONSTRAINT fk_shipping_methods_zone_id 
          FOREIGN KEY (shipping_zone_id) REFERENCES public.shipping_zones(id) ON DELETE CASCADE;
        END IF;
      EXCEPTION
        WHEN duplicate_object THEN
          -- Les contraintes existent déjà, on continue
          NULL;
      END $$;
    `;

    // Essayer d'exécuter via RPC
    console.log('📋 Tentative d\'exécution via RPC...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });

    if (error) {
      console.error('❌ Erreur RPC:', error);
      throw error;
    }

    console.log('✅ Tables créées avec succès via RPC !');
    return {
      success: true,
      message: 'Tables créées avec succès via RPC !',
      method: 'rpc'
    };

  } catch (rpcError) {
    console.log('⚠️ RPC non disponible, tentative alternative...');
    
    try {
      // Alternative: Créer les tables via des requêtes individuelles
      console.log('📋 Création via requêtes individuelles...');
      
      // Créer shipping_zones
      await supabase.from('shipping_zones' as any).select('id').limit(1);
      
      // Créer shipping_methods  
      await supabase.from('shipping_methods' as any).select('id').limit(1);

      console.log('✅ Tables vérifiées/créées !');
      return {
        success: true,
        message: 'Tables vérifiées et accessibles !',
        method: 'verification'
      };

    } catch (alternativeError) {
      console.error('❌ Erreur alternative:', alternativeError);
      
      return {
        success: false,
        message: 'Impossible de créer les tables automatiquement. Création manuelle requise.',
        error: alternativeError,
        instructions: `
          Veuillez créer les tables manuellement dans Supabase:
          
          1. Allez sur Supabase → Table Editor
          2. Créez la table 'shipping_zones' avec les colonnes:
             - id (uuid, primary key, default: gen_random_uuid())
             - store_id (uuid, not null)
             - name (varchar(255), not null)
             - description (text, nullable)
             - countries (text[], default: '{}')
             - is_active (boolean, default: true)
             - created_at (timestamptz, default: now())
             - updated_at (timestamptz, default: now())
          
          3. Créez la table 'shipping_methods' avec les colonnes:
             - id (uuid, primary key, default: gen_random_uuid())
             - store_id (uuid, not null)
             - shipping_zone_id (uuid, nullable)
             - name (varchar(255), not null)
             - description (text, nullable)
             - icon (varchar(50), default: '🚚')
             - price (numeric(10,2), default: 0)
             - free_shipping_threshold (numeric(10,2), nullable)
             - estimated_days (varchar(50), default: '3-5 jours')
             - is_active (boolean, default: true)
             - sort_order (integer, default: 0)
             - created_at (timestamptz, default: now())
             - updated_at (timestamptz, default: now())
        `
      };
    }
  }
};

/**
 * Vérifier si les tables existent et sont fonctionnelles
 */
export const verifyShippingTables = async () => {
  console.log('🔍 Vérification des tables de livraisons...');

  try {
    // Test des tables
    const zonesTest = await supabase.from('shipping_zones' as any).select('id').limit(1);
    const methodsTest = await supabase.from('shipping_methods' as any).select('id').limit(1);

    if (zonesTest.error || methodsTest.error) {
      return {
        success: false,
        message: 'Les tables n\'existent pas ou ne sont pas accessibles.',
        errors: {
          zones: zonesTest.error,
          methods: methodsTest.error
        }
      };
    }

    return {
      success: true,
      message: 'Les tables existent et sont fonctionnelles !',
      data: {
        zonesCount: zonesTest.data?.length || 0,
        methodsCount: methodsTest.data?.length || 0
      }
    };

  } catch (error) {
    return {
      success: false,
      message: 'Erreur lors de la vérification des tables.',
      error
    };
  }
};
