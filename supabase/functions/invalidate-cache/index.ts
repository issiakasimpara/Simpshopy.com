// 🗑️ EDGE FUNCTION - INVALIDATION INTELLIGENTE DU CACHE
// Date: 2025-01-28
// Objectif: Invalider automatiquement le cache lors des modifications

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface CacheInvalidationPayload {
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: any;
  old_record?: any;
}

interface CacheInvalidationConfig {
  [tableName: string]: {
    cacheKeys: string[];
    conditions?: (record: any, oldRecord?: any) => boolean;
    delay?: number; // Délai avant invalidation (ms)
  };
}

// Configuration de l'invalidation par table
const INVALIDATION_CONFIG: CacheInvalidationConfig = {
  stores: {
    cacheKeys: ['storefront', 'store_data', 'branding'],
    conditions: (record, oldRecord) => {
      // Invalider seulement si des champs critiques changent
      const criticalFields = ['name', 'slug', 'status', 'settings', 'primary_color'];
      return criticalFields.some(field => 
        oldRecord && record[field] !== oldRecord[field]
      );
    },
    delay: 1000, // 1 seconde de délai
  },
  site_templates: {
    cacheKeys: ['template', 'storefront'],
    conditions: (record, oldRecord) => {
      // Invalider seulement si le template est publié
      return record.is_published || (oldRecord && oldRecord.is_published);
    },
    delay: 2000, // 2 secondes de délai
  },
  products: {
    cacheKeys: ['products', 'storefront'],
    conditions: (record, oldRecord) => {
      // Invalider seulement si le produit est actif
      return record.status === 'active' || (oldRecord && oldRecord.status === 'active');
    },
    delay: 500, // 500ms de délai
  },
  categories: {
    cacheKeys: ['products', 'storefront'],
    delay: 1000,
  },
  orders: {
    cacheKeys: [], // Les commandes ne sont pas cachées côté storefront
  },
  customers: {
    cacheKeys: [], // Les clients ne sont pas cachés côté storefront
  }
};

// Fonction pour générer les clés de cache à invalider
function generateCacheKeys(table: string, record: any, config: CacheInvalidationConfig[typeof table]): string[] {
  const keys: string[] = [];
  
  config.cacheKeys.forEach(keyType => {
    switch (keyType) {
      case 'storefront':
        if (record.slug) {
          keys.push(`cache_storefront:${record.slug}`);
        }
        if (record.store_id) {
          // Trouver le slug du store via store_id
          keys.push(`cache_storefront:${record.store_id}`);
        }
        break;
      case 'store_data':
        if (record.slug) {
          keys.push(`cache_store:${record.slug}`);
        }
        if (record.id) {
          keys.push(`cache_store:${record.id}`);
        }
        break;
      case 'template':
        if (record.store_id) {
          keys.push(`cache_template:${record.store_id}`);
        }
        break;
      case 'products':
        if (record.store_id) {
          keys.push(`cache_products:${record.store_id}`);
        }
        break;
      case 'branding':
        if (record.store_id) {
          keys.push(`cache_branding:${record.store_id}`);
        }
        break;
    }
  });
  
  return keys;
}

// Fonction pour invalider le cache avec délai
async function invalidateWithDelay(keys: string[], delay: number): Promise<void> {
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // Ici on pourrait appeler une API pour invalider le cache
  // Pour l'instant, on log juste les clés à invalider
  console.log(`🗑️ Cache invalidation delayed (${delay}ms):`, keys);
  
  // TODO: Implémenter l'invalidation réelle via Redis ou autre
  // await Promise.all(keys.map(key => redis.del(key)));
}

serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
    });
  }

  try {
    const { event, table, record, old_record }: CacheInvalidationPayload = await req.json();
    
    console.log('🔔 Cache invalidation webhook:', { event, table, record: record?.id });
    
    // Vérifier si la table est configurée
    const config = INVALIDATION_CONFIG[table];
    if (!config) {
      console.log(`⚠️ Pas de configuration d'invalidation pour la table: ${table}`);
      return new Response(JSON.stringify({ success: true, message: 'No config for table' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Vérifier les conditions d'invalidation
    if (config.conditions && !config.conditions(record, old_record)) {
      console.log(`✅ Conditions non remplies pour l'invalidation de ${table}`);
      return new Response(JSON.stringify({ success: true, message: 'Conditions not met' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Générer les clés de cache à invalider
    const cacheKeys = generateCacheKeys(table, record, config);
    
    if (cacheKeys.length === 0) {
      console.log(`⚠️ Aucune clé de cache générée pour ${table}`);
      return new Response(JSON.stringify({ success: true, message: 'No cache keys generated' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Invalider avec délai
    await invalidateWithDelay(cacheKeys, config.delay || 0);
    
    console.log(`✅ Cache invalidation scheduled for ${table}:`, cacheKeys);
    
    return new Response(JSON.stringify({ 
      success: true, 
      invalidatedKeys: cacheKeys,
      table,
      event 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur invalidation cache:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
    });
  }
});
