// 🔐 CLIENT SUPABASE SÉCURISÉ
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 🔐 Récupération sécurisée des variables d'environnement
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ Validation des variables d'environnement
if (!SUPABASE_URL) {
  throw new Error('🚨 ERREUR: VITE_SUPABASE_URL manquante dans les variables d\'environnement');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('🚨 ERREUR: VITE_SUPABASE_ANON_KEY manquante dans les variables d\'environnement');
}

// 🔐 Validation du format des URLs (moins stricte en développement)
if (import.meta.env.PROD && (!SUPABASE_URL.startsWith('https://') || !SUPABASE_URL.includes('.supabase.co'))) {
  throw new Error('🚨 ERREUR: Format SUPABASE_URL invalide');
}

// 🔐 Validation du format de la clé (moins stricte en développement)
if (import.meta.env.PROD && !SUPABASE_ANON_KEY.startsWith('eyJ')) {
  throw new Error('🚨 ERREUR: Format SUPABASE_ANON_KEY invalide');
}

// ✅ Création du client sécurisé
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // 🔐 Configuration sécurisée
  global: {
    headers: {
      'X-Client-Info': 'maliba-shop@1.0.0'
    }
  }
});

// 🔍 Log de débogage (uniquement en développement)
if (import.meta.env.DEV) {
  console.log('🔐 Supabase client initialisé:', {
    url: SUPABASE_URL,
    keyPrefix: SUPABASE_ANON_KEY.substring(0, 20) + '...',
    env: import.meta.env.VITE_APP_ENV
  });
}